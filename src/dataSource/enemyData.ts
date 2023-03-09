/**
 * 敌人资源 
 * curFloorI: 当前所在格的索引, imgList: gif转静态图片数组, curSpeed: 当前的速度
 * w, h, curSpeed, speed, hp.size 的大小一开始都是size的倍数
 * 
 */



export default [
  {name: '僵尸',     x: 0, y: 0, w: 1.5, h: 1.5, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.03, speed: 0.03, reward: 100, hp: {cur: 10, sum: 10, size: 0.16},    audioKey: 'pvz-pieces', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_0_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 1.5, h: 1.5, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.03, speed: 0.03, reward: 10, hp: {cur: 10, sum: 10, size: 0.16},    audioKey: 'pvz', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_1_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 1.5, h: 1.5, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.03, speed: 0.03, reward: 15, hp: {cur: 20, sum: 20, size: 0.16},    audioKey: 'pvz-hat', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_2_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 1.5, h: 1.5, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.03, speed: 0.03, reward: 20, hp: {cur: 30, sum: 30, size: 0.16},    audioKey: 'pvz-drum', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_3_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 1.5, h: 1.5, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.04, speed: 0.04, reward: 30, hp: {cur: 50, sum: 50, size: 0.16},        audioKey: 'pvz-door', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_4_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 1.7, h: 1.7, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.06, speed: 0.06, reward: 40, hp: {cur: 100, sum: 100, size: 0.16},     audioKey: 'pvz-armor', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_5_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 1.7, h: 1.7, curFloorI: 0, isForward: true, isFlip: false,  curSpeed: 0.06, speed: 0.06, reward: -100, hp: {cur: 20, sum: 20, size: 0.16},      audioKey: 'pvz-newspaper', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_6_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '舞王',     x: 0, y: 0, w: 1.7, h: 1.7, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.04, speed: 0.04, reward: 100, hp: {cur: 150, sum: 150, size: 0.16},     skill: {time: 6000}, audioKey: 'pvz-dance', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_7_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 2, h: 1.7, curFloorI: 0, isForward: true, isFlip: false, curSpeed: 0.08, speed: 0.08, reward: 30, hp: {cur: 30, sum: 30, size: 0.16},        audioKey: 'pvz-rod', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_8_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 1.8, h: 1.8, curFloorI: 0, isForward: true, isFlip: false,  curSpeed: 0.04, speed: 0.04, reward: 80, hp: {cur: 250, sum: 250, size: 0.16},     audioKey: 'pvz-car', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_9_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 1.8, h: 1.8, curFloorI: 0, isForward: true, isFlip: false,  curSpeed: 0.03, speed: 0.03, reward: 100, hp: {cur: 500, sum: 500, size: 0.16}, audioKey: 'afu', type: 'png', imgSource: new URL("../assets/img/zombies/afu.png", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '弗利萨',   x: 0, y: 0, w: 1.8, h: 1.8, curFloorI: 0, isForward: true, isFlip: false,  curSpeed: 0.03, speed: 0.03, reward: 200, hp: {cur: 800, sum: 800, size: 0.16}, skill: {time: 5000}, audioKey: 'pvz-fulisha', type: 'png', imgSource: new URL("../assets/img/zombies/fulisha.png", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '舞王小兵', x: 0, y: 0, w: 1.5, h: 1.5, curFloorI: 0, isForward: true, isFlip: false,  curSpeed: 0.04, speed: 0.04, reward: 5, hp: {cur: 30, sum: 30, size: 0.16},       audioKey: 'pvz-dance-little', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_10_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '小鬼僵尸', x: 0, y: 0, w: 1.5, h: 1.5, curFloorI: 0, isForward: true, isFlip: false,  curSpeed: 0.06, speed: 0.06, reward: 5, hp: {cur: 20, sum: 20, size: 0.16},       audioKey: 'pvz-little', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_11_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '坤坤',     x: 0, y: 0, w: 1.8, h: 1.8, curFloorI: 0, isForward: true, isFlip: false,  curSpeed: 0.04, speed: 0.04, reward: 250, hp: {cur: 700, sum: 700, size: 0.16},     skill: {time: 10000}, audioKey: 'kunkun', type: 'png', imgSource: new URL("../assets/img/zombies/kunkun.png", import.meta.url).href, imgList: [], imgIndex: 0},
  // {name: '坤坤',     x: 0, y: 0, w: 1.8, h: 1.8, curFloorI: 0, isForward: true, isFlip: false,  curSpeed: 0.04, speed: 0.04, reward: 250, hp: {cur: 700, sum: 700, size: 0.16},     skill: {time: 10000}, audioKey: 'kunkun', type: 'gif', imgSource: new URL("../assets/img/zombies/kunkun.gif", import.meta.url).href, imgList: [], imgIndex: 0},
] as EnemyType[]
 
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
  curSpeed: number
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
  type: string
  /** 图片资源 */
  imgSource: string
  /** 加载完成的图片资源 */
  imgList: HTMLImageElement[]
  /** 当前绘画到的图片索引，用于gif图 */
  imgIndex: number
}