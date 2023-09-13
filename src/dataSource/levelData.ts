import levelEnemyArr from '@/dataSource/levelEnemyArr';
import mapData, { DirectionType, MapGridInfo, mapGridInfoList, othMapData } from './mapData';
import { BuildTowerParams } from '@/views/gameWorker/workers/type/tower';

export enum LevelDataItemEnum {
  /** 正常关卡 */
  Normal = "Normal",
  /** 体验关卡 */
  Experience = "Experience",
  /** 无尽模式 */
  Endless = "Endless",
}

const levelData: LevelDataItem[] = [
  // 体验关卡
  {
    type: LevelDataItemEnum.Experience,
    typeIndex: 0,
    enemyArr: levelEnemyArr[0],
    mapData: othMapData.experience[0].mapData,
    mapGridInfo: othMapData.experience[0].mapGridInfo,
    // towerArr: [
    //   {tname: 'aixi', x: }
    // ]
  },
]

// 正常关卡
for(let initI = levelData.length, i = 0; i < initI + mapData.length; i++) {
  const item: LevelDataItem = {
    type: LevelDataItemEnum.Normal,
    enemyArr: levelEnemyArr[0],
    mapData: mapData[i],
    mapGridInfo: mapGridInfoList[i],
  }
  levelData[initI + i] = item
}

// 无尽模式
levelData.push({
  type: LevelDataItemEnum.Endless,
  typeIndex: 0,
  enemyArr: levelEnemyArr[0],
  mapData: othMapData.endless[0].mapData,
  mapGridInfo: othMapData.endless[0].mapGridInfo,
})


export default levelData

export const levelNullItem: LevelDataItem = {
  type: LevelDataItemEnum.Normal,
  enemyArr: [],
  mapData: {},
  mapGridInfo: {x: 0, y: 0, x_y: 1, num: 0},
  disable: true
}

export type LevelDataItem = {
  /** 关卡类型 */
  type: LevelDataItemEnum
  /** 关卡索引，只有特殊关卡才需要区分 */
  typeIndex?: number
  /** 敌人数组 */
  enemyArr: Array<number[]>
  /** 地图移动方向信息 */
  mapData: {[key in number]: DirectionType}
  /** 格子信息 */
  mapGridInfo: MapGridInfo
  /** 初始化建造的塔防 */
  towerArr?: BuildTowerParams[]
  /** 是否禁用 */
  disable?: boolean
}