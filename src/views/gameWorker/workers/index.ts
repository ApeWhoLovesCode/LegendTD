import _ from "lodash";
import sourceInstance from '@/stores/sourceInstance'
import { WorkerFnName } from "./type/worker";

import { addMoney, baseDataState, canvasInfo, checkMode, gameConfigState, initAllGrid, isExperience, isInfinite, onLevelChange, onWorkerPostFn, setting, source, unifiedMoney } from "./tools/baseData";
import { drawEnemyMap, enemyState, makeEnemy, watchEnemyList, watchEnemySkill } from './tools/enemy'
import testBuildData from "./tools/testBuild";
import { towerMap, drawTowerMap, removeTower, buildTower, checkEnemyAndTower, initBuildTowers } from "./tools/tower";
import { drawSpecialBullets, handleBulletMove } from "./tools/bullet";
import { handleSkill } from "./tools/gameSkill";

import { waitTime } from "@/utils/tools";
import keepInterval from "@/utils/keepInterval";
import { range } from "@/utils/format";
import { addRowColArr } from "@/utils/direction";

import levelData from "@/dataSource/levelData";
import { GridInfo, MapGridInfo, towerCanvasMapData } from "@/dataSource/mapData";
import { WithPartial } from "@/type";

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
  const params = setting.isTowerCover ? {enemyList: setting.enemyList?.map(e => e.enemyName) ?? [], towerList: [setting.tname]} : void 0
  await sourceInstance.loadingAllImg((progress: number) => {
    onWorkerPostFn('onProgress', range(progress, 0, 100))
  }, params)
  onWorkerPostFn('onProgress', 100)
  checkMode()
  if(isExperience) {
    addMoney(10_000)
  } else if(isInfinite) {
    addMoney(94_999)
  }
  if(!setting.isTowerCover) {
    initAllGrid()
    onLevelChange()
  }
  initMovePath()
  source.isGameInit = true
  if(!setting.isTowerCover) {
    await waitTime(600)
    startDraw()
    initBuildTowers()
    testBuildTowers()
  } else { // 塔防展示组件
    buildTower({tname: setting.tname, x: 4 * gameConfigState.size, y: 3 * gameConfigState.size}, false, false)
    makeEnemy()
    startAnimation()
  }
  onWorkerPostFn('onWorkerReady', baseDataState.end)
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
  if(!setting.isTowerCover) {
    drawStart()
  } 
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

/** 画起点 */
function drawStart() {
  const size = gameConfigState.size
  baseDataState.mapItem.start.forEach(s => {
    gameConfigState.ctx.drawImage(source.othOnloadImg.start!, s.x * size, s.y * size, size, size)
    baseDataState.gridInfo.arr[s.y][s.x] = 'start'
  })
}

/** 画地板 */
function drawFloorTile() {
  const size = gameConfigState.size
  enemyState.movePath.forEach(pathArr => {
    pathArr.forEach(f => {
      gameConfigState.ctx.drawImage(source.othOnloadImg.floor!, f.x, f.y, size, size)
    })
  })
}

/** 初始化行动轨迹 */
function initMovePath() {
  const size = gameConfigState.size
  baseDataState.mapItem = !setting.isTowerCover ? levelData[source.mapLevel] : towerCanvasMapData
  baseDataState.mapItem.start.forEach((levelStart, startIndex) => {
    const movePathItem: WithPartial<MapGridInfo, 'num'> = JSON.parse(JSON.stringify(levelStart))
    const {addRow, addCol} = addRowColArr[movePathItem.x_y - 1]
    movePathItem.x = (movePathItem.x + addCol) * size;
    movePathItem.y = (movePathItem.y + addRow) * size;
    // 刚开始就右移了，所以该初始格不会算上去
    const length = movePathItem.num!
    delete movePathItem.num
    const movePath: GridInfo[] = [JSON.parse(JSON.stringify(movePathItem))]
    // 控制x y轴的方向 1:左 2:下 3:右 4:上
    let x_y = movePathItem.x_y
    for(let i = 0; i < length; i++) {
      const newXY = baseDataState.mapItem.map[startIndex][i]
      if(newXY) {
        x_y = newXY
      }
      if(x_y % 2) movePathItem.x += x_y === 3 ? size : -size
      else movePathItem.y += x_y === 4 ? size : -size
      movePathItem.x_y = x_y
      movePath.push(JSON.parse(JSON.stringify(movePathItem)))
      if(!setting.isTowerCover) {
        baseDataState.gridInfo.arr[Math.floor(movePathItem.y / size)][Math.floor(movePathItem.x / size)] = 'floor'
      }
    }
    enemyState.movePath.push(movePath)
  })
  if(!setting.isTowerCover) {
    // 为终点赋值
    let end = baseDataState.mapItem.end
    if(!end) {
      const lastItem = enemyState.movePath.at(-1)?.at(-1)
      end = {
        x: Math.floor(lastItem!.x / size),
        y: Math.floor(lastItem!.y / size),
      }
    }
    baseDataState.end = end
    baseDataState.gridInfo.arr[end!.y][end!.x] = 'end'
  }
}

/** 点击获取鼠标位置 操作塔防 */
function getMouse(e: {offsetX:number, offsetY:number}) {
  const size = gameConfigState.size
  const _x = e.offsetX * source.ratio, _y = e.offsetY * source.ratio
  // 当前点击的格子的索引值
  const row = Math.floor(_y / size), col = Math.floor(_x / size)
  const gridVal = baseDataState.gridInfo.arr[row][col]
  const left = col * size, top = row * size
  // 已经有地板或者有建筑了
  if(gridVal === 'tower') {
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
  enemyState.levelEnemy = ['zombie-dance','zombie-dance','fulisha','fulisha','rabbish-2','zombie-dance','zombie-dance','fulisha','fulisha','zombie-dance','zombie-dance','fulisha','fulisha','zombie-dance','zombie-dance','fulisha','fulisha']
  const size = gameConfigState.size
  testBuildData.forEach(item => {
    item.x *= size
    item.y *= size
    buildTower({...item}, false, false)
  })
  for(let i = 0; i < 20; i++) {
    buildTower({x: i * size, y: 0, tname: 'delaiwen'}, false, false)
  }
  for(let i = 0; i < 4; i++) {
    buildTower({x: i * size, y: size, tname: 'delaiwen'}, false, false)
  }
  for(let i = 0; i < 4; i++) {
    buildTower({x: i * size, y: 2 * size, tname: 'delaiwen'}, false, false)
  }
  for(let i = 6; i < 15; i++) {
    buildTower({x: i * size, y: 2 * size, tname: 'delaiwen'}, false, false)
  }
}

export default {}
