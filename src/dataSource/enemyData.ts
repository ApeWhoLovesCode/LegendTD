import { requireCDN } from "@/utils/handleImg";
const  _requireCDN = (url: string) => requireCDN(url, 'zombies')






const enemyArr: EnemyType[] = [
  {name: 'zombie-flag',   w: 1.5, h: 1.5, curSpeed: 0.03, speed: 0.03, reward: 50, hp: {cur: 10, sum: 10}, audioKey: 'pvz-pieces', imgType: 'gif', imgSource: _requireCDN('zombie_0_move.gif'), isForward: true, isFlip: false},
  {name: 'zombie-1',      w: 1.5, h: 1.5, curSpeed: 0.03, speed: 0.03, reward: 10, hp: {cur: 10, sum: 10}, audioKey: 'pvz', imgType: 'gif', imgSource: _requireCDN('zombie_1_move.gif'), isForward: true, isFlip: false},
  {name: 'zombie-2',      w: 1.5, h: 1.5, curSpeed: 0.03, speed: 0.03, reward: 15, hp: {cur: 25, sum: 25}, audioKey: 'pvz-hat', imgType: 'gif', imgSource: _requireCDN('zombie_2_move.gif'), isForward: true, isFlip: false},
  {name: 'zombie-3',      w: 1.5, h: 1.5, curSpeed: 0.03, speed: 0.03, reward: 20, hp: {cur: 40, sum: 40}, audioKey: 'pvz-drum', imgType: 'gif', imgSource: _requireCDN('zombie_3_move.gif'), isForward: true, isFlip: false},
  {name: '铁门',            w: 1.5, h: 1.5, curSpeed: 0.04, speed: 0.04, reward: 30, hp: {cur: 60, sum: 60}, audioKey: 'pvz-door', imgType: 'gif', imgSource: _requireCDN('zombie_4_move.gif'), isForward: true, isFlip: false},
  {name: '橄榄球',          w: 1.7, h: 1.7, curSpeed: 0.06, speed: 0.06, reward: 40, hp: {cur: 120, sum: 120}, audioKey: 'pvz-armor', imgType: 'gif', imgSource: _requireCDN('zombie_5_move.gif'), isForward: true, isFlip: false},
  {name: '报纸',            w: 1.7, h: 1.7,  curSpeed: 0.06, speed: 0.06, reward: -100, hp: {cur: 30, sum: 30}, audioKey: 'pvz-newspaper', imgType: 'gif', imgSource: _requireCDN('zombie_6_move.gif'), isForward: true, isFlip: false},
  {name: 'zombie-dance',  w: 1.7, h: 1.7, curSpeed: 0.04, speed: 0.04, reward: 80, hp: {cur: 350, sum: 350}, skill: {time: 8000}, audioKey: 'pvz-dance', imgType: 'gif', imgSource: _requireCDN('zombie_7_move.gif'), isForward: true, isFlip: false},
  {name: '撑杆',            w: 2, h: 1.7, curSpeed: 0.08, speed: 0.08, reward: 30, hp: {cur: 30, sum: 30}, audioKey: 'pvz-rod', imgType: 'gif', imgSource: _requireCDN('zombie_8_move.gif'), isForward: true, isFlip: false},
  {name: 'ice-car',        w: 1.8, h: 1.8,  curSpeed: 0.04, speed: 0.04, reward: 110, hp: {cur: 200, sum: 200}, skill: {time: 5000, r: 3, keepTime: 3000, animation: {cur: 120, sum: 120}}, audioKey: 'pvz-ice-car', imgType: 'gif', imgSource: _requireCDN('zombie_9_move.gif'), isForward: true, isFlip: false},
  {name: 'afu',            w: 1.8, h: 1.8, curSpeed: 0.03, speed: 0.03, reward: 80, hp: {cur: 500, sum: 500}, audioKey: 'afu', imgType: 'png', imgSource: _requireCDN('afu.png'), isForward: false, isFlip: true},
  {name: 'fulisha',        w: 1.8, h: 1.8,  curSpeed: 0.03, speed: 0.03, reward: 150, hp: {cur: 800, sum: 800}, skill: {time: 6000}, audioKey: 'pvz-fulisha', imgType: 'png', imgSource: _requireCDN('fulisha.png'), isForward: true, isFlip: false},
  {name: '舞王小兵',        w: 1.5, h: 1.5,  curSpeed: 0.04, speed: 0.04, reward: 5, hp: {cur: 15, sum: 15}, audioKey: 'pvz-dance-little', imgType: 'gif', imgSource: _requireCDN('zombie_10_move.gif'), isForward: true, isFlip: false},
  {name: '小鬼僵尸',        w: 1.5, h: 1.5,  curSpeed: 0.06, speed: 0.06, reward: 5, hp: {cur: 10, sum: 10}, audioKey: 'pvz-little', imgType: 'gif', imgSource: _requireCDN('zombie_11_move.gif'), isForward: true, isFlip: false},
  {name: 'kunkun',         w: 1.8, h: 1.8,  curSpeed: 0.04, speed: 0.04, reward: 160, hp: {cur: 800, sum: 800}, skill: {time: 10000}, audioKey: 'kunkun', imgType: 'gif', imgSource: _requireCDN('kunkun.gif'), isForward: false, isFlip: false},
  {name: 'rabbish',        w: 1.8, h: 1.8,  curSpeed: 0.04, speed: 0.04, reward: 50, hp: {cur: 300, sum: 300}, audioKey: 'rabbish', imgType: 'gif', imgSource: _requireCDN('rabbish_1.gif'), isForward: false, isFlip: true},
  {name: 'rabbish-2',      w: 1.8, h: 1.8, curSpeed: 0.04, speed: 0.04, reward: 100, hp: {cur: 400, sum: 400}, skill: {time: 3000, r:2, animation: {cur: 80, sum: 80}},  audioKey: 'rabbish-2', imgType: 'gif', imgSource: _requireCDN('rabbish_2.gif'), isForward: false, isFlip: true},
  {name: 'godzilla',       w: 1.8, h: 1.8, curSpeed: 0.03, speed: 0.03, reward: 200, hp: {cur: 400, sum: 400}, skill: {time: 6000, animation: {cur: 60, sum: 60}, damage: 4}, audioKey: 'pvz-godzilla', imgType: 'png', imgSource: _requireCDN('godzilla.png'), isForward: false, isFlip: true},
  {name: 'zombie-boom',  w: 1.5, h: 1.5, curSpeed: 0.03, speed: 0.03, reward: 80, hp: {cur: 150, sum: 150}, skill: {time: 3000, r: 2, animation: {cur: 120, sum: 120}, damage: 10, img: _requireCDN('zombie-boom-skill.gif')}, audioKey: 'pvz-boom', imgType: 'gif', imgSource: _requireCDN('zombie-boom.gif'), dieImg: _requireCDN('zombie-boom-skill2.gif'), isForward: true, isFlip: false},
]
export default enemyArr

// w, h, curSpeed, speed, hp.size 的大小一开始都是size的倍数
/** 敌人资源  */
export type EnemyType = {
  name: string
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

/** 敌人的最高等级 */
export const ENEMY_MAX_LEVEL = 10;

export const enemyHpColors = ['#0066a1', '#49ca00', '#409756', '#eedf96', '#f8d501', '#cb732a', '#e5a4ac', '#be3f41', '#e047db', '#c0c0cb', '#eaeaea']