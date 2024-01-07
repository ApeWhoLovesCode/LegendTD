import { TowerState } from "@/type";
import _ from "lodash";
import { reactive } from "vue";

export default function useTower() {
  const towerState = reactive<TowerState>({
    building: { left: 0, top: 0, isShow: false },
    buildingScope: {left: 0, top: 0, r: 0, isShow: false, towerId: '', saleMoney: 0}
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
  
  return {
    towerState,
    showTowerBuilding,
    hiddenTowerOperation,
  }
}
