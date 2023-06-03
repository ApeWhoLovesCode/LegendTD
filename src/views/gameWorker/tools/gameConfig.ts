import { GameConfigType } from "@/type/game"
import { reactive } from "vue"

export default function useGameConfig() {
  const gameConfigState = reactive<GameConfigType>({
    // canvas 默认大小
    defaultCanvas: {w: 1000, h: 600},
    /** 一格的大小 */
    size: 50,
    // canvas 对象
    canvas: {},
    // requestAnimationFrame api的保存对象
    animationFrame: 0,
    // 得到 canvas 的 2d 上下文
    ctx: null as unknown as CanvasRenderingContext2D,
    // 是否加载完成
    loadingDone: false,
    isGameBeginMask: true,
  })
  
  return {
    gameConfigState
  }
}
