import { TowerName } from "@/dataSource/towerData"
import { addMoney, gameConfigState, setting } from "./baseData"
import { enemyState } from "./enemy"
import { buildTower } from "./tower"

const testBuildData: {x: number, y: number, tname: TowerName}[] = [
  {x: 6, y: 4, tname: 'aixi'},{x: 4, y: 2, tname: 'lanbo'},{x: 4, y: 1, tname: 'delaiwen'},
  {x: 5, y: 5, tname: 'lanbo'},{x: 5, y: 4, tname: 'lanbo'},{x: 4, y: 4, tname: 'lanbo'},{x: 1, y: 6, tname: 'delaiwen'},{x: 2, y: 6, tname: 'delaiwen'},
  {x: 3, y: 6, tname: 'delaiwen'},{x: 2, y: 3, tname: 'lanbo'},{x: 8, y: 5, tname: 'jin'},{x: 9, y: 5, tname: 'jin'},{x: 10, y: 5, tname: 'jin'},{x: 12, y: 5, tname: 'jin'},{x: 11, y: 5, tname: 'jin'},
  {x: 16, y: 1, tname: 'delaiwen'},{x: 6, y: 5, tname: 'lanbo'},{x: 7, y: 3, tname: 'ejiate'},{x: 8, y: 3, tname: 'ejiate'},{x: 9, y: 3, tname: 'ejiate'},
  {x: 10, y: 3, tname: 'ejiate'},{x: 11, y: 3, tname: 'ejiate'},{x: 12, y: 3, tname: 'ejiate'},{x: 16, y: 6, tname: 'aixi'},{x: 15, y: 6, tname: 'lanbo'},
  {x: 16, y: 5, tname: 'lanbo'},{x: 15, y: 5, tname: 'lanbo'},{x: 16, y: 7, tname: 'lanbo'},{x: 15, y: 7, tname: 'lanbo'},{x: 6, y: 2, tname: 'ez'},{x: 7, y: 2, tname: 'ez'},{x: 8, y: 2, tname: 'ez'},
  {x: 7, y: 8, tname: 'jin'},{x: 8, y: 8, tname: 'jin'},{x: 9, y: 8, tname: 'jin'},{x: 10, y: 8, tname: 'jin'},{x: 11, y: 8, tname: 'jin'},{x: 12, y: 8, tname: 'jin'},
  {x: 8, y: 9, tname: 'huonan'},{x: 9, y: 9, tname: 'twitch'},{x: 10, y: 9, tname: 'twitch'},{x: 11, y: 9, tname: 'huonan'},
]

/** 测试: 建造塔防 */
export function testBuildTowers() {
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
