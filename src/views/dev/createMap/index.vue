<script setup lang='ts'>
import { useSourceStore } from '@/stores/source';
import _ from 'lodash';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { loadImage } from '@/utils/handleImg'
import { ElButton, ElMessage, ElSpace, ElTooltip } from 'element-plus';
import { EraserIcon, AddAndMinusIcon } from './imgSource'
import type {DirectionType, MapDataItem, MapGridInfo} from '@/dataSource/mapData'
import otherImgData from '@/dataSource/otherImgData'
import { getDirection, getDirectionVal, getStartDirection } from './utils';
import { getFlagImg, startColors } from './config';
import { addRowColArr } from '@/utils/direction';
import useMouseImg from './hooks/useMouseImg';
import { floorImgList, state, onloadImg, end, startFlag } from './hooks/baseData';
import { drawAllFlagAndEnd, drawAllGrid, drawLine } from './hooks/drawFun';

const source = useSourceStore()
const canvasWrapRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

const {mouseImg, onClickDrag, onMouseFloorClick, onRightClick, onMouseUp} = useMouseImg()

const flagIconSrc = computed(() => {
  let i = state.curFlagIndex
  return getFlagImg(i > 3 ? 0 : i, false) as string
})

const mouseIcons = computed(() => {
  if(mouseImg.type === 'flag') {
    return flagIconSrc.value
  }
  return [...floorImgList, EraserIcon, otherImgData.terminal, AddAndMinusIcon][mouseImg.imgIndex]
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
  onloadImg.floor = await Promise.all(floorImgList.map(img => loadImage(img)))
  onloadImg.terminal = await loadImage(otherImgData.terminal)
}

function startDraw() {
  state.ctx.clearRect(0, 0, state.canvasInfo.w, state.canvasInfo.h)
  drawLine()
  drawAllGrid()
  drawAllFlagAndEnd()
}

function onChangeFlagIndex() {
  state.newFloorNum = -1 // 切换完地板路径，需要清空一下该值
  if(state.curFlagIndex < startFlag.length - 1) {
    state.curFlagIndex++
  } else {
    state.curFlagIndex = 0
  }
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
                  <img :src="otherImgData.terminal" alt="" class="iconImg">
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
      width: 80vmin;
      height: 48vmin;
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