import { GameBaseInfo } from "@/type/game"
import { reactive } from "vue"

const baseInfoState = reactive<GameBaseInfo>({
  // 游戏结束
  isGameOver: false,
  // 设置游戏的暂停
  isPause: true,
  /** 是否播放背景音乐 */
  isPlayBgAudio: false,
  // 等级
  level: 0,
  // 生命值
  hp: 10,
  // 金钱
  money: 600,
  // 敌人生成间隔时间
  intervalTime: 900,
  // 当前关卡地图信息
  mapGridInfoItem: {x: 0, y: 9, x_y: 0, num: 0}
})

export {
  baseInfoState
}