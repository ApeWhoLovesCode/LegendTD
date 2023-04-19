import { requireCDN } from "@/utils/handleImg"

/** 用于canvas的图片数据 */
const otherImgData = {
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
}

export default otherImgData

export type OnloadImgKey = keyof typeof otherImgData