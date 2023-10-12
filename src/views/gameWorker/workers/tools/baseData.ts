import { EnemyStateType } from "@/type/game";
import { powAndSqrt, randomNumList } from "@/utils/tools";
import { VueFnName } from "../type/worker";
import keepInterval from "@/utils/keepInterval";
import sourceInstance from "@/stores/sourceInstance";
import { enemyState, makeEnemy } from "./enemy";
import levelData, { LevelDataItemEnum } from "@/dataSource/levelData";
import { TowerName } from "@/dataSource/towerData";
import levelEnemyArr from "@/dataSource/levelEnemyArr";
import { GridValue } from "../type/baseData";
import { MapDataItem } from "@/dataSource/mapData";

const source = sourceInstance.state

const setting = {
  /** 是否是高刷屏 */
  isHighRefreshScreen: false,
  /** 控制等级的切换 */
  isLevelLock: false,
  /** 是否是开发测试模式 */
  isDevTestMode: false,
  /** 是否是塔防展示组件 */
  isTowerCover: false,
  /** 塔防名字 */
  tname: '' as TowerName,
  /** 敌人索引列表 */
  enemyList: [] as {i: number, level?: number}[],
}

const baseDataState = {
  /** 当前的地图数据 */
  mapItem: {} as MapDataItem,
  // 格子数量信息
  gridInfo: { x_num: 20, y_num: 12, arr: [] as GridValue[][] },
  // 等级
  level: 0,
  // 生命值
  hp: 10,
  // 金钱
  money: 5000,
  // 敌人生成间隔时间
  intervalTime: 900,
  /** 终点的位置 */
  end: {x: 0, y: 0},
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

/** 是否是体验模式 */
const isExperience = levelData[source.mapLevel].type === LevelDataItemEnum.Experience
/** 是否是无限火力模式 */
const isInfinite = levelData[source.mapLevel].type === LevelDataItemEnum.Endless

/** 初始化所有格子 */
function initAllGrid() {
  const { x_num, y_num } = baseDataState.gridInfo
  const arr: GridValue[][] = []
  for(let i = 0; i < y_num; i++) {
    arr.push([])
    for(let j = 0; j < x_num; j++) {
      arr[i][j] = ''
    }
  }
  baseDataState.gridInfo.arr = arr
}

function onLevelChange() {
  const level = baseDataState.level
  setTimeout(() => {
    enemyState.createdEnemyNum = 0
    const enemyDataArr = levelData[source.mapLevel]?.enemyArr ?? levelEnemyArr[0]
    // 获取地图关卡中的敌人数据
    if(!isInfinite) {
      if(level < enemyDataArr.length) {
        enemyState.levelEnemy = enemyDataArr[level]
      } else {
        enemyState.levelEnemy = randomNumList(level)
      }
    } else { // 无限火力 第一关 每个怪兽都遍历生成一次
      enemyState.levelEnemy = level ? randomNumList(level + 5) : Array.from({length: enemyDataArr.length}, (_, i) => i)
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
  isExperience,
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
