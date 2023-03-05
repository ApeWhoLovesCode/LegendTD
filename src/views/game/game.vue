<script lang="ts" setup>
import { nextTick, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import _ from 'lodash'
import { ElMessage } from 'element-plus'

import useAudioState from './tools/audioState';
import useBaseData from './tools/baseData';
import useEnemy from './tools/enemy';
import useGameConfig from './tools/gameConfig';
import useGameSkill from './tools/gameSkill';
import { BuildingImg, HorseImg, SunImg } from './tools/imgSource';
import useTower from './tools/tower';

import Loading from '@/components/loading.vue'
import GameNavBar from '@/components/gameNavBar.vue'
import Skill from '@/components/skill.vue'

import { limitRange, randomNum, randomNumList, waitTime } from '@/utils/tools'
import keepInterval from '@/utils/keepInterval'

import levelData from '@/dataSource/levelData'
import mapData, { GridInfo, mapGridInfoList } from '@/dataSource/mapData'
import { useSourceStore } from '@/stores/source';
import { EnemyType } from '@/dataSource/enemyData';
import { BulletType, EnemyStateType, TargetInfo, TowerStateType } from '@/type/game';
import useDomRef from './tools/domRef';
import { getAngle } from '@/utils/handleCircle';

// 全局资源
const source = useSourceStore()

// 抽离的数据
const { audioState, createAudio, playDomAudio, removeAudio} = useAudioState()
const { baseDataState, gamePause, enterAttackScopeList, initAllGrid, powAndSqrt } = useBaseData()
const { gameConfigState } = useGameConfig()
const { gameSkillState } = useGameSkill()
const { enemyList, enemyState, slowEnemy} = useEnemy()
const { towerList, towerState, handlerTower, hiddenTowerOperation } = useTower()
const { canvasRef, audioBgRef, audioLevelRef, audioSkillRef, audioEndRef, audioRefObj } = useDomRef()

/** ---计算属性--- */
/** 终点位置 */
const terminalStyle = computed(() => {
  return {left: baseDataState.terminal?.x + 'px', top: baseDataState.terminal?.y + 'px'}
})
/** 塔防容器的样式 */
const buildingStyle = computed(() => {
  const {left, top} = towerState.building
  const size = gameConfigState.size
  return {left: left + size + 'px', top: top + size + 'px'}
})
/** 塔防容器的类目 */
const buildingClass = computed(() => {
  const {left, top} = towerState.building
  const {x_num, y_num, size} = baseDataState.gridInfo
  const _x_num = Math.round(left / size), _y_num = Math.round(top / size)
  let className = ''
  if(_y_num >= y_num - 3) {
    className += 'tower-wrap-bottom '
  }
  // 点击在左右两边的情况
  if(_x_num <= 1 || _x_num >= x_num - 2) {
    className += 'tower-wrap-row '
    if(_y_num >= 2) className += 'tower-wrap-row-top '
    if(_x_num <= 1) className += 'tower-wrap-left'
    else className += 'tower-wrap-right'
  }
  return className
})
/** 攻击范围的样式 */
const buildingScopeStyle = computed(() => {
  const padding = gameConfigState.size
  const size = gameConfigState.size / 2
  const {left, top, r} = towerState.buildingScope
  return {left: left + padding + size + 'px', top: top + padding + size + 'px', width: r * 2 + 'px', height: r * 2 + 'px'}
})
/** 售卖防御塔按钮的样式 */
const saleTowerStyle = computed(() => {
  const {y_num, size} = baseDataState.gridInfo
  const _y_num = Math.round(towerState.buildingScope.top / size)
  return _y_num >= y_num / 2 ? { top: 0 } : { bottom: 0 }
})
/** 是否是无限火力模式 */
const isInfinite = computed(() => {
  return source.mapLevel === mapData.length - 1
})
/** 当前关卡全部敌人已经上场 */
const allEnemyIn = computed(() => {
  return enemyState.createdEnemyNum === enemyState.levelEnemy.length
})

// 监听增加的钱
watch(() => baseDataState.money, (newVal, oldVal) => {
  gameSkillState.addMoney.num = ''
  clearTimeout(gameSkillState.addMoney.timer as NodeJS.Timer)
  gameSkillState.addMoney.timer = null
  nextTick(() => {
    const val = newVal - oldVal
    gameSkillState.addMoney.num = (val >= 0 ? '+' : '') + val
    gameSkillState.addMoney.timer = setTimeout(() => {
      gameSkillState.addMoney.num = ''
    }, gameSkillState.addMoney.time);
  })
})
// 游戏结束判断
watch(() => baseDataState.hp, (val) => {
  baseDataState.isGameOver = true
  baseDataState.isPause = true
  playAudio('ma-gameover', 'Skill')
  audioBgRef.value?.pause()
})
// 监听暂停
watch(() => baseDataState.isPause, (val) => {
  keepInterval.allPause(val)
  if(!val) {
    makeEnemy()
    startAnimation();
    startMoneyTimer()
  }
})
// 监听等级变化生成对应敌人
watch(() => baseDataState.level, (val) => {
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
    if(val < enemyDataArr.length && !isInfinite.value) {
      enemyState.levelEnemy = enemyDataArr[val]
    } else {
      const levelNum = baseDataState.level + (isInfinite.value ? 5 : 0)
      enemyState.levelEnemy = randomNumList(levelNum)
    }
    if(val) {
      if((val / 10) % 1 === 0) {
        playAudio('ma-pvz', 'End')
      }
      baseDataState.money += (baseDataState.level + 1) * gameSkillState.proMoney.money
      makeEnemy()
      audioLevelRef.value?.play()
    }
  }, val ? 500 : 0);
}, {immediate: true})
// 监听敌人的移动
watch(() => enemyList, (enemyList) => {
  // 敌人已经清空
  if(!enemyList.length && allEnemyIn.value && baseDataState.hp) {
    nextTick(() => { baseDataState.level++ })
  }
  for(let t_i in towerList) {
    const eIdList = enterAttackScopeList(enemyList, towerList[t_i])
    // 进入攻击范围，开始射击 
    if(eIdList.length) {
      towerList[t_i].shootFun(eIdList.slice(0, towerList[t_i].targetNum), t_i)
    }
  }
}, { deep: true }) // 这里deep可能会无效

/** ----- 入口 ----- */
onMounted(() => {
  setTimeout(() => {
    init();
    getCanvasMargin()
  }, 10);
  // 监听浏览器窗口大小变化
  window.addEventListener("resize", getCanvasMargin);
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', getCanvasMargin)
  cancelAnimationFrame(gameConfigState.animationFrame)
  keepInterval.clear()
})

async function init() {
  initMobileData()
  if(isInfinite.value) {
    baseDataState.money = 999999
  }
  gameConfigState.ctx = (canvasRef.value!.getContext("2d") as CanvasRenderingContext2D);
  const item = JSON.parse(JSON.stringify(mapGridInfoList[source.mapLevel]))
  item.x *= gameConfigState.size
  item.y *= gameConfigState.size
  baseDataState.mapGridInfoItem = item
  baseDataState.floorTile.num = baseDataState.mapGridInfoItem.num
  initAllGrid()
  initMovePath()
  onKeyDown()
  source.isGameInit = true
  await waitTime(800)
  gameConfigState.loadingDone = true
  startAnimation()
}

/** 开启动画绘画 */
function startAnimation() {
  (function go() {
    startDraw();
    if (!baseDataState.isPause) {
      // 时间间隔为 1000/60 每秒 60 帧
      gameConfigState.animationFrame = requestAnimationFrame(go);
    } else {
      cancelAnimationFrame(gameConfigState.animationFrame)
    }
  })();
}
/** 开始绘画 */
function startDraw() {
  gameConfigState.ctx.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height);
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
  handleBulletMove()
}

/** 按间隔时间生成敌人 */
function makeEnemy() {
  // 当前关卡敌人已经全部上场
  if(allEnemyIn.value) return
  // 暂停回来，间隔时间修改
  keepInterval.set('makeEnemy', () => {
    if(allEnemyIn.value) {
      keepInterval.delete('makeEnemy')
    } else {
      setEnemy()
    }
  }, baseDataState.intervalTime)
}

/** ----- enemy ----- */
/** 画敌人 */
function drawEnemy(index: number) {
  if(!enemyList[index]) return
  const { x, y, w, h, imgList, imgIndex, hp, curSpeed, isForward, speed } = enemyList[index]
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
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 5, 0, 2 * Math.PI, false)
    ctx.fillStyle = 'rgba(2, 38, 241, 0.3)'
    ctx.fill()
    ctx.strokeStyle = '#022ef1'
    ctx.stroke()
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
  const enemyItemSource = _.cloneDeep(source.enemySource[enemyState.levelEnemy[enemyState.createdEnemyNum]])
  const {audioKey, name, w, h} = enemyItemSource
  // 设置敌人的初始位置
  const id = Date.now()
  const enemyItem: EnemyStateType = {...enemyItemSource, id: audioKey + id}
  const {x, y} = baseDataState.mapGridInfoItem
  enemyItem.x = x - w / 4
  enemyItem.y = y - h / 2
  enemyList.push(enemyItem)
  enemyState.createdEnemyNum++
  handleEnemySkill(name, enemyItem.id)
  createAudio(audioKey, String(id))
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
    }
  } else if(enemyName === '坤坤') {
    const newHp = hp.cur + 200
    enemyList[e_i].hp.cur = limitRange(newHp, newHp, hp.sum)
    volume = 0.7
  }
  playDomAudio({id, volume})
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
  const { curFloorI, w, h, audioKey } = newEnemy
  const { x, y } = enemyState.movePath[curFloorI - 1]
  const id = Date.now() + i
  return {
    ...newEnemy,
    id: audioKey + id,
    x: x - w / 4,
    y: y - h / 2
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
      if(!enemyList[e_i]) return
      const e_id = enemyList[e_i].id
      // 清除减速持续时间定时器
      keepInterval.delete(`slow-${e_id}`)
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
      removeAudio(e_id)
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
    playAudio('ma-nansou', 'End')
    return true
  }
  // 将格子坐标同步到敌人的坐标
  const { x, y, x_y } = enemyState.movePath[curFloorI]
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
    enemyList[index].curFloorI++
  }
}

/** 发动技能 */
function handleSkill(index: number) {
  const { name, money, damage, audioKey, showTime, cd } = gameSkillState.skillList[index]
  baseDataState.money -= money
  if(name !== '礼物') {
    const e_idList = []
    for(const enemy of enemyList) {
      const e_id = enemy.id
      enemy.hp.cur -= damage
        if(enemy.hp.cur <= 0) {
        baseDataState.money += enemy.reward
        e_idList.push(e_id)
        // 遍历清除防御塔里的该攻击目标
        for(const t of towerList) {
          t.targetIndexList.splice(t.targetIndexList.findIndex(item => item === e_id), 1)
        }
      }
      if(name === "肉弹冲击") {
        slowEnemy(e_id, {num: 0, time: 6000})
      }
    }
    removeEnemy(e_idList)
  } else {
    baseDataState.money += randomNum(1, 100)
  }
  playAudio(audioKey, 'Skill')
  // 显示技能效果
  gameSkillState.skillList[index].isShow = true
  setTimeout(() => {
    gameSkillState.skillList[index].isShow = false
  }, showTime);
  // 技能进入cd
  gameSkillState.skillList[index].curTime = cd 
  const skillId = `skill-${name}`
  keepInterval.set(skillId, () => {
    gameSkillState.skillList[index].curTime -= 1000
    if(gameSkillState.skillList[index].curTime <= 0) {
      keepInterval.delete(skillId)
    }
  })
}

/** ----- tower ----- */
/** 点击获取鼠标位置 操作塔防 */
function getMouse(e: MouseEvent) {
  e.stopPropagation()
  const size = gameConfigState.size
  const _x = e.offsetX, _y = e.offsetY
  // 当前点击的格子的索引值
  const col = Math.floor(_y / size), row = Math.floor(_x / size)
  const gridVal = baseDataState.gridInfo.arr[col][row]
  const left = row * size, top = col * size
  // 已经有地板或者有建筑了
  if(gridVal >= 10) {
    handlerTower(left, top)
  }
  if(gridVal) {
    return
  }
  towerState.building.isShow = true
  towerState.building.left = left
  towerState.building.top = top
}
/** 点击建造塔防 */
function buildTower(index: number) {
  const { rate, money, audioKey, onloadImg, onloadbulletImg, ...ret } = source.towerSource[index]
  if(baseDataState.money < money) return
  baseDataState.money -= money
  const {left: x, top: y} = towerState.building
  const size = gameConfigState.size
  // 将该塔防数据放入场上塔防数组中
  // 射击的防抖函数
  const shootFun = _.throttle((eIdList, t_i) => {
    shootBullet(eIdList, t_i)
  }, rate, { leading: true, trailing: false })
  // 处理多个相同塔防的id值
  const tower: TowerStateType = {
    ...ret, x, y, id: audioKey + Date.now(), shootFun, targetIndexList: [], bulletArr: [], onloadImg, onloadbulletImg, rate, money, audioKey
  }
  if(tower.name === 'lanbo') {
    tower.scale = 1
    const {r, speed, bSize: {w, h}} = tower
    const l = powAndSqrt(w / 2, h / 2)
    // 这里 speed + 1 是为了让子弹扩散的效果快于真实子弹
    tower.addScale = (r / l - 1) / ((r - l) / (speed + 1))
  }
  towerList.push(tower)
  // 用于标记是哪个塔防 10 + index
  baseDataState.gridInfo.arr[y / size][x / size] = 10 + index
  drawTower(tower)
  createAudio(`${audioKey}-choose`, tower.id)
  playDomAudio({id: tower.id})
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
/** 售卖防御塔 */
function saleTower(index: number) {
  const size = gameConfigState.size
  const {x, y, saleMoney, id} = towerList[index]
  gameConfigState.ctx.clearRect(x, y, size, size);
  baseDataState.gridInfo.arr[y / size][x / size] = 0
  baseDataState.money += saleMoney
  removeAudio(id)
  towerList.splice(index, 1)
}
/** 发射子弹  enemy:敌人id数组，t_i:塔索引 */
function shootBullet(eIdList: string[], t_i: number) {
  // 添加攻击目标的索引
  towerList[t_i].targetIndexList = eIdList
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
    if(bulletInitDeg !== void 0) {
      const deg = getAngle({x: begin.x, y: begin.y}, {x: _x, y: _y})
      bullet.deg = -bulletInitDeg + deg
    }
    towerList[t_i].bulletArr.push(bullet)
    // 这里可以放发射子弹音频
    // if(name === 'PDD') {
    //   playDomAudio({id, volume: 0.4})
    // }
  }
  if(towerList[t_i].name === 'lanbo') {
    towerList[t_i].isBulleting = true
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
  const e_idList = []
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
          enemy.hp.cur -= t.damage
          if(enemy.hp.cur <= 0) {
            baseDataState.money += enemy.reward
            e_idList.push(e_id)
            t.targetIndexList.splice(t.targetIndexList.findIndex(item => item === e_id), 1)
            // 这里可以放击杀音频
            // if(t.name === '茄子') {
            //   playDomAudio({id: t.id})
            // }
          } else {
            // 判断减速
            if(t.slow) {
              slowEnemy(e_id, t.slow)
            }
          }
        }
      } else {
        if(!isDelete && !t.isThrough && bItem.xy >= bItem.x_y) {
          t.bulletArr.splice(b_i, 1)
        }
        const ctx = gameConfigState.ctx
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
  // 消灭敌人
  if(e_idList.length) {
    removeEnemy(e_idList)
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
    if(!attactIdSet.has(eItem.id) && checkBulletInEnemy({x,y,w,h}, eItem.id)) {
      return eItem.id
    }
  }
  return false
}
/** 判断穿透性子弹是否越界了 */
function checkThroughBullet(bItem: TargetInfo) {
  let {x, y, w, h} = bItem
  const {w: canvasW, h: canvasH} = gameConfigState.defaultCanvas
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

/** 开始游戏 */
function beginGame() {
  // audioLevelRef.value?.play()
  playBgAudio()
  gameConfigState.isGameBeginMask = false
  baseDataState.isPause = false
  ElMessage({type: 'success', message: '点击右上方按钮或按空格键继续 / 暂停游戏', duration: 2500, showClose: true})
}

/** 移动端按比例缩放数据 */
function initMobileData() {
  if(!source.isMobile) return
  const {w, h} = gameConfigState.defaultCanvas
  const wp = document.documentElement.clientWidth / (h + 80)
  const hp = document.documentElement.clientHeight / (w + 80)
  const p = Math.floor(Math.min(wp, hp) * 10) / 10
  function handleDecimals(val: number) {
    return val * (p * 1000) / 1000
  }
  gameConfigState.size *= p
  baseDataState.offset.y *= p
  gameConfigState.defaultCanvas.w *= p
  gameConfigState.defaultCanvas.h *= p
  source.enemySource.forEach(item => {
    item.w = handleDecimals(item.w)
    item.h = handleDecimals(item.h)
    item.curSpeed = handleDecimals(item.curSpeed)
    item.speed = handleDecimals(item.speed)
    item.hp.size = handleDecimals(item.hp.size)
  })
  source.towerSource.forEach(item => {
    item.r = handleDecimals(item.r)
    item.speed = handleDecimals(item.speed)
    item.bSize.w = handleDecimals(item.bSize.w)
    item.bSize.h = handleDecimals(item.bSize.h)
  })
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
    baseDataState.gridInfo.arr[movePathItem.y / size][movePathItem.x / size] = 1
  }
  baseDataState.terminal = movePath[movePath.length - 1]
  enemyState.movePath = movePath
}

/** 画地板 */
function drawFloorTile() {
  const size = gameConfigState.size
  for(let f of enemyState.movePath) {
    gameConfigState.ctx.drawImage(source.imgOnloadObj.floor!, f.x, f.y, size, size)
  }
}

/** 开启创建金钱定时器 */
function startMoneyTimer() {
  return
  keepInterval.set('startMoneyTimer', () => {
    gameSkillState.proMoney.isShow = true
    playAudio('ma-qifei', 'End')
    keepInterval.delete('startMoneyTimer')
  }, gameSkillState.proMoney.interval)
}
/** 点击了生产出来的金钱 */
function proMoneyClick() {
  gameSkillState.proMoney.isShow = false
  baseDataState.money += gameSkillState.proMoney.money
  startMoneyTimer()
}

/** 获取canvas与浏览器 左边 / 顶部 的距离 */
function getCanvasMargin() {
  clearTimeout(gameConfigState.resizeTimer as NodeJS.Timer)
  gameConfigState.resizeTimer = setTimeout(() => {
    // gameConfigState.canvasInfo.left = canvasRef.value?.getBoundingClientRect().left ?? 0;
    // gameConfigState.canvasInfo.top = canvasRef.value?.getBoundingClientRect().top ?? 0;
  }, 50);
}

/** 播放背景音乐 */
function playBgAudio() {
  return
  baseDataState.isPlayBgAudio = !baseDataState.isPlayBgAudio
  if(baseDataState.isPlayBgAudio) {
    audioBgRef.value!.volume = 0.65
    audioBgRef.value?.play()
  }
  else audioBgRef.value?.pause()
}

/** 播放技能音乐和结束音乐 */
function playAudio(audioKey: string, key: 'End' | 'Skill') {
  const audio_key: 'audioEnd' | 'audioSkill' = `audio${key}`
  if(audioState[audio_key] === undefined) return
  if(audioState[audio_key] !== audioKey) {
    audioState[audio_key] = audioKey
  }
  nextTick(()=>{
    // 调节音量
    audioRefObj[audio_key + 'Ref'].value!.volume = 0.9
    audioRefObj[audio_key + 'Ref'].value!.play()
  })
}

/** 监听用户的键盘事件 */
function onKeyDown() {
  document.onkeydown = (e) => {
    if(gameConfigState.isGameBeginMask) return
    switch (e.code) {
      case "Space":{
        gamePause()
        break;
      } 
    }
  };
}


</script>

<template>
  <div id="protect-horse">
    <div id="audio-wrap">
      <audio ref="audioBgRef" :src="audioState.audioList['pvz-morning']" loop></audio>
      <audio ref="audioLevelRef" :src="audioState.audioList['pvz-comein']"></audio>
      <audio ref="audioSkillRef" :src="audioState.audioList[audioState.audioSkill]"></audio>
      <audio ref="audioEndRef" :src="audioState.audioList[audioState.audioEnd]"></audio>
    </div>
    <div class="game-wrap" :style="{'--size': gameConfigState.size + 'px'}">
      <div class="canvas-wrap" @click="hiddenTowerOperation">
        <!-- 游戏顶部信息展示区域 -->
        <GameNavBar 
          :money="baseDataState.money"
          :addMoney="gameSkillState.addMoney"
          :level="baseDataState.level"
          :isPause="baseDataState.isPause"
          :isPlayBgAudio="baseDataState.isPlayBgAudio"
          @gamePause="gamePause"
          @playBgAudio="playBgAudio"
        />
        <!-- 游戏区域 -->
        <canvas ref="canvasRef" id="mycanvas" :width="gameConfigState.defaultCanvas.w" :height="gameConfigState.defaultCanvas.h" @click="getMouse($event)"></canvas>
        <!-- 塔防的容器 -->
        <div v-show="towerState.building.isShow" class="building-wrap" :style="buildingStyle">
          <img :src="BuildingImg" alt="" class="add-icon">
          <div class="tower-wrap" :class="buildingClass">
            <div 
              class="tower" 
              :class="{'tower-no-money': baseDataState.money < item.money}" 
              v-for="(item, index) in source.towerSource" 
              :key="index"
              @click="buildTower(index)"
            >
              <img :src="item.cover || item.img" alt="" class="tower-icon">
              <div class="tower-info">￥{{item.money}}</div>
            </div>
          </div>
        </div>
        <!-- 塔防的攻击范围 -->
        <div v-show="towerState.buildingScope.isShow" class="building-scope" :style="buildingScopeStyle">
          <span class="sale-wrap" @click="saleTower(towerState.buildingScope.towerIndex)" :style="saleTowerStyle">
            <span class="iconfont icon-ashbin"></span>
            <span class="sale-num">{{towerList[towerState.buildingScope.towerIndex] && towerList[towerState.buildingScope.towerIndex].saleMoney}}</span>
          </span>
        </div>
        <!-- 游戏底部技能区 -->
        <Skill :skillList="gameSkillState.skillList" :money="baseDataState.money" :isPause="baseDataState.isPause" @handleSkill="handleSkill" />
        <!-- 终点 -->
        <div v-if="baseDataState.terminal" class="terminal" :style="terminalStyle">
          <div class="hp">{{baseDataState.hp}}</div>
          <img class="terminal-icon" :src="HorseImg" alt="">
          <img v-show="gameSkillState.proMoney.isShow" class="money-icon" :src="SunImg" alt="" @click="proMoneyClick">
        </div>
        <!-- 游戏开始遮罩层 -->
        <div v-if="gameConfigState.isGameBeginMask" class="game-begin mask">
          <div class="info">
            <Loading v-if="!gameConfigState.loadingDone" />
            <div v-else class="begin-wrap">
              <span class="icon-wrap" @click="beginGame">
                <span class="iconfont" :class="baseDataState.isPause ? 'icon-kaishi1' : 'icon-24gf-pause2'"></span>
              </span>
              <span class="begin-text">开始游戏</span>
            </div>
          </div>
        </div>
        <!-- 游戏结束遮罩层 -->
        <div v-if="baseDataState.isGameOver" class="gameover-wrap mask">
          <div class="info">你为了保卫大司马抵御了{{baseDataState.level}}波僵尸</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang='less' scoped>
@import '@/style.less';
#protect-horse {
  .game-wrap {
    position: relative;
    display: inline-block;
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 8px;
    @size: var(--size);
    .canvas-wrap {
      position: relative;
      padding: @size;
      background-image: radial-gradient(circle 500px at center, #16d9e3 0%, #30c7ec 47%, #46aef7 100%);
      border-radius: 4px;
      overflow: hidden;
      .building-wrap {
        position: absolute;
        user-select: none;
        .add-icon {
          width: @size;
          height: @size;
        }
        .tower-wrap {
          position: absolute;
          top: calc(@size + 8px);
          left: calc(50% - (@size * 2 + @size / 2));
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(4, @size);
          grid-template-rows: repeat(2, @size);
          background: rgba(255, 255, 255, .4);
          border-radius: 16px;
          padding: 10px;
          z-index: 99;
          .tower {
            position: relative;
            width: @size;
            height: @size;
            border-radius: 8px;
            border: 2px solid #fff;
            margin-bottom: 10px;
            box-sizing: border-box;
            overflow: hidden;
            .tower-icon {
              width: 100%;
              height: 100%;
            }
            .tower-info {
              position: absolute;
              left: 0;
              right: 0;
              bottom: 0;
              text-align: center;
              font-size: calc(@size * 0.26);
              color: #fff;
              background: rgba(0, 0, 0, .4);
            }
          }
          .tower-no-money {
            opacity: .3;
          }
        }
        .tower-wrap-row {
          grid-template-rows: repeat(4, @size);
          grid-template-columns: repeat(2, @size);
          grid-auto-flow: column;
          width: auto;
          .tower {
            margin-bottom: 0;
            margin-right: 10px;
          }
        }
        .tower-wrap-row-top {
          top: calc(50% - (@size * 2 + @size / 2));
        }
        .tower-wrap-left {
          left: calc(@size + 8px);
        }
        .tower-wrap-right {
          right: calc(@size + 8px);
          left: auto;
        }
        .tower-wrap-bottom {
          bottom: calc(@size + 8px);
          top: auto;
        }
      }
      .building-scope {
        position: absolute;
        z-index: 1;
        transform: translate(-50%, -50%);
        box-sizing: border-box;
        border: 2px solid #3b9bdf;
        border-radius: 50%;
        background: rgba(255, 255, 255, .25);
        .sale-wrap {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          justify-content: center;
          align-items: center;
          // background: rgba(255, 255, 255, 0.4);
          background: #3b9bdf;
          color: #fff;
          border-radius: 8px;
          padding: 0 5px;
          cursor: pointer;
          &:hover {
            opacity: .75;
          }
          .iconfont {
            font-size: 20px;
          }
          .sale-num {
            font-size: 14px;
          }
        }
      }
      .terminal {
        position: absolute;
        user-select: none;
        cursor: pointer;
        // box-shadow: 0 0 2px 2px rgba(255, 255, 255, .3);
        .hp {
          color: #f24410;
          font-size: 18px;
          font-weight: bold;
          text-align: center;
        }
        .terminal-icon {
          display: block;
          width: calc(@size * 2.5);
        }
        .money-icon {
          position: absolute;
          top: 0;
          left: 0;
          width: calc(@size * 1.6);
          height: calc(@size * 1.6);
        }
      }
      .gameover-wrap {
        .info {
          font-size: 36px;
          font-weight: bold;
          color: #fff;
        }
      }
      .game-begin {
        .info {
          color: #fff;
          .begin-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            .icon-wrap {
              display: inline-block;
              display: flex;
              justify-content: center;
              align-items: center;
              width: calc(@size * 3);
              height: calc(@size * 3);
              border-radius: 50%;
              background-image: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
              cursor: pointer;
              user-select: none;
              &:hover {
                opacity: .95;
                box-shadow: 0 0 16px 4px #3393e7;
              }
              .iconfont {
                color: #fff;
                font-size: calc(@size * 1.6);
                animation: pulse 2s linear infinite;
              }
              @keyframes pulse {
                70% {
                  transform: scale(1.2);
                  opacity: 0.4;
                }
                100% {
                  transform: scale(1.2);
                  opacity: 0;
                }
              }
            }
            .begin-text {
              font-size: 36px;
              color: #fff;
              font-weight: bold;
              margin-top: 16px;
              letter-spacing: 8px;
              margin-left: 8px;
              user-select: none;
            }
          }
        }
      }
      .mask {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(0, 0, 0, .4);
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
@media screen and (orientation: portrait) {
  .game-wrap {
    -webkit-transform: rotate(90deg);
    -moz-transform: rotate(90deg);
    -ms-transform: rotate(90deg);
    transform: rotate(90deg);
    // transform-origin: 0% 0%;
  }
}
</style>
