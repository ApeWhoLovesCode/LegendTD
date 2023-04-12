import enemyData from "@/dataSource/enemyData"
import otherImgData from "@/dataSource/otherImgData"
import towerData, { TowerName } from "@/dataSource/towerData"
import { EnemyStateType } from "@/type/game"
import { range } from "@/utils/format"
import { gifToStaticImgWorker, loadImageWorker } from "@/utils/handleImg"
import _ from "lodash"
import { OnloadImgKey, SourceStateType, TowerSource } from "./source"

export type SourceClassType = {
  state: SourceStateType
  loadingAllImg: () => Promise<void>
  handleEnemyImg: () => Promise<void[]>
  handleTowerImg: () => Promise<void[]>
  handleOtherImg: () => Promise<(void | "")[]>
}

class SourceClass {
  public state: SourceStateType = {
    isGameInit: false,
    isGameing: false,
    enemySource: [],
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
  public async loadingAllImg() {
    if(this.state.progress >= 100) {
      return
    }
    return Promise.all([
      this.handleOtherImg(),
      this.handleEnemyImg(), 
      // this.handleTowerImg(),
    ]).then(() => {
      this.state.progress = range(this.state.progress, 0, 100)
    })
  }
  public async handleEnemyImg() {
    if(!this.state.enemySource.length) {
      this.state.enemySource = _.cloneDeep(enemyData) as unknown as EnemyStateType[]
    }
    const step = 70 / enemyData.length
    return Promise.all(enemyData.map(async (enemy, index) => {
      const item = this.state.enemySource[index]
      if(!item.imgList.length) {
        item.imgList = await gifToStaticImgWorker({type: enemy.type, imgSource: enemy.imgSource})
        this.state.progress += step
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
 