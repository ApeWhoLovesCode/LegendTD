import { GridInfo } from "@/dataSource/mapData"
import { DebouncedFunc } from "lodash"
import { TowerCanvasTower, TowerSlowType, TowerType } from "./tower"

export type EnemyName = 'zombie-flag' | 'zombie-1' | 'zombie-2' | 'zombie-3' | 'iron-gate'
| 'rugby' | 'newspaper' | 'zombie-dance' | 'pole-vault' | 'ice-car'
| 'afu' | 'fulisha' | 'dance-little' | 'zombie-little' | 'kunkun'
| 'rabbish' | 'rabbish-2' | 'godzilla' | 'zombie-boom'

export type EnemyDataObj = {[key in EnemyName]: EnemyType}

/** 敌人资源  */
export type EnemyType = {
  name: EnemyName
  w: number
  h: number
  /** 图片的方向是正的 */
  isForward: boolean
  /** 图片的方向是否要翻转 */
  isFlip: boolean
  /** 当前的速度 */
  curSpeed: number
  /** 原本的速度 */
  speed: number
  reward: number
  hp: {
    cur: number
    sum: number
    level?: number
  }
  /** 僵尸技能 */
  skill?: {
    /** 技能cd */
    time: number
    /** 技能持续时间 */
    keepTime?: number
    /** 技能动画播放 */
    animation?: {
      cur: number
      sum: number
    }
    /** 技能对塔防的总伤害 */
    damage?: number
    /** 技能范围，初始值是size的多少倍 */
    r?: number
    /** 技能方向 */
    direction?: {
      x: number
      y: number
      /** y = kx + b 的斜率 */
      k: number
      /** y轴截距 */
      b: number
    } 
    /** 被技能锁定的塔防 */
    towerIds?: string[]
    /** 技能图片 */
    img?: string
    /** 技能释放次数 */
    count?: number
    /** 技能是否触发 */
    isTriggle?: boolean
  }
  /** 音频播放的key值 */
  audioKey: string
  /** 图片类型 */
  imgType: 'gif' | 'png'
  /** 图片资源 */
  imgSource: string
  /** 死亡图片 */
  dieImg?: string
}

/** 敌人的类型 */
export type EnemyStateType = {
  id: string
  x: number
  y: number
  /** 敌人等级 */
  level: number
  /** 中毒 */
  poison?: EnemyPoison
  /** 减速类型 */
  slowType?: TowerSlowType
  /** 距离终点还有多少格 */
  endDistance: number
  /** 在当前格行进的距离 */
  gridDistance: number
  /** gif图遍历的帧数的索引 */
  framesNum: number
  /** 当前绘画到的图片索引，用于gif图 */
  imgIndex: number
  /** 敌人移动路径(会有多个路径的情况)的索引 */
  movePathIndex: number
  /** 敌人是否已经死亡 */
  isDead: boolean
} & EnemyType

/** 敌人数据 */
export type EnemyState = {
  /** 当前等级需要的敌人 */
  levelEnemy: EnemyName[]
  /** 已上场的敌人数量 */
  createdEnemyNum: number
  /** 敌人的移动轨迹 x坐标, y坐标, x_y方向 1:左 2:下 3:右 4:上 */
  movePath: GridInfo[][]
}
/** 敌人中毒 */
export type EnemyPoison = {
  /** 中毒伤害 最终会乘等级来计算伤害 */
  damage: number
  /** 伤害等级 */
  level: number
  /** 是否到时间允许继续中毒了 */
  isToTimePoison?: boolean
  /** 中毒触发函数 */
  poisonFun?: DebouncedFunc<(e_id: string, t: TowerType) => void>
}

/** 敌人的静态数据 */
export type EnemyStaticItem = {
  name: string
  explain: string
  /** 需要生成的敌人，默认：生成对应 name 的敌人 */
  enemyNameList?: EnemyName[]
  /** 生成的塔防，默认：中间位置放置烬 */
  towerList?: TowerCanvasTower[]
}