import { ENEMY_MAX_LEVEL, enemyHpColors } from "@/dataSource/enemyData"
import { TowerSlow } from "@/dataSource/towerData"
import sourceInstance from "@/stores/sourceInstance"
import { EnemyState, EnemyStateType } from "@/type/game"
import keepInterval, { KeepIntervalKey } from "@/utils/keepInterval"
import _ from "lodash"
import { addMoney, baseDataState, canvasInfo, gameConfigState, isInfinite, onLevelChange, onReduceHp, onWorkerPostFn, setting, source } from "./baseData"
import { drawLinearGradientRoundRect } from "./canvas"
import { damageTower, towerMap } from "./tower"
import { randomStr } from "@/utils/random"
import { range } from "@/utils/format"
import { limitRange, powAndSqrt } from "@/utils/tools"
import { getEndXy, isLineInRect } from "./compute"
import { getPointsCos } from "@/utils/handleCircle"

const enemyMap: Map<string, EnemyStateType> = new Map()
const enemyState: EnemyState = {
  levelEnemy: [],
  createdEnemyNum: 0,
  // 敌人的移动轨迹 x坐标, y坐标, x_y(方向): 1:左 2:下 3:右 4:上
  movePath: [],
}

/** 随着关卡增加敌人等级提升 */
const addEnemyLevel = () => range(Math.ceil(
  (baseDataState.level + 1 - (isInfinite() ? 5 : 20)) / 5
), 0, ENEMY_MAX_LEVEL)

function allEnemyIn() {
  return enemyState.createdEnemyNum === enemyState.levelEnemy.length
}

function watchEnemyList() {
  if(setting.isLevelLock) return
  // 敌人已经清空
  if(!enemyMap.size && allEnemyIn() && baseDataState.hp) {
    baseDataState.level++
    setting.isLevelLock = true
    onLevelChange()
  }
}

function watchEnemySkill() {
  enemyMap.forEach(enemy => {
    if(enemy.name === 'godzilla') {
      const animation = enemy.skill!.animation
      if(animation && animation.cur < animation.sum) {
        enemyGodzillaRemoveTower(enemy)
      }
    }
  })
}

/** 按间隔时间生成敌人 */
function makeEnemy() {
  // 当前关卡敌人已经全部上场
  if(allEnemyIn()) return
  // 暂停回来，间隔时间修改
  keepInterval.set(KeepIntervalKey.makeEnemy, () => {
    if(allEnemyIn()) {
      keepInterval.delete(KeepIntervalKey.makeEnemy)
    } else {
      setEnemy()
      if(setting.isLevelLock) setting.isLevelLock = false
    }
  }, baseDataState.intervalTime)
}

/** 绘画所有的敌人 */
function drawEnemyMap() {
  // 循环静态图片数组画敌人形成gif效果
  enemyMap.forEach(enemy => {
    // 当敌人已经到达终点，就不用绘画了
    if(moveEnemy(enemy)) return
    drawEnemy(enemy)
  })
}
/** 绘画敌人 */
function drawEnemy(enemy: EnemyStateType) {
  drawEnemyImg(enemy)
  drawEnemySlow(enemy)
  drawEnemyPoison(enemy)
  drawEnemySkill(enemy)
  if(enemy.hp.cur === enemy.hp.sum) return
  drawEnemyHp(enemy)
  drawEnemyLevel(enemy)
}

/** 生成敌人 */
function setEnemy() {
  const item = _.cloneDeep(source.enemySource[enemyState.levelEnemy[enemyState.createdEnemyNum]])
  const size = gameConfigState.size
  item.w *= size
  item.h *= size
  item.curSpeed *= size
  item.speed *= size
  item.hp.size *= size
  const id = randomStr(item.audioKey)
  const level = item.level + addEnemyLevel()
  item.hp.cur = item.hp.sum * (level + 1) / 2 
  item.hp.level = level
  if(level > 1) {
    item.hp.sum *= (level + 1) / 2
  }
  const enemyItem: EnemyStateType = {...item, id, level, imgIndex: 0, curFloorI: 0, framesNum: 0}
  const {audioKey, name, w, h} = enemyItem
  const {x, y} = baseDataState.mapGridInfoItem
  // 设置敌人的初始位置
  enemyItem.x = x - w / 4
  enemyItem.y = y - h / 2
  enemyMap.set(enemyItem.id, enemyItem)
  enemyState.createdEnemyNum++
  handleEnemySkill(name, id)
  onWorkerPostFn('createAudio', {audioKey, id})
}

/** 伤害敌人 */
function damageTheEnemy(enemy: EnemyStateType, damage: number) {
  enemy.hp.cur = Math.max(enemy.hp.cur - damage, 0)
  if(enemy.hp.cur <= 0) {
    removeEnemy([enemy.id])
    addMoney(enemy.reward)
  }
}

/** 处理敌人技能 */
function handleEnemySkill(enemyName: string, e_id: string) {
  const enemy = enemyMap.get(e_id)!
  if(!enemy.skill) return
  let skillFn: ((e_id: string) => void) | undefined
  switch (enemyName) {
    case 'zombies-dance': skillFn = enemySkillDance; break;
    case 'fulisha': skillFn = enemySkillFulisha; break;
    case 'kunkun': skillFn = enemySkillKunkun; break;
    case 'rabbish-2': skillFn = enemySkillRabbish2; break;
    case 'godzilla': skillFn = enemySkillGodzilla; break;
  };
  if(skillFn) { // 有技能的敌人
    keepInterval.set(e_id, () => {
      skillFn!(e_id)
    }, enemy.skill!.time)
  }
}
/** 舞王技能 */
function enemySkillDance(e_id: string) {
  const enemy = enemyMap.get(e_id)
  if(!enemy) return
  const {curFloorI} = enemy
  const total = baseDataState.floorTile.num - 1
  for(let i = 0; i < 4; i++) {
    const newEnemy = _.cloneDeep(source.enemySource[12])
    switch (i) {
      case 0: newEnemy.curFloorI = limitRange(curFloorI - 2, 1, total); break;
      case 1: newEnemy.curFloorI = limitRange(curFloorI - 1, 1, total); break;
      case 2: newEnemy.curFloorI = limitRange(curFloorI + 1, 1, total); break;
      case 3: newEnemy.curFloorI = limitRange(curFloorI + 2, 1, total); break;
    }
    const callEnemyItem = callEnemy(newEnemy, i)
    enemyMap.set(callEnemyItem.id, callEnemyItem)
  }
  onWorkerPostFn('playDomAudio', {id: e_id, volume: 1})
}
/** 弗利萨技能 */
function enemySkillFulisha(e_id: string) {
  const enemy = enemyMap.get(e_id)
  if(!enemy) return
  const {curFloorI} = enemy
  const total = baseDataState.floorTile.num - 1
  for(let i = 0; i < 2; i++) {
    const newEnemy = _.cloneDeep(source.enemySource[13])
    switch (i) {
      case 0: newEnemy.curFloorI = limitRange(curFloorI - 2, 1, total); break;
      case 1: newEnemy.curFloorI = limitRange(curFloorI - 1, 1, total); break;
    }
    const callEnemyItem = callEnemy(newEnemy, i)
    enemyMap.set(callEnemyItem.id, callEnemyItem)
  }
  onWorkerPostFn('playDomAudio', {id: e_id, volume: 0.7})
}
/** 坤坤技能 */
function enemySkillKunkun(e_id: string) {
  const enemy = enemyMap.get(e_id)
  if(!enemy) return
  const {hp} = enemy
  const newHp = hp.cur + 200
  enemy.hp.cur = limitRange(newHp, newHp, hp.sum)
  onWorkerPostFn('playDomAudio', {id: e_id, volume: 0.5})
}
/** 2号兔子技能 */
function enemySkillRabbish2(e_id: string) {
  const enemy = enemyMap.get(e_id)
  if(!enemy) return
  // 兔子和隔壁一格内的怪全部回5%的血
  enemyMap.forEach(e => {
    if(Math.abs(enemy.curFloorI - e.curFloorI) <= 1) {
      e.hp.cur = Math.min(e.hp.cur + e.hp.sum * 0.05, e.hp.sum) 
    }
  })
  enemy.skill!.animation!.cur = 0
}
/** 哥斯拉技能 */
function enemySkillGodzilla(e_id: string) {
  if(!towerMap.size) return
  const enemy = enemyMap.get(e_id)
  if(!enemy) return
  const size = gameConfigState.size
  const x = enemy.x + enemy.w / 2, y = enemy.y + enemy.h / 2;
  const tartget = {distance: Infinity, id: ''}
  towerMap.forEach(t => {
    const distance = powAndSqrt(x - t.x + size / 2, y - t.y + size / 2)
    if(distance < tartget.distance) {
      tartget.distance = distance
      tartget.id = t.id
    }
  })
  const {x: towerX, y: towerY} = towerMap.get(tartget.id)!
  const end = getEndXy({x, y, tx: towerX + size / 2, ty: towerY + size / 2, endX: canvasInfo.offscreen.width, endY: canvasInfo.offscreen.height})
  const k = (end.y - y) / (end.x - x) // 斜率
  const b = y - k *  x // 截距
  enemy.skill!.direction = {
    x: end.x,
    y: end.y,
    k,
    b,
  }
  enemy.skill!.towerIds = []
  enemy.skill!.animation!.cur = 0
  towerMap.forEach(t => {
    const cosVal = getPointsCos({x, y}, {x: t.x + size / 2, y: t.y + size / 2})
    const addB = Math.abs(cosVal * size) / 2
    const isIn = [-addB, 0, addB].some(addVal => (
      isLineInRect({
        k, 
        b: b + addVal, 
        points: {
          x1: t.x, 
          y1: t.y, 
          x2: t.x + size, 
          y2: t.y + size, 
        },
        line: {x1: x, y1: y + addVal, x2: end.x, y2: end.y + addVal}
      })
    ))
    if(isIn) {
      enemy.skill!.towerIds!.push(t.id)
    }
  })
  slowEnemy(enemy.id, {num: 0, time: 1000, type: 'stop'})
}
/** 哥斯拉释放技能中，清除塔防 */
function enemyGodzillaRemoveTower(enemy: EnemyStateType) {
  towerMap.forEach(t => {
    if(enemy.skill!.towerIds?.includes(t.id)) {
      if(!t.hp.isShow) {
        t.hp.isShow = true
        damageTower(t)
      } else {
        // 200毫秒掉一次血，这里暂停卡bug的话，当继续游戏时就会触发伤害
        if(Date.now() - t.hp.injuryTime! > 200) {
          damageTower(t)
        }
      }
    }
  })
}
/** 召唤敌人的处理 */
function callEnemy(newEnemy: EnemyStateType, i: number) {
  const { curFloorI, audioKey } = newEnemy
  const { x, y } = enemyState.movePath[curFloorI - 1]
  const id = randomStr(`callenemy-${i}`)
  const size = gameConfigState.size
  newEnemy.w *= size
  newEnemy.h *= size
  newEnemy.curSpeed *= size
  newEnemy.speed *= size
  newEnemy.hp.size *= size
  newEnemy.hp.cur = newEnemy.hp.sum
  newEnemy.hp.level = 1
  return {
    ...newEnemy,
    imgIndex: 0,
    framesNum: 0,
    id: audioKey + id,
    x: x - newEnemy.w / 4,
    y: y - newEnemy.h / 2,
  } as EnemyStateType
}

/** 敌人移动 */
function moveEnemy(enemy: EnemyStateType) {
  const { curSpeed, speed, curFloorI, isForward, isFlip, id, w, h } = enemy
  // 敌人到达终点
  if(curFloorI === baseDataState.floorTile.num - 1) {
    removeEnemy([id])
    onReduceHp(1)
    return true
  }
  // 将格子坐标同步到敌人的坐标
  const { x, y, x_y } = enemyState.movePath[curFloorI]
  const _x = x - w / 4, _y = y - h / 2
  switch (x_y) {
    case 1: {
      enemy.x -= curSpeed;
      if(isForward === isFlip) {
        enemy.isForward = !isForward
      }
      break;
    }
    case 2: enemy.y -= curSpeed; break;
    case 3: {
      enemy.x += curSpeed;
      if(!isForward === isFlip) {
        enemy.isForward = !isForward
      }
      break;
    } 
    case 4: enemy.y += curSpeed; break;
  }
  const { x: eX, y: eY } = enemy
  // 敌人到达下一个格子
  if((eX >= _x && eX <= _x + speed) && (eY >= _y && eY <= _y + speed)) {
    enemy.curFloorI++
  }
}

/** 消灭敌人 */
function removeEnemy(e_idList: string[]) {
  for(const e_id of e_idList) {
    keepInterval.delete(`${KeepIntervalKey.slow}-${e_id}`) // 清除减速持续时间定时器
    keepInterval.delete(`${KeepIntervalKey.twitch}-${e_id}`) // 清除中毒持续时间定时器
    keepInterval.delete(`${KeepIntervalKey.twitchDelete}-${e_id}`)
    keepInterval.delete(`${KeepIntervalKey.poisonFun}-${e_id}`)
    if(enemyMap.get(e_id)?.skill) {
      keepInterval.delete(e_id)
    }
    // 清除穿透子弹攻击过的目标id
    towerMap.forEach(t => {
      if(t.isThrough) {
        for(const b of t.bulletArr) {
          b.attactIdSet?.delete(e_id) 
        }
      }
    })
    // removeAudio(e_id)
    enemyMap.delete(e_id)
  }
}


/** 减速敌人 t_slow: {num: 减速倍速(当为0时无法动), time: 持续时间} */
function slowEnemy(e_id: string, t_slow: TowerSlow, callback?: (enemy: EnemyStateType) => void) {
  const enemyItem = enemyMap.get(e_id)!
  const { speed, curSpeed } = enemyItem
  // 当前已经被眩晕了不能减速了
  if(curSpeed === 0) return
  const newSpeed = t_slow.num ? speed / t_slow.num : t_slow.num
  // 防止艾希覆盖老鼠
  if(newSpeed <= curSpeed) {
    // 重新设置恢复速度定时器
    keepInterval.set(`${KeepIntervalKey.slow}-${e_id}`, () => {
      const enemyItem = enemyMap.get(e_id)
      if(enemyItem) {
        enemyItem.curSpeed = enemyItem.speed
        enemyItem.slowType = void 0
        callback?.(enemyItem)
      }
    }, t_slow.time, {isTimeOut: true})
  }
  // 减速敌人
  if(newSpeed < curSpeed) {
    enemyItem.curSpeed = newSpeed
    enemyItem.slowType = t_slow.type
  }
}

/** 绘画敌人图片 */
function drawEnemyImg(enemy: EnemyStateType) {
  const { name, imgType, x, y, w, h, imgIndex, curSpeed, isForward, speed } = enemy
  const ctx = gameConfigState.ctx
  ctx.save() // 保存画布
  // 翻转图片
  if(!isForward) { 
    ctx.translate(w + x * 2, 0)
    ctx.scale(-1, 1); // 翻转画布
  }
  const imgItem = sourceInstance.state.enemyImgSource[name]
  // 处理需要绘画的敌人图片
  const img = imgType === 'gif' ? imgItem.imgList![imgIndex].img : imgItem.img!
  ctx.drawImage(img, x, y, w, h) 
  ctx.restore() // 还原画布
  // 控制图片的索引
  if(imgType === 'gif') {
    let delay = imgItem.imgList![0].delay
    if(curSpeed !== speed) {
      delay *= 2 - curSpeed / speed
    }
    // 控制每一帧图片的切换时机
    if(curSpeed) {
      if(enemy.framesNum >= delay) {
        enemy.imgIndex++;
        enemy.framesNum = 0;
      } else {
        enemy.framesNum++;
      }
    }
    // 使图片索引回到第一帧
    if(enemy.imgIndex === imgItem.imgList!.length) {
      enemy.imgIndex = 0
    }
  }
}
/** 绘画减速效果 */
function drawEnemySlow(enemy: EnemyStateType) {
  const { x, y, w, h, curSpeed, speed, slowType } = enemy
  const ctx = gameConfigState.ctx
  const othOnloadImg = sourceInstance.state.othOnloadImg
  if(curSpeed !== speed) {
    if(slowType === 'stop') {
      return
    } else if(slowType === 'twitch') {
      ctx.save()
      ctx.globalAlpha = 0.5
      ctx.drawImage(othOnloadImg.snowPoison!, x + w / 4, y + h / 3, w / 2, w / 2)
      ctx.restore()
    } else {
      if(curSpeed === 0) {
        ctx.save()
        ctx.globalAlpha = 0.9
        ctx.drawImage(othOnloadImg.snowVertigo!, x + w / 4, y + h / 3, w / 2, w / 2)
        ctx.restore()
      } else {
        ctx.save()
        ctx.globalAlpha = 0.9
        ctx.drawImage(othOnloadImg.snow!, x + w / 4, y + h / 3, w / 3, w / 3)
        ctx.restore()
      }
    }
  }
}
/** 画中毒效果 */
function drawEnemyPoison(enemy: EnemyStateType) {
  const { x, y, w, hp, poison } = enemy
  if(!poison) return
  const ctx = gameConfigState.ctx
  const othOnloadImg = sourceInstance.state.othOnloadImg
  ctx.save()
  ctx.globalAlpha = 0.9
  if(poison.level === 5) {
    ctx.drawImage(othOnloadImg.poison!, x + w / 4, y - hp.size - w / 2, w / 2, w / 2)
  } else {
    let arr = [3 * w / 8, w / 4, w / 8, 0]
    let poisonX = x + arr[poison.level - 1]
    for(let i = 0; i < poison.level; i++) {
      ctx.drawImage(othOnloadImg.poison!, poisonX, y - hp.size - w / 4, w / 4, w / 4)
      poisonX += w / 4
    }
  }
  ctx.restore()
}
/** 绘画敌人的技能 */
function drawEnemySkill(enemy: EnemyStateType) {
  const { name, skill, x, y, w, h } = enemy
  const ctx = gameConfigState.ctx
  const othOnloadImg = sourceInstance.state.othOnloadImg
  if(name === 'rabbish-2') { // 画兔子回血效果
    const {cur, sum} = skill!.animation!
    if(cur === sum) return
    skill!.animation!.cur++
    ctx.save()
    const globalAlphaVal = Math.min(cur, sum - cur)
    ctx.globalAlpha = globalAlphaVal / 20
    const scale = 1 + cur / sum
    ctx.translate((x + w / 2) * (1 - scale), (y + h / 2) * (1 - scale))
    ctx.scale(scale, scale)
    ctx.drawImage(othOnloadImg.returnBlood!, x, y, w, w)
    ctx.restore()
  } else if(name === 'godzilla') { // 画哥斯拉原子吐息
    const {cur, sum} = skill!.animation!
    if(cur === sum) return
    skill!.animation!.cur++
    const t = enemy.skill!.direction!
    const size = gameConfigState.size
    const thickness = ((cur + sum) / (sum * 2)) * size
    drawLinearGradientRoundRect({
      ctx, thickness, thicknessPre: 0,
      x: x + w / 2, y: y + h / 2, tx: t.x, ty: t.y,
      linearGradient: [
        {value: 0, color: '#de5332'},
        {value: 0.4, color: '#f3c105'},
        {value: 0.5, color: '#ffc800'},
        {value: 0.6, color: '#f3c105'},
        {value: 1, color: '#de5332'},
      ]
    })
  }
}
/** 绘画生命值 */
function drawEnemyHp(enemy: EnemyStateType) {
  const { x, y, w, hp } = enemy
  const ctx = gameConfigState.ctx
  const w_2 = w - hp.size
  // 每一条血条的生命值
  const oneHp = hp.sum / hp.level!
  const colorI = Math.ceil(hp.cur / oneHp)
  // 血条背景色
  ctx.fillStyle = enemyHpColors[colorI - 1]
  ctx.fillRect(x, y - hp.size, w_2, hp.size)
  // 血条颜色
  ctx.fillStyle = enemyHpColors[colorI]
  ctx.fillRect(x, y - hp.size, w_2 * (hp.cur - (colorI - 1) * oneHp) / oneHp, hp.size)
  // 画边框
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#cff1d3"; //边框颜色
  ctx.rect(x, y - hp.size, w_2, hp.size);  //透明无填充
  ctx.stroke();
}
/** 绘画敌人的等级 */
function drawEnemyLevel(enemy: EnemyStateType) {
  const { x, y, hp } = enemy
  const ctx = gameConfigState.ctx
  const othOnloadImg = sourceInstance.state.othOnloadImg
  if(hp.level! < 10) {
    const levelSize = hp.size
    const moonN = Math.floor(hp.level! / 3)
    const starN = Math.floor(hp.level! % 3)
    let levelX = x - levelSize * 2, levelY = y - levelSize
    if(starN + moonN === 1) {
      ctx.drawImage(othOnloadImg[starN ? 'star' : 'moon']!, levelX, levelY, levelSize, levelSize)
    } else if(starN + moonN === 2) {
      levelX -= levelSize
      for(let i = 0; i < 2; i++) {
        ctx.drawImage(othOnloadImg[moonN > i ? 'moon' : 'star']!, levelX, levelY, levelSize, levelSize)
        levelX += levelSize
      }
    } else if(starN + moonN === 3) {
      for(let i = 0; i < 3; i++) {
        if(i === 0) {levelX -= levelSize / 2; levelY -= levelSize / 2;}
        else if(i === 1) {levelX -= levelSize / 2; levelY += levelSize;}
        else if(i === 2) levelX += levelSize;
        ctx.drawImage(othOnloadImg[moonN > i ? 'moon' : 'star']!, levelX, levelY, levelSize, levelSize)
      }
    } else if(starN + moonN === 4) {
      for(let i = 0; i < 4; i++) {
        if(i === 0) {levelX -= levelSize; levelY -= levelSize / 2;}
        else if(i === 1 || i === 3) levelX += levelSize;
        else if(i === 2) {levelX -= levelSize; levelY += levelSize;}
        ctx.drawImage(othOnloadImg[moonN > i ? 'moon' : 'star']!, levelX, levelY, levelSize, levelSize)
      }
    }
  } else {
    ctx.drawImage(othOnloadImg.sun!, x - hp.size * 2, y - hp.size * 3 / 2, hp.size * 2, hp.size * 2)
  }
}

export {
  enemyMap,
  enemyState,
  watchEnemyList,
  watchEnemySkill,
  drawEnemyMap,
  makeEnemy,
  damageTheEnemy,
  slowEnemy,
  removeEnemy,
}

