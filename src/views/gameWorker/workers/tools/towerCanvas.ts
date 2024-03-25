import { HandleEnemyTowerImgParams } from "@/stores/sourceInstance"
import { setting } from "./baseData"

/** 展示封面，按需加载的参数 */
export function getLoadingAllImgParams(): HandleEnemyTowerImgParams | undefined {
  if(setting.isTowerCover) {
    const enemyNameList = setting.enemyList?.map(e => e.enemyName) ?? []
    // 处理舞王和弗利萨的召唤僵尸
    if(enemyNameList.includes('zombie-dance') && !enemyNameList.includes('dance-little')) {
      enemyNameList.push('dance-little')
    }
    if(enemyNameList.includes('fulisha') && !enemyNameList.includes('zombie-little')) {
      enemyNameList.push('zombie-little')
    }
    return {
      enemyNameList: enemyNameList, 
      towerList: setting.towerList
    }
  }
}