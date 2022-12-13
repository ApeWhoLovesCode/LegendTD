<script lang="ts" setup>
/**
 * 必要优化-待完成
 * 1.敌人图片翻转
 * 2.手机屏幕翻转兼容
 */
import { nextTick, onMounted, onBeforeUnmount, computed, watch, ref, Ref } from 'vue';
import _ from 'lodash'
import { ElMessage } from 'element-plus'

import {audioState, playAudio} from './tools/audioState';
import {
  baseDataState, drawFloorTile, enterAttackScopeList, initAllGrid, initMobileData
} from './tools/baseData';
import {
  baseInfoState, initMovePath, onKeyDown, gamePause
} from './tools/baseInfo';
import {
  drawEnemy, enemyList, enemyState, moveEnemy, setEnemy
} from './tools/enemy';
import { gameConfigState } from './tools/gameConfig';
import { gameSkillState, handleSkill } from './tools/gameSkill';
import { BuildingImg, HorseImg, SunImg } from './tools/imgSource';
import {
  drawAndMoveBullet, hiddenTowerOperation, getMouse, buildTower, saleTower, drawTower, towerList, towerState
} from './tools/tower';
// import {audioBgRef, audioLevelRef, audioSkillRef, audioEndRef, audioRefObj} from './tools/domRef'

import Loading from '@/components/loading.vue'
import GameNavBar from '@/components/gameNavBar.vue'
import Skill from '@/components/skill.vue'

import { createProbNum, waitTime } from '@/utils/tools'
import keepInterval from '@/utils/keepInterval'

import levelEnemyArr from '@/dataSource/levelEnemyArr'
import mapData, { mapGridInfoList } from '@/dataSource/mapData'
import { TowerType } from '@/dataSource/towerData';
import { EnemyType } from '@/dataSource/enemyData';
import { ImgLoadType } from '@/type';


type GameProps = {
  mapLevel: number
  enemySource: EnemyType[]
  towerSource: TowerType[]
  imgOnloadObj: ImgLoadType
  towerOnloadImg: ImgLoadType
  towerBulletOnloadImg: ImgLoadType
  isMobile: boolean
}

const props = defineProps<GameProps>()

const canvasRef = ref<HTMLCanvasElement>()
/** 背景音乐 */
const audioBgRef = ref<HTMLAudioElement>()
/** 等级音乐 */
const audioLevelRef = ref<HTMLAudioElement>()
/** 技能音乐 */
const audioSkillRef = ref<HTMLAudioElement>()
/** 游戏结束音乐 */
const audioEndRef = ref<HTMLAudioElement>()
const audioRefObj: {[key in string]: Ref<HTMLAudioElement | undefined>} = {
  audioBgRef,
  audioLevelRef,
  audioSkillRef,
  audioEndRef
}

/** ---计算属性--- */
/** 终点位置 */
const terminalStyle = computed(() => {
  return {left: baseDataState.terminal?.x + 'px', top: baseDataState.terminal?.y + 'px'}
})
/** 塔防容器的样式 */
const buildingStyle = computed(() => {
  const {left, top} = towerState.building
  const size = baseDataState.gridInfo.size
  return {left: left + size + 'px', top: top + size + 'px'}
})
/** 塔防容器的类目 */
const buildingClass = computed(() => {
  const {left, top} = towerState.building
  const {x_num, y_num, size} = baseDataState.gridInfo
  const _x_num = Math.round(left / size), _y_num = Math.round(top / size)
  let className = ''
  if(_y_num >= y_num - 3) {
    className += 'tower-wrap-bottom '
  }
  // 点击在左右两边的情况
  if(_x_num <= 1 || _x_num >= x_num - 2) {
    className += 'tower-wrap-row '
    if(_y_num >= 2) className += 'tower-wrap-row-top '
    if(_x_num <= 1) className += 'tower-wrap-left'
    else className += 'tower-wrap-right'
  }
  return className
})
/** 攻击范围的样式 */
const buildingScopeStyle = computed(() => {
  const padding = baseDataState.gridInfo.size
  const size = baseDataState.gridInfo.size / 2
  const {left, top, r} = towerState.buildingScope
  return {left: left + padding + size + 'px', top: top + padding + size + 'px', width: r * 2 + 'px', height: r * 2 + 'px'}
})
/** 售卖防御塔按钮的样式 */
const saleTowerStyle = computed(() => {
  const {y_num, size} = baseDataState.gridInfo
  const _y_num = Math.round(towerState.buildingScope.top / size)
  return _y_num >= y_num / 2 ? { top: 0 } : { bottom: 0 }
})
/** 是否是无限火力模式 */
const isInfinite = computed(() => {
  return props.mapLevel === mapData.length - 1
})
/** 当前关卡全部敌人已经上场 */
const allEnemyIn = computed(() => {
  return enemyState.createdEnemyNum === enemyState.levelEnemy.length
})

// 监听增加的钱
watch(() => baseInfoState.money, (newVal, oldVal) => {
  gameSkillState.addMoney.num = ''
  clearTimeout(gameSkillState.addMoney.timer as NodeJS.Timer)
  gameSkillState.addMoney.timer = null
  nextTick(() => {
    const val = newVal - oldVal
    gameSkillState.addMoney.num = (val >= 0 ? '+' : '') + val
    gameSkillState.addMoney.timer = setTimeout(() => {
      gameSkillState.addMoney.num = ''
    }, gameSkillState.addMoney.time);
  })
})
// 游戏结束判断
watch(() => baseInfoState.hp, (val) => {
  baseInfoState.isGameOver = true
  baseInfoState.isPause = true
  playAudio('ma-gameover', 'Skill')
  audioBgRef.value?.pause()
})

watch(() => baseInfoState.isPause, (val) => {
  keepInterval.allPause(val)
  if(!val) {
    makeEnemy()
    startAnimation();
    startMoneyTimer()
  }
})
// 监听等级变化生成对应敌人
watch(() => baseInfoState.level, (val) => {
  setTimeout(() => {
    enemyState.createdEnemyNum = 0
    if(val < levelEnemyArr.length && !isInfinite.value) {
      enemyState.levelEnemy = levelEnemyArr[val]
    } else {
      const list = [0]
      const isUpdate = (val / 2) > levelEnemyArr.length ? true : false
      const enemyNum = isInfinite.value ? ~~((val + 1) * 5) : ~~(val * 1.3)
      for(let i = 0; i < enemyNum; i++) {
        list.push(createProbNum(isUpdate))
      }
      enemyState.levelEnemy = list
    }
    if(val) {
      if((val / 10) % 1 === 0) {
        playAudio('ma-pvz', 'End')
      }
      baseInfoState.money += (baseInfoState.level + 1) * gameSkillState.proMoney.money
      makeEnemy()
      audioLevelRef.value?.play()
    }
  }, val ? 500 : 0);
}, {immediate: true})
// 监听敌人的移动
watch(() => enemyList, (enemyList) => {
  // 敌人已经清空
  if(!enemyList.length && allEnemyIn.value && baseInfoState.hp) {
    nextTick(() => { baseInfoState.level++ })
  }
  for(let t_i in towerList) {
    const eIdList = enterAttackScopeList(enemyList, towerList[t_i])
    // 进入攻击范围，开始射击 
    if(eIdList.length) {
      towerList[t_i].shootFun(eIdList.slice(0, towerList[t_i].targetNum), t_i)
    }
  }
}, { deep: true }) // 这里deep可能会无效

onMounted(() => {
  setTimeout(() => {
    init();
    getCanvasMargin()
  }, 10);
  // 监听浏览器窗口大小变化
  window.addEventListener("resize", getCanvasMargin);
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', getCanvasMargin)
  cancelAnimationFrame(gameConfigState.animationFrame)
  keepInterval.clear()
})

async function init() {
  if(isInfinite.value) {
    baseInfoState.money = 999999
  }
  gameConfigState.ctx = (canvasRef.value!.getContext("2d") as CanvasRenderingContext2D);
  baseInfoState.mapGridInfoItem = JSON.parse(JSON.stringify(mapGridInfoList[props.mapLevel]))
  initMobileData()
  baseDataState.floorTile.num = baseInfoState.mapGridInfoItem.num
  initAllGrid()
  initMovePath()
  onKeyDown()
  await waitTime(800)
  gameConfigState.loadingDone = true
  startAnimation()
}

/** 开启动画绘画 */
function startAnimation() {
  (function go() {
    startDraw();
    if (!baseInfoState.isPause) {
      // 时间间隔为 1000/60 每秒 60 帧
      gameConfigState.animationFrame = requestAnimationFrame(go);
    } else {
      cancelAnimationFrame(gameConfigState.animationFrame)
    }
  })();
}
/** 开始绘画 */
function startDraw() {
  gameConfigState.ctx.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height);
  drawFloorTile()
  drawTower()
  // 循环静态图片数组画敌人形成gif效果
  for(let index = 0; index < enemyList.length; index++) {
    const item = enemyList[index]
    const res = moveEnemy(index)
    // 当敌人已经到达终点，后面就不执行了
    if(res) break
    drawEnemy(index)
    if(item.imgIndex === item.imgList.length - 1) enemyList[index].imgIndex = 0
    else enemyList[index].imgIndex++
  }
  drawAndMoveBullet()
}

/** 按间隔时间生成敌人 */
function makeEnemy() {
  // 当前关卡敌人已经全部上场
  if(allEnemyIn.value) return
  // 暂停回来，间隔时间修改
  keepInterval.set('makeEnemy', () => {
    if(allEnemyIn.value) {
      keepInterval.delete('makeEnemy')
    } else {
      setEnemy()
    }
  }, baseInfoState.intervalTime)
}

/** 开启创建金钱定时器 */
function startMoneyTimer() {
  keepInterval.set('startMoneyTimer', () => {
    gameSkillState.proMoney.isShow = true
    playAudio('ma-qifei', 'End')
    keepInterval.delete('startMoneyTimer')
  }, gameSkillState.proMoney.interval)
}
/** 点击了生产出来的金钱 */
function proMoneyClick() {
  gameSkillState.proMoney.isShow = false
  baseInfoState.money += gameSkillState.proMoney.money
  startMoneyTimer()
}
/** 获取canvas与浏览器 左边 / 顶部 的距离 */
function getCanvasMargin() {
  clearTimeout(gameConfigState.resizeTimer as NodeJS.Timer)
  gameConfigState.resizeTimer = setTimeout(() => {
    gameConfigState.canvasInfo.left = canvasRef.value?.getBoundingClientRect().left ?? 0;
    gameConfigState.canvasInfo.top = canvasRef.value?.getBoundingClientRect().top ?? 0;
  }, 50);
}

/** 播放背景音乐 */
function playBgAudio() {
  baseInfoState.isPlayBgAudio = !baseInfoState.isPlayBgAudio
  if(baseInfoState.isPlayBgAudio) {
    audioBgRef.value!.volume = 0.65
    audioBgRef.value?.play()
  }
  else audioBgRef.value?.pause()
}

/** 开始游戏 */
function beginGame() {
  audioLevelRef.value?.play()
  playBgAudio()
  gameConfigState.isGameBeginMask = false
  baseInfoState.isPause = false
  ElMessage({type: 'success', message: '点击右上方按钮或按空格键继续 / 暂停游戏', duration: 2500, showClose: true})
}

</script>

<template>
  <div id="protect-horse">
    <div id="audio-wrap">
      <audio ref="audioBgRef" :src="audioState.audioList['pvz-morning']" loop></audio>
      <audio ref="audioLevelRef" :src="audioState.audioList['pvz-comein']"></audio>
      <audio ref="audioSkillRef" :src="audioState.audioList[audioState.audioSkill]"></audio>
      <audio ref="audioEndRef" :src="audioState.audioList[audioState.audioEnd]"></audio>
    </div>
    <div class="game-wrap">
      <div class="canvas-wrap" @click="hiddenTowerOperation">
        <!-- 游戏顶部信息展示区域 -->
        <GameNavBar 
          :money="baseInfoState.money"
          :addMoney="gameSkillState.addMoney"
          :level="baseInfoState.level"
          :isPause="baseInfoState.isPause"
          :isPlayBgAudio="baseInfoState.isPlayBgAudio"
          @gamePause="gamePause"
          @playBgAudio="playBgAudio"
        />
        <!-- 游戏区域 -->
        <canvas ref="canvasRef" id="mycanvas" :width="gameConfigState.defaultCanvas.w" :height="gameConfigState.defaultCanvas.h" @click="getMouse($event)"></canvas>
        <!-- 塔防的容器 -->
        <div v-show="towerState.building.isShow" class="building-wrap" :style="buildingStyle">
          <img :src="BuildingImg" alt="" class="add-icon">
          <div class="tower-wrap" :class="buildingClass">
            <div 
              class="tower" 
              :class="{'tower-no-money': baseInfoState.money < item.money}" 
              v-for="(item, index) in towerSource" 
              :key="index"
              @click="buildTower(index)"
            >
              <img :src="item.img" alt="" class="tower-icon">
              <div class="tower-info">￥{{item.money}}</div>
            </div>
          </div>
        </div>
        <!-- 塔防的攻击范围 -->
        <div v-show="towerState.buildingScope.isShow" class="building-scope" :style="buildingScopeStyle">
          <span class="sale-wrap" @click="saleTower(towerState.buildingScope.towerIndex)" :style="saleTowerStyle">
            <span class="iconfont icon-ashbin"></span>
            <span class="sale-num">{{towerList[towerState.buildingScope.towerIndex] && towerList[towerState.buildingScope.towerIndex].saleMoney}}</span>
          </span>
        </div>
        <!-- 游戏底部技能区 -->
        <Skill :skillList="gameSkillState.skillList" :money="baseInfoState.money" :isPause="baseInfoState.isPause" @handleSkill="handleSkill" />
        <!-- 终点 -->
        <div v-if="baseDataState.terminal" class="terminal" :style="terminalStyle">
          <div class="hp">{{baseInfoState.hp}}</div>
          <img class="terminal-icon" :src="HorseImg" alt="">
          <img v-show="gameSkillState.proMoney.isShow" class="money-icon" :src="SunImg" alt="" @click="proMoneyClick">
        </div>
        <!-- 游戏开始遮罩层 -->
        <div v-if="gameConfigState.isGameBeginMask" class="game-begin mask">
          <div class="info">
            <Loading v-if="!gameConfigState.loadingDone" />
            <div v-else class="begin-wrap">
              <span class="icon-wrap" @click="beginGame">
                <span class="iconfont" :class="baseInfoState.isPause ? 'icon-kaishi1' : 'icon-24gf-pause2'"></span>
              </span>
              <span class="begin-text">开始游戏</span>
            </div>
          </div>
        </div>
        <!-- 游戏结束遮罩层 -->
        <div v-if="baseInfoState.isGameOver" class="gameover-wrap mask">
          <div class="info">你为了保卫大司马抵御了{{baseInfoState.level}}波僵尸</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/style.scss';
#protect-horse {
  .game-wrap {
    position: relative;
    display: inline-block;
    padding: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid #eee;
    border-radius: 8px;
    .canvas-wrap {
      position: relative;
      padding: $size;
      background-image: radial-gradient(circle 500px at center, #16d9e3 0%, #30c7ec 47%, #46aef7 100%);
      border-radius: 4px;
      overflow: hidden;
      .building-wrap {
        position: absolute;
        user-select: none;
        .add-icon {
          width: $size;
          height: $size;
        }
        .tower-wrap {
          position: absolute;
          top: calc($size + 8px);
          left: calc(50% - ($size * 2 + $size / 2));
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(4, $size);
          grid-template-rows: repeat(2, $size);
          background: rgba(255, 255, 255, .4);
          border-radius: 16px;
          padding: 10px;
          z-index: 99;
          .tower {
            position: relative;
            width: $size;
            height: $size;
            border-radius: 8px;
            border: 2px solid #fff;
            margin-bottom: 10px;
            box-sizing: border-box;
            overflow: hidden;
            .tower-icon {
              width: 100%;
              height: 100%;
            }
            .tower-info {
              position: absolute;
              left: 0;
              right: 0;
              bottom: 0;
              text-align: center;
              font-size: calc($size * 0.26);
              color: #fff;
              background: rgba(0, 0, 0, .4);
            }
          }
          .tower-no-money {
            opacity: .3;
          }
        }
        .tower-wrap-row {
          grid-template-rows: repeat(4, $size);
          grid-template-columns: repeat(2, $size);
          grid-auto-flow: column;
          width: auto;
          .tower {
            margin-bottom: 0;
            margin-right: 10px;
          }
        }
        .tower-wrap-row-top {
          top: calc(50% - ($size * 2 + $size / 2));
        }
        .tower-wrap-left {
          left: calc($size + 8px);
        }
        .tower-wrap-right {
          right: calc($size + 8px);
          left: auto;
        }
        .tower-wrap-bottom {
          bottom: calc($size + 8px);
          top: auto;
        }
      }
      .building-scope {
        position: absolute;
        z-index: 1;
        transform: translate(-50%, -50%);
        box-sizing: border-box;
        border: 2px solid #3b9bdf;
        border-radius: 50%;
        background: rgba(255, 255, 255, .25);
        .sale-wrap {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          justify-content: center;
          align-items: center;
          // background: rgba(255, 255, 255, 0.4);
          background: #3b9bdf;
          color: #fff;
          border-radius: 8px;
          padding: 0 5px;
          cursor: pointer;
          &:hover {
            opacity: .75;
          }
          .iconfont {
            font-size: 20px;
          }
          .sale-num {
            font-size: 14px;
          }
        }
      }
      .terminal {
        position: absolute;
        user-select: none;
        cursor: pointer;
        // box-shadow: 0 0 2px 2px rgba(255, 255, 255, .3);
        .hp {
          color: #f24410;
          font-size: 18px;
          font-weight: bold;
          text-align: center;
        }
        .terminal-icon {
          display: block;
          width: calc($size * 2.5);
        }
        .money-icon {
          position: absolute;
          top: 0;
          left: 0;
          width: calc($size * 1.6);
          height: calc($size * 1.6);
        }
      }
      .gameover-wrap {
        .info {
          font-size: 36px;
          font-weight: bold;
          color: #fff;
        }
      }
      .game-begin {
        .info {
          .begin-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            .icon-wrap {
              display: inline-block;
              display: flex;
              justify-content: center;
              align-items: center;
              width: calc($size * 3);
              height: calc($size * 3);
              border-radius: 50%;
              background-image: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
              cursor: pointer;
              user-select: none;
              &:hover {
                opacity: .95;
                box-shadow: 0 0 16px 4px #3393e7;
              }
              .iconfont {
                color: #fff;
                font-size: calc($size * 1.6);
                animation: pulse 2s linear infinite;
              }
              @keyframes pulse {
                70% {
                  transform: scale(1.2);
                  opacity: 0.4;
                }
                100% {
                  transform: scale(1.2);
                  opacity: 0;
                }
              }
            }
            .begin-text {
              font-size: 36px;
              color: #fff;
              font-weight: bold;
              margin-top: 16px;
              letter-spacing: 8px;
              margin-left: 8px;
              user-select: none;
            }
          }
        }
      }
      .mask {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(0, 0, 0, .4);
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
</style>
