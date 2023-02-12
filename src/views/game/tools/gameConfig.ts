import { GameConfigType } from "@/type/game"
import { reactive } from "vue"

export default function useGameConfig() {
  const gameConfigState = reactive<GameConfigType>({
    // 浏览器大小变化
    resizeTimer: null,
    // canvas 默认大小
    defaultCanvas: {w: 1050, h: 600},
    // canvas 对象
    canvas: {},
    // canvas 画布距离浏览器左边和顶部的距离
    canvasInfo: {left: 0, top: 0},
    // requestAnimationFrame api的保存对象
    animationFrame: null,
    // 得到 canvas 的 2d 上下文
    ctx: null,
    // 是否加载完成
    loadingDone: false,
    isGameBeginMask: true,
  })
  
  return {
    gameConfigState
  }
}