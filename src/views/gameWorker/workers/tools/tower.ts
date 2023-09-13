import { TowerStateType } from "@/type/game"
import { TargetCircleInfo, addMoney, baseDataState, checkValInCircle, gameConfigState, onWorkerPostFn, setting, source } from "./baseData"
import keepInterval, { KeepIntervalKey } from "@/utils/keepInterval"
import { randomStr } from "@/utils/random"
import { TowerName } from "@/dataSource/towerData"
import { powAndSqrt } from "@/utils/tools"
import _ from "lodash"
import { enemyMap } from "./enemy"
import { shootBullet, specialBullets, triggerPoisonFun } from "./bullet"
import { BuildTowerParams } from "../type/tower"

const towerMap: Map<string, TowerStateType> = new Map()

/** 点击建造塔防 */
function buildTower({x, y, tname}: BuildTowerParams, isMusic = true) {
  const { rate, money, audioKey, onloadImg, onloadbulletImg, ...ret } = _.cloneDeep(source.towerSource![tname]) 
  if(baseDataState.money < money) return
  addMoney(-money)
  if(setting.isDevTestMode) {
    ret.damage /= 10
  }
  const size = gameConfigState.size
  // 处理多个相同塔防的id值
  const tower: TowerStateType = {
    ...ret, x, y, id: randomStr(tname), targetIdList: [], bulletArr: [], onloadImg, onloadbulletImg, rate, money, audioKey
  }
  tower.r *= size 
  tower.speed *= size
  tower.bSize.w *= size
  tower.bSize.h *= size
  tower.hp.injuryTime = 0
  // 子弹射击的防抖函数
  if(tower.name !== 'huonan') {
    tower.isToTimeShoot = true
  }
  if(tower.name === 'lanbo') {
    tower.scale = 1
    const {r, speed, bSize: {w, h}} = tower
    const l = powAndSqrt(w / 2, h / 2)
    // 这里 speed + 1 是为了让子弹扩散的效果快于真实子弹
    tower.addScale = (r / l - 1) / ((r - l) / (speed + 1))
  } else if(tower.name === 'huonan') {
    tower.thickness = tower.bSize.w
    tower.preDamage = tower.damage
  }
  towerMap.set(tower.id, tower)
  if(!setting.isTowerCover) {
    // 用于标记是哪个塔防 10 + index
    baseDataState.gridInfo.arr[Math.floor(y / size)][Math.floor(x / size)] = 't' + tname
  }
  drawTower(tower)
  onWorkerPostFn('buildTowerCallback', {towerId: tower.id, audioKey})
  if(isMusic) {
    onWorkerPostFn('playDomAudio', {id: tower.id})
  }
}

function drawTowerMap() {
  towerMap.forEach(t => {
    drawTower(t)
  })
}
/** 画塔防 */
function drawTower(tower: TowerStateType) {
  const size = gameConfigState.size
  gameConfigState.ctx.drawImage(tower.onloadImg, tower.x, tower.y, size, size)
  if(tower.hp.isShow && tower.hp.injuryTime! + 1500 > Date.now()) {
    const ctx = gameConfigState.ctx
    const { x, y, hp } = tower
    const hpSize = size / 7
    // 血条背景色
    ctx.fillStyle = '#0066a1'
    ctx.fillRect(x, y - hpSize, size, hpSize)
    // 血条颜色
    ctx.fillStyle = '#ff687b'
    ctx.fillRect(x, y - hpSize, hp.cur / hp.sum * size, hpSize)
    // 画边框
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#cff1d3"; //边框颜色
    ctx.rect(x, y - hpSize, size, hpSize);  //透明无填充
    ctx.stroke();
  } else {
    tower.hp.isShow = false
  }
}

/** 伤害塔防 */
function damageTower(t: TowerStateType) {
  t.hp.injuryTime = Date.now()
  t.hp.cur -= 1
  if(t.hp.cur <= 0) {
    removeTower(t.id, false)
  }
}

/** 售卖防御塔 */
function removeTower(towerId: string, isSale = true) {
  const size = gameConfigState.size
  const tower = towerMap.get(towerId)!
  if(!tower) return
  const {x, y, saleMoney, id} = tower
  gameConfigState.ctx.clearRect(x, y, size, size);
  baseDataState.gridInfo.arr[Math.floor(y / size)][Math.floor(x / size)] = 0
  if(isSale) {
    addMoney(saleMoney)
  }
  keepInterval.delete(`towerShoot-${id}`)
  towerMap.delete(towerId)
  onWorkerPostFn('saleTowerCallback', id)
}

/** 处理敌人的移动，进入塔防的范围 */
function checkEnemyAndTower() {
  if(!enemyMap.size) return
  towerMap.forEach(t => {
    if(t.name === 'huonan') {
      const targetIdList = enterAttackScopeList(t)
      if(targetIdList) t.targetIdList = targetIdList
      else {
        if(t.targetIdList.length) t.targetIdList = []
      }
    } else {
      if(t.isToTimeShoot) {
        const eIdList = enterAttackScopeList(t)
        // 进入攻击范围，开始射击 
        if(eIdList?.length) {
          t.isToTimeShoot = false
          shootBullet(eIdList, t)
          keepInterval.set(`${KeepIntervalKey.towerShoot}-${t.id}`, () => {
            t.isToTimeShoot = true
          }, t.rate, {isTimeOut: true})
        } else {
          if(t.targetIdList.length) {
            t.targetIdList = []
          }
        }
      }
    }
  })
  for(const bItem of specialBullets.twitch) {
    // r = w / 2 除2.5是为了让敌人和子弹的接触范围缩小
    const eIdList = enterAttackScopeList({x: bItem.x, y: bItem.y, r: bItem.w / 2.5, size: bItem.w})
    if(eIdList?.length) {
      triggerPoisonFun(eIdList)
    }
  }
}

/** 返回进入攻击范围的值的数组 */
function enterAttackScopeList(target: TargetCircleInfo) {
  const arr: {curFloorI: number, id: string}[] = []
  enemyMap.forEach(enemy => {
    if(checkValInCircle(enemy, target)) {
      arr.push({curFloorI: enemy.curFloorI, id: enemy.id})
    }
  })
  if(!arr.length) return
  arr.sort((a, b) => b.curFloorI - a.curFloorI)
  if(target.targetNum) {
    return arr.splice(0, target.targetNum).map(item => item.id)
  }
  return arr.map(item => item.id)
}

export {
  towerMap,
  buildTower,
  drawTowerMap,
  damageTower,
  removeTower,
  checkEnemyAndTower,
}