<script setup lang='ts'>
import { nextTick, onMounted, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import ProtectTheHorse from './game.vue'

import _ from 'lodash'

import { useSourceStore } from '@/stores/source';
import UserBall from '@/components/userBall.vue'
import { requireCDN } from '@/utils/handleImg';
import { ElPopconfirm } from 'element-plus';

const source = useSourceStore()
const route = useRoute()
const router = useRouter()

const state = reactive({
  title: '塔防联盟',
  // 控制游戏区域的显示与隐藏
  isProtectTheHorse: true,
})

/** 初始化加载图片等内容 */
async function init() {
  source.loadingAllImg()
}
/** 切换地图 */
function switchMapLevel(index: number) {
  if(source.mapLevel === index) return
  source.mapLevel = index
  router.push(`/game/${index + 1}`)
  reStart()
}
/** 重新开始 */
function reStart() {
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
    <ElPopconfirm title="您确定要回到首页吗，当前页面游戏数据将清除" @confirm="$router.push('/')">
      <template #reference>
        <div class="title">
          <img :src="requireCDN('LTD.png')" alt="" class="title-icon">
          <span>{{state.title}}</span>
        </div>
      </template>
    </ElPopconfirm>
    <ProtectTheHorse
      v-if="state.isProtectTheHorse" 
      @re-start="reStart"
    />
    <UserBall :itemsNum="4" @switchMapLevel="switchMapLevel" @re-start="reStart" />
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
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    font-weight: bold;
    color: #eee;
    padding: 5px 12px;
    border-radius: 8px;
    animation: fall-animation .8s ease forwards;
    user-select: none;
    cursor: pointer;
    &:hover {
      background-color: rgba(255, 255, 255, .2);
    }
    &-icon {
      width: 3rem;
      height: 3rem;
      margin-right: 12px;
    }
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