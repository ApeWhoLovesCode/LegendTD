import mapData, { GridInfo, mapGridInfoList } from "@/dataSource/mapData";
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
import sourceInstance from '@/stores/sourceInstance'
import { GameConfigType } from "@/type/game";

// const source = useSourceStore()
const source = sourceInstance.state
const screenInfo = {
  width: 0,
  height: 0,
}
const canvasInfo = {
  offscreen: void 0 as unknown as OffscreenCanvas,
  width: 0,
  height: 0,
}

const gameConfigState: GameConfigType = {
  // canvas 默认大小
  defaultCanvas: {w: 1050, h: 600},
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
}

const { audioState, createAudio, playDomAudio, removeAudio} = useAudioState()
const { baseDataState, checkValInCircle, gamePause, initAllGrid } = useBaseData()
const { gameSkillState } = useGameSkill()
const { enemyList, enemyState, slowEnemy} = useEnemy()
const { towerList, towerState, handlerTower, hiddenTowerOperation } = useTower()
// const { canvasRef, audioBgRef, audioLevelRef, audioSkillRef, audioEndRef, audioRefObj } = useDomRef()
const { specialBullets } = useSpecialBullets()

/** 是否是无限火力模式 */
const isInfinite = computed(() => {
  return source.mapLevel === mapData.length - 1
})

/** 开始绘画 */
function startDraw() {
  gameConfigState.ctx.clearRect(0, 0, canvasInfo.offscreen.width, canvasInfo.offscreen.height);
  drawFloorTile()
  // drawTower()
  // // 循环静态图片数组画敌人形成gif效果
  // for(let index = 0; index < enemyList.length; index++) {
  //   const item = enemyList[index]
  //   const res = moveEnemy(index)
  //   // 当敌人已经到达终点，后面就不执行了
  //   if(res) break
  //   drawEnemy(index)
  //   if(item.imgIndex === item.imgList.length - 1) enemyList[index].imgIndex = 0
  //   else enemyList[index].imgIndex++
  // }
  // checkEnemyAndTower()
  // handleBulletMove()
  // drawSpecialBullets()
}

/** 画地板 */
function drawFloorTile() {
  const size = gameConfigState.size
  for(let f of enemyState.movePath) {
    gameConfigState.ctx.drawImage(source.othOnloadImg.floor!, f.x, f.y, size, size)
  }
}

async function init() {
  await sourceInstance.loadingAllImg()
  initZoomData()
  if(isInfinite.value) {
    baseDataState.money = 999999
  }
  const item = JSON.parse(JSON.stringify(mapGridInfoList[source.mapLevel]))
  item.x *= gameConfigState.size
  item.y *= gameConfigState.size
  baseDataState.mapGridInfoItem = item
  baseDataState.floorTile.num = baseDataState.mapGridInfoItem.num
  initAllGrid()
  initMovePath()
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
    const wp = screenInfo.width / (h + 150)
    const hp = screenInfo.height / (w + 100)
    p *= Math.floor(Math.min(wp, hp) * 100) / 100
  }
  gameConfigState.size = Math.floor(gameConfigState.size * p)
  gameConfigState.defaultCanvas.w = Math.floor(w * p)
  gameConfigState.defaultCanvas.h = Math.floor(h * p)
}

addEventListener('message', e => {
  const { data } = e;
  const offscreen = data.canvasInfo.offscreen;
  canvasInfo.offscreen = offscreen
  gameConfigState.ctx = (offscreen.getContext('2d') as CanvasRenderingContext2D);
  screenInfo.width = data.screenInfo.width
  screenInfo.height = data.screenInfo.height
  init()
})

export default {}
