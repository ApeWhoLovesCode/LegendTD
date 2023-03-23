import { requireCDN } from "@/utils/handleDom"

/** 地板的图片数据 */
export default {
  /** 地板 */
  floor: requireCDN('floor-tile.png'),
  /** 金币 */
  goldCoin: requireCDN('gold-coin.png'),
  /** 减速雪花 */
  snow: requireCDN('snow.png'),
  /** 中毒减速 */
  snowPoison: requireCDN('snow-poison.png'),
  /** 中毒 */
  poison: requireCDN('poison.png'),
}