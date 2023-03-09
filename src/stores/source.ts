import enemyData from '@/dataSource/enemyData'
import otherImgData from '@/dataSource/otherImgData'
import towerData from '@/dataSource/towerData'
import { EnemyStateType, TowerStateType } from '@/type/game'
import { range } from '@/utils/format'
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
  /** 进度 */
  progress: number
}

export const useSourceStore = defineStore('source', {
  state: (): StateType => ({
    isGameInit: false,
    enemySource: [],
    towerSource: [],
    othOnloadImg: {},
    mapLevel: 0,
    isMobile: false,
    progress: 0,
  }),
  actions: {
    async loadingAllImg() {
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
      this.$state.towerSource = _.cloneDeep(towerData) as unknown as TowerStateType[]
      const step = 20 / towerData.length
      return Promise.all(towerData.map(async (t, index) => {
        this.$state.towerSource[index].onloadImg = await loadImage(t.img)
        this.$state.towerSource[index].onloadbulletImg = await loadImage(t.bulletImg)
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