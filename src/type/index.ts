import { EnemyType } from "@/dataSource/enemyData"
import { TowerType } from "@/dataSource/towerData"

/** 首页的数据类型 */
export type IndexType = {
  title: string,
  /** 当前加载进度 */
  progress: number,
  /** 加载进度条的显示与隐藏 */
  isProgressBar: boolean,
  // 控制游戏区域的显示与隐藏
  isProtectTheHorse: boolean,
  // 静态图片资源(地板，阻挡物等)
  // imgObj: {
  //   floorTile: string
  // },
  // 敌人资源
  // enemySource: EnemyType[],
  // 塔防数据 
  // towerSource: TowerType[],
  // 加载完成的静态图片
  imgOnloadObj: ImgLoadType,
  // 塔防加载完成图片
  towerOnloadImg: ImgLoadType,
  // 塔防子弹加载完成图片
  towerBulletOnloadImg: ImgLoadType,
  // 判断是否是手机
  isMobile: boolean,
  // 用于切换关卡克隆出来的一份数据
  newEnemySource: EnemyType[],
  newTowerList: TowerType[]
}

/** 图片加载完成的类型 */
export type ImgLoadType = {
  [key: string]: HTMLImageElement
}