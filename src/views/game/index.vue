<script setup lang='ts'>
import { nextTick, onMounted, reactive, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import ProgressBar from '@/components/progressBar.vue'
import LevelSelect from '@/components/levelSelect.vue'
import ProtectTheHorse from './game.vue'

import { setTheme } from '@/assets/theme/theme'
import { loadImage, gifToStaticImg } from '@/utils/handleImg'
import { isMobile } from '@/utils/tools'

import towerData from '@/dataSource/towerData'
import enemyData from '@/dataSource/enemyData'
import _ from 'lodash'

import { IndexType } from '@/type';
import { useSourceStore } from '@/stores/source';
import floorData from '@/dataSource/floorData';
import { EnemyStateType, TowerStateType } from '@/type/game';

const state = reactive<IndexType>({
  title: '保卫大司马',
  // 当前加载进度
  progress: 0,
  isProgressBar: true,
  // 控制游戏区域的显示与隐藏
  isProtectTheHorse: false,
  // 加载完成的静态图片
  imgOnloadObj: {},
  // 塔防加载完成图片
  towerOnloadImg: {},
  // 塔防子弹加载完成图片
  towerBulletOnloadImg: {},
  // 判断是否是手机
  isMobile: false,
  // 用于切换关卡克隆出来的一份数据
  newEnemySource: [],
  newTowerList: []
})
const sourceS = useSourceStore()
const route = useRoute()
const router = useRouter()
const progressStep = computed<number>(() => {
  return 95 / sourceS.enemySource.length
})

/** 初始化加载图片等内容 */
async function init() {
  // 加载图片
  await handleEnemyImg()
  sourceS.imgOnloadObj.floor = await loadImage(floorData[0]);
  await handleTowerImg()
  state.progress = 100
  // handleData()
  setTimeout(() => {
    state.isProgressBar = false
    state.isProtectTheHorse = true
  }, 100);
}
// function handleData() {
//   if(state.isMobile) {
//     state.newEnemySource = _.cloneDeep(enemyData)
//     state.newTowerList = _.cloneDeep(towerData)
//   } else {
//     state.newEnemySource = enemyData
//     state.newTowerList = towerData
//   }
// }
/** 切换地图 */
function switchMapLevel(index: number) {
  if(sourceS.mapLevel === index) return
  sourceS.mapLevel = index
  router.push(`/game/${index + 1}`)
  state.isProtectTheHorse = false
  // handleData()
  nextTick(() => {state.isProtectTheHorse = true})
}
/** 等待所有的敌人的gif图生成静态图片 */
async function handleEnemyImg() {
  sourceS.enemySource = _.cloneDeep(enemyData) as unknown as EnemyStateType[]
  return Promise.all(enemyData.map(async (item, index) => {
    sourceS.enemySource[index].imgList = await gifToStaticImg({type: item.type, imgSource: item.imgSource})
    state.progress += progressStep.value
    return 
  })).then(res => {
    
  })
}
/** 处理塔防的图片 */
async function handleTowerImg() {
  sourceS.towerSource = _.cloneDeep(towerData) as unknown as TowerStateType[]
  return Promise.all(towerData.map(async (t, index) => {
    sourceS.towerSource[index].onloadImg = await loadImage(t.img)
    sourceS.towerSource[index].onloadbulletImg = await loadImage(t.bulletImg)
    return
  })).then(() => {})
}

onMounted(() => {
  sourceS.mapLevel = +(route.params.id ?? 1) - 1
  if(isMobile()) {
    console.log('--is mobile--');
    setTheme('phone')
    state.isMobile = true
  }
  init()
})

</script>

<!-- 
:isMobile="state.isMobile"
:mapLevel="state.mapLevel" 
:enemySource="state.newEnemySource"
:towerSource="state.newTowerList"
:imgOnloadObj="state.imgOnloadObj"
:towerOnloadImg="state.towerOnloadImg"
:towerBulletOnloadImg="state.towerBulletOnloadImg"
-->

<template>
  <div id='protect-horse-index'>
    <div class="back" @click="$router.push('/')">回到首页</div>
    <div class="title">{{state.title}}</div>
    <ProtectTheHorse
      v-if="state.isProtectTheHorse" 
    />
    <LevelSelect :mapLevel="sourceS.mapLevel" @switchMapLevel="switchMapLevel" />
    <ProgressBar v-if="state.isProgressBar" :progress="state.progress" />
  </div>
</template>

<style lang='less'>
#protect-horse-index {
  position: relative;
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 24px;
    font-weight: bold;
    height: 30px;
    line-height: 30px;
    color: #eee;
    text-align: center;
    user-select: none;
    animation: fall-animation .8s ease forwards;
  }
  @keyframes fall-animation {
    0% {
      opacity: 0;
      top: -50px;
    }
    100% {
      opacity: 1;
      top: 1%;
    }
  }
  .back {
    position: fixed;
    top: 20px;
    left: 20px;
    color: #fff;
    background: rgba(255, 255, 255, .3);
    padding: 4px 10px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 15px;
    user-select: none;
    &:hover {
      opacity: .8;
    }
  }
  
}
</style>