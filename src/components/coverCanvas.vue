<script setup lang='ts'>
import mapData, { GridInfo, mapGridInfoList } from '@/dataSource/mapData';
import { useSourceStore } from '@/stores/source';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';

const props = defineProps<{
  index: number;
  isOnload: boolean
}>()
const source = useSourceStore()
const canvasRef = ref<HTMLCanvasElement>()
const state = reactive({
  ctx: null as CanvasRenderingContext2D | null,
  canvasInfo: {w: 0, h: 0},
  /** 地板大小 */
  size: 10,
  movePath: [] as GridInfo[]
})

watch(() => props.isOnload, () => {
  if(props.isOnload) {
    drawFloorTile()
  }
})

onMounted(() => {
  setTimeout(() => {
    init()
  }, 10);
  window.addEventListener("resize", resizeFn);
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeFn)
})

const resizeFn = () => {
  getCanvasWH()
  initMovePath()
  drawFloorTile()
}

function init() {
  state.ctx = canvasRef.value!.getContext("2d");
  getCanvasWH()
  initMovePath()
}

function getCanvasWH() {
  const dom = document.querySelector('.com-cover-canvas')
  const width = dom?.clientWidth ?? 0
  state.canvasInfo.w = dom?.clientWidth ?? 0
  state.canvasInfo.h = dom?.clientHeight ?? 0
  state.size = width / 21
  initMovePath()
}

/** 初始化行动轨迹 */
function initMovePath() {
  const size = state.size
  if(!mapGridInfoList[props.index]) return
  const movePathItem: GridInfo & {num?: number} = JSON.parse(JSON.stringify(mapGridInfoList[props.index]))
  movePathItem.x *= size
  movePathItem.y *= size
  const length = movePathItem.num!
  delete movePathItem.num
  const movePath: GridInfo[]  = []
  // 控制x y轴的方向 1:左 2:下 3:右 4:上
  let x_y = movePathItem.x_y
  for(let i = 0; i < length; i++) {
    const newXY = mapData[props.index][i]
    if(newXY) {
      x_y = newXY
    }
    if(x_y % 2) movePathItem.x = movePathItem.x * size + (x_y === 3 ? size : -size)
    else movePathItem.y = movePathItem.y * size + (x_y === 4 ? size : -size)
    movePathItem.x_y = x_y
    movePath.push(JSON.parse(JSON.stringify(movePathItem)))
  }
  state.movePath = movePath
}

/** 画地板 */
function drawFloorTile() {
  for(let f of state.movePath) {
    state.ctx?.drawImage(source.imgOnloadObj.floor!, f.x, f.y, state.size, state.size)
  }
}

</script>

<template>
  <div class='com-cover-canvas'>
    <canvas 
      ref="canvasRef"
      :width="state.canvasInfo.w"
      :height="state.canvasInfo.h"
    ></canvas>
  </div>
</template>

<style lang='less' scoped>
.com-cover-canvas {
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle 250px at center, #16d9e3 0%, #30c7ec 47%, #46aef7 100%);
}
</style>