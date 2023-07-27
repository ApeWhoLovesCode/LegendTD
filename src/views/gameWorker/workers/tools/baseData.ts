import { EnemyStateType } from "@/type/game";
import { powAndSqrt, randomNumList } from "@/utils/tools";
import { VueFnName } from "../type/worker";
import keepInterval from "@/utils/keepInterval";
import sourceInstance from "@/stores/sourceInstance";
import { enemyState, makeEnemy } from "./enemy";
import levelData from "@/dataSource/levelData";
import mapData from "@/dataSource/mapData";

const source = sourceInstance.state

const setting = {
  /** 是否是高刷屏 */
  isHighRefreshScreen: false,
  /** 控制等级的切换 */
  isLevelLock: false,
  /** 是否是开发测试模式 */
  isDevTestMode: false,
}

const baseDataState = {
  // 地板：大小 数量
  floorTile: {size: 50, num: 83},
  // 格子数量信息 arr: [[ 0:初始值(可以放塔)，1:地板，2:有阻挡物，10(有塔防：10塔防一，11塔防二...) ]]
  gridInfo: { x_num: 20, y_num: 12, arr: [] as (string | number)[][] },
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

const gameConfigState = {
  /** 一格的大小 */
  size: 50,
  // requestAnimationFrame api的保存对象
  animationFrame: 0,
  // 得到 canvas 的 2d 上下文
  ctx: null as unknown as CanvasRenderingContext2D,
}

const canvasInfo = {
  offscreen: void 0 as unknown as OffscreenCanvas,
}

/** 是否是无限火力模式 */
const isInfinite = () => source.mapLevel === mapData.length - 1

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

function onLevelChange() {
  const level = baseDataState.level
  setTimeout(() => {
    enemyState.createdEnemyNum = 0
    // 处理地图关卡中的敌人数据
    let enemyDataArr: Array<number[]> | undefined
    for(let i = 0; i < source.mapLevel; i++) { 
      if(levelData[source.mapLevel]?.enemyArr) {
        enemyDataArr = levelData[source.mapLevel].enemyArr
        break
      }
    }
    if(!enemyDataArr) {
      enemyDataArr = levelData[0].enemyArr
    }
    // 获取地图关卡中的敌人数据
    if(level < enemyDataArr.length && !isInfinite()) {
      enemyState.levelEnemy = enemyDataArr[level]
    } else {
      if(isInfinite()) {
        // 无限火力 第一关 每个怪兽都遍历生成一次
        enemyState.levelEnemy = level ? randomNumList(level + 5) : Array.from({length: enemyDataArr.length}, (_, i) => i)
      } else {
        enemyState.levelEnemy = randomNumList(level)
      }
    }
    if(level) {
      addMoney((level + 1) * (20 + Math.ceil(Math.random() * Math.ceil(level / 3))))
      makeEnemy()
    }
    onWorkerPostFn('onLevelChange', level)
  }, 500);
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
  return angleList.some(item => item <= target.r!)
}

/** 计算点到圆心之间的距离 */
function calculateDistance(target: TargetCircleInfo, x: number, y: number) {
  const {x: _x, y: _y, size} = target
  const size_2 = (size ?? gameConfigState.size) / 2
  return powAndSqrt(_x + size_2 - x, _y + size_2 - y)
}

function onReduceHp(hp: number) {
  baseDataState.hp = Math.max(0, baseDataState.hp - hp)
  onWorkerPostFn('onHpChange', baseDataState.hp)
  if(!baseDataState.hp) {
    onGameOver()
  }
}
function onGameOver() {
  keepInterval.clear()
  cancelAnimationFrame(gameConfigState.animationFrame)
}
/** 改变金钱 */
function addMoney(money: number) {
  baseDataState.money += money
}
/** 统一金币 */
function unifiedMoney() {
  onWorkerPostFn('unifiedMoney', baseDataState.money)
}
function onWorkerPostFn(fnName: VueFnName, param?: any) {
  postMessage({fnName, param})
}

export {
  source,
  setting,
  baseDataState,
  gameConfigState,
  canvasInfo,
  isInfinite,
  initAllGrid,
  onLevelChange,
  checkValInCircle,
  calculateDistance,
  onReduceHp,
  onWorkerPostFn,
  addMoney,
  unifiedMoney,
}

export type TargetCircleInfo = {
  x: number
  y: number
  /** 半径 */
  r?: number
  /** 目标的大小 */
  size?: number
  /** 目标的数量 */
  targetNum?: number
}
