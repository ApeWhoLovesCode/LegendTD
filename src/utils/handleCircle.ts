/**
 *  弧度 = 弧长 / 半径 = 角度 * π / 180;  弧长 = (角度 / 360) * 周长
 *  const sin30 = Math.sin(30 * Math.PI / 180)  // 0.5  求sin
 *  const deg_30 = 180 * Math.asin(1 / 2) / Math.PI  // 30 求 角度
 */

/** 传入两个坐标，返回角度 */
export const toAngle = (start: Location, end: Location) => {
  const _x = end.x - start.x, _y = end.y - start.y;
  return 360 * Math.atan(_y / _x) / (2 * Math.PI)
}

/** 传入两个坐标，以坐标系顺时针的形势返回角度 */
export const getAngle = (start: Location, end: Location) => {
  const x = end.x - start.x, y = end.y - start.y;
  const deg = 180 * Math.acos(x / Math.sqrt(x * x + y * y)) / Math.PI;
  return y < 0 ? 360 - deg : deg;
}

/**
 * 获取圆上一条直线两个点之间的角度(线的长度, 半径)
 */
export const getLineAngle = (line: number, oblique: number) => {
  return (Math.asin(line / oblique) * 180) / Math.PI
}

/** 根据传入的(x或y)和半径r 求另一个xy */
export const circleEquation = (xy: number, r: number) => {
  const isReduce = r > xy ? -1 : 1
  return r + isReduce * Math.sqrt(Math.abs(r * r - xy * xy))
}

/** 坐标类型 */
type Location = {
  x: number
  y: number
}

export type IsLineInRectParams = {
  k: number
  b: number
  x1: number
  y1: number
  x2: number
  y2: number
  line: LineSegment
}
type LineSegment = {
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
export const isLineInRect = ({ k, b, x1, y1, x2, y2, line }: IsLineInRectParams) => {
  // 当所有的点都不在线段的范围内，就为false
  const pointList = [{x: x1, y: y1}, {x: x2, y: y1}, {x: x1, y: y2}, {x: x2, y: y2}]
  if(!pointList.some(p => checkPointInLine(p, line))) {
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
function checkPointInLine(point: {x: number, y: number}, line: LineSegment) {
  const valX = checkMinMax(line.x1, line.x2)
  const valY = checkMinMax(line.y1, line.y2)
  return (valX.min <= point.x && point.x <= valX.max) && (valY.min <= point.y && point.y <= valY.max)
}
function checkMinMax(v1: number, v2: number) {
  return {min: Math.min(v1, v2), max: Math.max(v1, v2)}
}
