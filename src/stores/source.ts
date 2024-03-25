import enemyData from '@/dataSource/enemyData'
import otherImgData, { OnloadImgKey } from '@/dataSource/otherImgData'
import towerData from '@/dataSource/towerData'
import { EnemyName, TowerName } from '@/type'
import { EnemyStateType, TowerStateType } from '@/type'
import { gifToStaticImgList, loadImage } from '@/utils/handleImg'
import { isMobile } from '@/utils/tools'
import { SourceImgObj } from 'lhh-utils'
import _ from 'lodash'
import { defineStore } from 'pinia'

export type EnemySource = {[key in EnemyName]: EnemyStateType}
export type TowerSource = {[key in TowerName]: TowerStateType}

export type OthOnloadImg = {[key in OnloadImgKey]?: CanvasImageSource}

export type SourceImgItem = {list: SourceImgObj[], total: number}

export type SourceStateType = {
  /** 游戏页面是否初始化完成 */
  isGameInit: boolean
  /** 游戏在进行中 */
  isGameing: boolean
  /** 敌人处理好的静态资源 */
  enemySource?: EnemySource
  /** 敌人加载完成的图片资源 */
  enemyImgSource: {
    [key in string]: {
      img?: HTMLImageElement | ImageBitmap
      imgList?: SourceImgObj[]
      /** 技能图片 */
      skill?: SourceImgItem
      /** 死亡图片 */
      die?: SourceImgItem
    }
  }
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
    enemySource: void 0,
    enemyImgSource: {},
    towerSource: void 0,
    othOnloadImg: {},
    mapLevel: 0,
    isMobile: !!isMobile(),
    ratio: window.devicePixelRatio ?? 1,
    progress: 0,
  }),
  actions: {
    async loadingAllImg() {
      if(this.$state.progress >= 100) {
        return
      }
      return Promise.all([
        this.loadMapImg(),
        this.handleTowerImg(),
      ]).then(() => {
        this.$state.progress = 100
      })
      // return Promise.all([
      //   this.handleOtherImg(),
      //   this.handleEnemyImg(), 
      //   this.handleTowerImg(),
      // ]).then(() => {
      //   this.$state.progress = 100
      // })
    },
    async handleEnemyImg() {
      const arr = Object.keys(enemyData) as EnemyName[]
      if(!this.$state.enemySource) {
        this.$state.enemySource = _.cloneDeep(enemyData) as unknown as EnemySource
      }
      const step = 70 / arr.length
      return Promise.all(arr.map(async (enemyName) => {
        const enemy = this.$state.enemySource![enemyName]
        const item = this.$state.enemyImgSource[enemy.name]
        if(!item?.imgList?.length && !item?.img) {
          if(enemy.imgType === 'gif') {
            const imgList = await gifToStaticImgList(enemy.imgSource, true)
            this.$state.enemyImgSource[enemy.name] = {imgList}
          } else {
            const img = await loadImage(enemy.imgSource)
            this.$state.enemyImgSource[enemy.name] = {img}
          }
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
      const step = 80 / arr.length / 2
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
    },
    /** 仅加载地图需要的图片就够了，其他的都是worker中获取的。 */
    async loadMapImg() {
      const arr: OnloadImgKey[] = ['floor']
      const step = 20 / arr.length
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