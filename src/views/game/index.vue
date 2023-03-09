<script setup lang='ts'>
import { nextTick, onMounted, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import ProgressBar from '@/components/progressBar.vue'
import ProtectTheHorse from './game.vue'

import _ from 'lodash'

import { IndexType } from '@/type';
import { useSourceStore } from '@/stores/source';
import UserBall from '@/components/userBall.vue'

const state = reactive<IndexType>({
  title: '塔防联盟',
  isProgressBar: true,
  // 控制游戏区域的显示与隐藏
  isProtectTheHorse: false,
})
const source = useSourceStore()
const route = useRoute()
const router = useRouter()

/** 初始化加载图片等内容 */
async function init() {
  source.loadingAllImg().then(() => {
    setTimeout(() => {
      state.isProgressBar = false
      state.isProtectTheHorse = true
    }, 100);
  })
}
/** 切换地图 */
function switchMapLevel(index: number) {
  if(source.mapLevel === index) return
  source.mapLevel = index
  router.push(`/game/${index + 1}`)
  state.isProtectTheHorse = false
  nextTick(() => {state.isProtectTheHorse = true})
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
    <ProgressBar v-if="state.isProgressBar" :progress="Math.ceil(source.progress)" />
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