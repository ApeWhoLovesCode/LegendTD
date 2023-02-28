<script setup lang='ts'>
import { nextTick, onMounted, reactive, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import ProgressBar from '@/components/progressBar.vue'
import ProtectTheHorse from './game.vue'

import { loadImage, gifToStaticImg } from '@/utils/handleImg'

import towerData from '@/dataSource/towerData'
import enemyData from '@/dataSource/enemyData'
import _ from 'lodash'

import { IndexType } from '@/type';
import { useSourceStore } from '@/stores/source';
import floorData from '@/dataSource/floorData';
import { EnemyStateType, TowerStateType } from '@/type/game';
import UserBall from '@/components/userBall.vue'

const state = reactive<IndexType>({
  title: '塔防联盟',
  // 当前加载进度
  progress: 0,
  isProgressBar: true,
  // 控制游戏区域的显示与隐藏
  isProtectTheHorse: false,
})
const source = useSourceStore()
const route = useRoute()
const router = useRouter()
const progressStep = computed<number>(() => {
  return 95 / source.enemySource.length
})

/** 初始化加载图片等内容 */
async function init() {
  // 加载图片
  await handleEnemyImg()
  source.imgOnloadObj.floor = await loadImage(floorData[0])
  await handleTowerImg()
  state.progress = 100
  setTimeout(() => {
    state.isProgressBar = false
    state.isProtectTheHorse = true
  }, 100);
}
/** 切换地图 */
function switchMapLevel(index: number) {
  if(source.mapLevel === index) return
  source.mapLevel = index
  router.push(`/game/${index + 1}`)
  state.isProtectTheHorse = false
  nextTick(() => {state.isProtectTheHorse = true})
}
/** 等待所有的敌人的gif图生成静态图片 */
async function handleEnemyImg() {
  source.enemySource = _.cloneDeep(enemyData) as unknown as EnemyStateType[]
  return Promise.all(enemyData.map(async (item, index) => {
    source.enemySource[index].imgList = await gifToStaticImg({type: item.type, imgSource: item.imgSource})
    state.progress += progressStep.value
    return 
  })).then(res => {})
}
/** 处理塔防的图片 */
async function handleTowerImg() {
  source.towerSource = _.cloneDeep(towerData) as unknown as TowerStateType[]
  return Promise.all(towerData.map(async (t, index) => {
    source.towerSource[index].onloadImg = await loadImage(t.img)
    source.towerSource[index].onloadbulletImg = await loadImage(t.bulletImg)
    return
  })).then(() => {})
}

onMounted(() => {
  source.mapLevel = +(route.params.id ?? 1) - 1
  init()
})

</script>

<template>
  <div id='protect-horse-index'>
    <div class="title" @click="$router.push('/')">{{state.title}}</div>
    <ProtectTheHorse
      v-if="state.isProtectTheHorse" 
    />
    <ProgressBar v-if="state.isProgressBar" :progress="state.progress" />
    <UserBall :itemsNum="4" @switchMapLevel="switchMapLevel" />
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
  overflow: hidden;
  .title {
    position: fixed;
    left: 50%;
    top: 1rem;
    transform: translateX(-50%);
    font-size: 24px;
    font-weight: bold;
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
}
</style>