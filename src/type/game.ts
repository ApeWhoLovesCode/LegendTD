/** 游戏详情页类型 */

import { GridInfo } from "@/dataSource/mapData"
import { SkillType } from "@/dataSource/skillData"

/** 游戏基础信息 */
export type GameBaseInfo = {
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

/** 游戏配置信息 */
export type GameConfigType = {
  /** 浏览器大小变化 */
  resizeTimer: NodeJS.Timer | null,
  /** canvas 默认大小 */
  defaultCanvas: {w: number, h: number},
  /** canvas 对象 */
  canvas: {},
  /** 得到 canvas 的 2d 上下文 */
  ctx: {},
  /** canvas 画布距离浏览器左边和顶部的距离 */
  canvasInfo: {left: number, top: number},
  /** requestAnimationFrame api的保存对象 */
  animationFrame: null,
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
  terminal: GridInfo,
  /** 地板：大小 数量 */
  floorTile: {size: number, num: number},
  /** 格子数量信息 arr: [[ 0:初始值(可以放塔)，1:地板，2:有阻挡物，10(有塔防：10塔防一，11塔防二...) ]] */
  gridInfo: { x_num: number, y_num: number, size: number, arr: [number[]] },
}

/** 游戏音乐 */
export type GameAudio = {
  // 所有音乐数据
  audioList: string[],
  // 终点音乐
  audioEnd: string,
  // 当前技能音乐
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
