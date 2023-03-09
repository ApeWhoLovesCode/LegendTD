/** 用于比较num 最大和最小不能超过边界值 */
export function range(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

