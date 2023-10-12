import { reactive } from "vue"
import { GridItem, MouseImgType } from "../type"
import { end, floorImgList, onloadImg, getGridInside, startFlag, state } from "./baseData"
import { useSourceStore } from "@/stores/source"
import { checkInRect } from "@/utils/tools"
import { range } from "@/utils/format"
import { drawEnd, drawFlag, drawGrid } from "./drawFun"
import { START_MAX_COUNT } from "../config"

export default () => {
  const source = useSourceStore()
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

  /** 点击画地板 */
  function onMouseFloorClick(e: MouseEvent) {
    if(e.button === 0) { // 左击
      if(!isInCanvas(e)) return
      mouseImg.isDraw = true
      onDrawMouseImg(e)
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
          img: onloadImg.floor[mouseImg.imgIndex], itemI: item.i, x, y, gridW
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
      img: onloadImg.floor[item.v - 1], itemI: item.i, x, y, gridW
    })
  }

  /** 当前event是否在canvas中 */
  function isInCanvas(e: MouseEvent) {
    const { left, top, w, h } = state.canvasInfo
    return checkInRect({x: e.clientX, y: e.clientY}, {x: left, y: top, w: w / source.ratio, h: h / source.ratio})
  }

  function onMouseUp() {
    mouseImg.isDraw = false
  }

  return {
    mouseImg,
    onClickDrag,
    onMouseFloorClick,
    onRightClick,
    onMouseUp,
  }
}