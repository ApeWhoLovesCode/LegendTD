import { requireCDN } from "@/utils/handleImg";
const prefix = 'zombies';






const enemyArr: EnemyType[] = [
  {name: '旗子',     x: 0, y: 0, w: 1.5, h: 1.5, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.03, speed: 0.03, reward: 50, hp: {cur: 10, sum: 10, size: 0.16},    audioKey: 'pvz-pieces', imgType: 'gif', imgSource: requireCDN('zombies_0_move.gif', prefix), imgIndex: 0},
  {name: 'zombies-1',     x: 0, y: 0, w: 1.5, h: 1.5, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.03, speed: 0.03, reward: 10, hp: {cur: 10, sum: 10, size: 0.16},    audioKey: 'pvz', imgType: 'gif', imgSource: requireCDN('zombies_1_move.gif', prefix), imgIndex: 0},
  {name: 'zombies-2',     x: 0, y: 0, w: 1.5, h: 1.5, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.03, speed: 0.03, reward: 15, hp: {cur: 25, sum: 25, size: 0.16},    audioKey: 'pvz-hat', imgType: 'gif', imgSource: requireCDN('zombies_2_move.gif', prefix), imgIndex: 0},
  {name: 'zombies-3',     x: 0, y: 0, w: 1.5, h: 1.5, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.03, speed: 0.03, reward: 20, hp: {cur: 40, sum: 40, size: 0.16},    audioKey: 'pvz-drum', imgType: 'gif', imgSource: requireCDN('zombies_3_move.gif', prefix), imgIndex: 0},
  {name: '铁门',     x: 0, y: 0, w: 1.5, h: 1.5, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.04, speed: 0.04, reward: 30, hp: {cur: 60, sum: 60, size: 0.16},        audioKey: 'pvz-door', imgType: 'gif', imgSource: requireCDN('zombies_4_move.gif', prefix), imgIndex: 0},
  {name: '橄榄球',     x: 0, y: 0, w: 1.7, h: 1.7, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.06, speed: 0.06, reward: 40, hp: {cur: 120, sum: 120, size: 0.16},     audioKey: 'pvz-armor', imgType: 'gif', imgSource: requireCDN('zombies_5_move.gif', prefix), imgIndex: 0},
  {name: '报纸',     x: 0, y: 0, w: 1.7, h: 1.7, curFloorI: 0, isForward: true, isFlip: false,  curSpeed: 0.06, speed: 0.06, reward: -100, hp: {cur: 30, sum: 30, size: 0.16},      audioKey: 'pvz-newspaper', imgType: 'gif', imgSource: requireCDN('zombies_6_move.gif', prefix), imgIndex: 0},
  {name: '舞王',     x: 0, y: 0, w: 1.7, h: 1.7, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.04, speed: 0.04, reward: 80, hp: {cur: 350, sum: 350, size: 0.16},     skill: {time: 10000}, audioKey: 'pvz-dance', imgType: 'gif', imgSource: requireCDN('zombies_7_move.gif', prefix), imgIndex: 0},
  {name: '撑杆',     x: 0, y: 0, w: 2, h: 1.7, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.08, speed: 0.08, reward: 30, hp: {cur: 30, sum: 30, size: 0.16},        audioKey: 'pvz-rod', imgType: 'gif', imgSource: requireCDN('zombies_8_move.gif', prefix), imgIndex: 0},
  {name: '雪橇',     x: 0, y: 0, w: 1.8, h: 1.8, curFloorI: 0, isForward: true, isFlip: false,  curSpeed: 0.06, speed: 0.06, reward: 80, hp: {cur: 250, sum: 250, size: 0.16},     audioKey: 'pvz-car', imgType: 'gif', imgSource: requireCDN('zombies_9_move.gif', prefix), imgIndex: 0},
  {name: 'afu',     x: 0, y: 0, w: 1.8, h: 1.8, curFloorI: 0, isForward: false, isFlip: true,  curSpeed: 0.03, speed: 0.03, reward: 80, hp: {cur: 500, sum: 500, size: 0.16}, audioKey: 'afu', imgType: 'png', imgSource: requireCDN('afu.png', prefix), imgIndex: 0},
  {name: '弗利萨',   x: 0, y: 0, w: 1.8, h: 1.8, curFloorI: 0, isForward: true, isFlip: false,  curSpeed: 0.03, speed: 0.03, reward: 150, hp: {cur: 800, sum: 800, size: 0.16}, skill: {time: 5000}, audioKey: 'pvz-fulisha', imgType: 'png', imgSource: requireCDN('fulisha.png', prefix), imgIndex: 0},
  {name: '舞王小兵', x: 0, y: 0, w: 1.5, h: 1.5, curFloorI: 0, isForward: true, isFlip: false,  curSpeed: 0.04, speed: 0.04, reward: 5, hp: {cur: 15, sum: 15, size: 0.16},       audioKey: 'pvz-dance-little', imgType: 'gif', imgSource: requireCDN('zombies_10_move.gif', prefix), imgIndex: 0},
  {name: '小鬼僵尸', x: 0, y: 0, w: 1.5, h: 1.5, curFloorI: 0, isForward: true, isFlip: false,  curSpeed: 0.06, speed: 0.06, reward: 5, hp: {cur: 10, sum: 10, size: 0.16},       audioKey: 'pvz-little', imgType: 'gif', imgSource: requireCDN('zombies_11_move.gif', prefix), imgIndex: 0},
  {name: '坤坤',     x: 0, y: 0, w: 1.8, h: 1.8, curFloorI: 0, isForward: false, isFlip: false,  curSpeed: 0.04, speed: 0.04, reward: 160, hp: {cur: 800, sum: 800, size: 0.16},     skill: {time: 12000}, audioKey: 'kunkun', imgType: 'gif', imgSource: requireCDN('kunkun.gif', prefix), imgIndex: 0},
  {name: 'rabbish',     x: 0, y: 0, w: 1.8, h: 1.8, curFloorI: 0, isForward: false, isFlip: true,  curSpeed: 0.04, speed: 0.04, reward: 50, hp: {cur: 300, sum: 300, size: 0.16},     audioKey: 'rabbish', imgType: 'gif', imgSource: requireCDN('rabbish_1.gif', prefix), imgIndex: 0},
  {name: 'rabbish-2',   x: 0, y: 0, w: 1.8, h: 1.8, curFloorI: 0, isForward: false, isFlip: true,  curSpeed: 0.04, speed: 0.04, reward: 80, hp: {cur: 500, sum: 500, size: 0.16},     audioKey: 'rabbish-2', imgType: 'gif', imgSource: requireCDN('rabbish_2.gif', prefix), imgIndex: 0},
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
  /** 当前僵尸所在的索引 */
  curFloorI: number
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
  }
  /** 僵尸技能 */
  skill?: {
    /** 技能cd */
    time: number
  }
  /** 音频播放的key值 */
  audioKey: string
  /** 图片类型 */
  imgType: 'gif' | 'png'
  /** 图片资源 */
  imgSource: string
  /** 当前绘画到的图片索引，用于gif图 */
  imgIndex: number
}