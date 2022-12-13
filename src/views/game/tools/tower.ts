import { BulletType, TargetInfo, TowerState, TowerStateType } from "@/type/game";
import { reactive } from "vue";
import { createAudio, playDomAudio, removeAudio } from "./audioState";
import { baseDataState, powAndSqrt } from "./baseData";
import { baseInfoState } from "./baseInfo";
import { enemyList, removeEnemy, slowEnemy } from "./enemy";
import { gameConfigState } from "./gameConfig";

const towerList = reactive<TowerStateType[]>([])
const towerState = reactive<TowerState>({
  building: { left: 0, top: 0, isShow: false },
  buildingScope: {left: 0, top: 0, r: 0, isShow: false, towerIndex: 0}
})

/** 点击获取鼠标位置 操作塔防 */
function getMouse(e: MouseEvent) {
  e.stopPropagation()
  const size = baseDataState.gridInfo.size
  const _x = e.x - gameConfigState.canvasInfo.left, _y = e.y - gameConfigState.canvasInfo.top
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
  const { rate, money, audioKey } = props.towerSource[index]
  if(baseInfoState.money < money) return
  baseInfoState.money -= money
  const {left: x, top: y} = towerState.building
  const size = baseDataState.gridInfo.size
  // 将该塔防数据放入场上塔防数组中
  // 射击的防抖函数
  const shootFun = _.throttle((eIdList, t_i) => {
    shootBullet(eIdList, t_i)
  }, rate, { leading: true, trailing: false })
  // 处理多个相同塔防的id值
  const id = Date.now()
  const tower: TowerStateType = {x, y, id: audioKey + id, shootFun, targetIndexList: [], bulletArr: [], ...props.towerSource[index], onloadImg: props.towerOnloadImg[index], onloadbulletImg: props.towerBulletOnloadImg[index]}
  towerList.push(tower)
  // 用于标记是哪个塔防 10 + index
  baseDataState.gridInfo.arr[y / size][x / size] = 10 + index
  drawTower(tower)
  createAudio(audioKey, String(id))
}
/** 画塔防 */
function drawTower(item?: TowerStateType) {
  const size = baseDataState.gridInfo.size
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
  const size = baseDataState.gridInfo.size
  const {x, y, saleMoney, id} = towerList[index]
  gameConfigState.ctx.clearRect(x, y, size, size);
  baseDataState.gridInfo.arr[y / size][x / size] = 0
  baseInfoState.money += saleMoney
  removeAudio(id)
  towerList.splice(index, 1)
}
/** 点击背景 隐藏塔防 */
function hiddenTowerOperation() {
  if(towerState.building.isShow) towerState.building.isShow = false
  if(towerState.buildingScope.isShow) towerState.buildingScope.isShow = false
}
/** 处理塔防 */
function handlerTower(x: number, y: number) {
  // 当前点击的是哪个塔防
  const towerIndex = towerList.findIndex(item => item.x === x && item.y === y)
  const {x:left, y:top, r} = towerList[towerIndex]
  // 展示攻击范围
  towerState.buildingScope = {isShow: true, left, top, r, towerIndex}
}

/** 发射子弹  enemy:敌人索引数组，t_i:塔索引 */
function shootBullet(eIdList: string[], t_i: number) {
  // 添加攻击目标的索引
  towerList[t_i].targetIndexList = eIdList
  for(const e_id of eIdList) {
    const enemy = enemyList.find(e => e.id === e_id)
    if(!enemy) break
    const {x, y, w, h} = enemy
    // 敌人中心坐标
    const _x = x + w / 2, _y = y + h / 2
    const {x: t_x, y: t_y, speed, name, id, isThrough } = towerList[t_i]
    const size_2 = baseDataState.gridInfo.size / 2
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
    towerList[t_i].bulletArr.push(bullet)
    if(name === 'PDD') {
      playDomAudio(id, 0.4)
    }
  }
}

/** 画并处理子弹 */
function drawAndMoveBullet() {
  const e_idList = []
  for(const t_i in towerList) {
    const t = towerList[t_i]
    for(let b_i = t.bulletArr.length - 1; b_i >= 0; b_i--) {
      const {w, h} = t.bSize
      // 当前塔防的当前子弹
      const bItem = t.bulletArr[b_i]
      let {x, y, addX, addY, e_id, attactIdSet} = bItem
      // 重新计算子弹离敌人的距离
      const b_e_distance = bulletEnemyDistance(e_id, +t_i, b_i)
      if(b_e_distance) {
        const {addX: _addX, addY: _addY, xy} = b_e_distance
        addX = _addX, addY = _addY
        bItem.addX = _addX
        bItem.addY = _addY
        bItem.x_y = xy
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
            baseInfoState.money += enemy.reward
            e_idList.push(e_id)
            t.targetIndexList.splice(t.targetIndexList.findIndex(item => item === e_id), 1)
            if(t.name === '茄子') {
              playDomAudio(t.id)
            }
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
        gameConfigState.ctx.drawImage(t.onloadbulletImg, x - w / 2, y - h / 2, w, h)
      }
      // 清除穿透性子弹
      if(t.isThrough && checkThroughBullet({x,y,w,h})) {
        t.bulletArr.splice(b_i, 1)
      }
    }
  }
  // 消灭敌人
  if(e_idList.length) {
    removeEnemy(e_idList)
  }
}

/** 
 * 计算子弹和敌人的距离
 * 返回 x,y方向需要增加的值， xy: 塔和敌人的距离
 */
 function bulletEnemyDistance(e_id: string, t_i: number, b_i: number) {
  const enemy = enemyList.find(e => e.id === e_id)
  // 敌人已经死了 或者 是能穿透的子弹，不用覆盖之前的值了 
  if(!enemy || towerList[t_i].isThrough) return
  const size_2 = baseDataState.gridInfo.size / 2
  const {x, y, w, h} = enemy
  // 敌人中心坐标
  const _x = x + w / 2, _y = y + h / 2
  const { speed, bulletArr, x: tx, y: ty } = towerList[t_i]
  // 两坐标间的差值
  const diff = {x: _x - bulletArr[b_i].x, y: _y - bulletArr[b_i].y}
  // 子弹和敌人的距离
  const distance = powAndSqrt(diff.x, diff.y)
  return {
    addX: speed * diff.x / distance, addY: speed * diff.y / distance, xy: powAndSqrt(_x - (tx + size_2), _y - (ty + size_2))
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

export {
  towerList,
  towerState,
  getMouse,
  drawTower,
  buildTower,
  saleTower,
  shootBullet,
  drawAndMoveBullet,
  hiddenTowerOperation,
}