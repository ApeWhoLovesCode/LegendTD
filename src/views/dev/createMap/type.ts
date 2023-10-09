/** 区域类型 */
export type AreaType = {
  x: number
  y: number
  w: number
  h: number
}

export type AreaKeyType = keyof AreaType

export type GridItem = {
  /** 格子信息: 0:初始值 1:地板(n:第n块地板) -1:旗子 -2:终点 */
  v: number
  /** 地板的索引值 */
  i: number[]
}

export type MouseImgType = '' 
| 'floor'
| 'eraser' 
| 'flag' 
| 'end'
| 'oneselfAdd'
| 'oneselfMinus'
| 'nextAdd' 
| 'chooseFlag'
| 'zeroing'