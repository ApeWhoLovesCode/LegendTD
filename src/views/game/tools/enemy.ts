import { TowerSlowType } from "@/dataSource/towerData"
import { EnemyState, EnemyStateType } from "@/type/game"
import keepInterval from "@/utils/keepInterval"
import _ from "lodash"
import { reactive } from "vue"

export default function useEnemy() {
  const enemyList = reactive<EnemyStateType[]>([])
  const enemyState = reactive<EnemyState>({
    levelEnemy: [],
    createdEnemyNum: 0,
    // 敌人的移动轨迹 x坐标, y坐标, x_y(方向): 1:左 2:下 3:右 4:上
    movePath: [],
  })
  
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
  
  return {
    enemyList,
    enemyState,
    slowEnemy,
  }
  
}

