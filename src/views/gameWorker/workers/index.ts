import { powAndSqrt } from "@/utils/tools";
import useAudioState from "@/views/game/tools/audioState";
import useBaseData from "@/views/game/tools/baseData";
import useDomRef from "@/views/game/tools/domRef";
import useEnemy from "@/views/game/tools/enemy";
import useGameConfig from "@/views/game/tools/gameConfig";
import useGameSkill from "@/views/game/tools/gameSkill";
import useSpecialBullets from "@/views/game/tools/specialBullets";
import useTower from "@/views/game/tools/tower";

const { audioState, createAudio, playDomAudio, removeAudio} = useAudioState()
const { baseDataState, checkValInCircle, gamePause, initAllGrid } = useBaseData()
const { gameConfigState } = useGameConfig()
const { gameSkillState } = useGameSkill()
const { enemyList, enemyState, slowEnemy} = useEnemy()
const { towerList, towerState, handlerTower, hiddenTowerOperation } = useTower()
const { canvasRef, audioBgRef, audioLevelRef, audioSkillRef, audioEndRef, audioRefObj } = useDomRef()
const { specialBullets } = useSpecialBullets()

function init() {
  // initZoomData()
  // if(isInfinite.value) {
  //   baseDataState.money = 999999
  // }
  // gameConfigState.ctx = (canvasRef.value!.getContext("2d") as CanvasRenderingContext2D);
  // const item = JSON.parse(JSON.stringify(mapGridInfoList[source.mapLevel]))
  // item.x *= gameConfigState.size
  // item.y *= gameConfigState.size
  // baseDataState.mapGridInfoItem = item
  baseDataState.floorTile.num = baseDataState.mapGridInfoItem.num
  console.log('baseDataState.floorTile.num: ', baseDataState.floorTile.num);
  // initAllGrid()
  // initMovePath()
  // onKeyDown()
  // source.isGameInit = true
  // waitTime(800).then(() => {
  //   gameConfigState.loadingDone = true
  //   startDraw()
  //   // testBuildTowers()
  // })
}

/** 按比例缩放数据 */
// function initZoomData() {
//   let p = source.ratio
//   const {w, h} = gameConfigState.defaultCanvas
//   if(source.isMobile) {
//     const wp = document.documentElement.clientWidth / (h + 150)
//     const hp = document.documentElement.clientHeight / (w + 100)
//     p *= Math.floor(Math.min(wp, hp) * 100) / 100
//   }
//   gameConfigState.size = Math.floor(gameConfigState.size * p)
//   gameConfigState.defaultCanvas.w = Math.floor(w * p)
//   gameConfigState.defaultCanvas.h = Math.floor(h * p)
// }

addEventListener('message', e => {
  const { data } = e;
  console.log('data: ', data);
  const offscreen = data.canvas;
  const ctx = offscreen.getContext('2d');
  init()
})

export default {}
