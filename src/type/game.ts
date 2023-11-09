/** 游戏详情页类型 */

import { SkillType } from "@/dataSource/skillData"
import { EnemyType, ImgLoadType, TowerType } from "."

/** 游戏配置信息 */
export type GameConfigType = {
  /** canvas 默认大小 */
  defaultCanvas: {w: number, h: number},
  /** 一格的大小 */
  size: number
  /** canvas 对象 */
  canvas: {},
  /** 得到 canvas 的 2d 上下文 */
  ctx: CanvasRenderingContext2D,
  /** requestAnimationFrame api的保存对象 */
  animationFrame: number,
  /** 是否加载完成 */
  loadingDone: boolean,
  /** 游戏开始遮罩 */
  isGameBeginMask: boolean,
}

/** 游戏基本数据 */
export type GameBaseData = {
  /** 终点位置 */
  terminal?: {x: number, y: number},
  /** 格子数量信息 */
  gridInfo: { x_num: number, y_num: number, size: number },
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
  othOnloadImg: ImgLoadType
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

/** 特殊子弹 */
export type SpecialBullets = {
  /** 毒液 */
  twitch: SpecialBulletItem[]
}

export type SpecialBulletItem = TargetInfo & {
  /** 子弹id */
  id: string
  /** 塔防的id */
  tId: string
}