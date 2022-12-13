import { EnemyStateType, GameBaseData, TowerStateType } from "@/type/game";
import { reactive } from "vue";
import { baseInfoState } from "./baseInfo";
import { enemyState } from "./enemy";
import { gameConfigState } from "./gameConfig";

const baseDataState = reactive<GameBaseData>({
  // 偏移量y 是用来计算敌人与地板底部的距离 (两个地板(50*2)-敌人(h(75)+y(10))) = 10
  offset: {y: 10},
  // 终点位置
  terminal: undefined,
  // 地板：大小 数量
  floorTile: {size: 50, num: 83},
  // 格子数量信息 arr: [[ 0:初始值(可以放塔)，1:地板，2:有阻挡物，10(有塔防：10塔防一，11塔防二...) ]]
  gridInfo: { x_num: 21, y_num: 12, size: 50, arr: [] },
})

/** 移动端按比例缩放数据 */
function initMobileData() {
  if(!props.isMobile) return
  console.log('props.isMobile: ', props.isMobile);
  const p = 0.4
  function handleDecimals(val: number) {
    return val * (p * 1000) / 1000
  }
  baseDataState.gridInfo.size *= p
  baseDataState.offset.y *= p
  gameConfigState.defaultCanvas.w *= p
  gameConfigState.defaultCanvas.h *= p
  baseInfoState.mapGridInfoItem.x *= p
  baseInfoState.mapGridInfoItem.y *= p
  props.enemySource.forEach(item => {
    item.w = handleDecimals(item.w)
    item.h = handleDecimals(item.w)
    item.curSpeed = handleDecimals(item.curSpeed)
    item.speed = handleDecimals(item.speed)
    item.hp.size = handleDecimals(item.hp.size)
  })
  props.towerSource.forEach(item => {
    item.r = handleDecimals(item.r)
    item.speed = handleDecimals(item.speed)
    item.bSize.w = handleDecimals(item.bSize.w)
    item.bSize.h = handleDecimals(item.bSize.h)
  })
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

/** 画地板 */
function drawFloorTile() {
  const size = baseDataState.gridInfo.size
  for(let f of enemyState.movePath) {
    gameConfigState.ctx.drawImage(props.imgOnloadObj.floorTile, f.x, f.y, size, size)
  }
}

/** 返回进入攻击范围的值的数组 */
function enterAttackScopeList(eList: EnemyStateType[], tower: TowerStateType) {
  const list = eList.reduce((pre, enemy) => {
    if(checkValInCircle(enemy, tower)) {
      pre.push({curFloorI: enemy.curFloorI, id: enemy.id})
    }
    return pre
  }, [] as {curFloorI: number, id: string}[])
  list.sort((a, b) => b.curFloorI - a.curFloorI)
  return list.map(item => item.id)
}

/** 判断值是否在圆内 */
function checkValInCircle(enemy: EnemyStateType, tower: TowerStateType) {
  const {x, y, w, h} = enemy
  const angleList = [
    calculateDistance(tower, x, y),
    calculateDistance(tower, x + w, y),
    calculateDistance(tower, x + w, y + h),
    calculateDistance(tower, x , y + h),
  ]
  return angleList.some(item => item <= tower.r)
}

/** 计算点到圆心的距离之间的距离 */
function calculateDistance(tower: TowerStateType, x: number, y: number) {
  const {x: _x, y: _y} = tower
  const size_2 = baseDataState.gridInfo.size / 2
  return powAndSqrt(_x + size_2 - x, _y + size_2 - y)
}
/** 两值平方相加并开方 求斜边 */
function powAndSqrt(val1: number, val2: number) {
  return Math.sqrt(Math.pow(val1, 2) + Math.pow(val2, 2))
}

export {
  baseDataState,
  initMobileData,
  initAllGrid,
  drawFloorTile,
  enterAttackScopeList,
  checkValInCircle,
  calculateDistance,
  powAndSqrt,
}