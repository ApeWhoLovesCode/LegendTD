import { BulletType, EnemyStateType, SpecialBulletItem, SpecialBullets, TargetInfo, TowerStateType } from "@/type/game"
import { damageTheEnemy, enemyMap, removeEnemy, slowEnemy } from "./enemy"
import { addMoney, canvasInfo, gameConfigState, source } from "./baseData"
import { powAndSqrt } from "@/utils/tools"
import { getAngle } from "@/utils/handleCircle"
import { towerMap } from "./tower"
import keepInterval, { KeepIntervalKey } from "@/utils/keepInterval"
import towerArr, { TowerName, TowerType } from "@/dataSource/towerData";
import { drawLinearGradientRoundRect } from "./canvas"
import { randomStr } from "@/utils/random"

/** 保存特殊子弹 */
export const specialBullets: SpecialBullets = {
  twitch: []
}

/** 发射子弹 */
export function shootBullet(eIdList: string[], t: TowerStateType) {
  for(const e_id of eIdList) {
    const enemy = enemyMap.get(e_id)
    if(!enemy) break
    const size_2 = gameConfigState.size / 2
    const {x, y, w, h} = enemy
    // 敌人中心坐标
    const _x = x + w / 2, _y = y + h / 2
    const {x: t_x, y: t_y, speed, name, id, isThrough, bulletInitDeg } = t
    // 子弹初始坐标
    const begin = {x: t_x + size_2, y: t_y + size_2}
    // 两坐标间的差值
    const diff = {x: _x - begin.x, y: _y - begin.y}
    // 子弹和敌人的距离
    const distance = powAndSqrt(diff.x, diff.y)
    const addX = speed * diff.x / distance, addY = speed * diff.y / distance
    const bullet: BulletType = {x: begin.x, y: begin.y, addX, addY, xy: 0, x_y: distance, e_id}
    if(isThrough) {
      bullet.attactIdSet = new Set()
    }
    if(name === 'delaiwen') {
      bullet.isRecycling = false
    }
    if(bulletInitDeg !== void 0) {
      const deg = getAngle({x: begin.x, y: begin.y}, {x: _x, y: _y})
      bullet.deg = -bulletInitDeg + deg
    }
    t.bulletArr.push(bullet)
    // 这里可以放发射子弹音频
    // if(name === 'PDD') {
    //   playDomAudio({id, volume: 0.4})
    // }
  }
  // 添加攻击目标的索引
  t.targetIdList = eIdList
  if(t.name === 'lanbo') {
    t.isBulleting = true
  }
}

/** 旋转子弹 */
function drawRotateBullet({x, y, w, h, deg, img}: {
  x: number; y: number; w: number; h:number; deg: number; img: CanvasImageSource
}) {
  const ctx = gameConfigState.ctx
  ctx.save()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate(deg * Math.PI / 180)
  ctx.translate(-(x + w / 2), -(y + h / 2))
  ctx.drawImage(img, x, y, w, h)
  ctx.restore()
}

/** 处理子弹的移动 */
export function handleBulletMove() {
  const e_idList: string[] = []
  towerMap.forEach(t => {
    for(let b_i = t.bulletArr.length - 1; b_i >= 0; b_i--) {
      const {w, h} = t.bSize
      // 当前塔防的当前子弹
      const bItem = t.bulletArr[b_i]
      let {x, y, addX, addY, e_id} = bItem
      // 重新计算子弹离敌人的距离
      const b_e_distance = bulletEnemyDistance(e_id, t, bItem.x, bItem.y)
      if(b_e_distance) {
        const {addX: _addX, addY: _addY, x_y} = b_e_distance
        addX = _addX, addY = _addY
        bItem.addX = _addX
        bItem.addY = _addY
        bItem.x_y = x_y
      }
      bItem.x += addX
      bItem.y += addY
      bItem.xy += t.speed
      // 穿透性塔防
      if(t.isThrough) {
        const newEid = handleThroughBulletEid({x, y, w, h, attactIdSet: bItem.attactIdSet!})
        if(newEid) bItem.e_id = newEid
      }
      handleBulletAndEnemy(t, b_i, e_id, e_idList)
      // 清除穿透性子弹
      if(t.isThrough && checkThroughBullet({x,y,w,h})) {
        if(t.name === 'delaiwen') {
          if(!bItem.isRecycling) {
            bItem.isRecycling = true
            bItem.attactIdSet?.clear()
            t.bulletArr[b_i].addX = -t.bulletArr[b_i].addX
            t.bulletArr[b_i].addY = -t.bulletArr[b_i].addY
          }
        } else {
          t.bulletArr.splice(b_i, 1)
        }
      }
      // 清除回收子弹
      if(t.name === 'delaiwen' && bItem.isRecycling && checkBulletInEnemyOrTower({x,y,w,h}, t.id, true)) {
        t.bulletArr.splice(b_i, 1)
      }
    }
    if(t.isBulleting) { // 有需要额外的子弹才绘画
      drawTowerBullet(t)
    }
    if(t.name === 'huonan') { // 处理火男子弹
      handleFireBullet(t)
    }
  })
  if(e_idList?.length) { // 消灭敌人
    removeEnemy(e_idList)
  }
}
/** 处理子弹和敌人的关系 */
function handleBulletAndEnemy(t: TowerStateType, b_i: number, e_id: string, e_idList: string[]) {
  const bItem = t.bulletArr[b_i]
  const {w, h} = t.bSize
  // 子弹击中敌人
  const isInTarget = (
    t.name !== 'twitch' 
    && checkBulletInEnemyOrTower({x: bItem.x, y: bItem.y, w, h}, e_id)
    && !(t.isThrough && bItem.attactIdSet?.has(e_id))
  )
  if(isInTarget) {
    // 穿透性子弹击中敌人
    if(t.isThrough) {
      bItem.attactIdSet?.add(e_id)
    } else { // 清除子弹
      t.bulletArr.splice(b_i, 1)
    }
    handelDamageEnemy(e_id, t, e_idList)
  } else {
    if(t.isSaveBullet) {
      // 老鼠子弹到达目标 
      if(t.name === 'twitch' && bItem.xy >= bItem.x_y) {
        handleSpecialBullets(t, bItem)
        t.bulletArr.splice(b_i, 1)
      }
    }
    // 清除子弹
    if(!t.isThrough && !t.isSaveBullet && bItem.xy >= bItem.x_y) {
      t.bulletArr.splice(b_i, 1)
    }
    const ctx = gameConfigState.ctx
    const imgX = bItem.x - w / 2, imgY = bItem.y - h / 2
    if(t.name === 'fengche') {
      bItem.rotateDeg = (bItem.rotateDeg ?? 0) + 3
      drawRotateBullet({deg: bItem.rotateDeg, x: imgX, y: imgY, w, h, img: t.onloadbulletImg})
    } else if(t.name === 'delaiwen') {
      bItem.rotateDeg = (bItem.rotateDeg ?? 0) + 20
      drawRotateBullet({deg: bItem.rotateDeg, x: imgX, y: imgY, w, h, img: t.onloadbulletImg})
    } else if(!((['lanbo'] as TowerName[]).includes(t.name))) { // 绘画其余塔防的子弹
      if(bItem.deg) { // 需要旋转的子弹
        drawRotateBullet({deg: bItem.deg, x: imgX, y: imgY, w, h, img: t.onloadbulletImg})
      } else {
        ctx.drawImage(t.onloadbulletImg, imgX, imgY, w, h)
      }
    } 
  }
}
/** 处理子弹伤害敌人 */
function handelDamageEnemy(e_id: string, t: TowerStateType, e_idList: string[]) {
  const enemy = enemyMap.get(e_id)
  if(!enemy) return
  let hp = enemy.hp.cur - t.damage
  if(t.name === 'delaiwen' && (hp * 10 <= enemy.hp.sum)) { // 德莱文处决少于10%生命的敌人
    hp = 0
  }
  // 敌人扣血
  enemy.hp.cur = Math.max(hp, 0)
  if(enemy.hp.cur <= 0) {
    e_idList.push(e_id)
    t.targetIdList.splice(t.targetIdList.findIndex(item => item === e_id), 1)
    let reward = enemy.reward
    if(t.name === 'delaiwen') {
      if(Math.floor(Math.random()*10) === 9) { // 随机 0-9
        reward = enemy.reward * 2
      }
    }
    addMoney(reward)
    // 这里可以放击杀音频
    // if(t.name === '茄子') {
    //   playDomAudio({id: t.id})
    // }
  } else {
    if(t.slow) { // 判断减速
      slowEnemy(e_id, t.slow)
    }
  }
}

/** 画塔防的特殊子弹 */
function drawTowerBullet(t: TowerStateType) {
  const {w, h} = t.bSize
  // 当前塔防的当前子弹
  const ctx = gameConfigState.ctx
  if(t.name === 'lanbo') {
    let {x, y, scale = 1, r, addScale} = t
    if(scale * w / 2 <= r) {
      scale += addScale ?? 0.3
    } else {
      t.scale = 1
      t.isBulleting = false
      return
    }
    ctx.save()
    ctx.translate((x + w / 2) * (1 - scale), (y + h / 2) * (1 - scale))
    ctx.scale(scale, scale)
    ctx.drawImage(t.onloadbulletImg, x, y, w, h)
    ctx.restore()
    t.scale = scale
  }
}

/** 处理火男火焰 */
function handleFireBullet(t: TowerStateType) {
  const enemy = enemyMap.get(t.targetIdList[0])
  if(!enemy) return
  damageTheEnemy(enemy, t.damage)
  if(t.damage < t.preDamage! * 3) {
    t.thickness! = Math.min(t.thickness! + 0.025, gameConfigState.size / 2)
    t.damage += 0.001
  }
  if(t.targetIdList[0]) {
    drawFireBullet(t, enemy)
  } 
  // 切换了目标或没目标了
  if(t.curTargetId !== t.targetIdList[0]) {
    t.thickness = t.bSize.w
    t.damage = t.preDamage ?? 1
    t.curTargetId = t.targetIdList[0]
  }
}

/** 画火男的火焰柱 */
function drawFireBullet(t: TowerStateType, enemy: EnemyStateType) {
  const {thickness = 1, x, y} = t
  const size = gameConfigState.size
  const {x: ex, y: ey, w, h} = enemy
  drawLinearGradientRoundRect({
    ctx: gameConfigState.ctx!,
    thickness, 
    thicknessPre: t.bSize.w,
    x: x + size / 2, 
    y: y + size / 2, 
    tx: ex + w / 2, 
    ty: ey + h / 2, 
    linearGradient: [
      {value: 0, color: '#de5332'},
      {value: 0.4, color: '#f3c105'},
      {value: 0.5, color: '#ffc800'},
      {value: 0.6, color: '#f3c105'},
      {value: 1, color: '#de5332'},
    ]
  })
}
/** 特殊子弹击中目标 */
function handleSpecialBullets(t: TowerStateType, bItem: BulletType) {
  const bw = t.bSize.w * 5, bh = t.bSize.h * 5
  const bId = randomStr('twitch-bid')
  const bullet: SpecialBulletItem = {
    id: bId, tId: t.id, x: bItem.x - bw / 2, y: bItem.y - bh / 2, w: bw, h: bh
  }
  specialBullets.twitch.push(bullet)
  // 倒计时清除该子弹
  keepInterval.set(bId, () => {
    const index = specialBullets.twitch.findIndex(b => b.id === bId)
    specialBullets.twitch.splice(index, 1)
  }, t.poison!.bulletTime, {isTimeOut: true})
}
/** 画特殊子弹 */
export function drawSpecialBullets() {
  if(!specialBullets.twitch.length) return
  const ctx = gameConfigState.ctx
  const img = source.towerSource!['twitch'].onloadbulletImg
  ctx.save()
  ctx.globalAlpha = 0.3
  specialBullets.twitch.forEach(b => {
    ctx?.drawImage(img, b.x, b.y, b.w, b.h)
  })
  ctx.restore()
}
/** 中毒触发函数 */
export function triggerPoisonFun(eIdList: string[]) {
  const t = towerArr['twitch']
  for(const e_id of eIdList) {
    const enemy = enemyMap.get(e_id)
    if(!enemy) return
    if(!enemy.poison) {
      enemy.poison = {level: 0, damage: t.damage, isToTimePoison: true}
    } else {
      if(enemy.poison.isToTimePoison) {
        enemy.poison!.isToTimePoison = false
        slowEnemy(e_id, t.slow!)
        startPoisonInterval(e_id, t)
        keepInterval.set(`${KeepIntervalKey.poisonFun}-${e_id}`, () => {
          enemy.poison!.isToTimePoison = true
        }, 1000, {isTimeOut: true})
      }
    }
  }
}
/** 开启中毒计时器 */
function startPoisonInterval(e_id: string, t: TowerType) {
  const enemy = enemyMap.get(e_id)
  if(enemy) {
    const ePoison = enemy.poison!
    if(ePoison.level < 5) ePoison.level++
    damageTheEnemy(enemy, ePoison.level * ePoison.damage)
    // 开启毒液伤害计时器 清除：1.敌人死亡 2.中毒时间到了 3.组件卸载
    keepInterval.set(`${KeepIntervalKey.twitch}-${e_id}`, () => {
      damageTheEnemy(enemy, ePoison.level * ePoison.damage)
    }, 1000)
    // 清除敌人受到的毒液计时器
    keepInterval.set(`${KeepIntervalKey.twitchDelete}-${e_id}`, () => {
      keepInterval.delete(`${KeepIntervalKey.twitch}-${e_id}`)
      enemy.poison = void 0
    }, t.poison!.time, {isTimeOut: true})
  }
}

/** 
 * 计算子弹和敌人的距离
 * 返回 x,y方向需要增加的值, distance: 子弹和敌人的距离, x_y: 塔和敌人的距离
 */
function bulletEnemyDistance(
  e_id: string, tower: TowerStateType, bx: number, by: number
) {
  // 敌人已经死了 | 能穿透的子弹 | 老鼠 ,不用覆盖之前的值了 
  if(tower.isThrough || tower.name === 'twitch') return
  const enemy = enemyMap.get(e_id)
  if(!enemy) return
  const size_2 = gameConfigState.size / 2
  const {x, y, w, h} = enemy
  // 敌人中心坐标
  const _x = x + w / 2, _y = y + h / 2
  const { speed,  x: tx, y: ty } = tower
  // 两坐标间的差值
  const diff = {x: _x - bx, y: _y - by}
  // 子弹和敌人的距离
  const distance = powAndSqrt(diff.x, diff.y)
  return {
    addX: speed * diff.x / distance,
    addY: speed * diff.y / distance,
    x_y: powAndSqrt(_x - (tx + size_2), _y - (ty + size_2))
  }
}

/** 处理穿透性子弹攻击的下一个敌人 */
function handleThroughBulletEid(bItem: TargetInfo & {attactIdSet: Set<string>}) {
  const {x, y, w, h, attactIdSet} = bItem
  for(const eItem of enemyMap.values()) {
    if(!attactIdSet.has(eItem.id) && checkBulletInEnemyOrTower({x,y,w,h}, eItem.id)) {
      return eItem.id
    }
  }
  return false
}

/** 判断穿透性子弹是否越界了 */
function checkThroughBullet(bItem: TargetInfo) {
  let {x, y, w, h} = bItem
  const canvasW = canvasInfo.offscreen.width
  const canvasH = canvasInfo.offscreen.height
  x = x - w / 2, y = y - h / 2
  return x + w < 0 || y + h < 0 || x > canvasW || y > canvasH
}
/** 判断敌人中心是否在子弹中 即击中敌人 */
function checkBulletInEnemyOrTower({x, y, w, h}: TargetInfo, id: string, isTower?: boolean) {
  const target = !isTower ? enemyMap.get(id) : towerMap.get(id)
  if(!target) return
  const size = gameConfigState.size
  const {x:ex, y:ey, w:ew = size, h:eh = size} = target as TargetInfo
  const checkIn = (v: number, scope: number, t: number) => (t > v - scope / 2) && (t < v + scope / 2)
  // 子弹中心(当前的xy在绘画时已经是偏移过了) 和 敌人中心 
  return checkIn(x, w, ex + ew / 2) && checkIn(y, h, ey + eh / 2)
}   
