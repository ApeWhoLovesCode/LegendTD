import enemyData from '@/dataSource/enemyData'
import floorData from '@/dataSource/floorData'
import towerData from '@/dataSource/towerData'
import { EnemyStateType, TowerStateType } from '@/type/game'
import { gifToStaticImg, loadImage } from '@/utils/handleImg'
import _ from 'lodash'
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
  }),
  actions: {
    async loadingAllImg() {
      return Promise.all([
        this.handleFloorImg(),
        this.handleEnemyImg(), 
        this.handleTowerImg(),
      ]).then(() => {

      })
    },
    async handleEnemyImg() {
      this.$state.enemySource = _.cloneDeep(enemyData) as unknown as EnemyStateType[]
      return Promise.all(enemyData.map(async (item, index) => {
        this.$state.enemySource[index].imgList = await gifToStaticImg({type: item.type, imgSource: item.imgSource})
        // state.progress += progressStep.value
        return 
      })).then(() => {})
    },
    async handleTowerImg() {
      this.$state.towerSource = _.cloneDeep(towerData) as unknown as TowerStateType[]
      return Promise.all(towerData.map(async (t, index) => {
        this.$state.towerSource[index].onloadImg = await loadImage(t.img)
        this.$state.towerSource[index].onloadbulletImg = await loadImage(t.bulletImg)
        return
      })).then(() => {})
    },
    async handleFloorImg() {
      const res = await loadImage(floorData[0])
      this.$state.imgOnloadObj.floor = res
    }
  }
})