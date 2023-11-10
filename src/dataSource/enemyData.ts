import { EnemyDataObj, EnemyName, EnemyStaticItem } from "@/type/enemy";
import { requireCDN } from "@/utils/handleImg";
const  _requireCDN = (url: string) => requireCDN(url, 'zombies')

const enemyObj: EnemyDataObj = {
  'zombie-flag': {name: 'zombie-flag',   w: 1.5, h: 1.5, curSpeed: 0.03, speed: 0.03, reward: 50, hp: {cur: 10, sum: 10}, audioKey: 'pvz-pieces', imgType: 'gif', imgSource: _requireCDN('zombie_0_move.gif'), isForward: true, isFlip: false},
  'zombie-1': {name: 'zombie-1',      w: 1.5, h: 1.5, curSpeed: 0.03, speed: 0.03, reward: 10, hp: {cur: 10, sum: 10}, audioKey: 'pvz', imgType: 'gif', imgSource: _requireCDN('zombie_1_move.gif'), isForward: true, isFlip: false},
  'zombie-2': {name: 'zombie-2',      w: 1.5, h: 1.5, curSpeed: 0.03, speed: 0.03, reward: 15, hp: {cur: 25, sum: 25}, audioKey: 'pvz-hat', imgType: 'gif', imgSource: _requireCDN('zombie_2_move.gif'), isForward: true, isFlip: false},
  'zombie-3': {name: 'zombie-3',      w: 1.5, h: 1.5, curSpeed: 0.03, speed: 0.03, reward: 20, hp: {cur: 40, sum: 40}, audioKey: 'pvz-drum', imgType: 'gif', imgSource: _requireCDN('zombie_3_move.gif'), isForward: true, isFlip: false},
  'iron-gate': {name: 'iron-gate',      w: 1.5, h: 1.5, curSpeed: 0.04, speed: 0.04, reward: 30, hp: {cur: 60, sum: 60}, audioKey: 'pvz-door', imgType: 'gif', imgSource: _requireCDN('zombie_4_move.gif'), isForward: true, isFlip: false},
  'rugby': {name: 'rugby',          w: 1.7, h: 1.7, curSpeed: 0.06, speed: 0.06, reward: 40, hp: {cur: 120, sum: 120}, audioKey: 'pvz-armor', imgType: 'gif', imgSource: _requireCDN('zombie_5_move.gif'), isForward: true, isFlip: false},
  'newspaper': {name: 'newspaper',            w: 1.7, h: 1.7,  curSpeed: 0.06, speed: 0.06, reward: -100, hp: {cur: 30, sum: 30}, audioKey: 'pvz-newspaper', imgType: 'gif', imgSource: _requireCDN('zombie_6_move.gif'), isForward: true, isFlip: false},
  'zombie-dance': {name: 'zombie-dance',  w: 1.7, h: 1.7, curSpeed: 0.04, speed: 0.04, reward: 80, hp: {cur: 350, sum: 350}, skill: {time: 8000}, audioKey: 'pvz-dance', imgType: 'gif', imgSource: _requireCDN('zombie_7_move.gif'), isForward: true, isFlip: false},
  'pole-vault': {name: 'pole-vault',            w: 2, h: 1.7, curSpeed: 0.08, speed: 0.08, reward: 30, hp: {cur: 30, sum: 30}, audioKey: 'pvz-rod', imgType: 'gif', imgSource: _requireCDN('zombie_8_move.gif'), isForward: true, isFlip: false},
  'ice-car': {name: 'ice-car',        w: 1.8, h: 1.8,  curSpeed: 0.04, speed: 0.04, reward: 110, hp: {cur: 200, sum: 200}, skill: {time: 5000, r: 3, keepTime: 3000, animation: {cur: 120, sum: 120}}, audioKey: 'pvz-ice-car', imgType: 'gif', imgSource: _requireCDN('zombie_9_move.gif'), isForward: true, isFlip: false},
  'afu': {name: 'afu',            w: 1.8, h: 1.8, curSpeed: 0.03, speed: 0.03, reward: 80, hp: {cur: 500, sum: 500}, audioKey: 'afu', imgType: 'png', imgSource: _requireCDN('afu.png'), isForward: false, isFlip: true},
  'fulisha': {name: 'fulisha',        w: 1.8, h: 1.8,  curSpeed: 0.03, speed: 0.03, reward: 150, hp: {cur: 800, sum: 800}, skill: {time: 6000}, audioKey: 'pvz-fulisha', imgType: 'png', imgSource: _requireCDN('fulisha.png'), isForward: true, isFlip: false},
  'dance-little': {name: 'dance-little',        w: 1.5, h: 1.5,  curSpeed: 0.04, speed: 0.04, reward: 5, hp: {cur: 15, sum: 15}, audioKey: 'pvz-dance-little', imgType: 'gif', imgSource: _requireCDN('zombie_10_move.gif'), isForward: true, isFlip: false},
  'zombie-little': {name: 'zombie-little',        w: 1.5, h: 1.5,  curSpeed: 0.06, speed: 0.06, reward: 5, hp: {cur: 10, sum: 10}, audioKey: 'pvz-little', imgType: 'gif', imgSource: _requireCDN('zombie_11_move.gif'), isForward: true, isFlip: false},
  'kunkun': {name: 'kunkun',         w: 1.8, h: 1.8,  curSpeed: 0.04, speed: 0.04, reward: 160, hp: {cur: 800, sum: 800}, skill: {time: 10000}, audioKey: 'kunkun', imgType: 'gif', imgSource: _requireCDN('kunkun.gif'), isForward: false, isFlip: false},
  'rabbish': {name: 'rabbish',        w: 1.8, h: 1.8,  curSpeed: 0.04, speed: 0.04, reward: 50, hp: {cur: 300, sum: 300}, audioKey: 'rabbish', imgType: 'gif', imgSource: _requireCDN('rabbish_1.gif'), isForward: false, isFlip: true},
  'rabbish-2': {name: 'rabbish-2',    skill: {time: 3000, r:2, animation: {cur: 80, sum: 80}}, w: 1.8, h: 1.8, curSpeed: 0.04, speed: 0.04, reward: 100, hp: {cur: 400, sum: 400}, audioKey: 'rabbish-2', imgType: 'gif', imgSource: _requireCDN('rabbish_2.gif'), isForward: false, isFlip: true},
  'godzilla': {name: 'godzilla',      skill: {time: 6000, animation: {cur: 60, sum: 60}, damage: 4}, w: 1.8, h: 1.8, curSpeed: 0.03, speed: 0.03, reward: 200, hp: {cur: 400, sum: 400}, audioKey: 'pvz-godzilla', imgType: 'png', imgSource: _requireCDN('godzilla.png'), isForward: false, isFlip: true},
  'zombie-boom': {name: 'zombie-boom', skill: {time: 3000, r: 2, animation: {cur: 120, sum: 120}, damage: 10, img: _requireCDN('zombie-boom-skill.gif')}, w: 1.5, h: 1.5, curSpeed: 0.03, speed: 0.03, reward: 80, hp: {cur: 150, sum: 150}, audioKey: 'pvz-boom', imgType: 'gif', imgSource: _requireCDN('zombie-boom.gif'), dieImg: _requireCDN('zombie-boom-skill2.gif'), isForward: true, isFlip: false},
}
export default enemyObj

export const enemyStaticData: {[key in EnemyName]: EnemyStaticItem} = {
  'zombie-flag': {name: '旗子僵尸', explain: '作者很懒没写什么...'},
  'zombie-1': {name: '普通僵尸', explain: '作者很懒没写什么...'},
  'zombie-2': {name: '路障僵尸', explain: '作者很懒没写什么...'},
  'zombie-3': {name: '铁桶僵尸', explain: '作者很懒没写什么...'},
  'iron-gate': {name: '铁门僵尸', explain: '作者很懒没写什么...'},
  'rugby': {name: '橄榄球僵尸', explain: '作者很懒没写什么...'},
  'newspaper': {name: '报纸僵尸', explain: '穷鬼一个，击杀它你将损失100金币'},
  'zombie-dance': {name: '舞王僵尸', explain: '技能: 能召唤4个傀儡僵尸', enemyNameList: ['zombie-dance', 'dance-little'], towerList: [{x: 3, y: 3, towerName: 'lanbo'},{x: 4, y: 3, towerName: 'lanbo'},{x: 5, y: 3, towerName: 'huonan'}]},
  'dance-little': {name: '舞王傀儡', explain: '舞王僵尸的傀儡'},
  'pole-vault': {name: '撑杆跳僵尸', explain: '他跑得很快...'},
  'ice-car': {name: '冰车', explain: '技能: 范围内释放冷气，冰冻塔防(塔防将无法攻击并受到少量伤害)'},
  'afu': {name: '阿福', explain: '乌鸦坐飞机，有待开发...'},
  'fulisha': {name: '弗利萨', explain: '技能: 召唤两个小鬼僵尸', enemyNameList: ['zombie-dance', 'zombie-little']},
  'zombie-little': {name: '小鬼僵尸', explain: '作者很懒没写什么...'},
  'kunkun': {name: '坤坤', explain: '技能: 播放“鸡你太美”回复200生命值'},
  'rabbish': {name: '兔子', explain: '兔兔很可爱，请不要击杀...'},
  'rabbish-2': {name: '带帽兔子', explain: '技能: 回复一格范围内所有僵尸5%的生命值'},
  'godzilla': {name: '哥斯拉', explain: '技能: 往最近的敌人方向释放原子吐息，该方向上的所有塔防都将收到巨量伤害'},
  'zombie-boom': {name: '炸弹僵尸', explain: '技能: 当生命值低于50%时，会进入自爆状态，如果在时间内未能击杀它，两格范围内的塔防都将被它炸掉'},
}

/** 敌人的最高等级 */
export const ENEMY_MAX_LEVEL = 10;

export const enemyHpColors = ['#0066a1', '#49ca00', '#409756', '#eedf96', '#f8d501', '#cb732a', '#e5a4ac', '#be3f41', '#e047db', '#c0c0cb', '#eaeaea']