<script setup lang='ts'>
import { useSourceStore } from '@/stores/source';
import { createTwoArray } from '@/utils/tools';
import _ from 'lodash';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { AreaKeyType, AreaType } from './type';

const source = useSourceStore()
const canvasWrapRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()
const state = reactive({
  canvasInfo: {
    w: 1000,
    h: 600,
    /** 行数 12 */
    rowNum: 12,
    /** 列数 20 */
    colNum: 20,
    /** 线的宽度 */
    lineW: 6.25
  },
  size: 50,
  ctx: null as unknown as CanvasRenderingContext2D,
  animationFrame: 0,
  /** 绘画地图区域 */
  darwArea: {
    x: 100,
    y: 100,
    w: 900,
    h: 500,
  },
  /** 格子信息 */
  gridArr: createTwoArray(12, 20, () => 0),
  /** 地板区域 */
  floorArea: {
    x: 0,
    y: 0,
    w: 80,
    h: 600,
  }
})

onMounted(() => {
  setTimeout(() => {
    init()
  }, 10);
  window.addEventListener('resize', getCanvasWrapInfoDebounce)
})

onUnmounted(() => {
  cancelAnimationFrame(state.animationFrame)
  window.removeEventListener('resize', getCanvasWrapInfoDebounce)
})

function init() {
  state.ctx = canvasRef.value!.getContext("2d") as CanvasRenderingContext2D;
  getCanvasWrapInfo()
  initData()
  setTimeout(() => {
    startDraw()
  }, 0);
}

function initData() {

}

function startDraw() {
  drawLine()
  drawFloorWrap()
}

function drawFloorWrap() {
  const ctx = state.ctx
  const {x, y, w, h} = state.floorArea
  ctx.fillStyle = '#ebf2fe'
  ctx.fillRect(x, y, w, h)
}

/** 画线 */
function drawLine() {
  const {colNum, rowNum, lineW} = state.canvasInfo
  const {x, y, w, h} = state.darwArea
  const size = state.size
  const ctx = state.ctx
  const lineSpace = size
  // 竖线
  for(let i = 0; i <= colNum; i++) {
    ctx.fillStyle = '#cff1d3'
    ctx.fillRect(x - lineW + lineSpace * i, y - lineW, lineW, h + lineW)
  }
  // 横线
  for(let i = 0; i <= rowNum; i++) {
    ctx.fillStyle = '#cff1d3'
    ctx.fillRect(x - lineW, y - lineW + lineSpace * i, w + lineW, lineW)
  }
}

const getCanvasWrapInfoDebounce = _.debounce(() => {
  getCanvasWrapInfo()
  setTimeout(() => {
    startDraw()
  }, 0);
}, 100)
function getCanvasWrapInfo() {
  const width = (canvasWrapRef.value?.clientWidth ?? 0) * source.ratio
  const height = (canvasWrapRef.value?.clientHeight ?? 0) * source.ratio
  state.canvasInfo.w = width
  state.canvasInfo.h = height
  state.size = width / state.canvasInfo.colNum
  state.canvasInfo.lineW = state.size / 8
  const xy = state.size * 2
  state.darwArea.x = xy
  state.darwArea.y = xy
  state.darwArea.w = width - xy
  state.darwArea.h = height - xy
  state.floorArea.w = xy - state.canvasInfo.lineW
  state.floorArea.h = height
}
function calcArea(area: AreaType) {
  Object.keys(area).forEach((key) => {
    area[key as AreaKeyType] *= source.ratio
  })
}

</script>

<template>
  <div class='createMap'>
    <div ref="canvasWrapRef" class="createMap-canvasWrap">
      <canvas 
        ref="canvasRef"
        :width="state.canvasInfo.w"
        :height="state.canvasInfo.h"
        :style="{
          width: state.canvasInfo.w / source.ratio + 'px',
          height: state.canvasInfo.h / source.ratio + 'px',
        }"
      ></canvas>
    </div>
  </div>
</template>

<style lang='less' scoped>
.createMap {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  &-canvasWrap {
    width: 90vw;
    height: 54vw;
    border: 1px solid #ccc;
  }
}
</style>