import { requireImg } from "@/utils/handleDom"



/**
 * 塔防数据
 * name:名称, money:花费, r:攻击半径, damage:伤害, targetNum:攻击目标数量, rate:攻击速率(n毫秒/次, import.meta.url).href, speed:子弹速度, slow:{num:减速倍数,time:减速时间}  bSize: 子弹大小, img:塔防图片, bulletImg:子弹图片
 */
const towerObj: TowerDataObj = {
  'icestar': { name: 'icestar',  money: 200, saleMoney: 100, r: 3, damage: 1, targetNum: 1, rate: 900, speed: 0.12, slow: {num: 2, time: 5000, type: 'slow'}, bSize: {w:0.6,h:0.6},   audioKey: 'slow-star', img: requireImg('tower/tower_slow.png'), bulletImg: requireImg('tower/bullet-star.png')},
  'fengche': { name: 'fengche',  money: 500, saleMoney: 250, r: 3.6, damage: 2, targetNum: 1, rate: 1000, speed: 0.14, bSize: {w:1,h:1}, isThrough: true, audioKey: 'fengche', img: requireImg('tower/fengche.png'), bulletImg: requireImg('tower/bullet-fengche.png')},
  'nanqiang': { name: 'nanqiang', money: 400, saleMoney: 200, r: 4, damage: 3, targetNum: 3, rate: 1000, speed: 0.14, bSize: {w:0.4,h:0.4},   audioKey: 'nanqiang', img: requireImg('tower/nanqiang.png'), bulletImg: requireImg('tower/bullet1.png'), cover: requireImg("tower/nanqiang-cover.png")},
  'ejiate': { name: 'ejiate',   money: 450, saleMoney: 225, r: 5, damage: 1, targetNum: 1, rate: 200, speed: 0.16, bSize: {w:0.4,h:0.4},   audioKey: 'ejiate',  img: requireImg('tower/ejiate.png'), bulletImg: requireImg('tower/bullet3.png'), cover: requireImg("tower/ejiate-cover.png")},
  'jin': { name: 'jin',      money: 800, saleMoney: 400, r: 6, damage: 8, targetNum: 1, rate: 1200, speed: 0.2, bSize: {w:0.4,h:0.4}, audioKey: 'jin', img: requireImg('tower/jin.png'), bulletImg: requireImg('tower/bullet3.png'), cover: requireImg("tower/jin-cover.png")},
  'ez': { name: 'ez',       money: 600, saleMoney: 300, r: 4.5, damage: 2, targetNum: 1, rate: 1200, speed: 0.14, bSize: {w:2,h:2}, isThrough: true, bulletInitDeg: 170, audioKey: 'ez', img: requireImg('tower/ez.png'), bulletImg: requireImg('tower/bullet-ez.png'), cover: requireImg("tower/ez-cover.png")},
  'lanbo': { name: 'lanbo',    money: 600, saleMoney: 300, r: 4, damage: 2, targetNum: 999, rate: 1600, speed: 0.1, bSize: {w:1,h:1}, audioKey: 'lanbo', img: requireImg('tower/lanbo.png'), bulletImg: requireImg('tower/bullet-blisters.png'), cover: requireImg("tower/lanbo-cover.png")},
  'aixi': { name: 'aixi',     money: 800, saleMoney: 400, r: 4, damage: 1, targetNum: 9, rate: 1200, speed: 0.12, slow: {num: 2, time: 5000, type: 'slow'}, bSize: {w:0.4,h:0.4}, bulletInitDeg: 20, audioKey: 'aixi', img: requireImg('tower/aixi.png'), bulletImg: requireImg('tower/bullet2.png'), cover: requireImg("tower/aixi-cover.png")},
  'delaiwen': { name: 'delaiwen', money: 1000, saleMoney: 500, r: 4, damage: 5, targetNum: 2, rate: 2000, speed: 0.14, bSize: {w:1,h:1}, isThrough: true, isCharging: false, bulletInitDeg: 170, audioKey: 'delaiwen', img: requireImg('tower/delaiwen.png'), bulletImg: requireImg('tower/bullet-delaiwen.png'), cover: requireImg("tower/delaiwen-cover.png")},
  'huonan': { name: 'huonan',   money: 900, saleMoney: 450, r: 4, damage: 0.1, targetNum: 1, rate: 100, speed: 0.14, bSize: {w:0.1,h:0.1}, audioKey: 'huonan', img: requireImg('tower/huonan.png'), bulletImg: requireImg('tower/bullet2.png'), cover: requireImg("tower/huonan-cover.png")},
  'twitch': { name: 'twitch',   money: 900, saleMoney: 450, r: 4, damage: 1, addDamage: 1, targetNum: 1, rate: 5000, speed: 0.14, slow: {num: 3, time: 1500, type: 'twitch'}, poison: {damage: 0.5, time: 5000, bulletTime: 6000}, bSize: {w:0.5,h:0.5}, audioKey: 'twitch', isSaveBullet: true, img: requireImg('tower/twitch.png'), bulletImg: requireImg('tower/bullet-blisters.png'), cover: requireImg("tower/twitch-cover.png")},
}

export default towerObj

export const towerStaticData: {[key in TowerName]: TowerStaticItem} = {
  'icestar': { name: '冰星', explain: '向最前方的一个敌人发射一颗会使敌人减速的冰星。' },
  'nanqiang': { name: '男枪', explain: '往三个敌人发射子弹。', eIndexList: [1,2,3] },
  'ejiate': { name: '厄加特', explain: '向一个敌人发射一连串的子弹。' },
  'jin': { name: '烬', explain: '攻击范围更大，子弹伤害更高。' },
  'fengche': { name: '风车', explain: '发射一个旋转风车，风车可穿透敌人并造成伤害。', eIndexList: [2,3] },
  'ez': { name: '伊泽瑞尔', explain: '发射一个大范围的精准弹幕，可以穿透所有敌人并造成伤害.', eIndexList: [1,2,3] },
  'lanbo': { name: '兰博', explain: '向附近区域发射火焰，对命中的所有敌人造成伤害。', eIndexList: [1,2,3,4,5] },
  'aixi': { name: '艾希', explain: '最多往九个敌人发射冰箭，并使敌人减速。', eIndexList: [1,2,3,4,5] },
  'delaiwen': { name: '德莱文', explain: '往前方最多两个敌人丢出可以回收的斧头，斧头会处决生命值低于10%的敌人，并有10%几率使该敌人奖励翻倍。', eIndexList: [1,2,3,4,5] },
  'huonan': { name: '火男', explain: '对一名敌人喷射火焰，火焰将持续造成越来越高的伤害', eIndexList: [4] },
  'twitch': { name: '老鼠', explain: '每隔5秒往敌人的地上喷射毒液，路过的敌人将减速并受到持续的中毒效果，每隔1秒将叠加一层毒液效果，最大5层', eIndexList: [2,3,4] },
}

export type TowerName = 'icestar' | 'fengche' | 'nanqiang' | 'ejiate' | 'jin'| 'ez' | 'lanbo'| 'aixi' | 'delaiwen' | 'huonan' | 'twitch'

export type TowerDataObj = {[key in TowerName]: TowerType}

export type TowerType = {
  name: TowerName
  money: number
  saleMoney: number
  /** 塔防半径 */
  r: number
  /** 伤害 */
  damage: number
  /** 增加的伤害 */
  addDamage?: number
  /** 最多攻击目标 */
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

export type TowerSlow = {
  /** 减少速度 */
  num: number
  /** 减速持续时间 */
  time: number
  /** 减速类型 */
  type: TowerSlowType
}
export type TowerSlowType = 'slow' | 'twitch' | 'vertigo'

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
  eIndexList?: number[]
}
