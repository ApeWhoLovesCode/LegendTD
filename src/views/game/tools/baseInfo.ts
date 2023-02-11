import mapData, { GridInfo } from "@/dataSource/mapData";
import { useSourceStore } from "@/stores/source";
import { GameBaseInfo } from "@/type/game"
import { reactive } from "vue"
import { baseDataState } from "./baseData";
import { enemyState } from "./enemy";
import { gameConfigState } from "./gameConfig";

const _baseInfoStateFn = (): GameBaseInfo => ({
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
  mapGridInfoItem: {x: 0, y: 9, x_y: 1, num: 0}
})

const baseInfoState = reactive<GameBaseInfo>(_baseInfoStateFn())
const source = useSourceStore()

/** 初始化行动轨迹 */
function initMovePath() {
  const size = baseDataState.gridInfo.size
  // 刚开始就右移了，所有该初始格不会算上去
  const movePathItem = JSON.parse(JSON.stringify(baseInfoState.mapGridInfoItem))
  delete movePathItem.num
  const movePath: GridInfo[]  = []
  // 控制x y轴的方向 1:左 2:下 3:右 4:上
  let x_y = movePathItem.x_y
  for(let i = 0; i < baseDataState.floorTile.num; i++) {
    const newXY = mapData[source.mapLevel][i]
    if(newXY) {
      x_y = newXY
    }
    if(x_y % 2) movePathItem.x += x_y === 3 ? size : -size
    else movePathItem.y += x_y === 4 ? size : -size
    movePathItem.x_y = x_y
    movePath.push(JSON.parse(JSON.stringify(movePathItem)))
    baseDataState.gridInfo.arr[movePathItem.y / size][movePathItem.x / size] = 1
  }
  baseDataState.terminal = movePath[movePath.length - 1]
  enemyState.movePath = movePath
}

/** 监听用户的键盘事件 */
function onKeyDown() {
  document.onkeydown = (e) => {
    if(gameConfigState.isGameBeginMask) return
    switch (e.code) {
      case "Space":{
        gamePause()
        break;
      } 
    }
  };
}

/** 游戏暂停 */
function gamePause() {
  if(!baseInfoState.isGameOver) {
    baseInfoState.isPause = !baseInfoState.isPause;
  }
}


export {
  baseInfoState,
  _baseInfoStateFn,
  onKeyDown,
  gamePause,
  initMovePath,
}