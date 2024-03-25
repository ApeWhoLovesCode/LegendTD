<script setup lang='ts'>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRoute } from "vue-router";
import Worker from "./workers/index.ts?worker"
import { VueFnName, WorkerFnName } from "./workers/type/worker";
import { TowerName } from "@/type";

import { ElMessage } from "element-plus";
import GameNavBar from './components/gameNavBar.vue'
import StartAndEnd from './components/startAndEnd.vue';
import TowerBuild from './components/towerBuild.vue';
import Skill from './components/skill.vue'
import Terminal from "./components/terminal.vue";
import ProgressBar from './components/progressBar.vue';

import useDomRef from './hooks/useDomRef';
import useGameConfig from './hooks/useGameConfig';
import useBaseData from './hooks/useBaseData';
import useAudioState from './hooks/useAudioState';
import useGameSkill from "./hooks/useGameSkill";
import useTower from "./hooks/useTower";

import useKeepInterval from "@/hooks/useKeepInterval";
import { useSourceStore } from '@/stores/source';
import { useUserInfoStore } from "@/stores/userInfo";
import { useSettingStore } from "@/stores/setting";
import { updateScoreApi } from "@/service/rank";
import { KeepIntervalKey } from "@/utils/keepInterval";
import { waitTime } from "@/utils/tools";
import levelData, { LevelDataItemEnum } from "@/dataSource/levelData";
import audioData from "@/dataSource/audioData"

const emit = defineEmits<{
  (event: 'reStart'): void
}>()

const source = useSourceStore()
const userInfoStore = useUserInfoStore()
const setting = useSettingStore()

const keepInterval = useKeepInterval()
const { canvasRef, audioBgRef, audioLevelRef, audioSkillRef, audioEndRef, audioRefObj } = useDomRef()
const { gameConfigState } = useGameConfig()
const { gameSkillState } = useGameSkill()
const { baseDataState } = useBaseData()
const { audioState, createAudio, playDomAudio, removeAudio} = useAudioState()
const { towerState, showTowerBuilding, hiddenTowerOperation } = useTower()

const router = useRoute()
const workerRef = ref<Worker>()

const state = reactive({
  isProgressBar: false,
  progress: 0,
})

onMounted(() => {
  init()
})
onBeforeUnmount(() => {
  onGameOver()
})

function init() {
  initZoomData()
  state.isProgressBar = true
  setTimeout(() => {
    initWorker()
    onKeyDown()
  }, 10);
}

function initWorker() {
  const canvasBitmap = document.getElementById('game-canvas') as HTMLCanvasElement;
  const offscreen = canvasBitmap.transferControlToOffscreen();
  const worker = new Worker()
  workerRef.value = worker
  worker.postMessage({
    init: true,
    source: {
      isMobile: source.isMobile,
      ratio: source.ratio,
      mapLevel: source.mapLevel,
    },
    setting: {
      isHighRefreshScreen: setting.isHighRefreshScreen,
    },
    canvasInfo: {
      offscreen,
      size: gameConfigState.size,
    },
    isDevTestMode: router.query['dev'] === 'test'
  }, [offscreen]);
  worker.onmessage = e => {
    const { data } = e
    const param = data.param
    switch (data.fnName as VueFnName) {
      case 'unifiedMoney': {
        baseDataState.money = param; break;
      }
      case 'createAudio': {
        createAudio(param.audioKey, param.id); break;
      }
      // --- 塔防相关 start ---
      case 'handlerTower': {
        towerState.buildingScope = param; break;
      }
      case 'showTowerBuilding': {
        showTowerBuilding(param); break;
      }
      case 'buildTowerCallback': {
        buildTowerCallback(param); break;
      }
      case 'removeAudio': {
        removeAudio(param); break;
      }
      // --- 塔防相关 end ---
      case 'onLevelChange': {
        onLevelChange(param); break;
      }
      case 'onHpChange': {
        onHpChange(param); break;
      }
      case 'onWorkerReady': {
        onWorkerReady(param); break;
      }
      case 'onProgress': {
        state.progress = param; break;
      }
      case 'playDomAudio': {
        playDomAudio(param); break;
      }
    }
  }
}

/** ----- 与worker交互的事件 ----- */
/** 改变等级 */
function onLevelChange(level: number) {
  if(level) {
    baseDataState.level = level
    if((level / 10) % 1 === 0) {
      playAudio('ma-pvz', 'End')
    }
    audioLevelRef.value?.play()
  }
}
function onWorkerReady(end: {x: number, y: number}) {
  baseDataState.terminal = {
    x: end.x * gameConfigState.size,
    y: end.y * gameConfigState.size,
  }; 
  gameConfigState.loadingDone = true;
}
function gamePause(val?: boolean) {
  baseDataState.isPause = val ?? !baseDataState.isPause
  const isPause = baseDataState.isPause
  keepInterval.allPause(isPause)
  if(!isPause) {
    startMoneyTimer()
  }
  workerRef.value?.postMessage({ isPause })
}
/** 点击获取鼠标位置 操作塔防 */
function getMouse(e: MouseEvent) {
  e.stopPropagation()
  onWorkerPostFn('getMouse', {offsetX: e.offsetX, offsetY: e.offsetY})
}
function onHpChange(hp: number) {
  baseDataState.hp = hp;
  playAudio('ma-nansou', 'End');
  // 判断游戏结束
  if(hp) return
  uploadScore()
}
function onGameOver() {
  baseDataState.isGameOver = true
  baseDataState.isPause = true
  audioBgRef.value?.pause()
  source.isGameing = false
  workerRef.value?.terminate()
  keepInterval.clear()
}
async function uploadScore() {
  playAudio('game-fail', 'End')
  onGameOver()
  if(levelData[source.mapLevel].type !== LevelDataItemEnum.Normal) {
    return
  }
  const {userInfo} = userInfoStore
  if(userInfo) {
    if(!baseDataState.level) {
      await waitTime(200)
      return ElMessage.info('很遗憾你一波敌人都没抵御成功')
    }
    const res = await updateScoreApi({
      userId: userInfo.id,
      score: baseDataState.level,
      level: source.mapLevel
    })
    ElMessage.success(res.isUpdate ? '恭喜，创造了当前地图的新纪录~~' : '还未超越最高分，继续努力吧~~')
  } else {
    await waitTime(200)
    ElMessage.info('登录后才能上传成绩~~')
  }
}
/** 点击建造塔防 */
function buildTower(tname: TowerName) {
  if(baseDataState.money! < source.towerSource![tname].money) return
  let {left: x, top: y} = towerState.building
  onWorkerPostFn('buildTower', {x, y, tname})
}
function buildTowerCallback(p: {towerId: string, audioKey: string}) {
  createAudio(`${p.audioKey}-choose`, p.towerId)
}
function saleTower(towerId: string) {
  onWorkerPostFn('saleTower', towerId)
}
/** 发动技能 */
function handleSkill(index: number) {
  const { name, audioKey, showTime, cd } = gameSkillState.skillList[index]
  playAudio(audioKey, 'Skill')
  // 显示技能效果
  gameSkillState.skillList[index].isShow = true
  setTimeout(() => {
    gameSkillState.skillList[index].isShow = false
  }, showTime);
  // 技能进入cd
  gameSkillState.skillList[index].curTime = cd 
  keepInterval.set(`${KeepIntervalKey.skill}-${name}`, () => {
    gameSkillState.skillList[index].curTime -= 1000
    if(gameSkillState.skillList[index].curTime <= 0) {
      keepInterval.delete(`${KeepIntervalKey.skill}-${name}`)
    }
  }, 1000)
  onWorkerPostFn('handleSkill', index)
}

/** ----- 与worker交互的事件 end ----- */

/** 开始游戏 */
function beginGame() {
  audioLevelRef.value?.play()
  playBgAudio()
  gameConfigState.isGameBeginMask = false
  gamePause(false)
  ElMessage({type: 'success', message: '点击右上方按钮或按空格键继续 / 暂停游戏', duration: 2500, showClose: true})
  source.isGameing = true
}

/** 播放背景音乐 */
function playBgAudio() {
  baseDataState.isPlayBgAudio = !baseDataState.isPlayBgAudio
  if(baseDataState.isPlayBgAudio) {
    audioBgRef.value!.volume = 0.4
    audioBgRef.value?.play()
  }
  else audioBgRef.value?.pause()
}

/** 播放技能音乐和结束音乐 */
function playAudio(audioKey: string, key: 'End' | 'Skill') {
  const audio_key: 'audioEnd' | 'audioSkill' = `audio${key}`
  if(audioState[audio_key] === undefined) return
  if(audioState[audio_key] !== audioKey) {
    audioState[audio_key] = audioKey
  }
  nextTick(()=>{
    // 调节音量
    audioRefObj[audio_key + 'Ref'].value!.volume = 0.5
    audioRefObj[audio_key + 'Ref'].value!.play()
  })
}

/** 按比例缩放数据 */
function initZoomData() {
  let p = source.ratio
  const {w, h} = gameConfigState.defaultCanvas
  if(source.isMobile) {
    const wp = document.documentElement.clientWidth / (h + 150)
    const hp = document.documentElement.clientHeight / (w + 100)
    p *= Math.floor(Math.min(wp, hp) * 100) / 100
  }
  gameConfigState.size = Math.floor(gameConfigState.size * p)
  gameConfigState.defaultCanvas.w = Math.floor(w * p)
  gameConfigState.defaultCanvas.h = Math.floor(h * p)
}

/** 开启创建金钱定时器 */
function startMoneyTimer() {
  keepInterval.set(KeepIntervalKey.startMoneyTimer, () => {
    gameSkillState.proMoney.isShow = true
    playAudio('create-money', 'End')
  }, gameSkillState.proMoney.interval, {isTimeOut: true})
}
/** 点击了生产出来的金钱 */
function proMoneyClick() {
  gameSkillState.proMoney.isShow = false
  baseDataState.money! += gameSkillState.proMoney.money
  startMoneyTimer()
}

/** 监听用户的键盘事件 */
function onKeyDown() {
  document.onkeydown = (e) => {
    if(gameConfigState.isGameBeginMask) return
    switch (e.code) {
      case "Space":{
        gamePause()
        break;
      } 
    }
  };
}

function onWorkerPostFn(fnName: WorkerFnName, event?: any) {
  workerRef.value?.postMessage({fnName, event})
}

</script>

<template>
  <div id="protect-horse">
    <div class="game-wrap" :style="{'--size': gameConfigState.size / source.ratio + 'px'}">
      <div class="canvas-wrap" @click="hiddenTowerOperation">
        <!-- 游戏顶部信息展示区域 -->
        <GameNavBar 
          :money="baseDataState.money"
          :level="baseDataState.level"
          :isPause="baseDataState.isPause"
          :isPlayBgAudio="baseDataState.isPlayBgAudio"
          @game-pause="gamePause"
          @play-bg-audio="playBgAudio"
          @re-start="uploadScore().then(() => {
            emit('reStart')
          })"
        />
        <!-- 游戏区域 -->
        <canvas 
          id="game-canvas"
          ref="canvasRef"
          :width="gameConfigState.defaultCanvas.w" 
          :height="gameConfigState.defaultCanvas.h" 
          :style="{
            width: gameConfigState.defaultCanvas.w / source.ratio + 'px',
            height: gameConfigState.defaultCanvas.h / source.ratio + 'px',
          }"
          @click="getMouse($event)"
        ></canvas>
        <TowerBuild 
          :tower-state="towerState"
          :base-data-state="baseDataState"
          :size="gameConfigState.size"
          @build-tower="buildTower"
          @sale-tower="saleTower"
        />
        <!-- 游戏底部技能区 -->
        <Skill 
          :skillList="gameSkillState.skillList" 
          :money="baseDataState.money!" 
          :isPause="baseDataState.isPause!" 
          @handleSkill="handleSkill" 
        />
        <!-- 终点 -->
        <Terminal
          :game-config-state="gameConfigState"
          :game-skill-state="gameSkillState"
          :base-data-state="baseDataState"
          @proMoneyClick="proMoneyClick"
        />
        <!-- 游戏开始和结束遮罩层 -->
        <StartAndEnd 
          :base-data-state="baseDataState" 
          :game-config-state="gameConfigState" 
          @begin-game="beginGame"
          @re-start="emit('reStart')"
        />
        <ProgressBar 
          v-if="state.isProgressBar" 
          :progress="Math.ceil(state.progress!)"
          @load-done="state.isProgressBar = false"
        />
      </div>
    </div>
    <div id="audio-wrap">
      <audio ref="audioBgRef" :src="audioData['pvz-morning']" loop></audio>
      <audio ref="audioLevelRef" :src="audioData['pvz-comein']"></audio>
      <audio ref="audioSkillRef" :src="audioData[audioState.audioSkill]"></audio>
      <audio ref="audioEndRef" :src="audioData[audioState.audioEnd]"></audio>
    </div>
  </div>
</template>

<style lang='less' scoped>
@import '@/style.less';
#protect-horse {
  .game-wrap {
    position: relative;
    display: inline-block;
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 8px;
    @size: var(--size);
    .canvas-wrap {
      position: relative;
      padding: @size;
      background-image: radial-gradient(circle calc(@size * 10) at center, #16d9e3 0%, #30c7ec 47%, #46aef7 100%);
      border-radius: 4px;
      overflow: hidden;
    }
  }
}
@media screen and (orientation: portrait) {
  .game-wrap {
    -webkit-transform: rotate(90deg);
    -moz-transform: rotate(90deg);
    -ms-transform: rotate(90deg);
    transform: rotate(90deg);
  }
}
</style>