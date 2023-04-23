import { TowerSlow } from "@/dataSource/towerData"
import { EnemyState, EnemyStateType } from "@/type/game"
import keepInterval, { KeepIntervalKey } from "@/utils/keepInterval"
import _ from "lodash"

const enemyList: EnemyStateType[] = []
const enemyState: EnemyState = {
  levelEnemy: [],
  createdEnemyNum: 0,
  // 敌人的移动轨迹 x坐标, y坐标, x_y(方向): 1:左 2:下 3:右 4:上
  movePath: [],
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

export {
  enemyList,
  enemyState,
  slowEnemy,
}

