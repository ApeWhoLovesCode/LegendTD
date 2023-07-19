import { limitRange } from "@/utils/tools"

/** 根据两个坐标点获取到达边界位置的xy */
export function getEndXy({x, y, tx, ty, endX, endY}: {
  x: number
  y: number
  tx: number
  ty: number
  endX: number
  endY: number
}) {
  let finalX = 0, finalY = 0
  if(x > tx && y > ty) {
    finalX = 0, finalY = 0
  } else if(x < tx && y > ty) {
    finalX = endX
  } else if(x < tx && y < ty) {
    finalX = endX
    finalY = endY
  } else if(x > tx && y < ty) {
    finalY = endY
  }
  const tan = (y - finalY) / (x - finalX)
  const tan_t = (y - ty) / (x - tx)
  const abs_tan = Math.abs(tan)
  const abs_tan_t = Math.abs(tan_t)
  let tailX = 0, tailY = 0;
  if(abs_tan_t > abs_tan) {
    tailY = y > ty ? 0 : endY
    tailX = limitRange(x - (y - tailY) / tan_t, 0, endX)
  } else if(abs_tan_t < abs_tan) {
    tailX = x > tx ? 0 : endX
    tailY = limitRange(y - (x - tailX) * tan_t, 0, endY)
  }
  return {x: tailX, y: tailY}
}