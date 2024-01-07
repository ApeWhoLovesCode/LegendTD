import { TowerDataObj, TowerName, TowerStaticItem } from "@/type";
import { requireCDN } from "@/utils/handleImg";
const  _requireCDN = (url: string) => requireCDN(url, 'tower')



/**
 * 塔防数据
 */
const towerObj: TowerDataObj = {
  'icestar': { name: 'icestar',  money: 200, saleMoney: 100, r: 3, damage: 1, hp: {cur: 10, sum: 10}, targetNum: 1, rate: 900, speed: 0.12, slow: {num: 2, time: 5000, type: 'slow'}, bSize: {w:0.6,h:0.6},   audioKey: 'slow-star', img: _requireCDN('tower_slow.png'), bulletImg: _requireCDN('bullet-star.png')},
  'fengche': { name: 'fengche',  money: 500, saleMoney: 250, r: 3.6, damage: 2, hp: {cur: 10, sum: 10}, targetNum: 1, rate: 1000, speed: 0.14, bSize: {w:1,h:1}, isThrough: true, audioKey: 'fengche', img: _requireCDN('fengche.png'), bulletImg: _requireCDN('bullet-fengche.png')},
  'nanqiang': { name: 'nanqiang', money: 400, saleMoney: 200, r: 4, damage: 3, hp: {cur: 10, sum: 10}, targetNum: 3, rate: 1000, speed: 0.14, bSize: {w:0.4,h:0.4},   audioKey: 'nanqiang', img: _requireCDN('nanqiang.png'), bulletImg: _requireCDN('bullet1.png'), cover: _requireCDN('nanqiang-cover.png')},
  'ejiate': { name: 'ejiate',   money: 450, saleMoney: 225, r: 5, damage: 1, hp: {cur: 10, sum: 10}, targetNum: 1, rate: 200, speed: 0.16, bSize: {w:0.4,h:0.4},   audioKey: 'ejiate',  img: _requireCDN('ejiate.png'), bulletImg: _requireCDN('bullet1.png'), cover: _requireCDN('ejiate-cover.png')},
  'jin': { name: 'jin',      money: 800, saleMoney: 400, r: 6, damage: 7, hp: {cur: 10, sum: 10}, targetNum: 1, rate: 1200, speed: 0.2, bSize: {w:0.4,h:0.4}, audioKey: 'jin', img: _requireCDN('jin.png'), bulletImg: _requireCDN('bullet3.png'), cover: _requireCDN('jin-cover.png')},
  'ez': { name: 'ez',       money: 600, saleMoney: 300, r: 4.5, damage: 3, hp: {cur: 10, sum: 10}, targetNum: 1, rate: 1200, speed: 0.16, bSize: {w:2,h:2}, isThrough: true, bulletInitDeg: 170, audioKey: 'ez', img: _requireCDN('ez.png'), bulletImg: _requireCDN('bullet-ez.png'), cover: _requireCDN('ez-cover.png')},
  'lanbo': { name: 'lanbo',    money: 800, saleMoney: 400, r: 4, damage: 2, hp: {cur: 10, sum: 10}, targetNum: 999, rate: 1600, speed: 0.1, bSize: {w:1,h:1}, audioKey: 'lanbo', img: _requireCDN('lanbo.png'), bulletImg: _requireCDN('bullet-blisters.png'), cover: _requireCDN('lanbo-cover.png')},
  'aixi': { name: 'aixi',     money: 700, saleMoney: 350, r: 4, damage: 1, hp: {cur: 10, sum: 10}, targetNum: 9, rate: 1200, speed: 0.12, slow: {num: 2, time: 5000, type: 'slow'}, bSize: {w:0.4,h:0.4}, bulletInitDeg: 20, audioKey: 'aixi', img: _requireCDN('aixi.png'), bulletImg: _requireCDN('bullet2.png'), cover: _requireCDN('aixi-cover.png')},
  'delaiwen': { name: 'delaiwen', money: 1200, saleMoney: 600, r: 4, damage: 4, hp: {cur: 10, sum: 10}, targetNum: 2, rate: 2000, speed: 0.14, bSize: {w:1,h:1}, isThrough: true, isCharging: false, bulletInitDeg: 170, audioKey: 'delaiwen', img: _requireCDN('delaiwen.png'), bulletImg: _requireCDN('bullet-delaiwen.png'), cover: _requireCDN('delaiwen-cover.png')},
  'huonan': { name: 'huonan',   money: 900, saleMoney: 450, r: 4, damage: 0.1, hp: {cur: 10, sum: 10}, targetNum: 1, rate: 100, speed: 0.14, bSize: {w:0.1,h:0.1}, audioKey: 'huonan', img: _requireCDN('huonan.png'), bulletImg: _requireCDN('bullet2.png'), cover: _requireCDN('huonan-cover.png')},
  'twitch': { name: 'twitch',   money: 1000, saleMoney: 500, r: 3, damage: 1, addDamage: 1, hp: {cur: 10, sum: 10}, targetNum: 1, rate: 5000, speed: 0.14, slow: {num: 3, time: 1500, type: 'twitch'}, poison: {damage: 0.5, time: 5000, bulletTime: 6000}, bSize: {w:0.5,h:0.5}, audioKey: 'twitch', isSaveBullet: true, img: _requireCDN('twitch.png'), bulletImg: _requireCDN('bullet-twitch.png'), cover: _requireCDN('twitch-cover.png')},
}

export default towerObj

export const towerStaticData: {[key in TowerName]: TowerStaticItem} = {
  'icestar': { name: '冰星', explain: '向最前方的一个敌人发射一颗会使敌人减速的冰星。' },
  'nanqiang': { name: '男枪', explain: '往三个敌人发射子弹。', enemyList: [{enemyName:'zombie-1'},{enemyName:'zombie-2'},{enemyName:'zombie-3'}] },
  'ejiate': { name: '厄加特', explain: '向一个敌人发射一连串的子弹。' },
  'jin': { name: '烬', explain: '攻击范围更大，子弹伤害更高。' },
  'fengche': { name: '风车', explain: '发射一个旋转风车，风车可穿透敌人并造成伤害。', enemyList: [{enemyName:'zombie-1'},{enemyName:'zombie-2'}] },
  'ez': { name: '伊泽瑞尔', explain: '发射一个大范围的精准弹幕，可以穿透所有敌人并造成伤害.', enemyList: [{enemyName:'zombie-1'},{enemyName:'zombie-2'},{enemyName:'zombie-3'}] },
  'lanbo': { name: '兰博', explain: '向附近区域发射火焰，对命中的所有敌人造成伤害。', enemyList: [{enemyName:'zombie-1', level: 1},{enemyName:'zombie-1', level: 2},{enemyName:'zombie-1', level: 3},{enemyName:'zombie-1', level: 4},{enemyName:'zombie-1', level: 5},{enemyName:'zombie-1', level: 6},{enemyName:'zombie-1', level: 7},{enemyName:'zombie-1', level: 8},{enemyName:'zombie-1', level: 9},{enemyName:'zombie-1', level: 10}] },
  'aixi': { name: '艾希', explain: '最多往九个敌人发射冰箭，并使敌人减速。', enemyList: [{enemyName:'zombie-1'},{enemyName:'zombie-2'},{enemyName:'zombie-3'}] },
  'delaiwen': { name: '德莱文', explain: '往前方敌人处最多丢出两个会回收的斧头，斧头会处决生命值低于10%的敌人，并有10%几率使该敌人奖励翻倍。', enemyList: [{enemyName:'zombie-3',level:3},{enemyName:'zombie-3',level:3},{enemyName:'rugby', level: 3}] },
  'huonan': { name: '火男', explain: '对一名敌人喷射火焰，火焰将持续造成越来越高的伤害', enemyList: [{enemyName:'zombie-1'},{enemyName:'zombie-2'}]},
  'twitch': { name: '老鼠', explain: '每隔5秒往敌人的地上喷射毒液，路过的敌人将减速并受到持续的中毒效果，每隔1秒将叠加一层毒液效果，最大5层', enemyList: [{enemyName:'zombie-1'},{enemyName:'zombie-2',level:2},{enemyName:'zombie-3',level:3}]},
}
