import { TowerStateType } from "@/type/game"
import { gameConfigState } from "./baseData"

const towerMap: Map<string, TowerStateType> = new Map()

function drawTowerMap() {
  towerMap.forEach(t => {
    drawTower(t)
  })
}
/** 画塔防 */
function drawTower(tower: TowerStateType) {
  const size = gameConfigState.size
  gameConfigState.ctx.drawImage(tower.onloadImg, tower.x, tower.y, size, size)
  if(tower.hp.isShow && tower.hp.injuryTime! + 1500 > Date.now()) {
    const ctx = gameConfigState.ctx
    const { x, y, hp } = tower
    const hpSize = size / 7
    // 血条背景色
    ctx.fillStyle = '#0066a1'
    ctx.fillRect(x, y - hpSize, size, hpSize)
    // 血条颜色
    ctx.fillStyle = '#ff687b'
    ctx.fillRect(x, y - hpSize, hp.cur / hp.sum * size, hpSize)
    // 画边框
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#cff1d3"; //边框颜色
    ctx.rect(x, y - hpSize, size, hpSize);  //透明无填充
    ctx.stroke();
  } else {
    tower.hp.isShow = false
  }
}

export {
  towerMap,
  drawTowerMap,
  drawTower,
}