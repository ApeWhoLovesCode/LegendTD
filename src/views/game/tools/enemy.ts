import { EnemyState, EnemyStateType } from "@/type/game"
import { reactive } from "vue"

const enemyList = reactive<EnemyStateType[]>([])
const enemyState = reactive<EnemyState>({
  levelEnemy: [],
  createdEnemyNum: 0,
  // 敌人的移动轨迹 x坐标, y坐标, x_y(方向): 1:左 2:下 3:右 4:上
  movePath: [],
})

export {
  enemyList,
  enemyState
}