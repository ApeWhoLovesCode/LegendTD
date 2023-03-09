<script setup lang='ts'>
import { DirectionType, GridInfo } from '@/dataSource/mapData';
import { useSourceStore } from '@/stores/source';
import { BulletType, EnemyStateType, TargetInfo, TowerStateType } from '@/type/game';
import { getAngle } from '@/utils/handleCircle';
import { randomStr } from '@/utils/random';
import useBaseData from '@/views/game/tools/baseData';
import useEnemy from '@/views/game/tools/enemy';
import useTower from '@/views/game/tools/tower';
import _ from 'lodash';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';

const { enemyList, slowEnemy} = useEnemy()
const { towerList } = useTower()
const { enterAttackScopeList, powAndSqrt } = useBaseData()

const props = withDefaults(defineProps<{
  index: number;
  eIndexList?: number[];
}>(), {
  index: 1,
  eIndexList: () => [1]
})
const source = useSourceStore()
const idRef = ref(randomStr('com-cover-canvas'))
/** canvas 提高清晰度 */
const ratio = ref(window.devicePixelRatio ?? 1)
const canvasRef = ref<HTMLCanvasElement>()
const state = reactive({
  ctx: null as CanvasRenderingContext2D | null,
  canvasInfo: {w: 0, h: 0},
  /** 地板大小 */
  size: 10,
  movePath: [] as GridInfo[],
  animationFrame: 0,
  mapGridInfoItem: {x: 1, y: 5, x_y: 3, num: 20},
})

// 监听敌人的移动
watch(() => enemyList, (enemyList) => {
  for(let t_i in towerList) {
    const eIdList = enterAttackScopeList(enemyList, towerList[t_i])
    // 进入攻击范围，开始射击 
    if(eIdList.length) {
      towerList[t_i].shootFun(eIdList.slice(0, towerList[t_i].targetNum), t_i)
    }
  }
}, { deep: true })

onMounted(() => {
  setTimeout(() => {
    getCanvasWH()
    init()
  }, 10);
})

onUnmounted(() => {
  cancelAnimationFrame(state.animationFrame)
})

function init() {
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
  (function go() {
    startDraw();
    // 时间间隔为 1000/60 每秒 60 帧
    state.animationFrame = requestAnimationFrame(go);
  })();
}

/** 开始绘画 */
function startDraw() {
  state.ctx!.clearRect(0, 0, state.canvasInfo.w, state.canvasInfo.h);
  drawFloorTile()
  drawTower()
  // 循环静态图片数组画敌人形成gif效果
  for(let index = 0; index < enemyList.length; index++) {
    const item = enemyList[index]
    moveEnemy(index)
    drawEnemy(index)
    if(item.imgIndex === item.imgList.length - 1) enemyList[index].imgIndex = 0
    else enemyList[index].imgIndex++
  }
  handleBulletMove()
}

/** 点击建造塔防 */
function buildTower() {
  const { rate, money, audioKey, onloadImg, onloadbulletImg, ...ret } =  _.cloneDeep(source.towerSource[props.index])
  const size = state.size
  const x = 4 * size, y = 3 * size
  // 将该塔防数据放入场上塔防数组中
  // 射击的防抖函数
  const shootFun = _.throttle((eIdList, t_i) => {
    shootBullet(eIdList, t_i)
  }, rate, { leading: true, trailing: false })
  // 处理多个相同塔防的id值
  const tower: TowerStateType = {
    ...ret, x, y, id: audioKey + Date.now(), shootFun, targetIndexList: [], bulletArr: [], onloadImg, onloadbulletImg, rate, money, audioKey
  }
  tower.r *= size 
  tower.speed *= size
  tower.bSize.w *= size
  tower.bSize.h *= size
  if(tower.name === 'lanbo') {
    tower.scale = 1
    const {r, speed, bSize: {w, h}} = tower
    const l = powAndSqrt(w / 2, h / 2)
    // 这里 speed + 1 是为了让子弹扩散的效果快于真实子弹
    tower.addScale = (r / l - 1) / ((r - l) / (speed + 1))
  }
  towerList.push(tower)
}

/** 发射子弹  enemy:敌人id数组，t_i:塔索引 */
function shootBullet(eIdList: string[], t_i: number) {
  // 添加攻击目标的索引
  towerList[t_i].targetIndexList = eIdList
  for(const e_id of eIdList) {
    const enemy = enemyList.find(e => e.id === e_id)
    if(!enemy) break
    const size_2 = state.size / 2
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
    if(bulletInitDeg !== void 0) {
      const deg = getAngle({x: begin.x, y: begin.y}, {x: _x, y: _y})
      bullet.deg = -bulletInitDeg + deg
    }
    towerList[t_i].bulletArr.push(bullet)
  }
  if(towerList[t_i].name === 'lanbo') {
    towerList[t_i].isBulleting = true
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
      let {x, y, addX, addY, e_id, attactIdSet} = bItem
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
        const newEid = handleThroughBulletEid({x, y, w, h, attactIdSet: attactIdSet!})
        if(newEid) bItem.e_id = newEid
      }
      let isAttact = t.isThrough && attactIdSet?.has(e_id)
      let isDelete = false
      // 子弹击中敌人
      if(checkBulletInEnemy({x: bItem.x, y: bItem.y, w, h}, e_id) && !isAttact) {
        // 穿透性子弹击中敌人
        if(t.isThrough) bItem.attactIdSet?.add(e_id)
        // 清除子弹
        if(!t.isThrough) {
          t.bulletArr.splice(b_i, 1)
          isDelete = true
        }
        // 敌人扣血
        const enemy = enemyList.find(e => e.id === e_id)
        if(enemy) {
          if(enemy.hp.cur <= 0) {
            enemy.hp.cur = enemy.hp.sum
          } else {
            // 判断减速
            if(t.slow) {
              slowEnemy(e_id, t.slow)
            }
          }
          const newHp = enemy.hp.cur - t.damage 
          enemy.hp.cur = newHp > 0 ? newHp : 0
        }
      } else {
        if(!isDelete && !t.isThrough && bItem.xy >= bItem.x_y) {
          t.bulletArr.splice(b_i, 1)
        }
        const ctx = state.ctx!
        const imgX = x - w / 2, imgY = y - h / 2
        if(t.name === 'fengche') {
          t.rotateDeg = (t.rotateDeg ?? 0) + 3
          drawRotateBullet({deg: t.rotateDeg, x: imgX, y: imgY, w, h, img: t.onloadbulletImg})
        } else if(t.name !== 'lanbo') {
          if(bItem.deg) { // 需要旋转的子弹
            drawRotateBullet({deg: bItem.deg, x: imgX, y: imgY, w, h, img: t.onloadbulletImg})
          } else {
            ctx.drawImage(t.onloadbulletImg, imgX, imgY, w, h)
          }
        } 
      }
      // 清除穿透性子弹
      if(t.isThrough && checkThroughBullet({x,y,w,h})) {
        t.bulletArr.splice(b_i, 1)
      }
    }
    // 有需要额外的子弹才绘画
    if(t.isBulleting) {
      drawTowerBullet(t_i)
    }
  }
}

/** 画塔防的特殊子弹 */
function drawTowerBullet(t_i: number) {
  const t = towerList[t_i]
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

/** 
 * 计算子弹和敌人的距离
 * 返回 x,y方向需要增加的值, distance: 子弹和敌人的距离, x_y: 塔和敌人的距离
 */
 function bulletEnemyDistance(
  e_id: string, t_i: number, bx: number, by: number
) {
  const enemy = enemyList.find(e => e.id === e_id)
  // 敌人已经死了 或者 是能穿透的子弹，不用覆盖之前的值了 
  if(!enemy || towerList[t_i].isThrough) return
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
    if(!attactIdSet.has(eItem.id) && checkBulletInEnemy({x,y,w,h}, eItem.id)) {
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
/** 判断敌人中心是否在子弹中 即击中敌人 */
function checkBulletInEnemy({x, y, w, h}: TargetInfo, e_id: string) {
  const enemy = enemyList.find(e => e.id === e_id)
  if(!enemy) return
  const {x:ex, y:ey, w:ew, h:eh} = enemy
  // 绘画子弹时的偏移
  x -= w / 2, y -= h / 2
  // 敌人中心
  const _ex = ex + ew / 2, _ey = ey + eh / 2
  return _ex > x && _ey > y && (_ex < x + w) && (_ey < y + h)
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
  setEnemy(props.eIndexList[0])
  for(let i = 1; i < props.eIndexList.length; i++) {
    setTimeout(() => {
      setEnemy(props.eIndexList[i])
    }, 900);
  }
}

/** 生成敌人 */
function setEnemy(i: number) {
  const item = _.cloneDeep(source.enemySource[i])
  const size = state.size
  item.w *= size
  item.h *= size
  item.curSpeed *= size
  item.speed *= size
  item.hp.size *= size
  const {audioKey, name, w, h} = item
  // 设置敌人的初始位置
  const id = Date.now()
  const enemyItem: EnemyStateType = {...item, id: audioKey + id}
  const {x, y} = state.mapGridInfoItem
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
      if(!isForward) enemyList[index].isForward = !isFlip
      break;
    }
    case 2: enemyList[index].y -= curSpeed; break;
    case 3: {
      enemyList[index].x += curSpeed;
      if(isForward) enemyList[index].isForward = isFlip
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
  const { x, y, w, h, imgList, imgIndex, hp, curSpeed, isForward, speed } = enemyList[index]
  const ctx = state.ctx!
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
    ctx.save()
    ctx.globalAlpha = 0.9
    ctx.drawImage(source.othOnloadImg.snow!, x + w / 4, y + h / 3, w / 2, w / 2)
    ctx.restore()
    // ctx.beginPath();
    // ctx.arc(x + w / 2, y + h / 2, w / 5, 0, 2 * Math.PI, false)
    // ctx.fillStyle = 'rgba(2, 38, 241, 0.3)'
    // ctx.fill()
    // ctx.strokeStyle = '#022ef1'
    // ctx.stroke()

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

function getCanvasWH() {
  const dom = document.querySelector(`.${idRef.value}`)
  const width = (dom?.clientWidth ?? 0) * ratio.value
  const height = (dom?.clientHeight ?? 0) * ratio.value
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
        width: state.canvasInfo.w / ratio + 'px',
        height: state.canvasInfo.h / ratio + 'px',
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