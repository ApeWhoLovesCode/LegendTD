<script setup lang='ts'>
import imgSource from '@/dataSource/imgSource';
import levelData from '@/dataSource/levelData';
import { GridInfo } from '@/dataSource/mapData';
import otherImgData from '@/dataSource/otherImgData';
import { useSourceStore } from '@/stores/source';
import { loadImage, requireCDN } from '@/utils/handleImg';
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
  movePath: [] as GridInfo[][]
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
    drawFloorTile()
  }, 10);
}

function init() {
  if(!canvasRef.value) return
  state.ctx = canvasRef.value.getContext("2d");
  initMovePath()
}

function getCanvasWH() {
  const dom = document.querySelector(`.${idRef.value}`)
  const width = (dom?.clientWidth ?? 0) * source.ratio
  const height = (dom?.clientHeight ?? 0) * source.ratio
  state.canvasInfo.w = width
  state.canvasInfo.h = height
  state.size = width / 20
}

/** 初始化行动轨迹 */
function initMovePath() {
  if(!levelData[props.index].start) return
  levelData[props.index].start.forEach((levelStart, startIndex) => {
    const movePathItem: GridInfo & {num?: number} = JSON.parse(
      JSON.stringify(levelStart)
    )
    const length = movePathItem.num!
    delete movePathItem.num
    const movePath: GridInfo[] = [JSON.parse(JSON.stringify(movePathItem))]
    // 控制x y轴的方向 1:左 2:下 3:右 4:上
    let x_y = movePathItem.x_y
    for(let i = 0; i < length; i++) {
      const newXY = levelData[props.index].map[startIndex][i]
      if(newXY) {
        x_y = newXY
      }
      if(x_y % 2) movePathItem.x += x_y === 3 ? 1 : -1
      else movePathItem.y += x_y === 4 ? 1 : -1
      movePathItem.x_y = x_y
      movePath.push(JSON.parse(JSON.stringify(movePathItem)))
    }
    state.movePath.push(movePath)
  })
  setTimeout(() => {
    drawFloorTile()
  }, 10);
}

/** 画起点 */
async function drawStart() {
  const size = state.size
  let startImg = source.othOnloadImg?.start
  if(!startImg) {
    startImg = await loadImage(otherImgData.start)
  }
  levelData[props.index].start.forEach(s => {
    let {x, y} = s
    state.ctx!.drawImage(startImg!, x * size, y * size, size, size)
  })
}

/** 画地板 */
async function drawFloorTile() {
  let floor = source.othOnloadImg?.floor
  if(!floor) {
    floor = await loadImage(otherImgData.floor)
  }
  const size = state.size
  state.ctx?.clearRect(0, 0, state.canvasInfo.w, state.canvasInfo.h)
  state.movePath.forEach(pathArr => {
    for(let f of pathArr) {
      state.ctx?.drawImage(floor!, f.x * size, f.y * size, size, size)
    }
  })
  drawStart()
  /** 画终点 */
  const end = levelData[props.index].end
  const x = end ? end.x * size : state.movePath[0].at(-1)!.x * size
  const y = end ? end.y * size : state.movePath[0].at(-1)!.y * size
  loadImage(imgSource.TerminalImg).then((terminalImg) => {
    state.ctx?.drawImage(terminalImg, x - 0.35 * size, y - 1.42 * size, size * 1.8, size * 2.48)
  })
}

</script>

<template>
  <div class='com-cover-canvas' :class="idRef">
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
</template>

<style lang='less' scoped>
.com-cover-canvas {
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle 250px at center, #16d9e3 0%, #30c7ec 47%, #46aef7 100%);
}
</style>