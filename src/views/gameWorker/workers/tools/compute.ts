import { limitRange, powAndSqrt } from "@/utils/tools"

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

export type IsLineInRectParams = {
  k: number
  b: number
  points: PointsTwo
  line: PointsTwo
}
type PointsTwo = {
  x1: number
  y1: number
  x2: number
  y2: number
}
/**
 * 判断线是否与矩形相交；
 * 直线方程: y = kx + b；
 * 矩形的左上角点(x1, y1)和右下角点(x2, y2)
 * @params line: 代表是线段
 */
export const isLineInRect = ({ k, b, points, line }: IsLineInRectParams) => {
  // 检查线和点是否有相交
  const {x1, y1, x2, y2} = points
  // if(!(checkPointsInLine(points, line) || checkLineInPoints(points, line))) {
  if(checkPointsOutSideLine(points, line)) {
    return false
  }
  if (k === 0) { // 水平
    return y1 <= b && b <= y2;
  } else if (k === Infinity) { // 垂直
    return x1 <= line.x1 && line.x1 <= x2;
  } else {
    // 计算直线与矩形的四条边的交点
    const xLeft = (y1 - b) / k;
    const xRight = (y2 - b) / k;
    const yTop = k * x1 + b;
    const yBottom = k * x2 + b;
    // 判断交点是否在矩形的边界内
    return (
      (x1 <= xLeft && xLeft <= x2) || 
      (x1 <= xRight && xRight <= x2) || 
      (y1 <= yTop && yTop <= y2) ||
      (y1 <= yBottom && yBottom <= y2)
    )
  }
}
/** 检查点到线两端的距离 */
function checkPointsOutSideLine(points: PointsTwo, line: PointsTwo) {
  const px = (points.x1 + points.x2) / 2, py = (points.y1 + points.y2) / 2
  const v1 = powAndSqrt(px - line.x1, py - line.y1)
  const v2 = powAndSqrt(px - line.x2, py - line.y2)
  const lineV = powAndSqrt(line.x2 - line.x1, line.y2 - line.y1)
  return v1 > lineV || v2 > lineV
}
/** 检查点在两线之间 */
function checkPointsInLine(points: PointsTwo, line: PointsTwo) {
  const valX = checkMinMax(line.x1, line.x2)
  const valY = checkMinMax(line.y1, line.y2)
  const arr = [
    valX.min <= points.x1 && points.x1 <= valX.max,
    valX.min <= points.x2 && points.x2 <= valX.max,
    valY.min <= points.y1 && points.y1 <= valY.max,
    valY.min <= points.y2 && points.y2 <= valY.max
  ]
  return (
    arr[0] && arr[2] ||
    arr[1] && arr[2] ||
    arr[1] && arr[3] ||
    arr[0] && arr[3]
  )
}
/** 检查线在两点之间 */
function checkLineInPoints(line: PointsTwo, points: PointsTwo) {
  const valX = checkMinMax(points.x1, points.x2)
  const valY = checkMinMax(points.y1, points.y2)
  const arr = [
    valX.min <= line.x1 && line.x1 <= valX.max,
    valX.min <= line.x2 && line.x2 <= valX.max,
    valY.min <= line.y1 && line.y1 <= valY.max,
    valY.min <= line.y2 && line.y2 <= valY.max
  ]
  return (
    arr[0] && arr[2] ||
    arr[0] && arr[3] ||
    arr[1] && arr[2] ||
    arr[1] && arr[3]
  )
}
function checkMinMax(v1: number, v2: number) {
  return {min: Math.min(v1, v2), max: Math.max(v1, v2)}
}