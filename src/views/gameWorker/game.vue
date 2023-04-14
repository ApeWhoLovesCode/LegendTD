<script setup lang='ts'>
import Worker from "./workers/index.ts?worker"
import { useSourceStore } from '@/stores/source';
import imgSource from '@/dataSource/imgSource';
import { computed, nextTick, onMounted, ref } from 'vue';

import GameNavBar from '../game/components/gameNavBar.vue'
import StartAndEnd from '../game/components/startAndEnd.vue';
import TowerBuild from '../game/components/towerBuild.vue';
import Skill from '../game/components/skill.vue'

import useDomRef from './tools/domRef';
import useGameConfig from './tools/gameConfig';
import useBaseData from './tools/baseData';
import useAudioState from './tools/audioState';
import useGameSkill from "./tools/gameSkill";
import { ElMessage } from "element-plus";
import keepInterval, { KeepIntervalKey } from "@/utils/keepInterval";
import useTower from "./tools/tower";
import { VueFnName, WorkerFnName } from "./workers/type/worker";
import { TowerStateType } from "@/type/game";
import { TowerName } from "@/dataSource/towerData";
import { powAndSqrt } from "@/utils/tools";

const emit = defineEmits<{
  (event: 'reStart'): void
}>()

const source = useSourceStore()

const { canvasRef, audioBgRef, audioLevelRef, audioSkillRef, audioEndRef, audioRefObj } = useDomRef()
const { gameConfigState } = useGameConfig()
const { gameSkillState } = useGameSkill()
const { baseDataState } = useBaseData()
const { audioState, createAudio, playDomAudio, removeAudio} = useAudioState()
const { towerState, showTowerBuilding, handlerTower, hiddenTowerOperation } = useTower()

const workerRef = ref<Worker>()

/** 终点位置 */
const terminalStyle = computed(() => {
  const size = transRatio(gameConfigState.size)
  if(baseDataState.terminal) {
    const {x, y} = baseDataState.terminal
    return {left: transRatio(x) + size / 2 + 'px', top: transRatio(y) - size / 2 + 'px'}
  }
})

onMounted(() => {
  init()
})

function init() {
  initZoomData()
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
    },
    canvasInfo: {
      offscreen,
      size: gameConfigState.size,
    }
  }, [offscreen]);
  worker.onmessage = e => {
    const { data } = e
    switch (data.fnName as VueFnName) {
      case 'onWorkerReady': {
        onWorkerReady(); break;
      }
      case 'handlerTower': {
        handlerTower(data.event?.left, data.event?.right); break;
      }
      case 'showTowerBuilding': {
        showTowerBuilding(data.event); break;
      }
      case 'buildTowerCallback': {
        buildTowerCallback(data.event); break;
      }
      case 'saleTowerCallback': {
        saleTowerCallback(data.event); break;
      }
    }
  }
  // worker.postMessage('线程关闭')
  // worker.terminate()
}

/** ----- 与worker交互的事件 ----- */

function onWorkerReady() {
  gameConfigState.loadingDone = true;
}
function gamePause() {
  baseDataState.isPause = !baseDataState.isPause
  workerRef.value?.postMessage({
    isPause: baseDataState.isPause
  })
}
/** 点击获取鼠标位置 操作塔防 */
function getMouse(e: MouseEvent) {
  e.stopPropagation()
  onWorkerPostFn('getMouse', {offsetX: e.offsetX, offsetY: e.offsetY})
}

/** 点击建造塔防 */
function buildTower(tname: TowerName, p?: {x: number, y: number}) {
  const { money } = source.towerSource![tname]
  if(baseDataState.money < money) return
  baseDataState.money -= money
  let {left: x, top: y} = towerState.building
  onWorkerPostFn('buildTower', {x, y, tname, p})
}
function buildTowerCallback(p: {towerId: string, audioKey: string, isMusic: false}) {
  createAudio(`${p.audioKey}-choose`, p.towerId)
  if(p.isMusic) return
  playDomAudio({id: p.towerId})
}

/** 售卖防御塔 */
function saleTower(index: number) {
  onWorkerPostFn('saleTower', {index})
}
function saleTowerCallback(id: string) {
  removeAudio(id)
}

/** ----- 与worker交互的事件 end ----- */


function handleSkill() {

}

/** 开始游戏 */
function beginGame() {
  audioLevelRef.value?.play()
  playBgAudio()
  gameConfigState.isGameBeginMask = false
  baseDataState.isPause = false
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
    audioRefObj[audio_key + 'Ref'].value!.volume = 0.6
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
  }, gameSkillState.proMoney.interval, true)
}
/** 点击了生产出来的金钱 */
function proMoneyClick() {
  gameSkillState.proMoney.isShow = false
  baseDataState.money += gameSkillState.proMoney.money
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

/** 清晰度转化 */
function transRatio(v: number) {
  return v / source.ratio
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
          :addMoney="gameSkillState.addMoney"
          :level="baseDataState.level"
          :isPause="baseDataState.isPause"
          :isPlayBgAudio="baseDataState.isPlayBgAudio"
          @game-pause="gamePause"
          @play-bg-audio="playBgAudio"
          @re-start="emit('reStart')"
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
          :tower-list="[]"
          :base-data-state="baseDataState"
          :size="gameConfigState.size"
          @build-tower="buildTower"
          @sale-tower="saleTower"
        />
        <!-- 游戏底部技能区 -->
        <Skill 
          :skillList="gameSkillState.skillList" 
          :money="baseDataState.money" 
          :isPause="baseDataState.isPause" 
          @handleSkill="handleSkill" 
        />
        <!-- 终点 -->
        <div v-if="baseDataState.terminal" class="terminal" :style="terminalStyle">
          <div class="hp" :class="{'hp-mobile': source.isMobile}">{{baseDataState.hp}}</div>
          <img class="terminal-icon" :src="imgSource.TerminalImg" alt="">
          <img 
            v-show="gameSkillState.proMoney.isShow" 
            class="money-icon" 
            :src="imgSource.SunImg" 
            alt=""
            @click="proMoneyClick"
          >
        </div>
        <!-- 游戏开始和结束遮罩层 -->
        <StartAndEnd 
          :base-data-state="baseDataState" 
          :game-config-state="gameConfigState" 
          @begin-game="beginGame"
          @re-start="emit('reStart')"
        />
      </div>
    </div>
    <div id="audio-wrap">
      <audio ref="audioBgRef" :src="audioState.audioList['pvz-morning']" loop></audio>
      <audio ref="audioLevelRef" :src="audioState.audioList['pvz-comein']"></audio>
      <audio ref="audioSkillRef" :src="audioState.audioList[audioState.audioSkill]"></audio>
      <audio ref="audioEndRef" :src="audioState.audioList[audioState.audioEnd]"></audio>
    </div>
    <!-- <div class="screenMask"></div> -->
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
      .terminal {
        position: absolute;
        user-select: none;
        .hp {
          position: absolute;
          top: calc(@size * 0.15);
          left: calc(@size * 0.35);
          color: #f24410;
          font-size: calc(@size * 0.3);
          font-weight: bold;
          text-align: center;
          &-mobile {
            font-size: calc(@size * 0.4);
            top: calc(@size * 0.1);
            left: calc(@size * 0.25);
          }
        }
        .terminal-icon {
          display: block;
          width: calc(@size * 1.8);
        }
        .money-icon {
          position: absolute;
          top: 0;
          right: 0;
          width: calc(@size * 1.2);
          height: calc(@size * 1.2);
          cursor: pointer;
        }
      }
    }
  }
  .screenMask {
    position: fixed;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    box-shadow: 0 0 500px 1000px rgba(0, 0, 0, .4);
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