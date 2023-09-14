/** 区域类型 */
export type AreaType = {
  x: number
  y: number
  w: number
  h: number
}

export type AreaKeyType = keyof AreaType

export type GridItem = {v: number, i?: number}

export type MouseImgType = '' 
| 'floor'
| 'eraser' 
| 'flag' 
| 'oneselfAdd'
| 'oneselfMinus'
| 'previousAdd' 
| 'previousMinus' 
| 'nextAdd' 
| 'nextMinus' 