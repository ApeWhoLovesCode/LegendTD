<script setup lang='ts'>
import { useSourceStore } from '@/stores/source';
import { checkInRect, createTwoArray } from '@/utils/tools';
import _ from 'lodash';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { GridItem, MouseImgType } from './type';
import { loadImage } from '@/utils/handleImg'
import { ElButton, ElMessage, ElSpace, ElTooltip } from 'element-plus';
import { EraserIcon, FlagIcon, AddAndMinusIcon } from './imgSource'
import type {DirectionType} from '@/dataSource/mapData'
import { getDirection, getDirectionVal, getStartDirection } from './utils';
import { range } from '@/utils/format';
import otherImgData from '@/dataSource/otherImgData';

const floorImgList = [otherImgData.floor]
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
  /** 格子信息 0:初始值 1:地板 -1:旗子 */
  gridArr: createTwoArray(12, 20, () => ({v: 0, i: 0})) as GridItem[][],
  /** 地板的累计数量 */
  floorNum: 0,
  floorOnloadImgs: [] as HTMLImageElement[],
  flagOnloadImg: void 0 as HTMLImageElement | undefined,
})
const mouseImg = reactive({
  x: 0,
  y: 0,
  /** 当前图片的索引 */
  imgIndex: 0,
  /** 是否允许绘画 */
  isDraw: false,
  /** img类型 */
  type: '' as MouseImgType,
  /** 新的地板索引，用于覆盖之前的索引 */
  newFloorNum: -1,
})
/** 起点 */
const startFlag = reactive({
  isShow: false,
  row: 0,
  col: 0,
})

const mouseIcons = computed(() => {
  return [...floorImgList, FlagIcon, EraserIcon, AddAndMinusIcon][mouseImg.imgIndex]
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
  state.floorOnloadImgs = await Promise.all(floorImgList.map(img => loadImage(img)))
  state.flagOnloadImg = await loadImage(FlagIcon)
}

function startDraw() {
  state.ctx.clearRect(0, 0, state.canvasInfo.w, state.canvasInfo.h)
  // for(let i = 0; i < 5; i++) {
  //   state.gridArr[2][3 + i].v = 1
  //   state.gridArr[2][3 + i].i = i
  //   state.floorNum++
  // }
  // for(let i = 0; i < 5; i++) {
  //   state.gridArr[3 + i][7].v = 1
  //   state.gridArr[3 + i][7].i = 5 + i
  //   state.floorNum++
  // }
  drawLine()
  drawAllGrid()
  drawFlag()
}

/** 点击拖拽 */
function onClickDrag(e: MouseEvent, i: number, type: MouseImgType) {
  mouseImg.type = type
  document.addEventListener("mousemove", onMouseMove);
  mouseImg.imgIndex = i
  mouseImg.x = e.clientX - state.size / 4
  mouseImg.y = e.clientY - state.size / 4
}

function onMouseMove(e: MouseEvent) {
  mouseImg.x = e.clientX - state.size / 4
  mouseImg.y = e.clientY - state.size / 4
  // 按住地板进行绘画
  if(!mouseImg.isDraw) { 
    return
  }
  if(!isInCanvas(e)) {
    onMouseUp()
    return
  }
  onDrawMouseImg(e)
}
/** 点击画地板 */
function onMouseFloorClick(e: MouseEvent) {
  if(e.button === 0) { // 左击
    if(!isInCanvas(e)) return
    mouseImg.isDraw = true
    onDrawMouseImg(e)
  }
}
function onMouseUp() {
  mouseImg.isDraw = false
}
function onRightClick() {
  document.removeEventListener("mousemove", onMouseMove);
  mouseImg.x = 0
  mouseImg.y = 0
  mouseImg.type = ''
}
/** 在canvas中画鼠标拖拽的图片 */
function onDrawMouseImg(e: MouseEvent) {
  const { left, top } = state.canvasInfo
  const size = state.size / source.ratio
  const row = Math.floor((e.clientY - top) / size)
  const col = Math.floor((e.clientX - left) / size)
  const item = state.gridArr[row][col]
  switch (mouseImg.type) {
    case 'floor': {
      if(item.v) return
      const {x, y, gridW} = getGridInside(col, row)
      item.v = 1
      item.i = state.floorNum
      state.floorNum++
      drawGrid({
        img: state.floorOnloadImgs[mouseImg.imgIndex], text: item.i + '', x, y, gridW
      })
      return
    }
    case 'flag': {
      if(item.v) return
      if(startFlag.isShow) {
        const {x, y, gridW} = getGridInside(startFlag.col, startFlag.row)
        state.ctx.clearRect(x, y, gridW, gridW)
        state.gridArr[startFlag.row][startFlag.col].v = 0
      }
      startFlag.isShow = true
      startFlag.row = row
      startFlag.col = col
      item.v = -1
      drawFlag()
      return
    }
    case 'eraser': {
      if(!item.v) return
      const {x, y, gridW} = getGridInside(col, row)
      changeOtherGrid(item.i!, -1)
      state.floorNum--
      state.ctx.clearRect(x, y, gridW, gridW)
      item.v = 0
      item.i = void 0
      return
    }
    case 'oneselfAdd': {
      handleAndDrawGridVal(item, item.i! + 1, row, col)
      return
    }
    case 'oneselfMinus': {
      handleAndDrawGridVal(item, item.i! - 1, row, col)
      return
    }
    case 'nextAdd': {
      if(item.v !== 1 || mouseImg.newFloorNum === item.i) return
      if(mouseImg.newFloorNum < 0) {
        mouseImg.newFloorNum = item.i!
      } else {
        mouseImg.newFloorNum++
        item.i = mouseImg.newFloorNum
        handleAndDrawGridVal(item, item.i, row, col)
      }
      return
    }
  }
}
/** 改变前面或后面的格子信息 */
function changeOtherGrid(floorNum: number, addVal: number, isNext = true) {
  const {rowNum, colNum} = state.canvasInfo
  for(let i = 0; i < rowNum; i++) {
    for(let j = 0; j < colNum; j++) {
      const item = state.gridArr[i][j]
      const isOther = isNext ? item.i! >= floorNum : item.i! <= floorNum
      if(item.v > 0 && isOther) {
        handleAndDrawGridVal(item, item.i! + addVal, i, j)
      }
    }
  }
}
/** 改变格子的值 */
function handleAndDrawGridVal(item: GridItem, itemNewI: number, row: number, col: number) {
  item.i = range(itemNewI, 0, state.floorNum - 1);
  const {x, y, gridW} = getGridInside(col, row)
  state.ctx.clearRect(x, y, gridW, gridW)
  drawGrid({
    img: state.floorOnloadImgs[item.v - 1], text: item.i + '', x, y, gridW
  })
}
/** 获取格子内部的信息，不包括边框 */
function getGridInside(col: number, row: number) {
  const {lineW} = state.canvasInfo
  return {
    gridW: state.size - lineW,
    x: col * state.size + lineW / 2,
    y: row * state.size + lineW / 2,
  }
}

/** 导出数据 */
function exportData() {
  if(!startFlag.isShow) return ElMessage.warning('请选择旗子作为敌人起点~')
  const floorTotal = state.gridArr.reduce((pre, cur) => {
    cur.forEach(v => pre += v.v)
    return pre
  }, 0)
  if(!floorTotal) return ElMessage.warning('当前没有地板~')
  const res: {[key in number]: DirectionType} = {} 
  let row = startFlag.row, col = startFlag.col;
  let item = getStartDirection(state.gridArr, row, col)
  let xy = item?.xy
  if(!item) return ElMessage.warning('旗子附近没有地板~')
  row = item.row
  col = item.col
  const mapInfoItem = {x: col, y: row, x_y: xy, num: floorTotal}
  for(let i = 1; i < floorTotal - 1; i++) {
    const item = getDirectionVal(state.gridArr, row, col, xy!)
    row = item.row
    col = item.col
    const _xy = getDirection(state.gridArr, row, col);
    if(!_xy) return ElMessage.warning('请将所有地板格子相连~')
    if(_xy !== xy) {
      xy = _xy
      res[i] = _xy
    }
  }
  console.log(res);
  console.log(mapInfoItem);
}

/** ------ 绘画 ------ */
function drawGrid({img, x, y, gridW, text}: {
  img: HTMLImageElement, x: number, y: number, gridW: number, text?: string
}) {
  state.ctx.drawImage(img, x, y, gridW, gridW)
  if(!text) return
  state.ctx.font = `${gridW / 1.5}px 宋体`
  state.ctx.textAlign = 'center';
  state.ctx.textBaseline = "middle";
  state.ctx.fillText(text, x + gridW / 2, y + gridW / 2)
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
    ctx.fillRect(size * i - lineW / 2, lineW, lineW, h)
  }
  // 横线
  for(let i = 1; i < rowNum; i++) {
    ctx.fillRect(lineW, size * i - lineW / 2, w, lineW)
  }
  ctx.fillStyle = '#b4d4fa'
  // 竖的中线
  ctx.fillRect(size * (colNum / 2) - lineW / 2, lineW, lineW, h - lineW * 2)
  ctx.fillRect(lineW, size * (rowNum / 2) - lineW / 2, w - lineW * 2, lineW)
}
/** 根据值绘画所有的格子 */
function drawAllGrid() {
  const {rowNum, colNum} = state.canvasInfo
  for(let i = 0; i < rowNum; i++) {
    for(let j = 0; j < colNum; j++) {
      if(state.gridArr[i][j].v > 0) {
        const {x, y, gridW} = getGridInside(j, i)
        drawGrid({
          img: state.floorOnloadImgs[state.gridArr[i][j].v - 1], 
          text: state.gridArr[i][j].i + '', 
          x, 
          y, 
          gridW
        })
      }
    }
  }
}
function drawFlag() {
  if(startFlag.isShow) {
    const {x, y, gridW} = getGridInside(startFlag.col, startFlag.row)
    state.ctx.drawImage(state.flagOnloadImg!, x, y, gridW, gridW)
  }
}
/** ------ 绘画 end ------ */

/** 当前event是否在canvas中 */
function isInCanvas(e: MouseEvent) {
  const { left, top, w, h } = state.canvasInfo
  return checkInRect({x: e.clientX, y: e.clientY}, {x: left, y: top, w: w / source.ratio, h: h / source.ratio})
}
function clearCanvas() {
  // 将二维数组中的值置为0
  state.gridArr = JSON.parse(JSON.stringify(state.gridArr).replace(/\d+/g, '0'))
  startFlag.isShow = false
  state.floorNum = 0
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

</script>

<template>
  <div class='createMap' :style="{'--size': state.size / source.ratio + 'px'}">
    <div>
      <div class="createMap-area">
        <div class="floorWrap">
          <div 
            v-for="(floor, i) in floorImgList" 
            :key="i" 
            class="floor"
          >
            <img :src="floor" class="floorImg" @mousedown="onClickDrag($event, i, 'floor')">
          </div>
        </div>
        <div class="right">
          <ElSpace class="tools">
            <ElSpace class="toolsLeft">
              <ElTooltip content="起点的标志" placement="top">
                <div class="iconWrap" @click="onClickDrag($event, floorImgList.length, 'flag')">
                  <img :src="FlagIcon" alt="" class="flagIcon">
                </div>
              </ElTooltip>
              <ElTooltip content="清除某个格子" placement="top">
                <div class="iconWrap" @click="onClickDrag($event, floorImgList.length + 1, 'eraser')">
                  <img :src="EraserIcon" alt="" class="eraserIcon">
                </div>
              </ElTooltip>
            </ElSpace>
            <ElSpace>
              <ElTooltip content="以该格为索引起始，移动为后面的格子赋值" placement="top">
                <ElButton type="primary" @click="onClickDrag($event, floorImgList.length + 2, 'nextAdd')">
                  Next +1
                </ElButton>
              </ElTooltip>
              <ElTooltip content="使该格索引加一" placement="top">
                <ElButton @click="onClickDrag($event, floorImgList.length + 2, 'oneselfAdd')">
                  索引 +1
                </ElButton>
              </ElTooltip>
              <ElTooltip content="使该格索引减一" placement="top">
                <ElButton @click="onClickDrag($event, floorImgList.length + 2, 'oneselfMinus')">
                  索引 -1
                </ElButton>
              </ElTooltip>
            </ElSpace>
          </ElSpace>
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
          class="mouseImg"
          :style="{
            top: (mouseImg.y || -999) + 'px',
            left: (mouseImg.x || -999) + 'px',
          }"
          @mousedown="onMouseFloorClick"
          @mouseup="onMouseUp"
          @contextmenu.prevent="onRightClick"
        >
          <img :src="mouseIcons" class="mouseImg-img">
        </div>
      </div>
      <ElSpace class="createMap-bottom">
        <div>
          <ElButton type="danger" @click="clearCanvas">清空画布</ElButton>
        </div>
        <div>
          <ElButton @click="exportData">导出数据</ElButton>
        </div>
      </ElSpace>
    </div>
  </div>
</template>

<style lang='less' scoped>
.createMap {
  @size: var(--size);
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .header {
    position: fixed;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    padding: 12px;
  }
  &-area {
    display: flex;
    .floorWrap {
      user-select: none;
      border: 1px solid #ccc;
      padding: 12px;
      .floorImg {
        width: @size;
        height: @size;
      }
    }
    .tools {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      background-color: #ddeafb;
      &Left {
        display: flex;
        align-items: center;
      }
      .iconWrap {
        padding: 5px 10px;
        background-color: rgba(255, 255, 255, .4);
        border-radius: 6px;
        user-select: none;
        &:hover {
          cursor: pointer;
          transform: scale(1.1);
          background-color: rgba(255, 255, 255, .5);
        }
        .eraserIcon { 
          width: 25px;
          height: 25px;
        }
        .flagIcon {
          width: 25px;
          height: 25px;
        }
      }
    }
    .createMap-canvasWrap {
      width: 90vw;
      height: 54vw;
      border: 1px solid #ccc;
    }
    .mouseImg {
      position: fixed;
      &-img {
        width: @size;
        height: @size;
        user-select: none;
        -webkit-user-drag: none;
      }
    }
  }
  &-bottom {
    width: 100%;
    padding: 12px;
    background-color: #e0eafb;
    justify-content: space-between;
  }
}
</style>