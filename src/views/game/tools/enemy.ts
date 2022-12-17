import { EnemyType } from "@/dataSource/enemyData"
import { TowerSlowType } from "@/dataSource/towerData"
import { useSourceStore } from "@/stores/source"
import { EnemyState, EnemyStateType } from "@/type/game"
import keepInterval from "@/utils/keepInterval"
import { limitRange } from "@/utils/tools"
import _ from "lodash"
import { reactive } from "vue"
import { createAudio, playAudio, playDomAudio, removeAudio } from "./audioState"
import { baseDataState } from "./baseData"
import { baseInfoState } from "./baseInfo"
import { gameConfigState } from "./gameConfig"
import { towerList } from "./tower"

const enemyList = reactive<EnemyStateType[]>([])
const enemyState = reactive<EnemyState>({
  levelEnemy: [],
  createdEnemyNum: 0,
  // 敌人的移动轨迹 x坐标, y坐标, x_y(方向): 1:左 2:下 3:右 4:上
  movePath: [],
})
const source = useSourceStore()

/** 画敌人 */
function drawEnemy(index: number) {
  if(!enemyList[index]) return
  const { x, y, w, h, imgList, imgIndex, hp, curSpeed, speed } = enemyList[index]
  // 翻转图片
  // ctx.translate(200, 0);
  // imgList[imgIndex].scale(-1, 1)
  gameConfigState.ctx.drawImage(imgList[imgIndex], x, y, w, h) 
  // 绘画减速效果
  if(curSpeed !== speed) {
    gameConfigState.ctx.beginPath();
    gameConfigState.ctx.arc(x + w / 2, y + h / 2, w / 5, 0, 2 * Math.PI, false)
    gameConfigState.ctx.fillStyle = 'rgba(2, 38, 241, 0.3)'
    gameConfigState.ctx.fill()
    gameConfigState.ctx.strokeStyle = '#022ef1'
    gameConfigState.ctx.stroke()
  }
  if(hp.cur === hp.sum) return
  // 绘画生命值
  const w_2 = w - hp.size
  gameConfigState.ctx.fillStyle = '#0066a1'
  gameConfigState.ctx.fillRect(x, y - hp.size, w_2, hp.size)
  gameConfigState.ctx.fillStyle = '#49ca00'
  gameConfigState.ctx.fillRect(x, y - hp.size,  w_2 * hp.cur / hp.sum, hp.size)
  // 画边框
  gameConfigState.ctx.beginPath();
  gameConfigState.ctx.lineWidth = 1;
  gameConfigState.ctx.strokeStyle = "#cff1d3"; //边框颜色
  gameConfigState.ctx.rect(x, y - hp.size, w_2, hp.size);  //透明无填充
  gameConfigState.ctx.stroke();
}

/** 减速敌人 t_slow: {num: 减速倍速(当为0时无法动), time: 持续时间} */
function slowEnemy(e_id: string, t_slow: TowerSlowType) {
  const e_i = enemyList.findIndex(e => e.id === e_id)
  const { speed: e_speed, curSpeed } = enemyList[e_i]
  // 当前已经被眩晕了不能减速了
  if(curSpeed === 0) return
  // 新增或重置减速定时器
  keepInterval.set(`slow-${e_id}`, () => {
    const newE_i = enemyList.findIndex(e => e.id === e_id)
    if(enemyList[newE_i]) {
      enemyList[newE_i].curSpeed = e_speed
    }
    keepInterval.delete(`slow-${e_id}`)
  }, t_slow.time)
  // 减速敌人
  const newSpeed = t_slow.num ? e_speed / t_slow.num : t_slow.num
  if(newSpeed < curSpeed) {
    enemyList[e_i].curSpeed = newSpeed
  }
}

/** 生成敌人 */
function setEnemy() {
  const enemyItemSource = _.cloneDeep(source.enemySource[enemyState.levelEnemy[enemyState.createdEnemyNum]])
  const size = baseDataState.gridInfo.size
  const {audioKey, name, h} = enemyItemSource
  // 设置敌人的初始位置
  const id = Date.now()
  const enemyItem: EnemyStateType = {...enemyItemSource, id: audioKey + id}
  const {x, y} = baseInfoState.mapGridInfoItem
  enemyItem.x = x
  enemyItem.y = y - (size - (size * 2 - h - baseDataState.offset.y))
  enemyList.push(enemyItem)
  enemyState.createdEnemyNum++
  handleEnemySkill(name, enemyItem.id)
  createAudio(audioKey, String(id))
}

/** 敌人移动 */
function moveEnemy(index: number) {
  const { w, h, curSpeed, speed, curFloorI, id } = enemyList[index]
  // 敌人到达终点
  if(curFloorI === baseDataState.floorTile.num - 1) {
    removeEnemy([id])
    baseInfoState.hp -= 1
    playAudio('ma-nansou', 'End')
    return true
  }
  const size = baseDataState.gridInfo.size
  // 将格子坐标同步到敌人的坐标
  const { x, y, x_y } = enemyState.movePath[curFloorI]
  // 敌人需要站在地板中间区域
  const _y = y - (size - (size * 2 - h - baseDataState.offset.y))
  const _x = x - (w - size)
  switch (x_y) {
    case 1: enemyList[index].x -= curSpeed; break;
    case 2: enemyList[index].y -= curSpeed; break;
    case 3: enemyList[index].x += curSpeed; break;
    case 4: enemyList[index].y += curSpeed; break;
  }
  const { x: eX, y: eY } = enemyList[index]
  // 敌人到达下一个格子
  if((eX >= _x &&  eX <= _x + speed) && (eY >= _y &&  eY <= _y + speed)) {
    enemyList[index].curFloorI++
  }
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
  playDomAudio(id, volume)
}

/** 召唤敌人的处理 */
function callEnemy(newEnemy: EnemyType, i: number) {
  const size = baseDataState.gridInfo.size
  const { curFloorI, w, h, audioKey } = newEnemy
  const { x, y } = enemyState.movePath[curFloorI - 1]
  const id = Date.now() + i
  const _newEnemy: EnemyStateType = {id: audioKey + id, ...newEnemy}
  _newEnemy.x = x - (w - size)
  _newEnemy.y = y - (size - (size * 2 - h - baseDataState.offset.y))
  return _newEnemy
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

export {
  enemyList,
  enemyState,
  drawEnemy,
  setEnemy,
  moveEnemy,
  removeEnemy,
  slowEnemy,
}
