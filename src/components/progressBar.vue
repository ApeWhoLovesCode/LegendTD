<template>
  <div class="com-progress-bar">
    <div class="progress-wrap">
      <div class="progress-title">正在努力加载中~</div>
      <canvas ref="progressCanvasRef" id="canvas-progress" :width="state.canvasInfo.w" :height="state.canvasInfo.h" :style="canvasStyle"></canvas>
      <div class="progress-text">{{Math.round(props.progress)}} / 100%</div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { reactive, computed, watch, onMounted, onBeforeUnmount, ref } from 'vue';

const props =  defineProps({
  progress: {
    type: Number,
    default: 0
  }
})

const progressCanvasRef = ref<HTMLCanvasElement>()
const state = reactive({
  ctx: null as CanvasRenderingContext2D | null,
  canvasInfo: {w: 0, h: 0},
  curProgress: 0,
  animationFrame: 0,
})

const canvasStyle = computed(() => {
  const { h } = state.canvasInfo
  return {background: '#fff', borderRadius: `${h / 2}px`}
})

watch(() => props.progress, (newVal, oldVal) => {
  state.curProgress = oldVal
  startAnimation(newVal)
})

onMounted(() => {
  getCanvasInfo();
})
onBeforeUnmount(() => {
  cancelAnimationFrame(state.animationFrame)
})

const getCanvasInfo = () => {
  state.ctx = progressCanvasRef.value!.getContext("2d");
  state.canvasInfo.w = Math.round(document.documentElement.clientWidth * 0.6)
  state.canvasInfo.h = Math.round(document.documentElement.clientHeight * 0.05)
}
/** 开启动画绘画 */
const startAnimation = (newVal: number) => {
  (function go() {
    drawProgress(++state.curProgress);
    if (state.curProgress < newVal ) {
      // 时间间隔为 1000/60 每秒 60 帧
      state.animationFrame = requestAnimationFrame(go);
    } else {
      cancelAnimationFrame(state.animationFrame)
    }
  })();
}
const drawProgress = (newVal: number) => {
  const { w, h } = state.canvasInfo
  state.ctx?.clearRect(0, 0, w, h);
  const _w = w * newVal / 100
  //创建一个渐变色线性对象
  const grad = state.ctx!.createLinearGradient(0, 0, _w, h);
  //定义渐变色颜色
  grad.addColorStop(0,"#00f2fe");
  grad.addColorStop(1,"#4facfe");                  
  state.ctx!.fillStyle = grad
  state.ctx!.fillRect(0, 0, _w, h)
}
</script>
<style lang='less' scoped>
@import '@/style.less';
.com-progress-bar {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, .3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  .progress-wrap {
    .progress-title {
      margin-bottom: 12px;
      text-align: center;
      color: #3fb5f9;
      font-size: 20px;
      font-weight: bold;
    }
    .progress-text {
      text-align: right;
      margin-top: 8px;
      font-size: 16px;
      font-weight: bold;
      color: #5bb3e5;
    }
  }
}
</style>