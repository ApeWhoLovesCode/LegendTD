/**
 *  弧度 = 弧长 / 半径 = 角度 * π / 180;  弧长 = (角度 / 360) * 周长
 *  const sin30 = Math.sin(30 * Math.PI / 180)  // 0.5  求sin
 *  const deg_30 = 180 * Math.asin(1 / 2) / Math.PI  // 30 求 角度
 */

import { powAndSqrt } from "./tools";

/** 传入两个坐标，返回弧度 */
export const getPointsRadian = (start: Location, end: Location) => {
  const _x = end.x - start.x, _y = end.y - start.y;
  return Math.atan(_y / _x)
}
/** 传入两个坐标，返回sin值 */
export const getPointsSin = (start: Location, end: Location) => {
  return Math.sin(getPointsRadian(start, end))
}
/** 传入两个坐标，返回cos值 */
export const getPointsCos = (start: Location, end: Location) => {
  return Math.cos(getPointsRadian(start, end))
}
/** 弧度转角度 */
export const radianToAngle = (v: number) => v * Math.PI / 180

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
