<script setup lang='ts'>
import { DirectionType, GridInfo } from '@/dataSource/mapData';
import { useSourceStore } from '@/stores/source';
import { randomStr } from '@/utils/random';
import { onMounted, onUnmounted, reactive, ref } from 'vue';

const props = defineProps<{
  index: number;
}>()
const source = useSourceStore()
const idRef = ref(randomStr('com-cover-canvas'))
const canvasRef = ref<HTMLCanvasElement>()
const state = reactive({
  ctx: null as CanvasRenderingContext2D | null,
  canvasInfo: {w: 0, h: 0},
  /** 地板大小 */
  size: 10,
  movePath: [] as GridInfo[]
})

onMounted(() => {
  setTimeout(() => {
    getCanvasWH()
    init()
  }, 10);
  window.addEventListener("resize", resizeFn);
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeFn)
})

const resizeFn = () => {
  getCanvasWH()
  setTimeout(() => {
    initMovePath()
  }, 10);
}

function init() {
  if(!canvasRef.value) return
  state.ctx = canvasRef.value.getContext("2d");
  initMovePath()
}

function getCanvasWH() {
  const dom = document.querySelector(`.${idRef.value}`)
  const height = dom?.clientHeight ?? 0
  state.canvasInfo.w = dom?.clientWidth ?? 0
  state.canvasInfo.h = height
  state.size = height / 7
}

/** 初始化行动轨迹 */
function initMovePath() {
  const size = state.size
  const movePathItem: GridInfo & {num?: number} = {x: 1, y: 4, x_y: 3, num: 20}
  const mapData: {[key in number]: DirectionType} = {6: 2, 10: 1, 16: 4}
  movePathItem.x *= size
  movePathItem.y = movePathItem.y * size + size
  const length = movePathItem.num!
  delete movePathItem.num
  const movePath: GridInfo[]  = []
  // 控制x y轴的方向 1:左 2:下 3:右 4:上
  let x_y = movePathItem.x_y
  for(let i = 0; i < length; i++) {
    const newXY = mapData[i]
    if(newXY) {
      x_y = newXY
    }
    if(x_y % 2) movePathItem.x += x_y === 3 ? size : -size
    else movePathItem.y += x_y === 4 ? size : -size
    movePathItem.x_y = x_y
    movePath.push(JSON.parse(JSON.stringify(movePathItem)))
  }
  state.movePath = movePath
  setTimeout(() => {
    drawFloorTile()
  }, 10);
}

/** 画地板 */
function drawFloorTile() {
  if(!source.imgOnloadObj?.floor) return
  state.ctx?.clearRect(0, 0, state.size, state.size)
  for(let f of state.movePath) {
    state.ctx?.drawImage(source.imgOnloadObj.floor!, f.x, f.y, state.size, state.size)
  }
}

</script>

<template>
  <div class='com-tower-canvas' :class="idRef">
    <canvas 
      ref="canvasRef"
      :width="state.canvasInfo.w"
      :height="state.canvasInfo.h"
    ></canvas>
  </div>
</template>

<style lang='less' scoped>
.com-tower-canvas {
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle 250px at center, #16d9e3 0%, #30c7ec 47%, #46aef7 100%);
}
</style>