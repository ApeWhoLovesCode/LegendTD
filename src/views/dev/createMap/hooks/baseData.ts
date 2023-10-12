import otherImgData from "@/dataSource/otherImgData";
import { createTwoArray } from "@/utils/tools";
import { reactive, ref } from "vue";
import { GridItem } from "../type";

export const floorImgList = [otherImgData.floor]
export const onloadImg = {
  floor: [] as HTMLImageElement[],
  terminal: undefined as HTMLImageElement | undefined
}

const state = reactive({
  canvasInfo: {
    w: 1000,
    h: 600,
    /** 行数 12 */
    rowNum: 12,
    /** 列数 20 */
    colNum: 20,
    /** 线的宽度 */
    lineW: 6.25,
    /** 距离浏览器左边距离 */
    left: 0,
    /** 距离浏览器上边距离 */
    top: 0,
  },
  size: 50,
  ctx: null as unknown as CanvasRenderingContext2D,
  animationFrame: 0,
  /** 格子信息二维数组 */
  gridArr: createTwoArray(12, 20, () => ({v: 0, i: []})) as GridItem[][],
  /** 当前的起点索引 */
  curFlagIndex: 0,
  /** 地板的累计数量, 和上面的起点索引对应 */
  floorNumList: [0, 0, 0, 0],
  /** 新的地板索引，用于覆盖之前的索引 */
  newFloorNum: -1,
})

/** 起点 */
const startFlag = reactive<{
  row: number
  col: number
}[]>([])
/** 起点 */
const end = ref<{row: number, col: number}>()

/** 获取格子内部的信息，不包括边框 */
function getGridInside(col: number, row: number) {
  const {lineW} = state.canvasInfo
  return {
    gridW: state.size - lineW,
    x: col * state.size + lineW / 2,
    y: row * state.size + lineW / 2,
  }
}

export {
  state,
  startFlag,
  end,
  getGridInside,
}