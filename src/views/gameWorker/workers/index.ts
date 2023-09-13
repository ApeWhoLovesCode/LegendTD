import { GridInfo, towerCanvasMapData, towerCanvasMapGridInfo } from "@/dataSource/mapData";
import { waitTime } from "@/utils/tools";
import sourceInstance from '@/stores/sourceInstance'
import { addMoney, baseDataState, canvasInfo, gameConfigState, initAllGrid, isInfinite, onLevelChange, onWorkerPostFn, setting, source, unifiedMoney } from "./tools/baseData";
import { drawEnemyMap, enemyState, makeEnemy, watchEnemyList, watchEnemySkill } from './tools/enemy'
import keepInterval from "@/utils/keepInterval";
import _ from "lodash";
import { WorkerFnName } from "./type/worker";
import testBuildData from "./tools/testBuild";
import { range } from "@/utils/format";
import { towerMap, drawTowerMap, removeTower, buildTower, checkEnemyAndTower } from "./tools/tower";
import { drawSpecialBullets, handleBulletMove } from "./tools/bullet";
import { handleSkill } from "./tools/gameSkill";
import levelData from "@/dataSource/levelData";

addEventListener('message', e => {
  const { data } = e;
  // 初始化
  if(data.init) {
    const offscreen = data.canvasInfo.offscreen;
    canvasInfo.offscreen = offscreen
    gameConfigState.ctx = (offscreen.getContext('2d') as CanvasRenderingContext2D);
    gameConfigState.size = data.canvasInfo.size
    source.isMobile = data.source.isMobile
    source.ratio = data.source.ratio
    source.mapLevel = data.source.mapLevel
    setting.isHighRefreshScreen = data.setting.isHighRefreshScreen
    if(data.isTowerCover) {
      setting.tname = data.tname
      setting.enemyList = data.enemyList
      setting.isTowerCover = data.isTowerCover
    }
    init()
  } 
  // 暂停或继续游戏
  if(data.isPause !== void 0) { 
    keepInterval.allPause(data.isPause)
    if(!data.isPause) {
      makeEnemy()
      startAnimation();
    } else {
      cancelAnimationFrame(gameConfigState.animationFrame)
    }
  }
  switch (data.fnName as WorkerFnName) {
    case 'getMouse': {
      getMouse(data.event); break;
    }
    case 'buildTower': {
      buildTower(data.event); break;
    }
    case 'saleTower': {
      removeTower(data.event); break;
    }
    case 'handleSkill': {
      handleSkill(data.event); break;
    }
  }
  if(data.isDevTestMode) {
    setting.isDevTestMode = true
  }
})

async function init() {
  const params = setting.isTowerCover ? {enemyList: setting.enemyList?.map(e => e.i) ?? [], towerList: [setting.tname]} : void 0
  await sourceInstance.loadingAllImg((progress: number) => {
    onWorkerPostFn('onProgress', range(progress, 0, 100))
  }, params)
  onWorkerPostFn('onProgress', 100)
  if(isInfinite) {
    addMoney(999999)
  }
  if(!setting.isTowerCover) {
    initAllGrid()
    onLevelChange()
  }
  initMovePath()
  source.isGameInit = true
  if(!setting.isTowerCover) {
    await waitTime(800)
    startDraw()
    testBuildTowers()
  } else { // 塔防展示组件
    buildTower({tname: setting.tname, x: 4 * gameConfigState.size, y: 3 * gameConfigState.size}, false)
    makeEnemy()
    startAnimation()
  }
  onWorkerPostFn('onWorkerReady')
}

/** 开启动画绘画 */
function startAnimation() {
  if(setting.isHighRefreshScreen) {
    startAnimationLockFrame()
  } else {
    (function go() {
      gameConfigState.animationFrame = requestAnimationFrame(go);
      startDraw();
    })();
  }
}
/** 高刷屏锁帧，锁帧会使绘画出现掉帧 */
function startAnimationLockFrame() {
  const fpx = 60;
  let fpsInterval = 1000 / fpx;
  let then = Date.now();
  (function go() {
    gameConfigState.animationFrame = requestAnimationFrame(go);
    const now = Date.now();
    const elapsed = now - then;
    if (elapsed > fpsInterval) {
      startDraw();
      then = now - (elapsed % fpsInterval);
    }
  })();
}

/** 开始绘画 */
function startDraw() {
  gameConfigState.ctx.clearRect(0, 0, canvasInfo.offscreen.width, canvasInfo.offscreen.height);
  drawFloorTile()
  drawTowerMap()
  drawEnemyMap()
  checkEnemyAndTower()
  handleBulletMove()
  drawSpecialBullets()
  watchEnemyList()
  watchEnemySkill()
  if(!setting.isTowerCover) {
    unifiedMoney()
  }
}

/** 画地板 */
function drawFloorTile() {
  const size = gameConfigState.size
  for(let f of enemyState.movePath) {
    gameConfigState.ctx.drawImage(source.othOnloadImg.floor!, f.x, f.y, size, size)
  }
}

/** 初始化行动轨迹 */
function initMovePath() {
  const movePathItem = JSON.parse(JSON.stringify(
    !setting.isTowerCover ? levelData[source.mapLevel].mapGridInfo : towerCanvasMapGridInfo
  ))
  movePathItem.x *= gameConfigState.size
  movePathItem.y *= gameConfigState.size
  baseDataState.mapGridInfoItem = JSON.parse(JSON.stringify(movePathItem))
  baseDataState.floorTile.num = movePathItem.num
  const size = gameConfigState.size
  // 刚开始就右移了，所以该初始格不会算上去
  const length = movePathItem.num!
  delete movePathItem.num
  const _mapData = !setting.isTowerCover ? levelData[source.mapLevel].mapData : towerCanvasMapData
  const movePath: GridInfo[] = []
  // 控制x y轴的方向 1:左 2:下 3:右 4:上
  let x_y = movePathItem.x_y
  for(let i = 0; i < length; i++) {
    const newXY = _mapData[i]
    if(newXY) {
      x_y = newXY
    }
    if(x_y % 2) movePathItem.x += x_y === 3 ? size : -size
    else movePathItem.y += x_y === 4 ? size : -size
    movePathItem.x_y = x_y
    movePath.push(JSON.parse(JSON.stringify(movePathItem)))
    if(!setting.isTowerCover) {
      baseDataState.gridInfo.arr[Math.floor(movePathItem.y / size)][Math.floor(movePathItem.x / size)] = 1
    }
  }
  onWorkerPostFn('initMovePathCallback', movePath[movePath.length - 1])
  enemyState.movePath = movePath
}

/** 点击获取鼠标位置 操作塔防 */
function getMouse(e: {offsetX:number, offsetY:number}) {
  const size = gameConfigState.size
  const _x = e.offsetX * source.ratio, _y = e.offsetY * source.ratio
  // 当前点击的格子的索引值
  const col = Math.floor(_y / size), row = Math.floor(_x / size)
  const gridVal = baseDataState.gridInfo.arr[col][row]
  const left = row * size, top = col * size
  // 已经有地板或者有建筑了
  if(String(gridVal).includes('t')) {
    // 当前点击的是哪个塔防
    let towerId = ''
    for(const item of towerMap.values()) {
      if(item.x === left && item.y === top) {
        towerId = item.id
      }
    }
    const tower = towerMap.get(towerId)
    if(tower) {
      // 展示攻击范围
      onWorkerPostFn('handlerTower', {
        isShow: true, left, top, r: tower.r, towerId, saleMoney: tower.saleMoney
      })
    }
  }
  if(gridVal) {
    return
  }
  onWorkerPostFn('showTowerBuilding', {left, top})
}

/** 测试: 建造塔防 */
function testBuildTowers() {
  if(!setting.isDevTestMode) return
  addMoney(999999)
  enemyState.levelEnemy = [11,0,14,11,17,7,9,9,7,7,9,16,17,11,11,7,16,7,10,7,7,7,17,11,15,16,7,11,7,14,14,14,7,7,11,9,14,9,9,11,11,9,14,14,17,11,11]
  const size = gameConfigState.size
  testBuildData.forEach(item => {
    item.x *= size
    item.y *= size
    buildTower({...item}, false)
  })
  for(let i = 0; i < 20; i++) {
    buildTower({x: i * size, y: 0, tname: 'delaiwen'}, false)
  }
  for(let i = 0; i < 4; i++) {
    buildTower({x: i * size, y: size, tname: 'delaiwen'}, false)
  }
  for(let i = 0; i < 4; i++) {
    buildTower({x: i * size, y: 2 * size, tname: 'delaiwen'}, false)
  }
  for(let i = 6; i < 15; i++) {
    buildTower({x: i * size, y: 2 * size, tname: 'delaiwen'}, false)
  }
}

export default {}
