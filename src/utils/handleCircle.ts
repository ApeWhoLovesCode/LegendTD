/**
 *  弧度 = 弧长 / 半径 = 角度 * π / 180;  弧长 = (角度 / 360) * 周长
 *  const sin30 = Math.sin(30 * Math.PI / 180)  // 0.5  求sin
 *  const deg_30 = 180 * Math.asin(1 / 2) / Math.PI  // 30 求 角度
 */

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
