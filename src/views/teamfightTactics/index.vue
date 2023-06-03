<script setup lang='ts'>
import Worker from "./worker/index.ts?worker"
import { useSourceStore } from '@/stores/source';
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { GAME_MIN_WIDTH, Grid_NUM } from "./config";
import _ from "lodash";

const source = useSourceStore()
const canvasInfo = reactive({
  w: GAME_MIN_WIDTH,
  h: GAME_MIN_WIDTH,
  /** 一格的大小 */
  size: GAME_MIN_WIDTH / Grid_NUM,
})
const workerRef = ref<Worker>()

onMounted(() => {
  init()
  window.addEventListener('resize', getCanvasInfoDebounce)
})
onBeforeUnmount(() => {
  workerRef.value?.terminate()
  window.removeEventListener('resize', getCanvasInfoDebounce)
})

function init() {
  getCanvasInfo()
  setTimeout(() => {
    initWorker()
    // onKeyDown()
  }, 10);
}

function initWorker() {
  const canvasBitmap = document.querySelector('#teamfightTactics-canvas') as HTMLCanvasElement;
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
      size: canvasInfo.size,
    },
  }, [offscreen]);
  worker.onmessage = e => {
    const { data } = e
    const param = data.param
    switch (data.fnName) {
      case '': {

      }
    }
  }
}

const getCanvasInfoDebounce = _.debounce(() => {
  getCanvasInfo()
}, 100)
function getCanvasInfo() {
  // 16
  const width = Math.max(Math.min(window.innerHeight, window.innerWidth), GAME_MIN_WIDTH) * source.ratio
  canvasInfo.w = width
  canvasInfo.h = width
  canvasInfo.size = width / Grid_NUM
}

function onWorkerPostFn(fnName: string, event?: any) {
  workerRef.value?.postMessage({fnName, event})
}

</script>

<template>
  <div 
    class='teamfightTactics' 
    :style="{
      '--size': canvasInfo.size / source.ratio + 'px',
      '--width': canvasInfo.w / source.ratio + 'px',
    }"
  >
    <canvas 
      id="teamfightTactics-canvas"
      ref="canvasRef"
      :width="canvasInfo.w" 
      :height="canvasInfo.h" 
      :style="{
        width: canvasInfo.w / source.ratio + 'px',
        height: canvasInfo.h / source.ratio + 'px',
      }"
    ></canvas>
    <div class="bottom"></div>
  </div>
</template>

<style lang='less' scoped>
@import './style/index.less';
.teamfightTactics {
  @size: var(--size);
  @width: var(--width);
  background-color: #000;
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  #teamfightTactics-canvas {
    background-color: #ccc;
  }
  .bottom {
    @cardW: calc(@width / 6);
    position: fixed;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: @width;
    height: @cardW;
    background-color: #080e10;
    border: 1px solid @yellow;
  }
}
</style>