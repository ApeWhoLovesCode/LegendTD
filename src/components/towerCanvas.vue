<script setup lang='ts'>
import Worker from "../views/gameWorker/workers/index.ts?worker";
import { TowerName } from '@/dataSource/towerData';
import { useSettingStore } from "@/stores/setting";
import { useSourceStore } from '@/stores/source';
import { randomStr } from '@/utils/random';
import _ from 'lodash';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import Loading from "./loading.vue";

const props = withDefaults(defineProps<{
  tname: TowerName;
  enemyList?: {i: number, level?: number}[];
  isPause?: boolean;
}>(), {
  enemyList: () => [{i: 1}],
  isPause: false,
})
const source = useSourceStore()
const setting = useSettingStore()
const idRef = ref(randomStr('com-cover-canvas'))
const workerRef = ref<Worker>()
const state = reactive({
  canvasInfo: {w: 0, h: 0},
  /** 一格的大小 */
  size: 10,
  isReady: false,
})

watch(() => props.isPause, (isPause) => {
  workerRef.value?.postMessage({
    isPause
  })
})

onMounted(() => {
  setTimeout(() => {
    init()
  }, 10);
})

onUnmounted(() => {
  workerRef.value?.terminate()
})

function init() {
  const dom = document.querySelector(`.${idRef.value}`)
  const width = (dom?.clientWidth ?? 0) * source.ratio
  const height = (dom?.clientHeight ?? 0) * source.ratio
  state.canvasInfo.w = width
  state.canvasInfo.h = height
  state.size = height / 7
  setTimeout(() => {
    initWorker()
  }, 10);
}

function initWorker() {
  const canvasBitmap = document.querySelector(`.${idRef.value} canvas`) as HTMLCanvasElement;
  if(!canvasBitmap) {
    return
  }
  const offscreen = canvasBitmap.transferControlToOffscreen();
  const worker = new Worker()
  workerRef.value = worker
  worker.postMessage({
    init: true,
    isTowerCover: true,
    tname: props.tname,
    enemyList: props.enemyList,
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
      size: state.size,
    },
  }, [offscreen]);
  worker.onmessage = e => {
    const {data} = e
    if(data.fnName === 'onWorkerReady') {
      state.isReady = true
    }
  }
}

</script>

<template>
  <div class='com-tower-canvas' :class="idRef">
    <canvas 
      :width="state.canvasInfo.w"
      :height="state.canvasInfo.h"
      :style="{
        width: state.canvasInfo.w / source.ratio + 'px',
        height: state.canvasInfo.h / source.ratio + 'px',
      }"
    ></canvas>
    <Loading v-if="!state.isReady" class="loading" />
  </div>
</template>

<style lang='less' scoped>
.com-tower-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle 100px at center, #16d9e3 0%, #30c7ec 47%, #46aef7 100%);
  .loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #e7e7e7;
    font-size: 20px;
  }
}
</style>