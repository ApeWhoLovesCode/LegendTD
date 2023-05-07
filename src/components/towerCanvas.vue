<script setup lang='ts'>
import { ENEMY_MAX_LEVEL, enemyHpColors } from '@/dataSource/enemyData';
import { DirectionType, GridInfo } from '@/dataSource/mapData';
import towerArr, { TowerName, TowerSlow, TowerType } from '@/dataSource/towerData';
import useKeepInterval from '@/hooks/useKeepInterval';
import { useSettingStore } from '@/stores/setting';
import { useSourceStore } from '@/stores/source';
import { BulletType, EnemyStateType, TargetInfo, TowerStateType, SpecialBulletItem } from '@/type/game';
import { range } from '@/utils/format';
import { getAngle } from '@/utils/handleCircle';
import { KeepIntervalKey } from '@/utils/keepInterval';
import { randomStr } from '@/utils/random';
import { powAndSqrt } from '@/utils/tools';
import useBaseData, { TargetCircleInfo } from '@/views/game/tools/baseData';
import useEnemy from '@/views/game/tools/enemy';
import useSpecialBullets from '@/views/game/tools/specialBullets';
import useTower from '@/views/game/tools/tower';
import _ from 'lodash';
import { onMounted, onUnmounted, reactive, ref } from 'vue';

const { enemyList } = useEnemy()
const { towerList } = useTower()
const { checkValInCircle } = useBaseData()
const { specialBullets } = useSpecialBullets()

const keepInterval = useKeepInterval()
const setting = useSettingStore()

const props = withDefaults(defineProps<{
  tname: TowerName;
  enemyList?: {i: number, level?: number}[];
}>(), {
  enemyList: () => [{i: 1}]
})
const source = useSourceStore()
const idRef = ref(randomStr('com-cover-canvas'))
const canvasRef = ref<HTMLCanvasElement>()
const state = reactive({
  ctx: null as CanvasRenderingContext2D | null,
  canvasInfo: {w: 0, h: 0},
  /** 一格的大小 */
  size: 10,
  movePath: [] as GridInfo[],
  animationFrame: 0,
  mapGridInfoItem: {x: 1, y: 5, x_y: 3, num: 20},
})
const makeEnemyTimer = ref<NodeJS.Timer>()

onMounted(() => {
  setTimeout(() => {
    init()
  }, 10);
})

onUnmounted(() => {
  cancelAnimationFrame(state.animationFrame)
  clearInterval(makeEnemyTimer.value)
})

function init() {
  getCanvasWH()
  if(!canvasRef.value) return
  state.ctx = canvasRef.value.getContext("2d");
  drawInit()
}

function drawInit() {
  state.mapGridInfoItem.x *= state.size
  state.mapGridInfoItem.y *= state.size
  initMovePath()
  makeEnemy()
  buildTower()
  startAnimation()
}

/** 开启动画绘画 */
function startAnimation() {
  if(setting.isHighRefreshScreen) {
    startAnimationLockFrame()
  } else {
    (function go() {
      state.animationFrame = requestAnimationFrame(go);
      startDraw();
    })();
  }
}
/** 高刷屏锁帧，锁帧会使绘画出现掉帧 */
function startAnimationLockFrame() {
  const fpx = 60;
  let fpsInterval = 1000 / fpx;
  let then = Date.now();
  (function go() {
    state.animationFrame = requestAnimationFrame(go);
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
  state.ctx!.clearRect(0, 0, state.canvasInfo.w, state.canvasInfo.h);
  drawFloorTile()
  drawTower()
  // 循环静态图片数组画敌人形成gif效果
  for(let index = 0; index < enemyList.length; index++) {
    moveEnemy(index)
    drawEnemy(index)
  }
  checkEnemyAndTower()
  handleBulletMove()
  drawSpecialBullets()
}
/** 处理敌人的移动，进入塔防的范围 */
function checkEnemyAndTower() {
  if(!enemyList.length) return
  for(let t_i in towerList) {
    const eIdList = enterAttackScopeList(towerList[t_i])
    // 进入攻击范围，开始射击 
    if(eIdList?.length) {
      if(towerList[t_i].name === 'huonan') {
        towerList[t_i].targetIdList = eIdList
      } else {
        towerList[t_i].shootFun!(eIdList.slice(0, towerList[t_i].targetNum), +t_i)
      }
    } else {
      if(towerList[t_i].targetIdList) {
        towerList[t_i].targetIdList = []
      }
    }
  }
  for(const bItem of specialBullets.twitch) {
    const eIdList = enterAttackScopeList({x: bItem.x, y: bItem.y, r: bItem.w / 2.5, size: bItem.w})
    if(eIdList?.length) {
      triggerPoisonFun(eIdList, 'twitch')
    }
  }
}
/** 点击建造塔防 */
function buildTower() {
  const { rate, money, audioKey, onloadImg, onloadbulletImg, ...ret } =  _.cloneDeep(source.towerSource![props.tname])
  const size = state.size
  const x = 4 * size, y = 3 * size
  const tower: TowerStateType = {
    ...ret, x, y, id: audioKey + Date.now(), targetIdList: [], bulletArr: [], onloadImg, onloadbulletImg, rate, money, audioKey
  }
  tower.r *= size 
  tower.speed *= size
  tower.bSize.w *= size
  tower.bSize.h *= size
  // 子弹射击的防抖函数
  if(tower.name !== 'huonan') {
    tower.shootFun = _.throttle((eIdList, t_i) => {
      shootBullet(eIdList, t_i)
    }, rate, { leading: true, trailing: false })
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
  towerList.push(tower)
}

/** 发射子弹  enemy:敌人id数组，t_i:塔索引 */
function shootBullet(eIdList: string[], t_i: number) {
  const t = towerList[t_i]
  for(const e_id of eIdList) {
    const enemy = enemyList.find(e => e.id === e_id)
    if(!enemy) break
    const size_2 = state.size / 2
    const {x, y, w, h} = enemy
    // 敌人中心坐标
    const _x = x + w / 2, _y = y + h / 2
    const {x: t_x, y: t_y, speed, name, isThrough, bulletInitDeg } = towerList[t_i]
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
  }
  // 添加攻击目标的索引
  t.targetIdList = eIdList
  if(t.name === 'lanbo') {
    t.isBulleting = true
  }
}

/** 处理子弹的移动 */
function handleBulletMove() {
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
      handleBulletAndEnemy(t, b_i, e_id)
      // 清除穿透性子弹
      if(t.isThrough && checkThroughBullet({x,y,w,h})) {
        if(t.name === 'delaiwen') {
          if(!bItem.isRecycling) {
            bItem.isRecycling = true
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
      drawTowerBullet(t)
    }
    if(t.name === 'huonan') { // 处理火男子弹
      handleFireBullet(t)
    }
  }
}
/** 处理子弹和敌人的关系 */
function handleBulletAndEnemy(t: TowerStateType, b_i: number, e_id: string) {
  const bItem = t.bulletArr[b_i]
  const {w, h} = t.bSize
  // 子弹击中敌人
  const isInTarget = (
    t.name !== 'twitch' 
    && checkBulletInEnemyOrTower({x: bItem.x, y: bItem.y, w, h}, e_id)
    && !(t.isThrough && bItem.attactIdSet?.has(e_id))
  )
  // 子弹击中敌人
  if(isInTarget) {
    if(t.isSaveBullet) {
      if(t.name === 'twitch') {
        handleSpecialBullets(t, bItem)
      }
    }
    // 穿透性子弹击中敌人
    if(t.isThrough) {
      bItem.attactIdSet?.add(e_id)
    } else { // 清除子弹
      t.bulletArr.splice(b_i, 1)
    }
    handelDamageEnemy(e_id, t)
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
    const ctx = state.ctx!
    const imgX = bItem.x - w / 2, imgY = bItem.y - h / 2
    if(t.name === 'fengche') {
      bItem.rotateDeg = (bItem.rotateDeg ?? 0) + 3
      drawRotateBullet({deg: bItem.rotateDeg, x: imgX, y: imgY, w, h, img: t.onloadbulletImg})
    } else if(t.name === 'delaiwen') {
      bItem.rotateDeg = (bItem.rotateDeg ?? 0) + 20
      drawRotateBullet({deg: bItem.rotateDeg, x: imgX, y: imgY, w, h, img: t.onloadbulletImg})
    } else if(!((['lanbo'] as TowerName[]).includes(t.name))) {  // 绘画其余塔防的子弹
      if(bItem.deg) { // 需要旋转的子弹
        drawRotateBullet({deg: bItem.deg, x: imgX, y: imgY, w, h, img: t.onloadbulletImg})
      } else {
        ctx.drawImage(t.onloadbulletImg, imgX, imgY, w, h)
      }
    } 
  }
}
/** 塔防伤害敌人 */
function handelDamageEnemy(e_id: string, t: TowerStateType) {
  const enemy = enemyList.find(e => e.id === e_id)
  if(!enemy) return
  let hp = enemy.hp.cur - t.damage
  if(t.name === 'delaiwen' && (hp * 10 <= enemy.hp.sum)) { // 德莱文处决少于10%生命的敌人
    hp = 0
  }
  // 敌人扣血
  enemy.hp.cur = Math.max(hp, 0) 
  if(enemy.hp.cur <= 0) {
    enemy.hp.cur = enemy.hp.sum
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
    enemy.hp.cur = enemy.hp.sum
  }
}
/** 画塔防的其他子弹 */
function drawTowerBullet(t: TowerStateType) {
  const {w, h} = t.bSize
  // 当前塔防的当前子弹
  const ctx = state.ctx!
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
  if(t.damage < t.preDamage! * 4) {
    t.thickness! = Math.min(t.thickness! + 0.025, state.size / 3)
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
  const size = state.size
  const {x: ex, y: ey, w, h} = enemy
  const ctx = state.ctx!
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
  const bId = randomStr('twitch')
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
function drawSpecialBullets() {
  if(!specialBullets.twitch.length) return
  const ctx = state.ctx!
  const img = source.towerSource!['twitch'].onloadbulletImg
  ctx.save()
  ctx.globalAlpha = 0.3
  specialBullets.twitch.forEach(b => {
    ctx.drawImage(img, b.x, b.y, b.w, b.h)
  })
  ctx.restore()
}
/** 中毒触发函数 */
function triggerPoisonFun(eIdList: string[], tName: TowerName) {
  const t = towerArr[tName]
  for(const e_id of eIdList) {
    const enemy = enemyList.find(e => e.id === e_id) 
    if(!enemy?.poison) {
      const poisonFun = _.throttle((e_id: string, t: TowerType) => {
        startPoisonInterval(e_id, t)
        slowEnemy(e_id, t.slow!)
      }, 1000, { leading: true, trailing: false })
      enemy!.poison = {level: 1, damage: t.damage, poisonFun}
    } else {
      enemy!.poison.poisonFun?.(e_id, t)
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
    }, t.poison!.time, {isTimeOut: true})
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
  const size_2 = state.size / 2
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
/** 判断穿透性子弹是否越界了 */
function checkThroughBullet(bItem: TargetInfo) {
  let {x, y, w, h} = bItem
  const {w: canvasW, h: canvasH} = state.canvasInfo
  x = x - w / 2, y = y - h / 2
  return x + w < 0 || y + h < 0 || x > canvasW || y > canvasH
}
/** 判断子弹中是否击中敌人 或者回到塔防 */
function checkBulletInEnemyOrTower({x, y, w, h}: TargetInfo, id: string, isTower?: boolean) {
  const target = !isTower ? enemyList.find(e => e.id === id) : towerList.find(t => t.id === id)
  if(!target) return
  const size = state.size
  const {x:ex, y:ey, w:ew = size, h:eh = size} = target as TargetInfo
  const checkIn = (v: number, scope: number, t: number) => (t > v - scope / 2) && (t < v + scope / 2)
  // 子弹中心(当前的xy在绘画时已经是偏移过了) 和 敌人中心 
  return checkIn(x, w, ex + ew / 2) && checkIn(y, h, ey + eh / 2)
}   


/** 画塔防 */
function drawTower() {
  for(const t of towerList) {
    state.ctx!.drawImage(t.onloadImg, t.x, t.y, state.size, state.size)
  }
}

/** 旋转子弹 */
function drawRotateBullet({x, y, w, h, deg, img}: {
  x: number; y: number; w: number; h:number; deg: number; img: CanvasImageSource
}) {
  const ctx = state.ctx!
  ctx.save()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate(deg * Math.PI / 180)
  ctx.translate(-(x + w / 2), -(y + h / 2))
  ctx.drawImage(img, x, y, w, h)
  ctx.restore()
}

function makeEnemy() {
  setEnemy(props.enemyList[0])
  makeEnemyTimer.value = setInterval(() => {
    const index = enemyList.length
    if(index === props.enemyList.length) {
      clearInterval(makeEnemyTimer.value)
    } else {
      setEnemy(props.enemyList[index])
    }
  }, 1200);
}

/** 生成敌人 */
function setEnemy(e: {i: number, level?: number}) {
  const item = _.cloneDeep(source.enemySource[e.i])
  const size = state.size
  item.w *= size
  item.h *= size
  item.curSpeed *= size
  item.speed *= size
  item.hp.size *= size
  const id = randomStr(item.audioKey)
  const level = range(e.level ?? 1, 0, ENEMY_MAX_LEVEL)
  item.hp.cur = item.hp.sum * (level + 1) / 2 
  item.hp.level = level
  if(level > 1) {
    item.hp.sum *= (level + 1) / 2
  }
  const enemyItem: EnemyStateType = {...item, id, imgIndex: 0, curFloorI: 0, framesNum: 0}
  const {x, y} = state.mapGridInfoItem
  const {w, h} = item
  enemyItem.x = x - w / 4
  enemyItem.y = y - h / 2
  enemyList.push(enemyItem)
  // handleEnemySkill(name, enemyItem.id)
}

/** 敌人移动 */
function moveEnemy(index: number) {
  const { curSpeed, speed, curFloorI, isForward, isFlip, id, w, h } = enemyList[index]
  // 敌人到达终点
  let newIndex = curFloorI
  if(newIndex === state.mapGridInfoItem.num) {
    newIndex = 0
  }
  // 将格子坐标同步到敌人的坐标
  const { x, y, x_y } = state.movePath[newIndex]
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
    if(newIndex === curFloorI) {
      enemyList[index].curFloorI++
    } else {
      enemyList[index].curFloorI = 0
      enemyList[index].x -= curSpeed
    }
  }
}

/** 画敌人 */
function drawEnemy(index: number) {
  if(!enemyList[index]) return
  const { name, imgType, x, y, w, h, imgIndex, hp, curSpeed, isForward, speed, poison, slowType } = enemyList[index]
  const ctx = state.ctx!
  ctx.save() // 保存画布
  // 翻转图片
  if(!isForward) { 
    ctx.translate(w + x * 2, 0)
    ctx.scale(-1, 1); // 翻转画布
  }
  const imgItem = source.enemyImgSource[name]
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
      if(enemyList[index].framesNum >= delay) {
        enemyList[index].imgIndex++;
        enemyList[index].framesNum = 0;
      } else {
        enemyList[index].framesNum++;
      }
    }
    // 使图片索引回到第一帧
    if(enemyList[index].imgIndex === imgItem.imgList!.length) {
      enemyList[index].imgIndex = 0
    }
  }
  // 绘画减速效果
  if(curSpeed !== speed) {
    if(slowType === 'twitch') {
      ctx.save()
      ctx.globalAlpha = 0.5
      ctx.drawImage(source.othOnloadImg.snowPoison!, x + w / 4, y + h / 3, w / 2, w / 2)
      ctx.restore()
    } else {
      ctx.save()
      ctx.globalAlpha = 0.9
      ctx.drawImage(source.othOnloadImg.snow!, x + w / 4, y + h / 3, w / 3, w / 3)
      ctx.restore()
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
  // --- 绘画生命值 ---
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
  // --- 绘画星级 ---
  if(hp.level! < 10) {
    const levelSize = hp.size
    const moonN = Math.floor(hp.level! / 3)
    const starN = Math.floor(hp.level! % 3)
    let levelX = x - levelSize * 2, levelY = y - levelSize
    if(starN + moonN === 1) {
      ctx.drawImage(source.othOnloadImg[starN ? 'star' : 'moon']!, levelX, levelY, levelSize, levelSize)
    } else if(starN + moonN === 2) {
      levelX -= levelSize
      for(let i = 0; i < 2; i++) {
        ctx.drawImage(source.othOnloadImg[moonN > i ? 'moon' : 'star']!, levelX, levelY, levelSize, levelSize)
        levelX += levelSize
      }
    } else if(starN + moonN === 3) {
      for(let i = 0; i < 3; i++) {
        if(i === 0) {levelX -= levelSize / 2; levelY -= levelSize / 2;}
        else if(i === 1) {levelX -= levelSize / 2; levelY += levelSize;}
        else if(i === 2) levelX += levelSize;
        ctx.drawImage(source.othOnloadImg[moonN > i ? 'moon' : 'star']!, levelX, levelY, levelSize, levelSize)
      }
    } else if(starN + moonN === 4) {
      for(let i = 0; i < 4; i++) {
        if(i === 0) {levelX -= levelSize; levelY -= levelSize / 2;}
        else if(i === 1 || i === 3) levelX += levelSize;
        else if(i === 2) {levelX -= levelSize; levelY += levelSize;}
        ctx.drawImage(source.othOnloadImg[moonN > i ? 'moon' : 'star']!, levelX, levelY, levelSize, levelSize)
      }
    }
  } else {
    ctx.drawImage(source.othOnloadImg.sun!, x - hp.size * 2, y - hp.size * 3 / 2, hp.size * 2, hp.size * 2)
  }
}

/** 减速敌人 t_slow: {num: 减速倍速(当为0时无法动), time: 持续时间} */
function slowEnemy(e_id: string, t_slow: TowerSlow) {
  const e_i = enemyList.findIndex(e => e.id === e_id)
  const { speed, curSpeed } = enemyList[e_i]
  // 当前已经被眩晕了不能减速了
  if(curSpeed === 0) return
  const newSpeed = t_slow.num ? speed / t_slow.num : t_slow.num
  // 防止艾希覆盖老鼠
  if(newSpeed <= curSpeed) {
    // 重新设置恢复速度定时器
    keepInterval.set(`${KeepIntervalKey.slow}-${e_id}`, () => {
      const newE_i = enemyList.findIndex(e => e.id === e_id)
      if(enemyList[newE_i]) {
        enemyList[newE_i].curSpeed = enemyList[newE_i].speed
        enemyList[newE_i].slowType = void 0
      }
    }, t_slow.time, {isTimeOut: true})
  }
  // 减速敌人
  if(newSpeed < curSpeed) {
    enemyList[e_i].curSpeed = newSpeed
    enemyList[e_i].slowType = t_slow.type
  }
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

function getCanvasWH() {
  const dom = document.querySelector(`.${idRef.value}`)
  const width = (dom?.clientWidth ?? 0) * source.ratio
  const height = (dom?.clientHeight ?? 0) * source.ratio
  state.canvasInfo.w = width
  state.canvasInfo.h = height
  state.size = height / 7
}

/** 初始化行动轨迹 */
function initMovePath() {
  const size = state.size
  const movePathItem: GridInfo & {num?: number} = JSON.parse(JSON.stringify(state.mapGridInfoItem))
  const mapData: {[key in number]: DirectionType} = {6: 2, 10: 1, 16: 4}
  const length = movePathItem.num!
  delete movePathItem.num
  const movePath: GridInfo[]  = []
  // 控制x y轴的方向 1:左 2:下 3:右 4:上
  let x_y = movePathItem.x_y
  for(let i = 0; i < length; i++) {
    const newXY = mapData[i]
    if(newXY) {
      x_y = newXY
    }
    if(x_y % 2) movePathItem.x += x_y === 3 ? size : -size
    else movePathItem.y += x_y === 4 ? size : -size
    movePathItem.x_y = x_y
    movePath.push(JSON.parse(JSON.stringify(movePathItem)))
  }
  state.movePath = movePath
}

/** 画地板 */
function drawFloorTile() {
  if(!source.othOnloadImg?.floor) return
  state.ctx?.clearRect(0, 0, state.size, state.size)
  for(let f of state.movePath) {
    state.ctx?.drawImage(source.othOnloadImg.floor!, f.x, f.y, state.size, state.size)
  }
}

</script>

<template>
  <div class='com-tower-canvas' :class="idRef">
    <canvas 
      ref="canvasRef"
      :width="state.canvasInfo.w"
      :height="state.canvasInfo.h"
      :style="{
        width: state.canvasInfo.w / source.ratio + 'px',
        height: state.canvasInfo.h / source.ratio + 'px',
      }"
    ></canvas>
  </div>
</template>

<style lang='less' scoped>
.com-tower-canvas {
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle 100px at center, #16d9e3 0%, #30c7ec 47%, #46aef7 100%);
}
</style>