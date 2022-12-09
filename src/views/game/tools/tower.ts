import { TowerState, TowerStateType } from "@/type/game";
import { reactive } from "vue";

const towerList = reactive<TowerStateType[]>([])
const towerState = reactive<TowerState>({
  building: { left: 0, top: 0, isShow: false },
  buildingScope: {left: 0, top: 0, r: 0, isShow: false, towerIndex: 0}
})

export {
  towerList,
  towerState
}