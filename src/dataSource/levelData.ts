import levelEnemyArr from '@/dataSource/levelEnemyArr';

const levelData: LevelDataType[] = [
  {
    cover: 'https://cdn.lightwork.com.cn/img/20220921141442-h4AHAn.png',
    enemyArr: []
  },
]

for(let i = 0; i < 25; i++) {
  levelData[i] = JSON.parse(JSON.stringify(levelData[0]))
}

for(let i = 0; i < levelData.length; i++) {
  // levelData[i].enemyArr = levelEnemyArr[i]
  levelData[i].enemyArr = levelEnemyArr[0]
}

export default levelData

export type LevelDataType = {
  /** 封面图 */
  cover: string
  /** 敌人关卡数组 */
  enemyArr: Array<number[]>
}