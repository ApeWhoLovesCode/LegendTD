import { GameBaseData } from "@/type/game";
import { _DeepPartial } from "pinia";
import { reactive } from "vue";

export default function useBaseData() {
  const baseDataState = reactive<GameBaseData>({
    // 终点位置
    terminal: undefined,
    gridInfo: { x_num: 20, y_num: 12, size: 50 },
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
    money: 5000,
  })
  
  /** 游戏暂停 */
  function gamePause() {
    if(!baseDataState.isGameOver) {
      baseDataState.isPause = !baseDataState.isPause;
    }
  }
  
  return {
    baseDataState,
    gamePause,
  }
}

export type TargetCircleInfo = {
  x: number
  y: number
  /** 半径 */
  r: number
  /** 目标的大小 */
  size?: number
  /** 目标的数量 */
  targetNum?: number
}
