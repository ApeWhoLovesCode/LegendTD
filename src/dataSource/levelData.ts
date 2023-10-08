import levelEnemyArr from '@/dataSource/levelEnemyArr';
import mapData, { MapDataItem, othMapData } from './mapData';

export enum LevelDataItemEnum {
  /** 正常关卡 */
  Normal = "Normal",
  /** 体验关卡 */
  Experience = "Experience",
  /** 无尽模式 */
  Endless = "Endless",
}

export type LevelDataItem = {
  /** 关卡类型 */
  type: LevelDataItemEnum
  /** 关卡索引，只有特殊关卡才需要区分 */
  typeIndex?: number
  /** 是否禁用 */
  disable?: boolean
} & MapDataItem

const levelData: LevelDataItem[] = [
  // 体验关卡
  {
    type: LevelDataItemEnum.Experience,
    typeIndex: 0,
    ...othMapData.experience[0]
  },
]

// 正常关卡
for(let initI = levelData.length, i = 0; i < mapData.length; i++) {
  const item: LevelDataItem = {
    type: LevelDataItemEnum.Normal,
    enemyArr: levelEnemyArr[0],
    ...mapData[i]
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
