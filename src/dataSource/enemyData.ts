import ememyMove_1 from '../assets/img/zombies/zombies_0_move.gif';
/**
 * 敌人资源 
 * curFloorI: 当前所在格的索引, imgList: gif转静态图片数组, curSpeed: 当前的速度
 * ∵ offset.y = 10; ∴ h + y = 90
 */



export default [
  {name: '僵尸',     x: 0, y: 0, w: 75, h: 75, curFloorI: 0, curSpeed: 1.5, speed: 1.5, reward: 100, hp: {cur: 10, sum: 10, size: 8},    audioKey: 'pvz-pieces', type: 'gif', imgSource: ememyMove_1, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 75, h: 75, curFloorI: 0, curSpeed: 1.5, speed: 1.5, reward: 10, hp: {cur: 10, sum: 10, size: 8},    audioKey: 'pvz', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_1_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 75, h: 75, curFloorI: 0, curSpeed: 1.5, speed: 1.5, reward: 15, hp: {cur: 20, sum: 20, size: 8},    audioKey: 'pvz-hat', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_2_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 75, h: 75, curFloorI: 0, curSpeed: 1.5, speed: 1.5, reward: 20, hp: {cur: 30, sum: 30, size: 8},    audioKey: 'pvz-drum', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_3_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 75, h: 75, curFloorI: 0, curSpeed: 2, speed: 2, reward: 30, hp: {cur: 50, sum: 50, size: 8},        audioKey: 'pvz-door', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_4_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 85, h: 85, curFloorI: 0, curSpeed: 3, speed: 3, reward: 40, hp: {cur: 100, sum: 100, size: 8},     audioKey: 'pvz-armor', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_5_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 85, h: 85, curFloorI: 0,  curSpeed: 3, speed: 3, reward: -100, hp: {cur: 20, sum: 20, size: 8},      audioKey: 'pvz-newspaper', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_6_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '舞王',     x: 0, y: 0, w: 85, h: 85, curFloorI: 0, curSpeed: 2, speed: 2, reward: 100, hp: {cur: 150, sum: 150, size: 8},     skill: {time: 6000}, audioKey: 'pvz-dance', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_7_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 100, h: 85, curFloorI: 0, curSpeed: 4, speed: 4, reward: 30, hp: {cur: 30, sum: 30, size: 8},        audioKey: 'pvz-rod', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_8_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 90, h: 90, curFloorI: 0,  curSpeed: 2, speed: 2, reward: 80, hp: {cur: 250, sum: 250, size: 8},     audioKey: 'pvz-car', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_9_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '僵尸',     x: 0, y: 0, w: 90, h: 90, curFloorI: 0,  curSpeed: 1.5, speed: 1.5, reward: 100, hp: {cur: 500, sum: 500, size: 8}, audioKey: 'afu', type: 'png', imgSource: new URL("../assets/img/zombies/afu.png", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '弗利萨',   x: 0, y: 0, w: 90, h: 90, curFloorI: 0,  curSpeed: 1.5, speed: 1.5, reward: 200, hp: {cur: 800, sum: 800, size: 8}, skill: {time: 5000}, audioKey: 'pvz-fulisha', type: 'png', imgSource: new URL("../assets/img/zombies/fulisha.png", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '舞王小兵', x: 0, y: 0, w: 75, h: 75, curFloorI: 0,  curSpeed: 2, speed: 2, reward: 5, hp: {cur: 30, sum: 30, size: 8},       audioKey: 'pvz-dance-little', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_10_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '小鬼僵尸', x: 0, y: 0, w: 75, h: 75, curFloorI: 0,  curSpeed: 3, speed: 3, reward: 5, hp: {cur: 20, sum: 20, size: 8},       audioKey: 'pvz-little', type: 'gif', imgSource: new URL("../assets/img/zombies/zombies_11_move.gif", import.meta.url).href, imgList: [], imgIndex: 0},
  // {name: '坤坤',     x: 0, y: 0, w: 90, h: 90, curFloorI: 0,  curSpeed: 2, speed: 2, reward: 250, hp: {cur: 700, sum: 700, size: 8},     skill: {time: 10000}, audioKey: 'kunkun', type: 'png', imgSource: new URL("../assets/img/zombies/kunkun.png", import.meta.url).href, imgList: [], imgIndex: 0},
  {name: '坤坤',     x: 0, y: 0, w: 90, h: 90, curFloorI: 0,  curSpeed: 2, speed: 2, reward: 250, hp: {cur: 700, sum: 700, size: 8},     skill: {time: 10000}, audioKey: 'kunkun', type: 'gif', imgSource: new URL("../assets/img/zombies/kunkun.gif", import.meta.url).href, imgList: [], imgIndex: 0},
]