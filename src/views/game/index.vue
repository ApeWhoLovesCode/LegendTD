<script setup lang='ts'>
import { nextTick, onMounted, reactive, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import ProgressBar from '@/components/progressBar.vue'
import LevelSelect from '@/components/levelSelect.vue'
import ProtectTheHorse from './protectTheHorse.vue'

import { setTheme } from '@/assets/theme/theme'
import { loadImage, gifToStaticImg } from '@/utils/handleImg'
import { isMobile } from '@/utils/tools'

import towerData from '@/dataSource/towerData'
import enemyData from '@/dataSource/enemyData'
import _ from 'lodash'
import floorTitleIcon from "@/assets/img/floor-tile.png"
import { IndexType } from '@/type';

const state = reactive<IndexType>({
  title: '保卫大司马',
  // 当前选择的地图
  mapLevel: 0,
  // 当前加载进度
  progress: 0,
  isProgressBar: true,
  // 控制游戏区域的显示与隐藏
  isProtectTheHorse: false,
  // 静态图片资源(地板，阻挡物等)
  imgObj: {
    // floorTile: import("@/assets/img/floor-tile.png")
    floorTile: floorTitleIcon
  },
  // 敌人资源
  enemySource: enemyData,
  // 塔防数据 
  towerList: towerData,
  // 加载完成的静态图片
  imgOnloadObj: null,
  // 塔防加载完成图片
  towerOnloadImg: null,
  // 塔防子弹加载完成图片
  towerBulletOnloadImg: null,
  // 判断是否是手机
  isMobile: false,
  // 用于切换关卡克隆出来的一份数据
  newEnemySource: undefined,
  newTowerList: undefined
})
const route = useRoute()
const router = useRouter()
const progressStep = computed<number>(() => {
  return 95 / state.enemySource.length
})

/** 初始化加载图片等内容 */
async function init() {
  // 加载图片
  await allGifToStaticImg()
  state.imgOnloadObj = await loadImage(state.imgObj);
  state.towerOnloadImg = await loadImage(state.towerList, 'img');
  state.towerBulletOnloadImg = await loadImage(state.towerList, 'bulletImg');
  state.progress = 100
  handleData()
  setTimeout(() => {
    state.isProgressBar = false
    state.isProtectTheHorse = true
  }, 200);
}
function handleData() {
  if(state.isMobile) {
    state.newEnemySource = _.cloneDeep(state.enemySource)
    state.newTowerList = _.cloneDeep(state.towerList)
  } else {
    state.newEnemySource = state.enemySource
    state.newTowerList = state.towerList
  }
}
/** 切换地图 */
function switchMapLevel(index: number) {
  if(state.mapLevel === index) return
  state.mapLevel = index
  router.push(`/protectTheHorse/${index}`)
  state.isProtectTheHorse = false
  handleData()
  nextTick(() => {state.isProtectTheHorse = true})
}
/** 等待所有的gif图生成静态图片 */
async function allGifToStaticImg() {
  return Promise.all(state.enemySource.map(async (item, index) => {
    state.enemySource[index].imgList = await gifToStaticImg({type: item.type, imgSource: item.imgSource})
    state.progress += progressStep.value
    return 
  })).then(res => {
    
  })
}

onMounted(() => {
  state.mapLevel = +(route?.query?.id ?? '')
  if(isMobile()) {
    console.log('--is mobile--');
    setTheme('phone')
    state.isMobile = true
  }
  init()
})

</script>

<template>
  <div id='protect-horse-index'>
    <div class="back" @click="$router.push('/')">回到首页</div>
    <div class="title">{{state.title}}</div>
    <ProtectTheHorse
      v-if="state.isProtectTheHorse" 
      :isMobile="state.isMobile"
      :mapLevel="state.mapLevel" 
      :enemySource="state.newEnemySource"
      :towerList="state.newTowerList"
      :imgOnloadObj="state.imgOnloadObj"
      :towerOnloadImg="state.towerOnloadImg"
      :towerBulletOnloadImg="state.towerBulletOnloadImg"
    />
    <LevelSelect :mapLevel="state.mapLevel" @switchMapLevel="switchMapLevel" />
    <ProgressBar v-if="state.isProgressBar" :progress="state.progress" />
  </div>
</template>

<style lang='scss'>
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