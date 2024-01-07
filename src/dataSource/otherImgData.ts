import { requireCDN } from "@/utils/handleImg"

/** 用于canvas的图片数据 */
const otherImgData = {
  /** 起点 */
  start: requireCDN('start.jpg'),
  /** 终点 */
  terminal: requireCDN('terminal.png'),
  /** 地板 */
  floor: requireCDN('floor-tile.png'),
  /** 金币 */
  goldCoin: requireCDN('gold-coin.png'),
  /** 减速雪花 */
  snow: requireCDN('snow.png'),
  /** 中毒减速 */
  snowPoison: requireCDN('snow-poison.png'),
  /** 眩晕 */
  snowVertigo: requireCDN('snow-vertigo1.png'),
  /** 中毒 */
  poison: requireCDN('poison.png'),
  /** 星星 */
  star: requireCDN('star.png'),
  /** 月亮 */
  moon: requireCDN('moon.png'),
  /** 太阳 */
  sun: requireCDN('sun.png'),
  /** 回血 */
  returnBlood: requireCDN('return-blood.png'),
  /** 敌人冰冻塔防技能 */
  frozen: requireCDN('frozen.png'),
  /** 建造图片 */
  building: requireCDN('add.png'),
  /** 阳光 gif */
  sunGif: requireCDN('Sun.gif'),
}

export default otherImgData

export type OnloadImgKey = keyof typeof otherImgData

/** 仅用于展示图片数据 */
export const imgSource = {
  /** 爱心 */
  heart: requireCDN('heart.svg'),
}