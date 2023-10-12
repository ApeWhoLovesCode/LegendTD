import { getFlagImg, startColors2 } from "../config";
import { end, getGridInside, startFlag, state, onloadImg } from "./baseData";

export function drawGrid({img, x, y, gridW, itemI}: {
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
export function drawLine() {
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
export function drawAllGrid() {
  const {rowNum, colNum} = state.canvasInfo
  for(let i = 0; i < rowNum; i++) {
    for(let j = 0; j < colNum; j++) {
      if(state.gridArr[i][j].v > 0) {
        const {x, y, gridW} = getGridInside(j, i)
        drawGrid({
          img: onloadImg.floor[state.gridArr[i][j].v - 1], 
          itemI: state.gridArr[i][j].i, 
          x, 
          y, 
          gridW
        })
      }
    }
  }
}
export function drawAllFlagAndEnd() {
  startFlag.forEach((flag, i) => {
    drawFlag(flag.row, flag.col, i)
  })
  if(end.value?.row) {
    drawEnd(end.value.row, end.value.col)
  }
}
export function drawFlag(row: number, col: number, i: number) {
  const {x, y, gridW} = getGridInside(col, row)
  const flagImg = getFlagImg(i) as HTMLImageElement
  flagImg.onload = () => {
    state.ctx.drawImage(flagImg, x, y, gridW, gridW)
  }
}
export function drawEnd(row: number, col: number) {
  const {x, y, gridW} = getGridInside(col, row)
  state.ctx.drawImage(onloadImg.terminal!, x, y, gridW, gridW)
}

