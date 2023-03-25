import levelEnemyArr from '@/dataSource/levelEnemyArr';

const levelData: LevelDataItem[] = [
  {
    cover: 'http://lhh.codeape.site/img/dog4.jpeg',
    enemyArr: []
  },
]

for(let i = 1; i < 30; i++) {
  levelData[i] = JSON.parse(JSON.stringify(levelData[0]))
}

for(let i = 0; i < levelData.length; i++) {
  // levelData[i].enemyArr = levelEnemyArr[i]
  levelData[i].enemyArr = levelEnemyArr[0]
}

export default levelData

export const levelNullItem: LevelDataItem = {
  cover: 'http://lhh.codeape.site/img/dog4.jpeg',
  enemyArr: [],
  disable: true
}

export type LevelDataItem = {
  /** 封面图 */
  cover: string
  /** 敌人关卡数组 */
  enemyArr: Array<number[]>
  /** 是否禁用 */
  disable?: boolean
}