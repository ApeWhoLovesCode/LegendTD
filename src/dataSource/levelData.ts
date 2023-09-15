import levelEnemyArr from '@/dataSource/levelEnemyArr';
import mapData, { DirectionType, MapDataInfo, MapGridInfo, othMapData } from './mapData';
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
    start: othMapData.experience[0].start,
    map: othMapData.experience[0].map,
    // towerArr: [
    //   {tname: 'aixi', x: }
    // ]
  },
]

// 正常关卡
for(let initI = levelData.length, i = 0; i < mapData.length; i++) {
  const item: LevelDataItem = {
    type: LevelDataItemEnum.Normal,
    enemyArr: levelEnemyArr[0],
    start: mapData[i].start,
    map: mapData[i].map,
  }
  levelData[initI + i] = item
}

// 无尽模式
levelData.push({
  type: LevelDataItemEnum.Endless,
  typeIndex: 0,
  enemyArr: levelEnemyArr[0],
  start: othMapData.endless[0].start,
  map: othMapData.endless[0].map,
})


export default levelData

export const levelNullItem: LevelDataItem = {
  type: LevelDataItemEnum.Normal,
  enemyArr: [],
  start: [],
  map: [],
  disable: true
}

export type LevelDataItem = {
  /** 关卡类型 */
  type: LevelDataItemEnum
  /** 关卡索引，只有特殊关卡才需要区分 */
  typeIndex?: number
  /** 敌人数组 */
  enemyArr: Array<number[]>
  /** 起点信息 */
  start: MapGridInfo[]
  /** 地图移动方向信息 */
  map: MapDataInfo[]
  /** 初始化建造的塔防 */
  towerArr?: BuildTowerParams[]
  /** 是否禁用 */
  disable?: boolean
}