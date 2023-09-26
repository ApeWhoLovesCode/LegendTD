import { DirectionType } from "@/dataSource/mapData";
import { GridItem } from "./type";

/** 获取起点格子的方向并移动 */
export function getStartDirection(arr: Array<GridItem[]>, row: number, col: number) {
  const array = [
    {addRow: 0, addCol: -1},
    {addRow: -1, addCol: 0},
    {addRow: 0, addCol: 1},
    {addRow: 1, addCol: 0},
  ]
  for(let i = 0; i < array.length; i++) {
    if(arr[row + array[i].addRow][col + array[i].addCol].v) {
      return {xy: i + 1 as DirectionType, row: row + array[i].addRow, col: col + array[i].addCol}
    }
  }
}

/** 从二维数组中获取方向 */
export function getDirection(
  arr: Array<GridItem[]>, row: number, col: number, flagIndex: number, end: {row: number, col: number}
): {xy: DirectionType | 'end', flagIndex: number} | undefined {
  const array = [
    {addRow: 0, addCol: -1},
    {addRow: -1, addCol: 0},
    {addRow: 0, addCol: 1},
    {addRow: 1, addCol: 0},
  ]
  for(let i = 0; i < array.length; i++) {
    const cur = arr[row][col]
    const nextRow = row + array[i].addRow, nextCol = col + array[i].addCol
    const next = arr[nextRow]?.[nextCol]
    let isNextGrid = next && cur.i[flagIndex] && cur.i[flagIndex] + 1 === next.i[flagIndex]
    // 尝试走其他的路径中可走的路
    if(!isNextGrid) {
      for(let otherI = 0; otherI < cur.i.length; otherI++) {
        if(otherI === flagIndex) break;
        const _isNextGrid = cur.i[otherI] && cur.i[otherI] + 1 === next.i[otherI]
        if(_isNextGrid) {
          isNextGrid = _isNextGrid
          flagIndex = otherI
        }
      }
    }
    if(next?.v && isNextGrid) {
      return {xy: i + 1 as DirectionType, flagIndex};
    }
    if(end.row === nextRow && end.col === nextCol) {
      return {xy: 'end', flagIndex}
    }
  }
}

/** 根据方向值返回二维数组的值和新的row col */
export function getDirectionVal(arr: Array<GridItem[]>, row: number, col: number, v: DirectionType) {
  let value 
  switch (v) {
    case 1: {value = arr[row][--col].v; break};
    case 2: {value = arr[--row][col].v; break};
    case 3: {value = arr[row][++col].v; break};
    case 4: {value = arr[++row][col].v; break};
  }
  return {value, row, col}
}