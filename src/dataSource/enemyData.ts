import { requireCDN } from "@/utils/handleImg";
const  _requireCDN = (url: string) => requireCDN(url, 'zombies')






const enemyArr: EnemyType[] = [
  {name: '旗子',     x: 0, y: 0, w: 1.5, h: 1.5, isForward: true, isFlip: false, curSpeed: 0.03, speed: 0.03, reward: 50, hp: {cur: 10, sum: 10, size: 0.16},    audioKey: 'pvz-pieces', imgType: 'gif', imgSource: _requireCDN('zombies_0_move.gif'), level: 1},
  {name: 'zombies-1',     x: 0, y: 0, w: 1.5, h: 1.5, isForward: true, isFlip: false, curSpeed: 0.03, speed: 0.03, reward: 10, hp: {cur: 10, sum: 10, size: 0.16},    audioKey: 'pvz', imgType: 'gif', imgSource: _requireCDN('zombies_1_move.gif'), level: 1},
  {name: 'zombies-2',     x: 0, y: 0, w: 1.5, h: 1.5, isForward: true, isFlip: false, curSpeed: 0.03, speed: 0.03, reward: 15, hp: {cur: 25, sum: 25, size: 0.16},    audioKey: 'pvz-hat', imgType: 'gif', imgSource: _requireCDN('zombies_2_move.gif'), level: 1},
  {name: 'zombies-3',     x: 0, y: 0, w: 1.5, h: 1.5, isForward: true, isFlip: false, curSpeed: 0.03, speed: 0.03, reward: 20, hp: {cur: 40, sum: 40, size: 0.16},    audioKey: 'pvz-drum', imgType: 'gif', imgSource: _requireCDN('zombies_3_move.gif'), level: 1},
  {name: '铁门',     x: 0, y: 0, w: 1.5, h: 1.5, isForward: true, isFlip: false, curSpeed: 0.04, speed: 0.04, reward: 30, hp: {cur: 60, sum: 60, size: 0.16},        audioKey: 'pvz-door', imgType: 'gif', imgSource: _requireCDN('zombies_4_move.gif'), level: 1},
  {name: '橄榄球',     x: 0, y: 0, w: 1.7, h: 1.7, isForward: true, isFlip: false, curSpeed: 0.06, speed: 0.06, reward: 40, hp: {cur: 120, sum: 120, size: 0.16},     audioKey: 'pvz-armor', imgType: 'gif', imgSource: _requireCDN('zombies_5_move.gif'), level: 1},
  {name: '报纸',     x: 0, y: 0, w: 1.7, h: 1.7, isForward: true, isFlip: false,  curSpeed: 0.06, speed: 0.06, reward: -100, hp: {cur: 30, sum: 30, size: 0.16},      audioKey: 'pvz-newspaper', imgType: 'gif', imgSource: _requireCDN('zombies_6_move.gif'), level: 1},
  {name: 'zombies-dance',     x: 0, y: 0, w: 1.7, h: 1.7, isForward: true, isFlip: false, curSpeed: 0.04, speed: 0.04, reward: 80, hp: {cur: 350, sum: 350, size: 0.16},     skill: {time: 10000}, audioKey: 'pvz-dance', imgType: 'gif', imgSource: _requireCDN('zombies_7_move.gif'), level: 1},
  {name: '撑杆',     x: 0, y: 0, w: 2, h: 1.7, isForward: true, isFlip: false, curSpeed: 0.08, speed: 0.08, reward: 30, hp: {cur: 30, sum: 30, size: 0.16},        audioKey: 'pvz-rod', imgType: 'gif', imgSource: _requireCDN('zombies_8_move.gif'), level: 1},
  {name: '雪橇',     x: 0, y: 0, w: 1.8, h: 1.8, isForward: true, isFlip: false,  curSpeed: 0.06, speed: 0.06, reward: 80, hp: {cur: 250, sum: 250, size: 0.16},     audioKey: 'pvz-car', imgType: 'gif', imgSource: _requireCDN('zombies_9_move.gif'), level: 1},
  {name: 'afu',     x: 0, y: 0, w: 1.8, h: 1.8, isForward: false, isFlip: true,  curSpeed: 0.03, speed: 0.03, reward: 80, hp: {cur: 500, sum: 500, size: 0.16}, audioKey: 'afu', imgType: 'png', imgSource: _requireCDN('afu.png'), level: 1},
  {name: 'fulisha',   x: 0, y: 0, w: 1.8, h: 1.8, isForward: true, isFlip: false,  curSpeed: 0.03, speed: 0.03, reward: 150, hp: {cur: 800, sum: 800, size: 0.16}, skill: {time: 5000}, audioKey: 'pvz-fulisha', imgType: 'png', imgSource: _requireCDN('fulisha.png'), level: 1},
  {name: '舞王小兵', x: 0, y: 0, w: 1.5, h: 1.5, isForward: true, isFlip: false,  curSpeed: 0.04, speed: 0.04, reward: 5, hp: {cur: 15, sum: 15, size: 0.16},       audioKey: 'pvz-dance-little', imgType: 'gif', imgSource: _requireCDN('zombies_10_move.gif'), level: 1},
  {name: '小鬼僵尸', x: 0, y: 0, w: 1.5, h: 1.5, isForward: true, isFlip: false,  curSpeed: 0.06, speed: 0.06, reward: 5, hp: {cur: 10, sum: 10, size: 0.16},       audioKey: 'pvz-little', imgType: 'gif', imgSource: _requireCDN('zombies_11_move.gif'), level: 1},
  {name: 'kunkun',     x: 0, y: 0, w: 1.8, h: 1.8, isForward: false, isFlip: false,  curSpeed: 0.04, speed: 0.04, reward: 160, hp: {cur: 800, sum: 800, size: 0.16},     skill: {time: 12000}, audioKey: 'kunkun', imgType: 'gif', imgSource: _requireCDN('kunkun.gif'), level: 1},
  {name: 'rabbish',     x: 0, y: 0, w: 1.8, h: 1.8, isForward: false, isFlip: true,  curSpeed: 0.04, speed: 0.04, reward: 50, hp: {cur: 300, sum: 300, size: 0.16},     audioKey: 'rabbish', imgType: 'gif', imgSource: _requireCDN('rabbish_1.gif'), level: 1},
  {name: 'rabbish-2',   x: 0, y: 0, w: 1.8, h: 1.8, isForward: false, isFlip: true,  curSpeed: 0.04, speed: 0.04, reward: 100, hp: {cur: 400, sum: 400, size: 0.16},   skill: {time: 3000, animation: {cur: 80, sum: 80}},  audioKey: 'rabbish-2', imgType: 'gif', imgSource: _requireCDN('rabbish_2.gif'), level: 1},
  {name: 'godzilla',   x: 0, y: 0, w: 1.8, h: 1.8, isForward: false, isFlip: true,  curSpeed: 0.03, speed: 0.03, reward: 150, hp: {cur: 500, sum: 500, size: 0.16}, skill: {time: 3000, animation: {cur: 50, sum: 50}}, audioKey: 'pvz-godzilla', imgType: 'png', imgSource: _requireCDN('godzilla.png'), level: 1},
]
export default enemyArr

// w, h, curSpeed, speed, hp.size 的大小一开始都是size的倍数
/** 敌人资源  */
export type EnemyType = {
  name: string
  x: number
  y: number
  w: number
  h: number
  /** 敌人等级 */
  level: number
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
    size: number
    level?: number
  }
  /** 僵尸技能 */
  skill?: {
    /** 技能cd */
    time: number
    /** 技能动画播放 */
    animation?: {
      cur: number
      sum: number
    }
    /** 技能方向 */
    direction?: {
      x: number
      y: number
    } 
  }
  /** 音频播放的key值 */
  audioKey: string
  /** 图片类型 */
  imgType: 'gif' | 'png'
  /** 图片资源 */
  imgSource: string
}

/** 敌人的最高等级 */
export const ENEMY_MAX_LEVEL = 10;

export const enemyHpColors = ['#0066a1', '#49ca00', '#409756', '#eedf96', '#f8d501', '#cb732a', '#e5a4ac', '#be3f41', '#e047db', '#c0c0cb', '#eaeaea']