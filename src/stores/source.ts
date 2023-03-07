import { EnemyStateType, TowerStateType } from '@/type/game'
import {defineStore} from 'pinia'

type StateType = {
  /** 游戏页面是否初始化完成 */
  isGameInit: boolean
  /** 敌人处理好的静态资源 */
  enemySource: EnemyStateType[]
  /** 塔防处理好的静态资源 */
  towerSource: TowerStateType[]
  /** 图片资源 */
  imgOnloadObj: {
    /** 地板资源 */
    floor?: HTMLImageElement
  }
  /** 当前选择的地图 */
  mapLevel: number
  /** 是否是手机 */
  isMobile: boolean
}

export const useSourceStore = defineStore('source', {
  state: (): StateType => ({
    isGameInit: false,
    enemySource: [],
    towerSource: [],
    imgOnloadObj: {
      floor: undefined
    },
    mapLevel: 0,
    isMobile: false,
  })
})