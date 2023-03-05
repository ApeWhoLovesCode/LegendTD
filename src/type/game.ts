/** 游戏详情页类型 */

import { EnemyType } from "@/dataSource/enemyData"
import { GridInfo, MapGridInfo } from "@/dataSource/mapData"
import { SkillType } from "@/dataSource/skillData"
import { TowerType } from "@/dataSource/towerData"
import { ImgLoadType } from "."

/** 游戏配置信息 */
export type GameConfigType = {
  /** 浏览器大小变化 */
  resizeTimer: NodeJS.Timer | null,
  /** canvas 默认大小 */
  defaultCanvas: {w: number, h: number},
  /** 一格的大小 */
  size: number
  /** canvas 对象 */
  canvas: {},
  /** 得到 canvas 的 2d 上下文 */
  ctx: CanvasRenderingContext2D,
  /** requestAnimationFrame api的保存对象 */
  animationFrame: any,
  /** 是否加载完成 */
  loadingDone: boolean,
  /** 游戏开始遮罩 */
  isGameBeginMask: boolean,
}

/** 游戏基本数据 */
export type GameBaseData = {
  /** 偏移量y 是用来计算敌人与地板底部的距离 (两个地板(50*2)-敌人(h(75)+y(10))) = 10 */
  offset: {y: number},
  /** 终点位置 */
  terminal?: GridInfo,
  /** 地板：大小 数量 */
  floorTile: {size: number, num: number},
  /** 格子数量信息 arr: [[ 0:初始值(可以放塔)，1:地板，2:有阻挡物，10(有塔防：10塔防一，11塔防二...) ]] */
  gridInfo: { x_num: number, y_num: number, size: number, arr: number[][] },
  /** 游戏结束 */
  isGameOver: boolean
  /** 设置游戏的暂停 */
  isPause: boolean
  /** 是否播放背景音乐 */
  isPlayBgAudio: boolean,
  /** 当前等级 */
  level: number
  /** 生命值 */
  hp: number
  /** 金钱 */
  money: number
  /** 敌人生成间隔时间 */
  intervalTime: number
  /** 当前关卡地图信息 */
  mapGridInfoItem: MapGridInfo
}

/** 敌人的类型 */
export type EnemyStateType = {
  id: string
} & EnemyType

/** 敌人数据 */
export type EnemyState = {
  /** 当前等级需要的敌人索引 */
  levelEnemy: number[]
  /** 已上场的敌人数量 */
  createdEnemyNum: number
  /** 敌人的移动轨迹 x坐标, y坐标, x_y方向 1:左 2:下 3:右 4:上 */
  movePath: GridInfo[]
}

/** 子弹类型 */
export type BulletType = {
  x: number
  y: number
  /** 往目标方向增加的 x */
  addX: number
  /** 往目标方向增加的 y */
  addY: number
  /** 当前距离 */
  xy: number
  /** 子弹和敌人的距离 */
  x_y: number
  /** 目标id */
  e_id: string
  /** 当前攻击的id集合 */
  attactIdSet?: Set<string>
  /** 实际中子弹要旋转的角度 */
  deg?: number
}

/** 塔防的类型 */
export type TowerStateType = {
  id: string
  x: number
  y: number
  /** 防抖的射击函数 */
  shootFun: any
  /** 攻击的目标id数组 */
  targetIndexList: string[]
  /** 子弹数组 */
  bulletArr: BulletType[]
  /** 塔防加载好的图片 */
  onloadImg: CanvasImageSource
  /** 子弹图片 */
  onloadbulletImg: CanvasImageSource
  /** 是否是可穿透的 */
  isThrough?: boolean 
  /** 旋转的角度 */
  rotateDeg?: number
  /** 子弹的缩放倍数 */
  scale?: number 
  /** 子弹的缩放倍数变化值 */
  addScale?: number
  /** 子弹发射中 */
  isBulleting?: boolean
} & TowerType
/** 塔防的数据 */
export type TowerState = {
  /** 塔防的位置 */
  building: {left: number, top: number, isShow: boolean}
  /** 塔防的攻击范围 */
  buildingScope: {left: number, top: number, r: number, isShow: boolean, towerIndex: number}
}

/** 游戏音乐 */
export type GameAudio = {
  /** 所有音乐数据 */
  audioList: {[key in string]: string},
  /** 终点音乐 */
  audioEnd: string,
  /** 当前技能音乐 */
  audioSkill: string,
}

/** 游戏人物技能 */
export type GameMasterSkill = {
  /** 生产的金钱 */
  proMoney: {isShow: boolean, interval: number, money: number},
  /** 增加的金钱 */
  addMoney: {num: string, timer: NodeJS.Timer | null, time: number},
  /** 底部技能栏 */
  skillList: SkillType[],
}

/** 游戏的传参 */
export type GameProps = {
  mapLevel: number
  enemySource: EnemyType[]
  towerSource: TowerType[]
  imgOnloadObj: ImgLoadType
  towerOnloadImg: ImgLoadType
  towerBulletOnloadImg: ImgLoadType
  isMobile: boolean
}

/** 目标的信息类型 宽高xy */
export type TargetInfo = {
  w: number
  h: number
  x: number
  y: number
}