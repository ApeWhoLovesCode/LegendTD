import { TowerState, TowerStateType } from "@/type/game";
import _ from "lodash";
import { reactive } from "vue";

export default function useTower() {
  const towerList = reactive<TowerStateType[]>([])
  const towerState = reactive<TowerState>({
    building: { left: 0, top: 0, isShow: false },
    buildingScope: {left: 0, top: 0, r: 0, isShow: false, towerIndex: 0}
  })

  function showTowerBuilding(e: {left: number, top: number}) {
    towerState.building.isShow = true
    towerState.building.left = e.left
    towerState.building.top = e.top
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
  
  return {
    towerList,
    towerState,
    handlerTower,
    showTowerBuilding,
    hiddenTowerOperation,
  }
}
