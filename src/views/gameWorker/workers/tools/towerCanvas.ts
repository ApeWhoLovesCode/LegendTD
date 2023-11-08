import { HandleEnemyTowerImgParams } from "@/stores/sourceInstance"
import { setting } from "./baseData"

/** 展示封面，按需加载的参数 */
export function getLoadingAllImgParams(): HandleEnemyTowerImgParams | undefined {
  if(setting.isTowerCover) {
    return {
      enemyNameList: setting.enemyList?.map(e => e.enemyName) ?? [], 
      towerList: setting.towerList
    }
  }
}