import levelEnemyArr from '@/dataSource/levelEnemyArr';

export enum LevelDataItemEnum {
  Normal = "Normal"
}

const levelData: LevelDataItem[] = [
  {
    type: LevelDataItemEnum.Normal,
    enemyArr: []
  },
]

for(let i = 1; i < 30; i++) {
  levelData[i] = JSON.parse(JSON.stringify(levelData[0]))
}

for(let i = 0; i < levelData.length; i++) {
  // levelData[i].enemyArr = levelEnemyArr[i]
  levelData[i].enemyArr = JSON.parse(JSON.stringify(levelEnemyArr[0]))
}

export default levelData

export const levelNullItem: LevelDataItem = {
  type: LevelDataItemEnum.Normal,
  enemyArr: [],
  disable: true
}

export type LevelDataItem = {
  type: LevelDataItemEnum
  /** 敌人关卡数组 */
  enemyArr: Array<number[]>
  /** 是否禁用 */
  disable?: boolean
}