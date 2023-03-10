import { requireImg } from "@/utils/handleDom"



/**
 * 塔防数据
 * name:名称, money:花费, r:攻击半径, damage:伤害, targetNum:攻击目标数量, rate:攻击速率(n毫秒/次, import.meta.url).href, speed:子弹速度, slow:{num:减速倍数,time:减速时间}  bSize: 子弹大小, img:塔防图片, bulletImg:子弹图片
 */
const towerArr: TowerType[] = [
  { name: 'icestar',  money: 200, saleMoney: 100, r: 3, damage: 1, targetNum: 1, rate: 900, speed: 0.12, slow: {num: 2, time: 5000}, bSize: {w:0.6,h:0.6},   audioKey: 'slow-star', img: requireImg('tower/tower_slow.png'), bulletImg: requireImg('tower/bullet-star.png')},
  { name: 'fengche',  money: 500, saleMoney: 250, r: 3.6, damage: 2, targetNum: 1, rate: 1000, speed: 0.14, bSize: {w:1,h:1}, isThrough: true, audioKey: 'fengche', img: requireImg('tower/fengche.png'), bulletImg: requireImg('tower/bullet-fengche.png')},
  { name: 'nanqiang', money: 400, saleMoney: 200, r: 4, damage: 3, targetNum: 3, rate: 1000, speed: 0.14, bSize: {w:0.4,h:0.4},   audioKey: 'nanqiang', img: requireImg('tower/nanqiang.png'), bulletImg: requireImg('tower/bullet1.png')},
  { name: 'ejiate',   money: 450, saleMoney: 225, r: 5, damage: 1, targetNum: 1, rate: 200, speed: 0.16, bSize: {w:0.4,h:0.4},   audioKey: 'ejiate',  img: requireImg('tower/ejiate.png'), bulletImg: requireImg('tower/bullet3.png')},
  { name: 'jin',      money: 500, saleMoney: 250, r: 6, damage: 6, targetNum: 1, rate: 1200, speed: 0.2, bSize: {w:0.4,h:0.4}, audioKey: 'jin', img: requireImg('tower/jin.png'), bulletImg: requireImg('tower/bullet3.png')},
  { name: 'ez',       money: 500, saleMoney: 250, r: 4.5, damage: 2, targetNum: 1, rate: 1200, speed: 0.14, bSize: {w:2,h:2}, isThrough: true, bulletInitDeg: 170, audioKey: 'ez', img: requireImg('tower/ez.png'), bulletImg: requireImg('tower/bullet-ez.png')},
  {
    // 这里的攻击间隔应要大于子弹扩散完毕的时间
    name: 'lanbo',    money: 600, saleMoney: 300, r: 4, damage: 2, targetNum: 999, rate: 1600, speed: 0.1, bSize: {w:1,h:1}, audioKey: 'lanbo',
    img: requireImg('tower/lanbo.png'), bulletImg: requireImg('tower/bullet-blisters.png'), cover: requireImg("tower/lanbo-cover.png")
  },
  { name: 'aixi',     money: 800, saleMoney: 400, r: 4, damage: 1, targetNum: 9, rate: 1200, speed: 0.12, slow: {num: 2, time: 5000}, bSize: {w:0.4,h:0.4}, bulletInitDeg: 20, audioKey: 'aixi', img: requireImg('tower/aixi.png'), bulletImg: requireImg('tower/bullet2.png')},
  { name: 'delaiwen', money: 500, saleMoney: 250, r: 4, damage: 8, targetNum: 1, rate: 1200, speed: 0.14, bSize: {w:1,h:1}, isThrough: true, isCharging: false, bulletInitDeg: 170, audioKey: 'ez', img: requireImg('tower/ez.png'), bulletImg: requireImg('tower/bullet-fengche.png')},
]
export default towerArr

export const towerStaticData: {[key in TowerName]: TowerStaticItem} = {
  'icestar': { explain: '向最前方的一个敌人发射一颗会使敌人减速的冰星' },
  'nanqiang': { explain: '往三个敌人发射子弹' },
  'ejiate': { explain: '向一个敌人发射一连串的子弹' },
  'jin': { explain: '攻击范围更大，子弹伤害更高' },
  'fengche': { explain: '发射一个旋转风车，风车可穿透敌人并造成伤害' },
  'ez': { explain: '发射一个大范围的精准弹幕，可以穿透所有敌人并造成伤害' },
  'lanbo': { explain: '向附近区域发射火焰，对命中的所有敌人造成伤害' },
  'aixi': { explain: '最多往九个敌人发射冰箭，并使敌人减速' },
  'delaiwen': { explain: '往前方丢出碰到敌人会回收的斧头，斧头会处决生命值低于10%的敌人，并有40%几率获取20金币' },
}

export type TowerName = 'icestar' | 'fengche' | 'nanqiang' | 'ejiate' | 'jin'| 'ez' | 'lanbo'| 'aixi' | 'delaiwen'

export type TowerType = {
  name: TowerName
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
  /** 是否是可穿透的 */
  isThrough?: boolean 
  /** 是否充能完毕 是否可以下一次攻击 */
  isCharging?: boolean
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
