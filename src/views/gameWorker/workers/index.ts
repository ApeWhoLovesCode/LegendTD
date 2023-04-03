import mapData, { GridInfo, mapGridInfoList } from "@/dataSource/mapData";
import { useSourceStore } from "@/stores/source";
import { powAndSqrt, waitTime } from "@/utils/tools";
import useAudioState from "@/views/game/tools/audioState";
import useBaseData from "@/views/game/tools/baseData";
import useDomRef from "@/views/game/tools/domRef";
import useEnemy from "@/views/game/tools/enemy";
import useGameConfig from "@/views/game/tools/gameConfig";
import useGameSkill from "@/views/game/tools/gameSkill";
import useSpecialBullets from "@/views/game/tools/specialBullets";
import useTower from "@/views/game/tools/tower";
import { computed } from "vue";

const source = useSourceStore()

const { audioState, createAudio, playDomAudio, removeAudio} = useAudioState()
const { baseDataState, checkValInCircle, gamePause, initAllGrid } = useBaseData()
const { gameConfigState } = useGameConfig()
const { gameSkillState } = useGameSkill()
const { enemyList, enemyState, slowEnemy} = useEnemy()
const { towerList, towerState, handlerTower, hiddenTowerOperation } = useTower()
const { canvasRef, audioBgRef, audioLevelRef, audioSkillRef, audioEndRef, audioRefObj } = useDomRef()
const { specialBullets } = useSpecialBullets()

/** 是否是无限火力模式 */
const isInfinite = computed(() => {
  return source.mapLevel === mapData.length - 1
})

function startDraw() {
  console.log('startDraw: ');
}

function init() {
  initZoomData()
  if(isInfinite.value) {
    baseDataState.money = 999999
  }
  gameConfigState.ctx = (canvasRef.value!.getContext("2d") as CanvasRenderingContext2D);
  const item = JSON.parse(JSON.stringify(mapGridInfoList[source.mapLevel]))
  item.x *= gameConfigState.size
  item.y *= gameConfigState.size
  baseDataState.mapGridInfoItem = item
  baseDataState.floorTile.num = baseDataState.mapGridInfoItem.num
  initAllGrid()
  initMovePath()
  onKeyDown()
  source.isGameInit = true
  waitTime(800).then(() => {
    gameConfigState.loadingDone = true
    startDraw()
    // testBuildTowers()
  })
}

/** 初始化行动轨迹 */
function initMovePath() {
  const size = gameConfigState.size
  // 刚开始就右移了，所以该初始格不会算上去
  const movePathItem: GridInfo & {num?: number} = JSON.parse(JSON.stringify(baseDataState.mapGridInfoItem))
  const length = movePathItem.num!
  delete movePathItem.num
  const movePath: GridInfo[] = []
  // 控制x y轴的方向 1:左 2:下 3:右 4:上
  let x_y = movePathItem.x_y
  for(let i = 0; i < length; i++) {
    const newXY = mapData[source.mapLevel][i]
    if(newXY) {
      x_y = newXY
    }
    if(x_y % 2) movePathItem.x += x_y === 3 ? size : -size
    else movePathItem.y += x_y === 4 ? size : -size
    movePathItem.x_y = x_y
    movePath.push(JSON.parse(JSON.stringify(movePathItem)))
    baseDataState.gridInfo.arr[Math.floor(movePathItem.y / size)][Math.floor(movePathItem.x / size)] = 1
  }
  baseDataState.terminal = movePath[movePath.length - 1]
  enemyState.movePath = movePath
}

/** 按比例缩放数据 */
function initZoomData() {
  let p = source.ratio
  const {w, h} = gameConfigState.defaultCanvas
  if(source.isMobile) {
    const wp = document.documentElement.clientWidth / (h + 150)
    const hp = document.documentElement.clientHeight / (w + 100)
    p *= Math.floor(Math.min(wp, hp) * 100) / 100
  }
  gameConfigState.size = Math.floor(gameConfigState.size * p)
  gameConfigState.defaultCanvas.w = Math.floor(w * p)
  gameConfigState.defaultCanvas.h = Math.floor(h * p)
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

addEventListener('message', e => {
  const { data } = e;
  console.log('data: ', data);
  const offscreen = data.canvas;
  const ctx = offscreen.getContext('2d');
  init()
})

export default {}
