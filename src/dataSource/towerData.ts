import { requireImg } from "@/utils/handleDom"

/**
 * 塔防数据
 * name:名称, money:花费, r:攻击半径, damage:伤害, targetNum:攻击目标数量, rate:攻击速率(n毫秒/次, import.meta.url).href, speed:子弹速度, slow:{num:减速倍数,time:减速时间}  bSize: 子弹大小, img:塔防图片, bulletImg:子弹图片
 */
export default [
  { name: 'icestar',  money: 200, saleMoney: 100, r: 150, damage: 1, targetNum: 1, rate: 900, speed: 6, slow: {num: 2, time: 5000}, bSize: {w:30,h:30},   audioKey: 'slow-star', img: requireImg('tower/tower_slow.png'), bulletImg: requireImg('tower/bullet-star.png')},
  { name: 'fengche',  money: 500, saleMoney: 250, r: 180, damage: 2, targetNum: 1, rate: 1000, speed: 7, bSize: {w:50,h:50}, isThrough: true, audioKey: 'fengche', img: requireImg('tower/fengche.png'), bulletImg: requireImg('tower/bullet-fengche.png')},
  { name: 'nanqiang', money: 400, saleMoney: 200, r: 200, damage: 3, targetNum: 3, rate: 1000, speed: 7, bSize: {w:20,h:20},   audioKey: 'nanqiang', img: requireImg('tower/nanqiang.png'), bulletImg: requireImg('tower/bullet1.png')},
  { name: 'ejiate',   money: 450, saleMoney: 225, r: 250, damage: 1, targetNum: 1, rate: 200, speed: 8, bSize: {w:20,h:20},   audioKey: 'ejiate',  img: requireImg('tower/ejiate.png'), bulletImg: requireImg('tower/bullet3.png')},
  { name: 'jin',      money: 500, saleMoney: 250, r: 300, damage: 6, targetNum: 1, rate: 1200, speed: 10, bSize: {w:20,h:20}, audioKey: 'jin', img: requireImg('tower/jin.png'), bulletImg: requireImg('tower/bullet3.png')},
  { name: 'ez',       money: 500, saleMoney: 250, r: 220, damage: 2, targetNum: 1, rate: 1200, speed: 7, bSize: {w:100,h:100}, isThrough: true, bulletInitDeg: 170, audioKey: 'ez', img: requireImg('tower/ez.png'), bulletImg: requireImg('tower/bullet-ez.png')},
  {
    // 这里的攻击间隔应要大于子弹扩散完毕的时间
    name: 'lanbo',    money: 600, saleMoney: 300, r: 200, damage: 2, targetNum: 999, rate: 1600, speed: 5, bSize: {w:50,h:50}, audioKey: 'lanbo',
    img: requireImg('tower/lanbo.png'), bulletImg: requireImg('tower/bullet-blisters.png'), cover: requireImg("tower/lanbo-cover.png")
  },
  { name: 'aixi',     money: 800, saleMoney: 400, r: 200, damage: 1, targetNum: 9, rate: 1200, speed: 6, slow: {num: 2, time: 5000}, bSize: {w:20,h:20}, bulletInitDeg: 20, audioKey: 'aixi', img: requireImg('tower/aixi.png'), bulletImg: requireImg('tower/bullet2.png')},
] as TowerType[]

export const towerStaticData: {[key in string]: TowerStaticItem} = {
  'icestar': { explain: '向最前方的一个敌人发射一颗会使敌人减速的冰星' },
  'nanqiang': { explain: '往三个敌人发射子弹' },
  'ejiate': { explain: '向一个敌人发射一连串的子弹' },
  'jin': { explain: '攻击范围更大，子弹伤害更高' },
  'fengche': { explain: '发射一个旋转风车，风车可穿透敌人并造成伤害' },
  'ez': { explain: '发射一个大范围的精准弹幕，可以穿透所有敌人并造成伤害' },
  'lanbo': { explain: '向附近区域发射火焰，对命中的所有敌人造成伤害' },
  'aixi': { explain: '最多往九个敌人发射冰箭，并使敌人减速' },
}

export type TowerType = {
  name: string
  money: number,
  saleMoney: number,
  r: number,
  damage: number,
  targetNum: number
  /** 攻击范围 */
  rate: number
  speed: number
  bSize: {w:number,h:number}
  audioKey: string
  /** 游戏图片 */
  img: string
  /** 封面图 */
  cover?: string
  /** 子弹图片 */
  bulletImg: string
  /** 减速 */
  slow?: TowerSlowType
  /** 子弹的初始角度 */
  bulletInitDeg?: number
}

export type TowerSlowType = {
  /** 减少速度 */
  num: number
  /** 减速持续时间 */
  time: number
}

export type TowerStaticItem = {
  /** 说明文本 */
  explain: string
}
