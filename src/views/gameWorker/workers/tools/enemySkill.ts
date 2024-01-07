import _ from "lodash"
import { enemyMap, enemyState, removeEnemy, slowEnemy } from "./enemy";
import { damageTower, towerMap } from "./tower"
import { baseDataState, canvasInfo, checkValInCircle, gameConfigState, onWorkerPostFn, source } from "./baseData"
import { getEndXy, isLineInRect } from "./compute"
import keepInterval, { KeepIntervalKey } from "@/utils/keepInterval";
import { limitRange, powAndSqrt } from "@/utils/tools"
import { getPointsCos } from "@/utils/handleCircle"
import { EnemyStateType } from "@/type";
import sourceInstance from "@/stores/sourceInstance";
import { randomStr } from "@/utils/random";
import { drawLinearGradientRoundRect } from "./canvas";

/** 时刻监听敌人的技能 */
export function watchEnemySkill() {
  enemyMap.forEach(enemy => {
    checkTriggerEnemySkill(enemy)
    const animation = enemy.skill?.animation
    if(enemy.name === 'godzilla') {
      if(animation && animation.cur < animation.sum) {
        enemyGodzillaRemoveTower(enemy)
      }
    } else if(enemy.name === 'ice-car') {
      if(animation && animation.cur < animation.sum) {
        enemyIceCarPlayingSkill(enemy)
      }
    }
  })
}

/** 检查是否触发技能 */
function checkTriggerEnemySkill(enemy: EnemyStateType) {
  if(enemy.skill?.isTriggle) return
  switch (enemy.name) {
    case 'zombie-boom': {
      if(enemy.hp.cur < enemy.hp.sum / 2) { // 开启爆炸倒计时
        onWorkerPostFn('playDomAudio', {id: enemy.id, audioKey: enemy.skill!.audioKeys![0]})
        setEnemySkill(enemy, enemySkillBoom)
      }
      break;
    }
  };
}

/** 处理敌人技能 */
export function handleEnemySkill(enemyName: string, e_id: string) {
  const enemy = enemyMap.get(e_id)!
  if(!enemy.skill) return
  let skillFn: ((enemy: EnemyStateType) => void) | undefined
  switch (enemyName) {
    case 'zombie-dance': skillFn = enemySkillDance; break;
    case 'fulisha': skillFn = enemySkillFulisha; break;
    case 'kunkun': skillFn = enemySkillKunkun; break;
    case 'rabbish-2': skillFn = enemySkillRabbish2; break;
    case 'godzilla': skillFn = enemySkillGodzilla; break;
    case 'ice-car': skillFn = enemySkillIceCar; break;
  };
  setEnemySkill(enemy, skillFn)
}

/** 设置技能 */
function setEnemySkill(enemy: EnemyStateType, skillFn?: ((enemy: EnemyStateType) => void)) {
  if(!skillFn) return
  enemy.skill!.isTriggle = true
  keepInterval.set(enemy.id, () => {
    const _enemy = enemyMap.get(enemy.id)
    if(_enemy) {
      _enemy.skill!.count!++
      skillFn!(_enemy)
    }
  }, enemy.skill!.time)
}

/** 舞王技能 */
function enemySkillDance(enemy: EnemyStateType) {
  const {id, endDistance, movePathIndex} = enemy
  const total = baseDataState.mapItem.start[movePathIndex].num - 1
  for(let i = 0; i < 4; i++) {
    const newEnemy = _.cloneDeep(source.enemySource!["dance-little"])
    newEnemy.movePathIndex = enemy.movePathIndex
    newEnemy.level = enemy.level
    switch (i) {
      case 0: newEnemy.endDistance = limitRange(endDistance - 2, 1, total); break;
      case 1: newEnemy.endDistance = limitRange(endDistance - 1, 1, total); break;
      case 2: newEnemy.endDistance = limitRange(endDistance + 1, 1, total); break;
      case 3: newEnemy.endDistance = limitRange(endDistance + 2, 1, total); break;
    }
    const callEnemyItem = callEnemy(newEnemy, i)
    enemyMap.set(callEnemyItem.id, callEnemyItem)
  }
  onWorkerPostFn('playDomAudio', {id, volume: 0.6})
}

/** 弗利萨技能 */
function enemySkillFulisha(enemy: EnemyStateType) {
  const {id, endDistance, movePathIndex} = enemy
  const total = baseDataState.mapItem.start[movePathIndex].num - 1
  for(let i = 0; i < 2; i++) {
    const newEnemy = _.cloneDeep(source.enemySource!['zombie-little'])
    newEnemy.movePathIndex = enemy.movePathIndex
    newEnemy.level = enemy.level
    switch (i) {
      case 0: newEnemy.endDistance = limitRange(endDistance + 2, 1, total); break;
      case 1: newEnemy.endDistance = limitRange(endDistance + 1, 1, total); break;
    }
    const callEnemyItem = callEnemy(newEnemy, i)
    enemyMap.set(callEnemyItem.id, callEnemyItem)
  }
  onWorkerPostFn('playDomAudio', {id, volume: 0.6})
}

/** 坤坤技能 */
function enemySkillKunkun(enemy: EnemyStateType) {
  const {id, hp} = enemy
  const newHp = hp.cur + 200
  enemy.hp.cur = limitRange(newHp, newHp, hp.sum)
  onWorkerPostFn('playDomAudio', {id})
}

/** 2号兔子技能 */
function enemySkillRabbish2(enemy: EnemyStateType) {
  // 兔子和隔壁一格内的怪全部回10%的血
  enemyMap.forEach(e => {
    if(Math.abs(enemy.endDistance - e.endDistance) <= 1) {
      e.hp.cur = Math.min(e.hp.cur + e.hp.sum * 0.1, e.hp.sum) 
    }
  })
  enemy.skill!.animation!.cur = 0
}

/** 哥斯拉技能 */
function enemySkillGodzilla(enemy: EnemyStateType) {
  if(!towerMap.size) return
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
  onWorkerPostFn('playDomAudio', {id: enemy.id})
}

/** 哥斯拉释放技能中，清除塔防 */
function enemyGodzillaRemoveTower(enemy: EnemyStateType) {
  towerMap.forEach(t => {
    if(enemy.skill!.towerIds?.includes(t.id)) {
      const {cur, sum} = enemy.skill!.animation!
      // 每隔 Math.floor(sum(60 - 1) / damage(4)) = 14 掉一次血，减一是防止最后一次不触发
      if(cur > 0 && !(cur % Math.floor((sum - 1) / enemy.skill!.damage!))) {
        damageTower(t)
      }
    }
  })
}

/** 冰车技能 */
function enemySkillIceCar(enemy: EnemyStateType) {
  enemy.skill!.animation!.cur = 0
  slowEnemy(enemy.id, {num: 0, time: 1000, type: 'stop'})
  onWorkerPostFn('playDomAudio', {id: enemy.id})
}

/** 冰车释放技能中 */
function enemyIceCarPlayingSkill(enemy: EnemyStateType) {
  const size = gameConfigState.size
  towerMap.forEach(t => {
    const id = `${KeepIntervalKey.frozenTower}-${t.id}-${enemy.id}`
    if(t.enemySkill?.frozen?.ids.includes(id)) return // 已经被当前敌人冰冻过了
    const r = enemy.skill!.r! * size * (enemy.skill!.animation!.cur / enemy.skill!.animation!.sum)
    if(checkValInCircle(
      {x: t.x, y: t.y, w: size, h: size}, 
      {x: enemy.x, y: enemy.y, r: r}
    )) {
      if(!t.enemySkill?.frozen) {
        t.enemySkill!.frozen = {ids: [id]}
      } else {
        t.enemySkill!.frozen.ids.push(id)
      }
      keepInterval.set(id, () => {
        if(t.enemySkill?.frozen) {
          t.enemySkill.frozen = void 0
        }
      }, enemy.skill!.keepTime!, {isTimeOut: true})
      damageTower(t)
    }
  })
}

/** 炸弹僵尸释放技能 */
export function enemyBoomPlayingSkill(enemy: EnemyStateType) {
  const size = gameConfigState.size
  towerMap.forEach(t => {
    const r = enemy.skill!.r! * size
    if(checkValInCircle(
      {x: t.x, y: t.y, w: size, h: size}, 
      {x: enemy.x, y: enemy.y, r: r}
    )) {
      damageTower(t, enemy.skill!.damage)
    }
  })
}

/** 炸弹小丑僵尸 1秒钟的 尖叫盒子弹出 */
function enemySkillBoom(enemy: EnemyStateType) {
  enemy.skill!.animation!.cur = 0
  const total = sourceInstance.state.enemyImgSource[enemy.name].skill!.total
  enemy.skill!.animation!.sum = total
  slowEnemy(enemy.id, {num: 0, time: total * 1000 / 60, type: 'stop'})
  onWorkerPostFn('playDomAudio', {id: enemy.id, audioKey: enemy.skill!.audioKeys![1]})
}

/** 召唤敌人的处理 */
function callEnemy(newEnemy: EnemyStateType, i: number) {
  const { endDistance, name, movePathIndex } = newEnemy
  const total = baseDataState.mapItem.start[movePathIndex].num
  const { x, y } = enemyState.movePath[movePathIndex][total - endDistance]
  const id = randomStr(`callenemy-${i}`)
  const size = gameConfigState.size
  newEnemy.w *= size
  newEnemy.h *= size
  newEnemy.curSpeed *= size
  newEnemy.speed *= size
  newEnemy.hp.cur = newEnemy.hp.sum
  newEnemy.hp.level = 1
  return {
    ...newEnemy,
    id: name + id,
    x: x - newEnemy.w / 4,
    y: y - newEnemy.h / 2,
    imgIndex: 0,
    framesNum: 0,
    gridDistance: 0,
    isDead: false,
  } as EnemyStateType
}

/** ----- 绘画技能 ----- */

/** 绘画敌人的技能的动画效果 */
export function drawEnemySkillAnimation(enemy: EnemyStateType) {
  if(!enemy.skill?.animation) return
  const { name, skill, x, y, w, h } = enemy
  const othOnloadImg = sourceInstance.state.othOnloadImg
  const {cur, sum} = skill.animation!
  switch(name) {
    case 'rabbish-2': { // 画兔子回血效果
      drawZoomEnemySkill(enemy, othOnloadImg.returnBlood!)
      break;
    }
    case 'godzilla': { // 画哥斯拉原子吐息
      if(cur === sum) return
      skill!.animation!.cur++
      const t = enemy.skill!.direction!
      const size = gameConfigState.size
      const thickness = ((cur + sum) / (sum * 2)) * size
      const ctx = gameConfigState.ctx
      drawLinearGradientRoundRect({
        ctx, thickness, thicknessPre: 0, globalAlpha: 0.9,
        x: x + w / 2, y: y + h / 2, tx: t.x, ty: t.y,
        linearGradient: [
          {value: 0, color: '#de5332'},
          {value: 0.4, color: '#f3c105'},
          {value: 0.5, color: '#ffc800'},
          {value: 0.6, color: '#f3c105'},
          {value: 1, color: '#de5332'},
        ]
      })
      break;
    }
    case 'ice-car': { // 绘画冰车的放大技能
      drawZoomEnemySkill(enemy, othOnloadImg.frozen!)
      break;
    }
    case 'zombie-boom': {
      if(skill.count) { 
        if(cur !== sum) { // 开始绘画效果
          skill!.animation!.cur++
        }
        if(cur === sum) {
          if(!enemy.isDead) { // 技能效果结束，绘画炸弹爆炸效果
            enemy.isDead = true
            skill!.animation!.cur = 0
            enemy.skill!.animation!.sum = sourceInstance.state.enemyImgSource[enemy.name].die!.total
            onWorkerPostFn('playDomAudio', {id: enemy.id, audioKey: enemy.skill!.audioKeys![2]})
            enemyBoomPlayingSkill(enemy)
          } else { // 炸弹效果已经绘画结束，清除数据
            removeEnemy([enemy.id])
          }
        }
      }
      break;
    }
  }
}

/** 绘画敌人的放大技能 */
function drawZoomEnemySkill(enemy: EnemyStateType, img: CanvasImageSource) {
  const { skill, x, y, w, h } = enemy
  const {cur, sum} = skill!.animation!
  if(cur === sum) return
  skill!.animation!.cur++
  const ctx = gameConfigState.ctx
  ctx.save()
  ctx.globalAlpha = Math.min(0.5, Math.min(cur, sum - cur) / sum)
  // 0.3 是为了让技能扩展得更大，让效果接触触发更合理
  const scale = skill!.r! * (cur / sum) + 0.3
  ctx.translate((x + w / 2) * (1 - scale), (y + h / 2) * (1 - scale))
  ctx.scale(scale, scale)
  ctx.drawImage(img, x, y, w, w)
  ctx.restore()
}
