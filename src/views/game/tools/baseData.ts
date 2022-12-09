import { GameBaseData } from "@/type/game";
import { reactive } from "vue";

const baseDataState = reactive<GameBaseData>({
  // 偏移量y 是用来计算敌人与地板底部的距离 (两个地板(50*2)-敌人(h(75)+y(10))) = 10
  offset: {y: 10},
  // 终点位置
  terminal: undefined,
  // 地板：大小 数量
  floorTile: {size: 50, num: 83},
  // 格子数量信息 arr: [[ 0:初始值(可以放塔)，1:地板，2:有阻挡物，10(有塔防：10塔防一，11塔防二...) ]]
  gridInfo: { x_num: 21, y_num: 12, size: 50, arr: [] },
})

export {
  baseDataState
}