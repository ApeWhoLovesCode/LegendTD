import { DebouncedFunc } from "lodash"
import { EnemyName } from "./enemy"

export type TowerName = 'icestar' | 'fengche' | 'nanqiang' | 'ejiate' | 'jin'| 'ez' | 'lanbo'| 'aixi' | 'delaiwen' | 'huonan' | 'twitch'

export type TowerDataObj = {[key in TowerName]: TowerType}

export type TowerType = {
  name: TowerName
  money: number
  saleMoney: number
  /** 塔防生命值 */
  hp: {
    cur: number
    sum: number
    /** 是否显示生命条 */
    isShow?: boolean
    /** 受伤时间 */
    injuryTime?: number
  },
  /** 塔防半径 */
  r: number
  /** 伤害 */
  damage: number
  /** 增加的伤害 */
  addDamage?: number
  /** 最多攻击目标 */
  targetNum: number
  /** 攻击速率(n毫秒/次 */
  rate: number
  /** 子弹速度 */
  speed: number
  /** 子弹大小 */
  bSize: BulletSize
  /** 塔防音频的key */
  audioKey: string
  /** 游戏图片 */
  img: string
  /** 封面图 */
  cover?: string
  /** 子弹图片 */
  bulletImg: string
  /** 是否是可穿透的 */
  isThrough?: boolean 
  /** 是否充能完毕 是否可以下一次攻击 */
  isCharging?: boolean
  /** 减速 */
  slow?: TowerSlow
  /** 子弹的初始角度 */
  bulletInitDeg?: number
  /** 是否保存该子弹 */
  isSaveBullet?: boolean
  /** 持续伤害 */
  poison?: TowerPoison
}
export type BulletSize = { w: number; h: number}

export type TowerSlow = {
  /** 减少速度 */
  num: number
  /** 减速持续时间 */
  time: number
  /** 减速类型 */
  type: TowerSlowType
}
export type TowerSlowType = 'slow' | 'twitch' | 'vertigo' | 'stop'

/** 持续伤害比如中毒等 */
export type TowerPoison = {
  /** 毒液在地上持续时间 */
  bulletTime: number
  /** 持续时间 */
  time: number
  /** 伤害 */
  damage: number
}

export type TowerStaticItem = {
  /** 中文名字 */
  name: string
  /** 说明文本 */
  explain: string
  /** 展示的敌人数组 */
  enemyList?: TowerCanvasEnemy[]
}

/** 塔防封面钟的塔防 */
export type TowerCanvasTower = {towerName: TowerName, x: number, y: number}

/** 塔防封面中的敌人 */
export type TowerCanvasEnemy = {enemyName: EnemyName, level?: number}


/** 子弹类型 */
export type BulletType = {
  x: number
  y: number
  /** 往目标方向增加的 x */
  addX: number
  /** 往目标方向增加的 y */
  addY: number
  /** 子弹和敌人的距离 */
  xy: number
  /** 目标id */
  e_id: string
  /** 当前攻击的id集合 */
  attactIdSet?: Set<string>
  /** 实际中子弹要旋转的角度 */
  deg?: number
  /** 子弹是否回收中 */
  isRecycling?: boolean
  /** 子弹旋转的角度 */
  rotateDeg?: number
}

/** 塔防的类型 */
export type TowerStateType = {
  id: string
  x: number
  y: number
  /** 是否到时间允许射击了 */
  isToTimeShoot?: boolean
  /** 防抖的射击函数 */
  shootFun?: DebouncedFunc<(eIdList: string[], t_i: number) => void>
  /** 攻击的目标id数组 */
  targetIdList: string[]
  /** 当前攻击的目标，用于攻击单一目标切换目标后的判断 */
  curTargetId: string
  /** 子弹数组 */
  bulletArr: BulletType[]
  /** 塔防加载好的图片 */
  onloadImg: CanvasImageSource
  /** 子弹图片 */
  onloadbulletImg: CanvasImageSource
  /** 子弹的缩放倍数 */
  scale?: number 
  /** 子弹的缩放倍数变化值 */
  addScale?: number
  /** 子弹发射中 */
  isBulleting?: boolean
  /** 用于火男火焰喷柱的粗细变化 */
  thickness?: number
  /** 之前的伤害 */
  preDamage?: number
  /** 受敌人技能影响 */
  enemySkill?: {[key in TowerEnemySkillType]?: {ids: string[]}}
} & TowerType
/** 塔防的数据 */
export type TowerState = {
  /** 塔防的位置 */
  building: {left: number, top: number, isShow: boolean}
  /** 塔防的攻击范围 */
  buildingScope: BuildingScope
}
/** 塔防受敌人技能影响的类型 */
export type TowerEnemySkillType = 'frozen' 
export type BuildingScope = {
  left: number, 
  top: number, 
  r: number, 
  isShow: boolean, 
  towerId: string, 
  saleMoney: number
}