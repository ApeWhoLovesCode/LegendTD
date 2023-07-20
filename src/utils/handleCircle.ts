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
}
/**
 * 判断线是否与矩形相交；
 * 直线方程: y = kx + b；
 * 矩形的左上角点(x1, y1)和右下角点(x2, y2)
 */
export const isLineInRect = ({ k, b, x1, y1, x2, y2 }: IsLineInRectParams) => {
  // 判断直线是否与矩形的边界相交
  if (k === undefined) {
    return y1 <= b && b <= y2;
  } else {
    // 计算直线与矩形的四条边的交点
    const xLeft = (y1 - b) / k;
    const xRight = (y2 - b) / k;
    const yTop = k * x1 + b;
    const yBottom = k * x2 + b;
    // 判断交点是否在矩形的边界内
    return (x1 <= xLeft && xLeft <= x2 && y1 <= yTop && yTop <= y2) ||
      (x1 <= xRight && xRight <= x2 && y1 <= yBottom && yBottom <= y2) ||
      (x1 <= xLeft && xLeft <= x2 && y1 <= yBottom && yBottom <= y2) ||
      (x1 <= xRight && xRight <= x2 && y1 <= yTop && yTop <= y2);
  }
}

type LineType = {
  x1: number
  y1: number
  x2: number
  y2: number
}
type RectType = {
  x: number
  y: number
  w: number
  h: number
}
export function lineIntersectsRect(line: LineType, rect: RectType) {
  // 矩形的四个边
  var edges = [
    { x1: rect.x, y1: rect.y, x2: rect.x + rect.w, y2: rect.y }, // 上边
    { x1: rect.x, y1: rect.y, x2: rect.x, y2: rect.y + rect.h }, // 左边
    { x1: rect.x + rect.w, y1: rect.y, x2: rect.x + rect.w, y2: rect.y + rect.h }, // 右边
    { x1: rect.x, y1: rect.y + rect.h, x2: rect.x + rect.w, y2: rect.y + rect.h } // 下边
  ];
  for (var i = 0; i < edges.length; i++) {
    if (lineIntersectsLine(line, edges[i])) {
      return true;
    }
  }
  return false;
}

function lineIntersectsLine(line1: LineType, line2: LineType) {
  var a1 = line1.y2 - line1.y1;
  var b1 = line1.x1 - line1.x2;
  var c1 = a1 * line1.x1 + b1 * line1.y1;

  var a2 = line2.y2 - line2.y1;
  var b2 = line2.x1 - line2.x2;
  var c2 = a2 * line2.x1 + b2 * line2.y1;

  var delta = a1 * b2 - a2 * b1;

  return delta != 0;
}