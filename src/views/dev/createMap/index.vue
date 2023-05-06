<script setup lang='ts'>
import { useSourceStore } from '@/stores/source';
import { checkInRect, createTwoArray } from '@/utils/tools';
import _ from 'lodash';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { AreaKeyType, AreaType } from './type';
import { loadImage } from '@/utils/handleImg'
import otherImgData from '@/dataSource/otherImgData';
import { ElButton } from 'element-plus';

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
    lineW: 6.25,
    /** 距离浏览器左边距离 */
    left: 0,
    /** 距离浏览器上边距离 */
    top: 0,
  },
  size: 50,
  ctx: null as unknown as CanvasRenderingContext2D,
  animationFrame: 0,
  /** 格子信息 */
  gridArr: createTwoArray(12, 20, () => 0),
  floorImgList: [otherImgData.floor],
  floorOnloadImgs: [] as HTMLImageElement[],
})
const mouseFloor = reactive({
  x: 0,
  y: 0,
  imgIndex: 0,
  /** 是否允许绘画 */
  isDraw: false,
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

async function init() {
  state.ctx = canvasRef.value!.getContext("2d") as CanvasRenderingContext2D;
  getCanvasWrapInfo()
  await initData()
  setTimeout(() => {
    startDraw()
  }, 0);
}

async function initData() {
  state.floorOnloadImgs = await Promise.all(state.floorImgList.map(img => loadImage(img)))
}

function startDraw() {
  drawLine()
}

/** 画线 */
function drawLine() {
  const {colNum, rowNum, lineW} = state.canvasInfo
  const {w, h} = state.canvasInfo
  const size = state.size
  const ctx = state.ctx
  // 四周边框
  ctx.lineWidth = lineW
  ctx.strokeStyle = '#ddeafb'
  ctx.strokeRect(lineW / 2, lineW / 2, w - lineW, h - lineW)
  ctx.fillStyle = '#ddeafb'
  // 竖线
  for(let i = 1; i < colNum; i++) {
    ctx.fillRect(size * i - lineW / 2, lineW, lineW, h + lineW)
  }
  // 横线
  for(let i = 1; i < rowNum; i++) {
    ctx.fillRect(lineW, size * i - lineW / 2, w + lineW, lineW)
  }
}

function onClickFloor(e: MouseEvent, i: number) {
  document.addEventListener("mousemove", onMouseMove);
  mouseFloor.imgIndex = i
  mouseFloor.x = e.clientX - state.size / 4
  mouseFloor.y = e.clientY - state.size / 4
}
function onMouseMove(e: MouseEvent) {
  mouseFloor.x = e.clientX - state.size / 4
  mouseFloor.y = e.clientY - state.size / 4
  // 按住地板进行绘画
  if(!mouseFloor.isDraw) { 
    return
  }
  if(!isInCanvas(e)) {
    onCancelDrawFloor()
    return
  }
  onDrawFloor(e)
}
/** 点击画地板 */
function onMouseFloorClick(e: MouseEvent) {
  if (e.button === 0) { // 左击
    if(!isInCanvas(e)) return
    mouseFloor.isDraw = true
    onDrawFloor(e)
  }
}
function onCancelDrawFloor() {
  mouseFloor.isDraw = false
}
function onRightClick() {
  document.removeEventListener("mousemove", onMouseMove);
  mouseFloor.x = 0
  mouseFloor.y = 0
}

/** 在canvas中画地板 */
function onDrawFloor(e: MouseEvent) {
  const { left, top, lineW } = state.canvasInfo
  const size = state.size / source.ratio
  const row = Math.floor((e.clientY - top) / size)
  const col = Math.floor((e.clientX - left) / size)
  if(state.gridArr[row][col]) return
  state.gridArr[row][col] = 1
  const imgW = state.size - lineW
  state.ctx.drawImage(state.floorOnloadImgs[mouseFloor.imgIndex], col * state.size + lineW / 2, row * state.size + lineW / 2, imgW, imgW)
}
/** 当前event是否在canvas中 */
function isInCanvas(e: MouseEvent) {
  const { left, top, w, h } = state.canvasInfo
  return checkInRect({x: e.clientX, y: e.clientY}, {x: left, y: top, w: w / source.ratio, h: h / source.ratio})
}
function clearCanvas() {
  state.ctx.clearRect(0, 0, state.canvasInfo.w, state.canvasInfo.h)
  // 将二维数组中的值置为0
  state.gridArr = JSON.parse(JSON.stringify(state.gridArr).replace(/\d+/g, '0'))
  startDraw()
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
  state.canvasInfo.left = canvasWrapRef.value?.offsetLeft ?? 0
  state.canvasInfo.top = canvasWrapRef.value?.offsetTop ?? 0
  state.size = width / state.canvasInfo.colNum
  const lineW = state.size / 8
  state.canvasInfo.lineW = lineW
}
function calcArea(area: AreaType) {
  Object.keys(area).forEach((key) => {
    area[key as AreaKeyType] *= source.ratio
  })
}

</script>

<template>
  <div class='createMap'>
    <div class="createMap-area" :style="{'--size': state.size / source.ratio + 'px'}">
      <div class="floorWrap">
        <div 
          v-for="(floor, i) in state.floorImgList" 
          :key="i" 
          class="floor"
        >
          <img :src="floor" class="floorImg" @mousedown="onClickFloor($event, i)">
        </div>
      </div>
      <div class="right">
        <div class="tools">
          <ElButton @click="clearCanvas">清空画布</ElButton>
        </div>
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
      <div 
        class="mouseFloor"
        :style="{
          top: (mouseFloor.y || -999) + 'px',
          left: (mouseFloor.x || -999) + 'px',
        }"
        @mousedown="onMouseFloorClick"
        @mouseup="onCancelDrawFloor"
        @contextmenu.prevent="onRightClick"
      >
        <img :src="state.floorImgList[mouseFloor.imgIndex]" class="mouseFloor-img">
      </div>
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
  &-area {
    @size: var(--size);
    display: flex;
    .floorWrap {
      .floorImg {
        width: @size;
        height: @size;
      }
    }
    .tools {
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      background-color: #ddeafb;
    }
    .createMap-canvasWrap {
      width: 90vw;
      height: 54vw;
      border: 1px solid #ccc;
    }
    .mouseFloor {
      position: fixed;
      &-img {
        width: @size;
        height: @size;
        user-select: none;
        -webkit-user-drag: none;
      }
    }
  }
}
</style>