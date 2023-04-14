import enemyData from '@/dataSource/enemyData'
import otherImgData from '@/dataSource/otherImgData'
import towerData, { TowerName } from '@/dataSource/towerData'
import { EnemyStateType, TowerStateType } from '@/type/game'
import { range } from '@/utils/format'
import { gifToStaticImg, loadImage } from '@/utils/handleImg'
import _ from 'lodash'
import { defineStore } from 'pinia'

export type TowerSource = {[key in TowerName]: TowerStateType}

export type OnloadImgKey = keyof typeof otherImgData

export type OthOnloadImg = {[key in OnloadImgKey]?: CanvasImageSource}

export type SourceStateType = {
  /** 游戏页面是否初始化完成 */
  isGameInit: boolean
  /** 游戏在进行中 */
  isGameing: boolean
  /** 敌人处理好的静态资源 */
  enemySource: EnemyStateType[]
  /** 塔防处理好的静态资源 */
  towerSource?: TowerSource
  /** 图片资源 */
  othOnloadImg: OthOnloadImg
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
  state: (): SourceStateType => ({
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
      if(this.$state.progress >= 100) {
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
      if(!this.$state.enemySource.length) {
        this.$state.enemySource = _.cloneDeep(enemyData) as unknown as EnemyStateType[]
      }
      const step = 70 / enemyData.length
      return Promise.all(enemyData.map(async (enemy, index) => {
        const item = this.$state.enemySource[index]
        if(!item.imgList.length) {
          item.imgList = await gifToStaticImg({type: enemy.type, imgSource: enemy.imgSource})
          this.$state.progress += step
        }
        return 
      }))
    },
    async handleTowerImg() {
      const arr = Object.keys(towerData) as TowerName[]
      if(!this.$state.towerSource) {
        this.$state.towerSource = _.cloneDeep(towerData) as unknown as TowerSource
      }
      const step = 20 / arr.length / 2
      return Promise.all(arr.map(async (key) => {
        const item = this.$state.towerSource![key]
        if(!item.onloadImg) {
          item.onloadImg = await loadImage(towerData[key].img)
          this.$state.progress += step
        }
        if(!item.onloadbulletImg) {
          item.onloadbulletImg = await loadImage(towerData[key].bulletImg)
          this.$state.progress += step
        }
        return
      }))
    },
    async handleOtherImg() {
      const arr = Object.keys(otherImgData) as OnloadImgKey[]
      const step = 10 / arr.length
      return Promise.all(
        arr.map(key => (
          !this.$state.othOnloadImg[key] ? loadImage(otherImgData[key]).then((img) => {
            this.$state.othOnloadImg[key] = img
            this.$state.progress += step
          }) : ''
        ))
      )
    }
  }
})