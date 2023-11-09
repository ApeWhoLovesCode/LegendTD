import enemyData from "@/dataSource/enemyData"
import otherImgData, { OnloadImgKey } from "@/dataSource/otherImgData"
import towerData from "@/dataSource/towerData"
import { gifToStaticImgList, loadImageWorker } from "@/utils/handleImg"
import _ from "lodash"
import { EnemySource, SourceStateType, TowerSource } from "./source"
import { EnemyDataObj, EnemyName, TowerCanvasTower, TowerDataObj, TowerName } from "@/type"

export type HandleEnemyTowerImgParams = {
  towerList: TowerCanvasTower[]
  enemyNameList: EnemyName[]
}

export type SourceClassType = {
  state: SourceStateType
  loadingAllImg: (fn: (progress: number) => void, params?: HandleEnemyTowerImgParams) => Promise<number>
  handleEnemyImg: (fn: (progress: number) => void) => Promise<void[]>
  handleTowerImg: () => Promise<void[]>
  handleOtherImg: () => Promise<(void | "")[]>
}

class SourceClass {
  public state: SourceStateType = {
    isGameInit: false,
    isGameing: false,
    enemySource: void 0,
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
  public async loadingAllImg(fn: (progress: number) => void, params?: HandleEnemyTowerImgParams) {
    if(this.state.progress >= 100) {
      return 100
    }
    return Promise.all([
      this.handleOtherImg().then(() => {
        fn(this.state.progress)
      }),
      this.handleEnemyImg(fn, params?.enemyNameList).then(() => {
        fn(this.state.progress)
      }), 
      this.handleTowerImg(params?.towerList).then(() => {
        fn(this.state.progress)
      }),
    ]).then(() => {
      this.state.progress = 100
      fn(this.state.progress)
      return this.state.progress
    })
  }
  /** 
   * @param fn 敌人加载的回调
   * @param enemyNameList 只加载指定的敌人
   */
  public async handleEnemyImg(fn: (progress: number) => void, enemyNameList?: EnemyName[]) {
    const _enemyData = enemyNameList?.reduce((pre, enemyName) =>({...pre, [enemyName]: enemyData[enemyName]}), {} as EnemyDataObj) ?? enemyData
    const arr = Object.keys(_enemyData) as EnemyName[]
    if(!this.state.enemySource) {
      this.state.enemySource = _.cloneDeep(_enemyData) as unknown as EnemySource
    }
    const step = 70 / arr.length
    return Promise.all(arr.map(async (enemyName) => {
      const item = this.state.enemyImgSource[enemyName]
      const enemy = this.state.enemySource![enemyName]
      if(!item?.imgList?.length && !item?.img) {
        if(enemy.imgType === 'gif') {
          const imgList = await gifToStaticImgList(enemy.imgSource, true)
          this.state.enemyImgSource[enemy.name] = {imgList}
        } else {
          const img = await loadImageWorker(enemy.imgSource)
          this.state.enemyImgSource[enemy.name] = {img}
        }
        if(enemy.skill?.img) { // 加载敌人技能图片
          const list = await gifToStaticImgList(enemy.skill.img, true)
          this.state.enemyImgSource[enemy.name].skill = {list, total: list.reduce((pre, cur) => pre += cur.delay, 0)}
        }
        if(enemy.dieImg) { // 加载敌人死亡图片
          const list = await gifToStaticImgList(enemy.dieImg, true)
          if(enemy.name === 'zombie-boom') { // 爆炸gif最后两帧是多了的
            list.pop()
            list.pop()
          }
          this.state.enemyImgSource[enemy.name].die = {list, total: list.reduce((pre, cur) => pre += cur.delay, 0)}
        }
        this.state.progress += step
        fn(this.state.progress)
      }
      return 
    }))
  }
  /** 
   * @param towerList 只加载指定的塔防
   */
  public async handleTowerImg(towerList?: TowerCanvasTower[]) {
    const _towerData = towerList?.reduce((pre, t) => {
      const tower = JSON.parse(JSON.stringify((towerData[t.towerName])))
      tower.x = t.x
      tower.y = t.y
      pre[t.towerName] = tower
      return pre
    }, {} as TowerDataObj) ?? towerData
    const arr = Object.keys(_towerData) as TowerName[]
    if(!this.state.towerSource) {
      this.state.towerSource = _.cloneDeep(_towerData) as unknown as TowerSource
    }
    const step = 20 / arr.length / 2
    return Promise.all(arr.map(async (key) => {
      const item = this.state.towerSource![key]
      if(!item.onloadImg) {
        item.onloadImg = await loadImageWorker(_towerData[key].img)
        this.state.progress += step
      }
      if(!item.onloadbulletImg) {
        item.onloadbulletImg = await loadImageWorker(_towerData[key].bulletImg)
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
 