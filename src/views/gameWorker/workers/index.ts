import mapData, { GridInfo, mapGridInfoList } from "@/dataSource/mapData";
import { limitRange, powAndSqrt, randomNumList, waitTime } from "@/utils/tools";
import { computed } from "vue";
import sourceInstance from '@/stores/sourceInstance'
import { BulletType, EnemyStateType, GameConfigType, SpecialBulletItem, TargetInfo, TowerStateType } from "@/type/game";

import { TargetCircleInfo, baseDataState, checkValInCircle, gamePause, initAllGrid } from "./tools/baseData";
import { enemyList, enemyState, slowEnemy } from './tools/enemy'
import { towerList, towerState, handlerTower, hiddenTowerOperation } from './tools/tower'
import { specialBullets } from './tools/specialBullets'
import keepInterval, { KeepIntervalKey } from "@/utils/keepInterval";
import { EnemyType } from "@/dataSource/enemyData";
import _ from "lodash";
import { randomStr } from "@/utils/random";
import { getAngle } from "@/utils/handleCircle";
import towerArr, { TowerName, TowerType } from "@/dataSource/towerData";
import levelData from "@/dataSource/levelData";

const source = sourceInstance.state
const screenInfo = {
  width: 0,
  height: 0,
}
const canvasInfo = {
  offscreen: void 0 as unknown as OffscreenCanvas,
  width: 0,
  height: 0,
}

const gameConfigState: GameConfigType = {
  // canvas 默认大小
  defaultCanvas: {w: 1050, h: 600},
  /** 一格的大小 */
  size: 50,
  // canvas 对象
  canvas: {},
  // requestAnimationFrame api的保存对象
  animationFrame: 0,
  // 得到 canvas 的 2d 上下文
  ctx: null as unknown as CanvasRenderingContext2D,
  // 是否加载完成
  loadingDone: false,
  isGameBeginMask: true,
}

addEventListener('message', e => {
  const { data } = e;
  // 初始化
  if(data.init) {
    const offscreen = data.canvasInfo.offscreen;
    canvasInfo.offscreen = offscreen
    gameConfigState.ctx = (offscreen.getContext('2d') as CanvasRenderingContext2D);
    screenInfo.width = data.screenInfo.width
    screenInfo.height = data.screenInfo.height
    init()
  } else {
    if(data.isPause === void 0) return
    if(!data.isPause) {
      makeEnemy()
      startAnimation();
      // startMoneyTimer()
    } else {
      cancelAnimationFrame(gameConfigState.animationFrame)
    }
  }
})

/** 是否是无限火力模式 */
const isInfinite = () => source.mapLevel === mapData.length - 1

async function init() {
  await sourceInstance.loadingAllImg()
  initZoomData()
  if(isInfinite()) {
    baseDataState.money = 999999
  }
  const item = JSON.parse(JSON.stringify(mapGridInfoList[source.mapLevel]))
  item.x *= gameConfigState.size
  item.y *= gameConfigState.size
  baseDataState.mapGridInfoItem = item
  baseDataState.floorTile.num = baseDataState.mapGridInfoItem.num
  initAllGrid()
  initMovePath()
  onLevelChange()
  source.isGameInit = true
  waitTime(800).then(() => {
    gameConfigState.loadingDone = true
    startDraw()
    // testBuildTowers()
  })
}

/** 开启动画绘画 */
function startAnimation() {
  const fpx = 60;
  let fpsInterval = 1000 / fpx;
  let then = Date.now();
  (function go() {
    gameConfigState.animationFrame = requestAnimationFrame(go);
    const now = Date.now();
    const elapsed = now - then;
    if (elapsed > fpsInterval) {
      startDraw();
      then = now - (elapsed % fpsInterval);
    }
  })();
}

/** 开始绘画 */
function startDraw() {
  gameConfigState.ctx.clearRect(0, 0, canvasInfo.offscreen.width, canvasInfo.offscreen.height);
  drawFloorTile()
  drawTower()
  // 循环静态图片数组画敌人形成gif效果
  for(let index = 0; index < enemyList.length; index++) {
    const item = enemyList[index]
    const res = moveEnemy(index)
    // 当敌人已经到达终点，后面就不执行了
    if(res) break
    drawEnemy(index)
    if(item.imgIndex === item.imgList.length - 1) enemyList[index].imgIndex = 0
    else enemyList[index].imgIndex++
  }
  checkEnemyAndTower()
  handleBulletMove()
  drawSpecialBullets()
}

function onLevelChange() {
  const val = baseDataState.level
  setTimeout(() => {
    enemyState.createdEnemyNum = 0
    // 处理地图关卡中的敌人数据
    let enemyDataArr: Array<number[]> | undefined
    for(let i = 0; i < source.mapLevel; i++) { 
      if(levelData[source.mapLevel]?.enemyArr) {
        enemyDataArr = levelData[source.mapLevel].enemyArr
        break
      }
    }
    if(!enemyDataArr) {
      enemyDataArr = levelData[0].enemyArr
    }
    // 获取地图关卡中的敌人数据
    if(val < enemyDataArr.length && !isInfinite()) {
      enemyState.levelEnemy = enemyDataArr[val]
    } else {
      const levelNum = val + (isInfinite() ? 5 : 0)
      enemyState.levelEnemy = randomNumList(levelNum)
    }
    if(val) {
      // if((val / 10) % 1 === 0) {
      //   playAudio('ma-pvz', 'End')
      // }
      // baseDataState.money += (val + 1) * Math.round(gameSkillState.proMoney.money / 2)
      makeEnemy()
      // audioLevelRef.value?.play()
    }
  }, 500);
}

/** 处理敌人的移动，进入塔防的范围 */
function checkEnemyAndTower() {
  if(!enemyList.length) return
  for(let t_i in towerList) {
    const t = towerList[t_i]
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
          shootBullet(eIdList, +t_i)
          keepInterval.set(`${KeepIntervalKey.towerShoot}-${t.id}`, () => {
            t.isToTimeShoot = true
          }, t.rate, true)
        } else {
          if(t.targetIdList.length) {
            t.targetIdList = []
          }
        }
      }
    }
  }
  for(const bItem of specialBullets.twitch) {
    // r = w / 2 除2.5是为了让敌人和子弹的接触范围缩小
    const eIdList = enterAttackScopeList({x: bItem.x, y: bItem.y, r: bItem.w / 2.5, size: bItem.w})
    if(eIdList?.length) {
      triggerPoisonFun(eIdList)
    }
  }
}

/** 发射子弹  enemy:敌人id数组，t_i:塔索引 */
function shootBullet(eIdList: string[], t_i: number) {
  const t = towerList[t_i]
  for(const e_id of eIdList) {
    const enemy = enemyList.find(e => e.id === e_id)
    if(!enemy) break
    const size_2 = gameConfigState.size / 2
    const {x, y, w, h} = enemy
    // 敌人中心坐标
    const _x = x + w / 2, _y = y + h / 2
    const {x: t_x, y: t_y, speed, name, id, isThrough, bulletInitDeg } = towerList[t_i]
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
function handleBulletMove() {
  const e_idList: string[] = []
  for(let t_i = 0; t_i < towerList.length; t_i++) {
    const t = towerList[t_i]
    for(let b_i = t.bulletArr.length - 1; b_i >= 0; b_i--) {
      const {w, h} = t.bSize
      // 当前塔防的当前子弹
      const bItem = t.bulletArr[b_i]
      let {x, y, addX, addY, e_id} = bItem
      // 重新计算子弹离敌人的距离
      const b_e_distance = bulletEnemyDistance(e_id, +t_i, bItem.x, bItem.y)
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
      if(t.name === 'delaiwen' && bItem.isRecycling && checkBulletInEnemyOrTower({x,y,w,h}, towerList[t_i].id, true)) {
        t.bulletArr.splice(b_i, 1)
      }
    }
    if(t.isBulleting) { // 有需要额外的子弹才绘画
      drawTowerBullet(t_i)
    }
    if(t.name === 'huonan') { // 处理火男子弹
      handleFireBullet(t)
    }
  }
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
  const enemy = enemyList.find(e => e.id === e_id)
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
    baseDataState.money += reward
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
/** 伤害敌人 */
function damageTheEnemy(enemy: EnemyStateType, damage: number) {
  enemy.hp.cur = Math.max(enemy.hp.cur - damage, 0)
  if(enemy.hp.cur <= 0) {
    removeEnemy([enemy.id])
    baseDataState.money += enemy.reward
  }
}
/** 画塔防的特殊子弹 */
function drawTowerBullet(t_i: number) {
  const t = towerList[t_i]
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
  const enemy = enemyList.find(e => e.id === t.targetIdList[0])
  if(!enemy) return
  damageTheEnemy(enemy, t.damage)
  if(t.damage < t.preDamage! * 3) {
    t.thickness! = Math.min(t.thickness! + 0.025, gameConfigState.size / 3)
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
  const ctx = gameConfigState.ctx!
  const _x = x + size / 2, _y = y + size / 2, _ex = ex + w / 2, _ey = ey + h / 2
  const deg = getAngle({x: _x, y: _y}, {x: _ex, y: _ey})
  // 敌人和塔防间的距离
  const xy = powAndSqrt(_ex - _x, _ey - _y)
  ctx.save()
  ctx.translate(_x, _y)
  ctx.rotate(deg * Math.PI / 180)
  ctx.translate(-_x, -_y)
  const newY = _y - (thickness - t.bSize.w) / 2
  // 设置渐变色
  if(ctx.createLinearGradient) {
    const linearGradient = ctx.createLinearGradient(_x, newY, _x, newY + thickness)
    linearGradient.addColorStop(0, '#de5332');
    linearGradient.addColorStop(0.4, '#f3c105');
    linearGradient.addColorStop(0.5, '#ffc800');
    linearGradient.addColorStop(0.6, '#f3c105');
    linearGradient.addColorStop(1, '#de5332'); 
    ctx.strokeStyle = linearGradient
    ctx.fillStyle = linearGradient
  } else {
    ctx.strokeStyle = '#de5332'
    ctx.fillStyle = '#f3c105'
  }
  ctx.beginPath()
  if((ctx as any).roundRect) {
    (ctx as any).roundRect(_x, newY, xy, thickness, size / 2)
  } else {
    ctx.moveTo(_x + thickness / 2, newY)
    ctx.arcTo(_x + xy, newY, _x + xy, newY + thickness, thickness / 2)
    ctx.arcTo(_x + xy, newY + thickness, _x, newY + thickness, thickness / 2)
    ctx.arcTo(_x, newY + thickness, _x, newY, thickness / 2)
    ctx.arcTo(_x, newY, _x + xy, newY, thickness / 2)
  }
  ctx.fill()
  ctx.stroke()
  ctx.restore()
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
  }, t.poison!.bulletTime, true)
}
/** 画特殊子弹 */
function drawSpecialBullets() {
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
function triggerPoisonFun(eIdList: string[]) {
  const t = towerArr['twitch']
  for(const e_id of eIdList) {
    const enemy = enemyList.find(e => e.id === e_id) 
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
        }, 1000, true)
      }
    }
  }
}
/** 开启中毒计时器 */
function startPoisonInterval(e_id: string, t: TowerType) {
  const enemy = enemyList.find(e => e.id === e_id)
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
    }, t.poison!.time, true)
  }
}

/** 
 * 计算子弹和敌人的距离
 * 返回 x,y方向需要增加的值, distance: 子弹和敌人的距离, x_y: 塔和敌人的距离
 */
function bulletEnemyDistance(
  e_id: string, t_i: number, bx: number, by: number
) {
  // 敌人已经死了 | 能穿透的子弹 | 老鼠 ,不用覆盖之前的值了 
  if(towerList[t_i].isThrough || towerList[t_i].name === 'twitch') return
  const enemy = enemyList.find(e => e.id === e_id)
  if(!enemy) return
  const size_2 = gameConfigState.size / 2
  const {x, y, w, h} = enemy
  // 敌人中心坐标
  const _x = x + w / 2, _y = y + h / 2
  const { speed,  x: tx, y: ty } = towerList[t_i]
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
  for(const eItem of enemyList) {
    if(!attactIdSet.has(eItem.id) && checkBulletInEnemyOrTower({x,y,w,h}, eItem.id)) {
      return eItem.id
    }
  }
  return false
}

/** 画地板 */
function drawFloorTile() {
  const size = gameConfigState.size
  for(let f of enemyState.movePath) {
    gameConfigState.ctx.drawImage(source.othOnloadImg.floor!, f.x, f.y, size, size)
  }
}

function allEnemyIn() {
  return enemyState.createdEnemyNum === enemyState.levelEnemy.length
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
    }
  }, baseDataState.intervalTime)
}

function drawEnemy(index: number) {
  if(!enemyList[index]) return
  const { x, y, w, h, imgList, imgIndex, hp, curSpeed, isForward, speed, poison, slowType } = enemyList[index]
  const ctx = gameConfigState.ctx
  ctx.save() // 保存画布
  // 翻转图片
  if(!isForward) { 
    ctx.translate(w + x * 2, 0)
    ctx.scale(-1, 1); // 翻转画布
  }
  ctx.drawImage(imgList[imgIndex], x, y, w, h) 
  ctx.restore() // 还原画布
  // 绘画减速效果
  if(curSpeed !== speed) {
    if(slowType === 'twitch') {
      ctx.save()
      ctx.globalAlpha = 0.5
      ctx.drawImage(source.othOnloadImg.snowPoison!, x + w / 4, y + h / 3, w / 2, w / 2)
      ctx.restore()
    } else {
      if(curSpeed === 0) {
        ctx.save()
        ctx.globalAlpha = 0.9
        ctx.drawImage(source.othOnloadImg.snowVertigo!, x + w / 4, y + h / 3, w / 2, w / 2)
        ctx.restore()
      } else {
        ctx.save()
        ctx.globalAlpha = 0.9
        ctx.drawImage(source.othOnloadImg.snow!, x + w / 4, y + h / 3, w / 2, w / 2)
        ctx.restore()
      }
    }
  }
  // 画中毒效果
  if(poison) {
    ctx.save()
    ctx.globalAlpha = 0.9
    if(poison.level === 5) {
      ctx.drawImage(source.othOnloadImg.poison!, x + w / 4, y - hp.size - w / 2, w / 2, w / 2)
    } else {
      let arr = [3 * w / 8, w / 4, w / 8, 0]
      let poisonX = x + arr[poison.level - 1]
      for(let i = 0; i < poison.level; i++) {
        ctx.drawImage(source.othOnloadImg.poison!, poisonX, y - hp.size - w / 4, w / 4, w / 4)
        poisonX += w / 4
      }
    }
    ctx.restore()
  }
  if(hp.cur === hp.sum) return
  // 绘画生命值
  const w_2 = w - hp.size
  ctx.fillStyle = '#0066a1'
  ctx.fillRect(x, y - hp.size, w_2, hp.size)
  ctx.fillStyle = '#49ca00'
  ctx.fillRect(x, y - hp.size,  w_2 * hp.cur / hp.sum, hp.size)
  // 画边框
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#cff1d3"; //边框颜色
  ctx.rect(x, y - hp.size, w_2, hp.size);  //透明无填充
  ctx.stroke();
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
  // 设置敌人的初始位置
  const id = item.audioKey + randomStr('enemy')
  const enemyItem: EnemyStateType = {...item, id}
  const {audioKey, name, w, h} = enemyItem
  const {x, y} = baseDataState.mapGridInfoItem
  enemyItem.x = x - w / 4
  enemyItem.y = y - h / 2
  enemyList.push(enemyItem)
  enemyState.createdEnemyNum++
  handleEnemySkill(name, enemyItem.id)
  // createAudio(audioKey, String(id))
}

/** 设置敌人技能 */
function setEnemySkill(enemyName: string, e_id: string) {
  const e_i = enemyList.findIndex(e => e.id === e_id)
  if(!enemyList[e_i] || !enemyList[e_i].skill) return
  const {curFloorI: _curFloorI, id, hp} = enemyList[e_i]
  let volume = 1
  // 舞王僵尸技能
  if(enemyName === '舞王') {
    const total = baseDataState.floorTile.num - 1
    for(let i = 0; i < 4; i++) {
      const newEnemy = _.cloneDeep(source.enemySource[12])
      switch (i) {
        case 0: newEnemy.curFloorI = limitRange(_curFloorI - 2, 1, total); break;
        case 1: newEnemy.curFloorI = limitRange(_curFloorI - 1, 1, total); break;
        case 2: newEnemy.curFloorI = limitRange(_curFloorI + 1, 1, total); break;
        case 3: newEnemy.curFloorI = limitRange(_curFloorI + 2, 1, total); break;
      }
      enemyList.push(callEnemy(newEnemy, i))
    }
  } else if(enemyName === '弗利萨') {
    const total = baseDataState.floorTile.num - 1
    for(let i = 0; i < 2; i++) {
      const newEnemy = _.cloneDeep(source.enemySource[13])
      switch (i) {
        case 0: newEnemy.curFloorI = limitRange(_curFloorI - 2, 1, total); break;
        case 1: newEnemy.curFloorI = limitRange(_curFloorI - 1, 1, total); break;
      }
      enemyList.push(callEnemy(newEnemy, i))
      volume = 0.7
    }
  } else if(enemyName === '坤坤') {
    const newHp = hp.cur + 200
    enemyList[e_i].hp.cur = limitRange(newHp, newHp, hp.sum)
    volume = 0.5
  }
  // playDomAudio({id, volume})
}

/** 处理敌人技能 */
function handleEnemySkill(enemyName: string, e_id: string) {
  const e_i = enemyList.findIndex(e => e.id === e_id)
  if(!enemyList[e_i].skill) return
  // 有技能的敌人
  const {time} = enemyList[e_i].skill!
  keepInterval.set(e_id, () => {
    setEnemySkill(enemyName, e_id)
  }, time)
}

/** 召唤敌人的处理 */
function callEnemy(newEnemy: EnemyType, i: number) {
  const { curFloorI, audioKey } = newEnemy
  const { x, y } = enemyState.movePath[curFloorI - 1]
  const id = randomStr(`callenemy-${i}`)
  const size = gameConfigState.size
  newEnemy.w *= size
  newEnemy.h *= size
  newEnemy.curSpeed *= size
  newEnemy.speed *= size
  newEnemy.hp.size *= size
  return {
    ...newEnemy,
    id: audioKey + id,
    x: x - newEnemy.w / 4,
    y: y - newEnemy.h / 2
  } as EnemyStateType
}

/** 消灭敌人 */
function removeEnemy(e_idList: string[]) {
  if(!e_idList.length) return
  const eiList = Array.from(e_idList.reduce((pre, id) => {
    const e_i = enemyList.findIndex(e => e.id === id)
    if(e_i !== -1) pre.add(e_i)
    return pre
  }, new Set() as Set<number>))
  eiList.sort((a, b) => b - a)
  // 这里会有执行时机的问题
  try {
    for(const e_i of eiList) {
      const e_id = enemyList[e_i].id
      keepInterval.delete(`${KeepIntervalKey.slow}-${e_id}`) // 清除减速持续时间定时器
      keepInterval.delete(`${KeepIntervalKey.twitch}-${e_id}`) // 清除中毒持续时间定时器
      keepInterval.delete(`${KeepIntervalKey.twitchDelete}-${e_id}`)
      keepInterval.delete(`${KeepIntervalKey.poisonFun}-${e_id}`)
      if(enemyList[e_i].skill) {
        keepInterval.delete(e_id)
      }
      // 清除穿透子弹攻击过的目标id
      for(const t of towerList) {
        if(t.isThrough) {
          for(const b of t.bulletArr) {
            b.attactIdSet?.delete(e_id) 
          }
        }
      }
      // removeAudio(e_id)
      enemyList.splice(e_i, 1)
    }
  } catch (error) {
    console.log('error: ', error);
  }
}

/** 敌人移动 */
function moveEnemy(index: number) {
  const { curSpeed, speed, curFloorI, isForward, isFlip, id, w, h } = enemyList[index]
  // 敌人到达终点
  if(curFloorI === baseDataState.floorTile.num - 1) {
    removeEnemy([id])
    baseDataState.hp -= 1
    // playAudio('ma-nansou', 'End')
    return true
  }
  // 将格子坐标同步到敌人的坐标
  const { x, y, x_y } = enemyState.movePath[curFloorI]
  const _x = x - w / 4, _y = y - h / 2
  switch (x_y) {
    case 1: {
      enemyList[index].x -= curSpeed;
      if(isForward === isFlip) {
        enemyList[index].isForward = !isForward
      }
      break;
    }
    case 2: enemyList[index].y -= curSpeed; break;
    case 3: {
      enemyList[index].x += curSpeed;
      if(!isForward === isFlip) {
        enemyList[index].isForward = !isForward
      }
      break;
    } 
    case 4: enemyList[index].y += curSpeed; break;
  }
  const { x: eX, y: eY } = enemyList[index]
  // 敌人到达下一个格子
  if((eX >= _x && eX <= _x + speed) && (eY >= _y && eY <= _y + speed)) {
    enemyList[index].curFloorI++
  }
}

/** 画塔防 */
function drawTower(item?: TowerStateType) {
  const size = gameConfigState.size
  if(item) {
    gameConfigState.ctx.drawImage(item.onloadImg, item.x, item.y, size, size)
  } else {
    for(const t of towerList) {
      gameConfigState.ctx.drawImage(t.onloadImg, t.x, t.y, size, size)
    }
  }
}

/** 初始化行动轨迹 */
function initMovePath() {
  const size = gameConfigState.size
  // 刚开始就右移了，所以该初始格不会算上去
  const movePathItem: GridInfo & {num?: number} = JSON.parse(JSON.stringify(baseDataState.mapGridInfoItem))
  const length = movePathItem.num!
  delete movePathItem.num
  const movePath: GridInfo[] = []
  // 控制x y轴的方向 1:左 2:下 3:右 4:上
  let x_y = movePathItem.x_y
  for(let i = 0; i < length; i++) {
    const newXY = mapData[source.mapLevel][i]
    if(newXY) {
      x_y = newXY
    }
    if(x_y % 2) movePathItem.x += x_y === 3 ? size : -size
    else movePathItem.y += x_y === 4 ? size : -size
    movePathItem.x_y = x_y
    movePath.push(JSON.parse(JSON.stringify(movePathItem)))
    baseDataState.gridInfo.arr[Math.floor(movePathItem.y / size)][Math.floor(movePathItem.x / size)] = 1
  }
  baseDataState.terminal = movePath[movePath.length - 1]
  enemyState.movePath = movePath
}

/** 判断穿透性子弹是否越界了 */
function checkThroughBullet(bItem: TargetInfo) {
  let {x, y, w, h} = bItem
  const {w: canvasW, h: canvasH} = gameConfigState.defaultCanvas
  x = x - w / 2, y = y - h / 2
  return x + w < 0 || y + h < 0 || x > canvasW || y > canvasH
}
/** 判断敌人中心是否在子弹中 即击中敌人 */
function checkBulletInEnemyOrTower({x, y, w, h}: TargetInfo, id: string, isTower?: boolean) {
  const target = !isTower ? enemyList.find(e => e.id === id) : towerList.find(t => t.id === id)
  if(!target) return
  const size = gameConfigState.size
  const {x:ex, y:ey, w:ew = size, h:eh = size} = target as TargetInfo
  const checkIn = (v: number, scope: number, t: number) => (t > v - scope / 2) && (t < v + scope / 2)
  // 子弹中心(当前的xy在绘画时已经是偏移过了) 和 敌人中心 
  return checkIn(x, w, ex + ew / 2) && checkIn(y, h, ey + eh / 2)
}   

/** 返回进入攻击范围的值的数组 */
function enterAttackScopeList(target: TargetCircleInfo) {
  const arr = enemyList.reduce((pre, enemy) => {
    if(checkValInCircle(enemy, target)) {
      pre.push({curFloorI: enemy.curFloorI, id: enemy.id})
    }
    return pre
  }, [] as {curFloorI: number, id: string}[])
  if(!arr.length) return
  arr.sort((a, b) => b.curFloorI - a.curFloorI)
  if(target.targetNum) {
    return arr.splice(0, target.targetNum).map(item => item.id)
  }
  return arr.map(item => item.id)
}

/** 按比例缩放数据 */
function initZoomData() {
  let p = source.ratio
  const {w, h} = gameConfigState.defaultCanvas
  if(source.isMobile) {
    const wp = screenInfo.width / (h + 150)
    const hp = screenInfo.height / (w + 100)
    p *= Math.floor(Math.min(wp, hp) * 100) / 100
  }
  gameConfigState.size = Math.floor(gameConfigState.size * p)
  gameConfigState.defaultCanvas.w = Math.floor(w * p)
  gameConfigState.defaultCanvas.h = Math.floor(h * p)
}

export default {}
