import enemyData from "@/dataSource/enemyData"
import otherImgData, { OnloadImgKey } from "@/dataSource/otherImgData"
import towerData, { TowerName } from "@/dataSource/towerData"
import { EnemyStateType } from "@/type/game"
import { range } from "@/utils/format"
import { gifToStaticImgList, loadImageWorker } from "@/utils/handleImg"
import _ from "lodash"
import { SourceStateType, TowerSource } from "./source"

export type SourceClassType = {
  state: SourceStateType
  loadingAllImg: (fn: (progress: number) => void) => Promise<number>
  handleEnemyImg: (fn: (progress: number) => void) => Promise<void[]>
  handleTowerImg: () => Promise<void[]>
  handleOtherImg: () => Promise<(void | "")[]>
}

class SourceClass {
  public state: SourceStateType = {
    isGameInit: false,
    isGameing: false,
    enemySource: [],
    enemyImgSource: {},
    towerSource: void 0,
    othOnloadImg: {},
    mapLevel: 0,
    isMobile: false,
    ratio: 1,
    progress: 0,
  }
  static _instance: SourceClassType
  static get instance(){
    if(!this._instance){
      this._instance = new SourceClass()
    }
    return this._instance
  }
  public async loadingAllImg(fn: (progress: number) => void) {
    if(this.state.progress >= 100) {
      return 100
    }
    return Promise.all([
      this.handleOtherImg().then(() => {
        fn(this.state.progress)
      }),
      this.handleEnemyImg(fn).then(() => {
        fn(this.state.progress)
      }), 
      this.handleTowerImg().then(() => {
        fn(this.state.progress)
      }),
    ]).then(() => {
      this.state.progress = 100
      fn(this.state.progress)
      return this.state.progress
    })
  }
  public async handleEnemyImg(fn: (progress: number) => void) {
    if(!this.state.enemySource.length) {
      this.state.enemySource = _.cloneDeep(enemyData) as unknown as EnemyStateType[]
    }
    const step = 70 / enemyData.length
    return Promise.all(enemyData.map(async (enemy) => {
      const item = this.state.enemyImgSource[enemy.name]
      if(!item?.imgList?.length && !item?.img) {
        if(enemy.imgType === 'gif') {
          const imgList = await gifToStaticImgList(enemy.imgSource, true)
          this.state.enemyImgSource[enemy.name] = {imgList}
        } else {
          const img = await loadImageWorker(enemy.imgSource)
          this.state.enemyImgSource[enemy.name] = {img}
        }
        this.state.progress += step
        fn(this.state.progress)
      }
      return 
    }))
  }
  public async handleTowerImg() {
    const arr = Object.keys(towerData) as TowerName[]
    if(!this.state.towerSource) {
      this.state.towerSource = _.cloneDeep(towerData) as unknown as TowerSource
    }
    const step = 20 / arr.length / 2
    return Promise.all(arr.map(async (key) => {
      const item = this.state.towerSource![key]
      if(!item.onloadImg) {
        item.onloadImg = await loadImageWorker(towerData[key].img)
        this.state.progress += step
      }
      if(!item.onloadbulletImg) {
        item.onloadbulletImg = await loadImageWorker(towerData[key].bulletImg)
        this.state.progress += step
      }
      return
    }))
  }
  public async handleOtherImg() {
    const arr = Object.keys(otherImgData) as OnloadImgKey[]
    const step = 10 / arr.length
    return Promise.all(
      arr.map(key => (
        !this.state.othOnloadImg[key] ? loadImageWorker(otherImgData[key]).then((img) => {
          this.state.othOnloadImg[key] = img
          this.state.progress += step
        }) : ''
      ))
    )
  }
}

export default SourceClass.instance
 