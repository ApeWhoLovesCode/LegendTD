<script setup lang='ts'>
import { useSourceStore } from '@/stores/source';
import { checkInRect, createTwoArray } from '@/utils/tools';
import _ from 'lodash';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { GridItem, MouseImgType } from './type';
import { loadImage } from '@/utils/handleImg'
import { ElButton, ElMessage, ElSpace, ElTooltip } from 'element-plus';
import { EraserIcon, AddAndMinusIcon } from './imgSource'
import type {DirectionType, MapDataItem, MapGridInfo} from '@/dataSource/mapData'
import { getDirection, getDirectionVal, getStartDirection } from './utils';
import { range } from '@/utils/format';
import otherImgData from '@/dataSource/otherImgData';
import { START_MAX_COUNT, getFlagImg, startColors, startColors2 } from './config';
import ImgSource from '@/dataSource/imgSource';
import { addRowColArr } from '@/utils/direction';

const floorImgList = [otherImgData.floor]
let floorOnloadImgs: HTMLImageElement[] = []
let terminalOnloadImg: HTMLImageElement | undefined = void 0
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
  /** 格子信息二维数组 */
  gridArr: createTwoArray(12, 20, () => ({v: 0, i: []})) as GridItem[][],
  /** 当前的起点索引 */
  curFlagIndex: 0,
  /** 地板的累计数量, 和上面的起点索引对应 */
  floorNumList: [0, 0, 0, 0],
  /** 新的地板索引，用于覆盖之前的索引 */
  newFloorNum: -1,
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
})
/** 起点 */
const startFlag = reactive<{
  row: number
  col: number
}[]>([])
/** 起点 */
const end = ref<{row: number, col: number}>()

const flagIconSrc = computed(() => {
  let i = state.curFlagIndex
  return getFlagImg(i > 3 ? 0 : i, false) as string
})

const mouseIcons = computed(() => {
  if(mouseImg.type === 'flag') {
    return flagIconSrc.value
  }
  return [...floorImgList, EraserIcon, ImgSource.TerminalImg, AddAndMinusIcon][mouseImg.imgIndex]
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
  // devTry()
  setTimeout(() => {
    startDraw()
  }, 0);
}

async function initData() {
  floorOnloadImgs = await Promise.all(floorImgList.map(img => loadImage(img)))
  terminalOnloadImg = await loadImage(ImgSource.TerminalImg)
}

function startDraw() {
  state.ctx.clearRect(0, 0, state.canvasInfo.w, state.canvasInfo.h)
  drawLine()
  drawAllGrid()
  drawAllFlagAndEnd()
}

/** 点击拖拽 */
function onClickDrag(e: MouseEvent, type: MouseImgType, i?: number) {
  mouseImg.type = type
  document.addEventListener("mousemove", onMouseMove);
  switch(type) {
    case 'floor': {
      mouseImg.imgIndex = i!
      break;
    }
    case 'eraser': {
      mouseImg.imgIndex = floorImgList.length
      break;
    }
    case 'end': {
      mouseImg.imgIndex = floorImgList.length + 1
      break;
    }
    case 'oneselfAdd':
    case 'oneselfMinus':
    case 'nextAdd': {
      mouseImg.imgIndex = floorImgList.length + 2
      break;
    }
    case 'zeroing': {
      mouseImg.imgIndex = floorImgList.length + 2
      break;
    }
  }
  mouseImg.x = e.clientX - state.size / 4
  mouseImg.y = e.clientY - state.size / 4
}

function onChangeFlagIndex() {
  state.newFloorNum = -1 // 切换完地板路径，需要清空一下该值
  if(state.curFlagIndex < startFlag.length - 1) {
    state.curFlagIndex++
  } else {
    state.curFlagIndex = 0
  }
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
  switch(mouseImg.type) {
    case 'nextAdd': {
      state.newFloorNum = -1
    }
  }
  mouseImg.type = ''
}
/** 在canvas中画鼠标拖拽的图片 */
function onDrawMouseImg(e: MouseEvent) {
  const { left, top } = state.canvasInfo
  const size = state.size / source.ratio
  const row = Math.floor((e.clientY - top) / size)
  const col = Math.floor((e.clientX - left) / size)
  const item = state.gridArr[row][col]
  const curIndex = state.curFlagIndex
  switch (mouseImg.type) {
    case 'floor': {
      if(item.v === -1) return
      // 排除当前路径的地板
      if(item.v > 0 && item.i[state.curFlagIndex] !== void 0) return
      const {x, y, gridW} = getGridInside(col, row)
      item.v = 1
      item.i[curIndex] = state.floorNumList[curIndex]
      state.floorNumList[curIndex]++
      drawGrid({
        img: floorOnloadImgs[mouseImg.imgIndex], itemI: item.i, x, y, gridW
      })
      return
    }
    case 'flag': {
      if(item.v) return
      if(startFlag.length >= START_MAX_COUNT) return
      startFlag.push({row, col})
      state.curFlagIndex = startFlag.length - 1
      item.v = -1
      drawFlag(row, col, state.curFlagIndex)
      return
    }
    case 'end': {
      if(item.v) return
      if(end.value) {
        const {x, y, gridW} = getGridInside(end.value.col, end.value.row)
        state.gridArr[end.value.row][end.value.col].v = 0
        state.ctx.clearRect(x, y, gridW, gridW)
      }
      end.value = {row, col}
      item.v = -2
      drawEnd(row, col)
      return
    }
    case 'eraser': {
      if(!item.v) return
      const {x, y, gridW} = getGridInside(col, row)
      changeOtherGrid(item.i[curIndex], -1)
      if(item.v === -1) { // 删除旗子的数据
        const fIndex = startFlag.findIndex(f => f.row === row && f.col === col)
        if(fIndex !== -1) {
          startFlag.splice(fIndex, 1)
        }
      } else if(item.v === -2) {
        end.value = void 0
      }
      item.i.forEach(((v, i) => {
        if(v !== void 0) {
          state.floorNumList[i] = Math.max(state.floorNumList[i] - 1, 0)
        }
      }))
      state.ctx.clearRect(x, y, gridW, gridW)
      item.v = 0
      item.i = []
      return
    }
    case 'oneselfAdd': {
      handleAndDrawGridVal(item, item.i[curIndex] + 1, row, col)
      return
    }
    case 'oneselfMinus': {
      handleAndDrawGridVal(item, item.i[curIndex] - 1, row, col)
      return
    }
    case 'zeroing': {
      handleAndDrawGridVal(item, 0, row, col)
      return
    }
    case 'nextAdd': {
      if(item.v !== 1 || state.newFloorNum === item.i[curIndex]) return
      if(state.newFloorNum < 0) {
        state.newFloorNum = item.i[curIndex]
      } else {
        state.newFloorNum++
        item.i[curIndex] = state.newFloorNum
        handleAndDrawGridVal(item, item.i[curIndex], row, col)
      }
      return
    }
  }
}
/** 改变前面或后面的格子信息 */
function changeOtherGrid(floorNum: number, addVal: number, isNext = true) {
  const {rowNum, colNum} = state.canvasInfo
  const curIndex = state.curFlagIndex
  for(let i = 0; i < rowNum; i++) {
    for(let j = 0; j < colNum; j++) {
      const item = state.gridArr[i][j]
      const isOther = isNext ? item.i[curIndex] >= floorNum : item.i[curIndex] <= floorNum
      if(item.v > 0 && isOther) {
        handleAndDrawGridVal(item, item.i[curIndex] + addVal, i, j)
      }
    }
  }
}
/** 改变格子的值 */
function handleAndDrawGridVal(item: GridItem, itemNewI: number, row: number, col: number) {
  item.i[state.curFlagIndex] = range(itemNewI, 0, state.floorNumList[state.curFlagIndex]);
  const {x, y, gridW} = getGridInside(col, row)
  state.ctx.clearRect(x, y, gridW, gridW)
  drawGrid({
    img: floorOnloadImgs[item.v - 1], itemI: item.i, x, y, gridW
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

/** ------ 绘画 ------ */
function drawGrid({img, x, y, gridW, itemI}: {
  img: HTMLImageElement, x: number, y: number, gridW: number, itemI: number[]
}) {
  state.ctx.drawImage(img, x, y, gridW, gridW)
  const gridValue = itemI.reduce((pre, cur, index) => {
    if(cur !== void 0) {
      pre.length++;
      // 当该格只有1个值时才有效，用于绘画颜色
      pre.curFlagIndex = index
    }
    return pre
  }, {length: 0, curFlagIndex: 0})
  if(!gridValue.length) return
  state.ctx.textAlign = 'center';
  state.ctx.textBaseline = "middle";
  switch (gridValue.length) {
    case 1: {
      state.ctx.fillStyle = startColors2[gridValue.curFlagIndex];
      itemI.forEach((i) => {
        if(i === void 0) return 
        drawGridValue({
          fontSize: gridW / 1.5, x: x + gridW / 2, y: y + gridW / 2, text: i + ''
        })
      })
      break;
    }
    case 2: {
      let drawI = 0;
      itemI.forEach((i, flagIndex) => {
        if(i === void 0) return 
        state.ctx.fillStyle = startColors2[flagIndex];
        drawGridValue({
          fontSize: gridW / 2, x: x + gridW * (drawI % 2 ? 3 : 1) / 4, y: y + gridW / 2, text: i + ''
        })
        drawI++;
      })
      break;
    }
    case 3: {
      let drawI = 0;
      itemI.forEach((i, flagIndex) => {
        if(i === void 0) return 
        state.ctx.fillStyle = startColors2[flagIndex];
        drawGridValue({
          fontSize: gridW / 2, 
          x: x + gridW * (drawI ? (drawI === 1 ? 1 : 3) : 2) / 4, 
          y: y + gridW * (drawI ? 3 : 1) / 4, 
          text: i + ''
        })
        drawI++;
      })
      break;
    }
    case 4: {
      let drawI = 0;
      itemI.forEach((i, flagIndex) => {
        if(i === void 0) return 
        state.ctx.fillStyle = startColors2[flagIndex];
        drawGridValue({
          fontSize: gridW / 2, 
          x: x + gridW * (drawI % 2 ? 3 : 1) / 4, 
          y: y + gridW * (drawI > 1 ? 3 : 1) / 4, 
          text: i + ''
        })
        drawI++;
      })
      break;
    }
  }
}
function drawGridValue({fontSize, x, y, text}: {fontSize: number, text: string, x: number, y: number}) {
  state.ctx.font = `${fontSize}px 宋体`;
  state.ctx.fillText(text, x, y);
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
          img: floorOnloadImgs[state.gridArr[i][j].v - 1], 
          itemI: state.gridArr[i][j].i, 
          x, 
          y, 
          gridW
        })
      }
    }
  }
}
function drawAllFlagAndEnd() {
  startFlag.forEach((flag, i) => {
    drawFlag(flag.row, flag.col, i)
  })
  if(end.value?.row) {
    drawEnd(end.value.row, end.value.col)
  }
}
function drawFlag(row: number, col: number, i: number) {
  const {x, y, gridW} = getGridInside(col, row)
  const flagImg = getFlagImg(i) as HTMLImageElement
  flagImg.onload = () => {
    state.ctx.drawImage(flagImg, x, y, gridW, gridW)
  }
}
function drawEnd(row: number, col: number) {
  const {x, y, gridW} = getGridInside(col, row)
  state.ctx.drawImage(terminalOnloadImg!, x, y, gridW, gridW)
}
/** ------ 绘画 end ------ */

/** 当前event是否在canvas中 */
function isInCanvas(e: MouseEvent) {
  const { left, top, w, h } = state.canvasInfo
  return checkInRect({x: e.clientX, y: e.clientY}, {x: left, y: top, w: w / source.ratio, h: h / source.ratio})
}
function clearCanvas() {
  // 将二维数组中的值置为0
  // state.gridArr = JSON.parse(JSON.stringify(state.gridArr).replace(/\d+/g, '0'))
  state.gridArr.forEach(arr => {
    arr.forEach(item => {
      item.v = 0
      item.i = []
    })
  })
  state.curFlagIndex = 0
  startFlag.length = 0
  state.floorNumList = [0, 0, 0, 0]
  end.value = void 0
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

/** 导出数据 */
function exportData() {
  if(!startFlag.length) return ElMessage.warning('请选择旗子作为敌人起点~')
  if(!end.value) return ElMessage.warning('请选择萝卜作为敌人终点~')
  const res: MapDataItem = {start: [], map: [], end: {x: end.value.col, y: end.value.row}} 
  for(let flagIndex = 0; flagIndex < startFlag.length; flagIndex++) {
    res.map.push({})
    let {row, col} = startFlag[flagIndex]
    const mapInfoItem: MapGridInfo = {x: col, y: row, x_y: 1, num: 0}
    let item = getStartDirection(state.gridArr, row, col, flagIndex)
    let xy = item?.xy
    if(!item) return ElMessage.warning('旗子附近没有地板~')
    row = item.row
    col = item.col
    mapInfoItem.x_y = xy ?? 1
    let i = 1;
    // 当前遍历的路径，可能会由于当前路径不足以到终点，走其他路径的路
    let _flagIndex = flagIndex
    while(row !== end.value.row || col !== end.value.col) {
      const item = getDirectionVal(state.gridArr, row, col, xy!)
      row = item.row
      col = item.col
      const direction = getDirection(state.gridArr, row, col, _flagIndex, end.value);
      if(!direction) return ElMessage.warning('请将所有地板格子相连~')
      if(direction.xy === 'end') break; // 该路径到达终点
      _flagIndex = direction.flagIndex // 如果路径不同就被修改到其他的路径上了
      if(direction.xy !== xy) {
        xy = direction.xy
        res.map[flagIndex][i] = direction.xy
      }
      i++;
    }
    mapInfoItem.num = i
    res.start.push(mapInfoItem)
  }
  console.log(res);
}

/** 尝试绘画新路径 */
function devTryNewPath({row, col, path}: {
  row: number
  col: number
  /** d: 方向 n: 遍历次数 */
  path: {d: DirectionType, n: number}[]
}) {
  // 设置起点
  startFlag.push({row, col})
  state.gridArr[row][col].v = -1;
  // 设置后续的格子
  function addGridArr(row: number, col: number, i: number) {
    state.gridArr[row][col].v = 1
    state.gridArr[row][col].i[startFlag.length - 1] = i
    state.floorNumList[startFlag.length - 1]++;
  }
  let sum = 0;
  path.forEach(({d, n: forNum}) => {
    const {addRow, addCol} = addRowColArr[d - 1]
    for(let i = 0; i < forNum; i++) {
      addGridArr(row += addRow, col += addCol, sum++)
    }
  })
  // 第一条路径的尽头就是终点
  if(startFlag.length === 1) {
    const {addRow, addCol} = addRowColArr[(path.at(-1)?.d ?? 1) - 1]
    row += addRow;
    col += addCol;
    state.gridArr[row][col].v = -2
    end.value = {row, col}
  }
}

function devTry() {
  // 路径一
  devTryNewPath({
    row: 5,
    col: 10,
    path: [
      {d: 3, n: 3}, {d: 2, n: 3}, {d: 1, n: 5}, {d: 4, n: 3}
    ]
  })
  // 路径一
  devTryNewPath({
    row: 6,
    col: 11,
    path: [
      {d: 3, n: 2}, {d: 4, n: 3}, {d: 1, n: 5}, {d: 2, n: 2}
    ]
  })
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
            <img :src="floor" class="floorImg" @mousedown="onClickDrag($event, 'floor', i)">
          </div>
        </div>
        <div class="right">
          <ElSpace class="tools">
            <ElSpace class="toolsLeft">
              <ElTooltip content="起点的标志" placement="top">
                <div class="iconWrap" @click="onClickDrag($event, 'flag')">
                  <img :src="flagIconSrc" alt="" class="iconImg">
                </div>
              </ElTooltip>
              <ElTooltip content="清除某个格子" placement="top">
                <div class="iconWrap" @click="onClickDrag($event, 'eraser')">
                  <img :src="EraserIcon" alt="" class="iconImg">
                </div>
              </ElTooltip>
              <ElTooltip content="终点的标志" placement="top">
                <div class="iconWrap" @click="onClickDrag($event, 'end')">
                  <img :src="ImgSource.TerminalImg" alt="" class="iconImg">
                </div>
              </ElTooltip>
            </ElSpace>
            <ElSpace>
              <ElTooltip content="切换接下来的敌人路径的索引" placement="top">
                <ElButton :type="startColors[state.curFlagIndex]" @click="onChangeFlagIndex">
                  当前的路径是: {{ state.curFlagIndex + 1 }}
                </ElButton>
              </ElTooltip>
            </ElSpace>
            <ElSpace>
              <ElTooltip content="以该格为索引起始，移动为后面的格子赋值" placement="top">
                <ElButton type="primary" @click="onClickDrag($event, 'nextAdd')">
                  Next +1
                </ElButton>
              </ElTooltip>
              <ElTooltip content="使该格索引置为零" placement="top">
                <ElButton size="small" @click="onClickDrag($event, 'zeroing')">
                  索引置 0
                </ElButton>
              </ElTooltip>
              <ElTooltip content="使该格索引加一" placement="top">
                <ElButton size="small" @click="onClickDrag($event, 'oneselfAdd')">
                  索引 +1
                </ElButton>
              </ElTooltip>
              <ElTooltip content="使该格索引减一" placement="top">
                <ElButton size="small" @click="onClickDrag($event, 'oneselfMinus')">
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
        .iconImg { 
          width: 25px;
          height: 25px;
          object-fit: cover;
        }
      }
    }
    .createMap-canvasWrap {
      // 20 / 12
      width: 80vw;
      height: 48vw;
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