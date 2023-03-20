import enemyData from '@/dataSource/enemyData'
import otherImgData from '@/dataSource/otherImgData'
import towerData, { TowerName } from '@/dataSource/towerData'
import { EnemyStateType, TowerStateType } from '@/type/game'
import { range } from '@/utils/format'
import { gifToStaticImg, loadImage } from '@/utils/handleImg'
import _ from 'lodash'
import {defineStore} from 'pinia'

type TowerSource = {[key in TowerName]: TowerStateType}

type StateType = {
  /** 游戏页面是否初始化完成 */
  isGameInit: boolean
  /** 游戏在进行中 */
  isGameing: boolean
  /** 敌人处理好的静态资源 */
  enemySource: EnemyStateType[]
  /** 塔防处理好的静态资源 */
  towerSource?: TowerSource
  /** 图片资源 */
  othOnloadImg: {
    /** 地板 */
    floor?: HTMLImageElement
    /** 金币 */
    goldCoin?: HTMLImageElement
    /** 减速雪花 */
    snow?: HTMLImageElement
  }
  /** 当前选择的地图 */
  mapLevel: number
  /** 是否是手机 */
  isMobile: boolean
  /** 清晰度倍数，用于 canvas 提高清晰度 */
  ratio: number
  /** 进度 */
  progress: number
}

export const useSourceStore = defineStore('source', {
  state: (): StateType => ({
    isGameInit: false,
    isGameing: false,
    enemySource: [],
    towerSource: void 0,
    othOnloadImg: {},
    mapLevel: 0,
    isMobile: false,
    ratio: 1,
    progress: 0,
  }),
  actions: {
    async loadingAllImg() {
      if(this.$state.progress === 100) {
        return
      }
      return Promise.all([
        this.handleOtherImg(),
        this.handleEnemyImg(), 
        this.handleTowerImg(),
      ]).then(() => {
        this.$state.progress = range(this.$state.progress, 0, 100)
      })
    },
    async handleEnemyImg() {
      this.$state.enemySource = _.cloneDeep(enemyData) as unknown as EnemyStateType[]
      const step = 70 / enemyData.length
      return Promise.all(enemyData.map(async (item, index) => {
        this.$state.enemySource[index].imgList = await gifToStaticImg({type: item.type, imgSource: item.imgSource})
        this.$state.progress += step
        return 
      }))
    },
    async handleTowerImg() {
      const arr = Object.keys(towerData) as TowerName[]
      this.$state.towerSource = _.cloneDeep(towerData) as unknown as TowerSource
      const step = 20 / arr.length
      return Promise.all(arr.map(async (key, index) => {
        this.$state.towerSource![key].onloadImg = await loadImage(towerData[key].img)
        this.$state.towerSource![key].onloadbulletImg = await loadImage(towerData[key].bulletImg)
        this.$state.progress += step
        return
      }))
    },
    async handleOtherImg() {
      const step = 10 / Object.keys(otherImgData).length
      return Promise.all([
        loadImage(otherImgData.floor[0]).then(res => {
          this.$state.othOnloadImg.floor = res
          this.$state.progress += step
        }),
        loadImage(otherImgData.goldCoin).then(res => {
          this.$state.othOnloadImg.goldCoin = res
          this.$state.progress += step
        }),
        loadImage(otherImgData.snow).then(res => {
          this.$state.othOnloadImg.snow = res
          this.$state.progress += step
        }),
      ])
    }
  }
})