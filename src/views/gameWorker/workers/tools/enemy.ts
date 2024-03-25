import { ENEMY_MAX_LEVEL, enemyHpColors } from "@/dataSource/enemyData"
import sourceInstance from "@/stores/sourceInstance"
import { EnemyState, EnemyStateType, TowerSlow } from "@/type"
import keepInterval, { KeepIntervalKey } from "@/utils/keepInterval"
import _ from "lodash"
import { addMoney, baseDataState, gameConfigState, isNormalMode, onLevelChange, onReduceHp, onWorkerPostFn, setting, source } from "./baseData"
import { towerMap } from "./tower"
import { randomStr } from "@/utils/random"
import { range } from "@/utils/format"
import { towerCanvasMapData } from "@/dataSource/mapData"
import { drawEnemySkillAnimation, handleEnemySkill } from "./enemySkill"

const enemyMap: Map<string, EnemyStateType> = new Map()
const enemyState: EnemyState = {
  levelEnemy: [],
  createdEnemyNum: 0,
  movePath: [],
}

/** 随着关卡增加敌人等级提升 */
const addEnemyLevel = () => range(Math.ceil(
  (baseDataState.level + 1 - (isNormalMode ? 20 : 5)) / 5
), 0, ENEMY_MAX_LEVEL)

function allEnemyIn() {
  const length = !setting.isTowerCover ? enemyState.levelEnemy.length : setting.enemyList.length 
  return enemyState.createdEnemyNum === length
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
      setting.isLevelLock = false
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
  drawEnemySkillAnimation(enemy)
  if(enemy.hp.cur === enemy.hp.sum) return
  drawEnemyHp(enemy)
  drawEnemyLevel(enemy)
}

/** 生成敌人 */
function setEnemy() {
  const towerCanvasEnemy = setting.enemyList?.[enemyState.createdEnemyNum]
  const enemyName = !setting.isTowerCover ? (
    enemyState.levelEnemy[enemyState.createdEnemyNum]
  ) : towerCanvasEnemy.enemyName
  const item = _.cloneDeep(source.enemySource![enemyName])
  const size = gameConfigState.size
  item.w *= size
  item.h *= size
  item.curSpeed *= size
  item.speed *= size
  const id = randomStr(enemyName)
  const level = towerCanvasEnemy?.level ?? 1 + addEnemyLevel()
  item.hp.cur = item.hp.sum * (level + 1) / 2 
  item.hp.level = level
  if(item.skill) item.skill.count = 0
  if(level > 1) {
    item.hp.sum *= (level + 1) / 2
  }
  const movePathIndex = Math.floor(Math.random() * baseDataState.mapItem.start.length)
  const startInfo = baseDataState.mapItem.start[movePathIndex]
  const enemyItem: EnemyStateType = {...item, id, level, imgIndex: 0, endDistance: startInfo.num, gridDistance: 0, framesNum: 0, movePathIndex, isDead: false}
  const {audioKey, name, w, h} = enemyItem
  const {x, y} = !setting.isTowerCover ? startInfo : towerCanvasMapData.start[0]
  // 设置敌人的初始位置
  enemyItem.x = x * size - w / 4
  enemyItem.y = y * size - h / 2
  enemyMap.set(id, enemyItem)
  enemyState.createdEnemyNum++
  handleEnemySkill(name, id)
  if(audioKey) {
    onWorkerPostFn('createAudio', {audioKey, id})
  }
}

/** 伤害敌人 */
function damageTheEnemy(enemy: EnemyStateType, damage: number) {
  enemy.hp.cur = Math.max(enemy.hp.cur - damage, 0)
  if(enemy.hp.cur <= 0) {
    if(setting.isTowerCover && !enemy.id.includes('callenemy')) {
      enemy.hp.cur = enemy.hp.sum
    } else {
      removeEnemy([enemy.id])
      addMoney(enemy.reward)
    }
  }
}

/** 敌人移动 */
function moveEnemy(enemy: EnemyStateType) {
  if(enemy.isDead) return
  const { curSpeed, speed, endDistance, isForward, movePathIndex, isFlip, id, w, h } = enemy
  let newEndDistance = endDistance
  const total = baseDataState.mapItem.start[movePathIndex].num
  // 敌人到达终点
  if(!setting.isTowerCover) {
    if(endDistance < 0) {
      removeEnemy([id])
      onReduceHp(1)
      return true
    }
  } else { // 塔防展示组件才需要
    if(newEndDistance < 0) {
      newEndDistance = total - 1
    }
  }
  // 将格子坐标同步到敌人的坐标
  const { x, y, x_y } = enemyState.movePath[movePathIndex][total - newEndDistance]
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
  enemy.gridDistance += curSpeed
  const { x: eX, y: eY } = enemy
  const _x = x - w / 4, _y = y - h / 2
  // 敌人到达下一个格子
  if((_x - speed <= eX && eX <= _x + speed) && (_y - speed <= eY && eY <= _y + speed)) {
    enemy.gridDistance = 0;
    if(!setting.isTowerCover) {
      enemy.endDistance--
    } else {
      if(newEndDistance === endDistance) {
        enemy.endDistance--
      } else {
        enemy.endDistance = total - 1
        enemy.x -= curSpeed
      }
    }
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
    if(enemyMap.get(e_id)?.audioKey) {
      onWorkerPostFn('removeAudio', e_id)
    }
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
  const imgItem = sourceInstance.state.enemyImgSource[name]
  let imgList = imgItem.imgList
  let img = imgType === 'gif' ? imgList![imgIndex].img : imgItem.img!
  let isChangeFrames = false;
  // 敌人的技能图或死亡图替代默认图
  if(enemy.skill?.animation && imgItem.skill) {
    const {cur, sum} = enemy.skill.animation
    if(cur !== sum) {
      if(!cur) {
        enemy.imgIndex = 0
        enemy.framesNum = 0
      }
      isChangeFrames = true
      if(enemy.isDead) {
        if(imgItem.die) {
          img = imgItem.die.list[enemy.imgIndex].img
          imgList = imgItem.die!.list
        }
      } else {
        img = imgItem.skill.list[enemy.imgIndex].img
        imgList = imgItem.skill.list
      }
    }
  }
  ctx.save() // 保存画布
  if(enemy.isDead) { // 死亡放大爆炸
    if(enemy.skill?.r) {
      const scale = enemy.skill.r
      ctx.translate((x + w / 2) * (1 - scale), (y + h / 2) * (1 - scale))
      ctx.scale(scale, scale)
    }
  } else {
    // 翻转图片
    if(!isForward) { 
      ctx.translate(w + x * 2, 0)
      ctx.scale(-1, 1); // 翻转画布
    }
  }
  // 处理需要绘画的敌人图片
  ctx.drawImage(img, x, y, w, h) 
  ctx.restore() // 还原画布
  // 控制图片的索引
  if(imgType === 'gif') {
    let delay = imgList![enemy.imgIndex].delay
    if(curSpeed !== speed) {
      delay *= 2 - curSpeed / speed
    }
    // 控制每一帧图片的切换时机
    if(curSpeed || isChangeFrames) {
      if(enemy.framesNum >= delay) {
        enemy.imgIndex++;
        enemy.framesNum = 0;
      } else {
        enemy.framesNum++;
      }
    }
    // 使图片索引回到第一帧
    if(enemy.imgIndex === imgList!.length) {
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
  const { x, y, w, h, poison } = enemy
  if(!poison) return
  const ctx = gameConfigState.ctx
  const othOnloadImg = sourceInstance.state.othOnloadImg
  ctx.save()
  ctx.globalAlpha = 0.9
  const hpSize = h / 10
  if(poison.level === 5) {
    ctx.drawImage(othOnloadImg.poison!, x + w / 4, y - hpSize - w / 2, w / 2, w / 2)
  } else {
    let arr = [3 * w / 8, w / 4, w / 8, 0]
    let poisonX = x + arr[poison.level - 1]
    for(let i = 0; i < poison.level; i++) {
      ctx.drawImage(othOnloadImg.poison!, poisonX, y - hpSize - w / 4, w / 4, w / 4)
      poisonX += w / 4
    }
  }
  ctx.restore()
}

/** 绘画生命值 */
function drawEnemyHp(enemy: EnemyStateType) {
  const { x, y, w, h, hp } = enemy
  const ctx = gameConfigState.ctx
  const h_2 = h / 10 
  const w_2 = w - h_2
  // 每一条血条的生命值
  const oneHp = hp.sum / hp.level!
  const colorI = Math.ceil(hp.cur / oneHp)
  // 血条背景色
  ctx.fillStyle = enemyHpColors[colorI - 1]
  ctx.fillRect(x, y - h_2, w_2, h_2)
  // 血条颜色
  ctx.fillStyle = enemyHpColors[colorI]
  ctx.fillRect(x, y - h_2, w_2 * (hp.cur - (colorI - 1) * oneHp) / oneHp, h_2)
  // 画边框
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#cff1d3"; //边框颜色
  ctx.rect(x, y - h_2, w_2, h_2);  //透明无填充
  ctx.stroke();
}

/** 绘画敌人的等级 */
function drawEnemyLevel(enemy: EnemyStateType) {
  const { x, y, h, hp } = enemy
  const ctx = gameConfigState.ctx
  const othOnloadImg = sourceInstance.state.othOnloadImg
  const levelSize = h / 10
  if(hp.level! < 10) {
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
    ctx.drawImage(othOnloadImg.sun!, x - levelSize * 2, y - levelSize * 3 / 2, levelSize * 2, levelSize * 2)
  }
}

export {
  enemyMap,
  enemyState,
  watchEnemyList,
  drawEnemyMap,
  makeEnemy,
  damageTheEnemy,
  slowEnemy,
  removeEnemy,
}
