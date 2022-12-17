import { EnemyStateType, TowerStateType } from '@/type/game'
import {defineStore} from 'pinia'

type StateType = {
  /** 敌人处理好的静态资源 */
  enemySource: EnemyStateType[]
  /** 塔防处理好的静态资源 */
  towerSource: TowerStateType[]
  /** 图片资源 */
  imgOnloadObj: {
    /** 地板资源 */
    floor?: HTMLImageElement
  }
  mapLevel: number
  isMobile: boolean
}

type GameDataType = {

}

export const useSourceStore = defineStore('source', {
  state: (): StateType => ({
    enemySource: [],
    towerSource: [],
    imgOnloadObj: {
      floor: undefined
    },
    mapLevel: 0,
    isMobile: false
  })
})