import { EnemyStateType } from "@/type/game";
import { powAndSqrt } from "@/utils/tools";

const baseDataState = {
  // 地板：大小 数量
  floorTile: {size: 50, num: 83},
  // 格子数量信息 arr: [[ 0:初始值(可以放塔)，1:地板，2:有阻挡物，10(有塔防：10塔防一，11塔防二...) ]]
  gridInfo: { x_num: 21, y_num: 12, size: 50, arr: [] as (string | number)[][] },
  // 等级
  level: 0,
  // 生命值
  hp: 10,
  // 金钱
  money: 5000,
  // 敌人生成间隔时间
  intervalTime: 900,
  // 当前关卡地图信息
  mapGridInfoItem: {x: 0, y: 9, x_y: 1, num: 0}
}

/** 初始化所有格子 */
function initAllGrid() {
  const { x_num, y_num } = baseDataState.gridInfo
  const arr: number[][] = []
  for(let i = 0; i < x_num; i++) {
    arr.push([])
    for(let j = 0; j < y_num; j++) {
      arr[i][j] = 0
    }
  }
  baseDataState.gridInfo.arr = arr
}

/** 判断值是否在圆内 */
function checkValInCircle(enemy: EnemyStateType, target: TargetCircleInfo) {
  const {x, y, w, h} = enemy
  const angleList = [
    calculateDistance(target, x, y),
    calculateDistance(target, x + w, y),
    calculateDistance(target, x + w, y + h),
    calculateDistance(target, x , y + h),
  ]
  return angleList.some(item => item <= target.r)
}

/** 计算点到圆心的距离之间的距离 */
function calculateDistance(target: TargetCircleInfo, x: number, y: number) {
  const {x: _x, y: _y, size} = target
  const size_2 = (size ?? baseDataState.gridInfo.size) / 2
  return powAndSqrt(_x + size_2 - x, _y + size_2 - y)
}

export {
  baseDataState,
  initAllGrid,
  checkValInCircle,
}

export type TargetCircleInfo = {
  x: number
  y: number
  /** 半径 */
  r: number
  /** 目标的大小 */
  size?: number
  /** 目标的数量 */
  targetNum?: number
}
