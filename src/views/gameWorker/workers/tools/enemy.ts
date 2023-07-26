import { enemyHpColors } from "@/dataSource/enemyData"
import { TowerSlow } from "@/dataSource/towerData"
import sourceInstance from "@/stores/sourceInstance"
import { EnemyState, EnemyStateType } from "@/type/game"
import keepInterval, { KeepIntervalKey } from "@/utils/keepInterval"
import _ from "lodash"
import { gameConfigState } from "./baseData"
import { drawLinearGradientRoundRect } from "./canvas"

const enemyMap: Map<string, EnemyStateType> = new Map()
const enemyState: EnemyState = {
  levelEnemy: [],
  createdEnemyNum: 0,
  // 敌人的移动轨迹 x坐标, y坐标, x_y(方向): 1:左 2:下 3:右 4:上
  movePath: [],
}

/** 减速敌人 t_slow: {num: 减速倍速(当为0时无法动), time: 持续时间} */
function slowEnemy(e_id: string, t_slow: TowerSlow, callback?: (enemy: EnemyStateType) => void) {
  const enemyItem = enemyMap.get(e_id)!
  const { speed, curSpeed } = enemyItem
  // 当前已经被眩晕了不能减速了
  if(curSpeed === 0) return
  const newSpeed = t_slow.num ? speed / t_slow.num : t_slow.num
  // 防止艾希覆盖老鼠
  if(newSpeed <= curSpeed) {
    // 重新设置恢复速度定时器
    keepInterval.set(`${KeepIntervalKey.slow}-${e_id}`, () => {
      const enemyItem = enemyMap.get(e_id)
      if(enemyItem) {
        enemyItem.curSpeed = enemyItem.speed
        enemyItem.slowType = void 0
        callback?.(enemyItem)
      }
    }, t_slow.time, {isTimeOut: true})
  }
  // 减速敌人
  if(newSpeed < curSpeed) {
    enemyItem.curSpeed = newSpeed
    enemyItem.slowType = t_slow.type
  }
}

/** 绘画敌人图片 */
function drawEnemyImg(enemy: EnemyStateType) {
  const { name, imgType, x, y, w, h, imgIndex, curSpeed, isForward, speed } = enemy
  const ctx = gameConfigState.ctx
  ctx.save() // 保存画布
  // 翻转图片
  if(!isForward) { 
    ctx.translate(w + x * 2, 0)
    ctx.scale(-1, 1); // 翻转画布
  }
  const imgItem = sourceInstance.state.enemyImgSource[name]
  // 处理需要绘画的敌人图片
  const img = imgType === 'gif' ? imgItem.imgList![imgIndex].img : imgItem.img!
  ctx.drawImage(img, x, y, w, h) 
  ctx.restore() // 还原画布
  // 控制图片的索引
  if(imgType === 'gif') {
    let delay = imgItem.imgList![0].delay
    if(curSpeed !== speed) {
      delay *= 2 - curSpeed / speed
    }
    // 控制每一帧图片的切换时机
    if(curSpeed) {
      if(enemy.framesNum >= delay) {
        enemy.imgIndex++;
        enemy.framesNum = 0;
      } else {
        enemy.framesNum++;
      }
    }
    // 使图片索引回到第一帧
    if(enemy.imgIndex === imgItem.imgList!.length) {
      enemy.imgIndex = 0
    }
  }
}
/** 绘画减速效果 */
function drawEnemySlow(enemy: EnemyStateType) {
  const { x, y, w, h, curSpeed, speed, slowType } = enemy
  const ctx = gameConfigState.ctx
  const othOnloadImg = sourceInstance.state.othOnloadImg
  if(curSpeed !== speed) {
    if(slowType === 'stop') {
      return
    } else if(slowType === 'twitch') {
      ctx.save()
      ctx.globalAlpha = 0.5
      ctx.drawImage(othOnloadImg.snowPoison!, x + w / 4, y + h / 3, w / 2, w / 2)
      ctx.restore()
    } else {
      if(curSpeed === 0) {
        ctx.save()
        ctx.globalAlpha = 0.9
        ctx.drawImage(othOnloadImg.snowVertigo!, x + w / 4, y + h / 3, w / 2, w / 2)
        ctx.restore()
      } else {
        ctx.save()
        ctx.globalAlpha = 0.9
        ctx.drawImage(othOnloadImg.snow!, x + w / 4, y + h / 3, w / 3, w / 3)
        ctx.restore()
      }
    }
  }
}
/** 画中毒效果 */
function drawEnemyPoison(enemy: EnemyStateType) {
  const { x, y, w, hp, poison } = enemy
  if(!poison) return
  const ctx = gameConfigState.ctx
  const othOnloadImg = sourceInstance.state.othOnloadImg
  ctx.save()
  ctx.globalAlpha = 0.9
  if(poison.level === 5) {
    ctx.drawImage(othOnloadImg.poison!, x + w / 4, y - hp.size - w / 2, w / 2, w / 2)
  } else {
    let arr = [3 * w / 8, w / 4, w / 8, 0]
    let poisonX = x + arr[poison.level - 1]
    for(let i = 0; i < poison.level; i++) {
      ctx.drawImage(othOnloadImg.poison!, poisonX, y - hp.size - w / 4, w / 4, w / 4)
      poisonX += w / 4
    }
  }
  ctx.restore()
}
/** 绘画敌人的技能 */
function drawEnemySkill(enemy: EnemyStateType) {
  const { name, skill, x, y, w, h } = enemy
  const ctx = gameConfigState.ctx
  const othOnloadImg = sourceInstance.state.othOnloadImg
  if(name === 'rabbish-2') { // 画兔子回血效果
    const {cur, sum} = skill!.animation!
    if(cur === sum) return
    skill!.animation!.cur++
    ctx.save()
    const globalAlphaVal = Math.min(cur, sum - cur)
    ctx.globalAlpha = globalAlphaVal / 20
    const scale = 1 + cur / sum
    ctx.translate((x + w / 2) * (1 - scale), (y + h / 2) * (1 - scale))
    ctx.scale(scale, scale)
    ctx.drawImage(othOnloadImg.returnBlood!, x, y, w, w)
    ctx.restore()
  } else if(name === 'godzilla') { // 画哥斯拉原子吐息
    const {cur, sum} = skill!.animation!
    if(cur === sum) return
    skill!.animation!.cur++
    const t = enemy.skill!.direction!
    const size = gameConfigState.size
    const thickness = ((cur + sum) / (sum * 2)) * size
    drawLinearGradientRoundRect({
      ctx, thickness, thicknessPre: 0,
      x: x + w / 2, y: y + h / 2, tx: t.x, ty: t.y,
      linearGradient: [
        {value: 0, color: '#de5332'},
        {value: 0.4, color: '#f3c105'},
        {value: 0.5, color: '#ffc800'},
        {value: 0.6, color: '#f3c105'},
        {value: 1, color: '#de5332'},
      ]
    })
  }
}
/** 绘画生命值 */
function drawEnemyHp(enemy: EnemyStateType) {
  const { x, y, w, hp } = enemy
  const ctx = gameConfigState.ctx
  const w_2 = w - hp.size
  // 每一条血条的生命值
  const oneHp = hp.sum / hp.level!
  const colorI = Math.ceil(hp.cur / oneHp)
  // 血条背景色
  ctx.fillStyle = enemyHpColors[colorI - 1]
  ctx.fillRect(x, y - hp.size, w_2, hp.size)
  // 血条颜色
  ctx.fillStyle = enemyHpColors[colorI]
  ctx.fillRect(x, y - hp.size, w_2 * (hp.cur - (colorI - 1) * oneHp) / oneHp, hp.size)
  // 画边框
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#cff1d3"; //边框颜色
  ctx.rect(x, y - hp.size, w_2, hp.size);  //透明无填充
  ctx.stroke();
}
/** 绘画敌人的等级 */
function drawEnemyLevel(enemy: EnemyStateType) {
  const { x, y, hp } = enemy
  const ctx = gameConfigState.ctx
  const othOnloadImg = sourceInstance.state.othOnloadImg
  if(hp.level! < 10) {
    const levelSize = hp.size
    const moonN = Math.floor(hp.level! / 3)
    const starN = Math.floor(hp.level! % 3)
    let levelX = x - levelSize * 2, levelY = y - levelSize
    if(starN + moonN === 1) {
      ctx.drawImage(othOnloadImg[starN ? 'star' : 'moon']!, levelX, levelY, levelSize, levelSize)
    } else if(starN + moonN === 2) {
      levelX -= levelSize
      for(let i = 0; i < 2; i++) {
        ctx.drawImage(othOnloadImg[moonN > i ? 'moon' : 'star']!, levelX, levelY, levelSize, levelSize)
        levelX += levelSize
      }
    } else if(starN + moonN === 3) {
      for(let i = 0; i < 3; i++) {
        if(i === 0) {levelX -= levelSize / 2; levelY -= levelSize / 2;}
        else if(i === 1) {levelX -= levelSize / 2; levelY += levelSize;}
        else if(i === 2) levelX += levelSize;
        ctx.drawImage(othOnloadImg[moonN > i ? 'moon' : 'star']!, levelX, levelY, levelSize, levelSize)
      }
    } else if(starN + moonN === 4) {
      for(let i = 0; i < 4; i++) {
        if(i === 0) {levelX -= levelSize; levelY -= levelSize / 2;}
        else if(i === 1 || i === 3) levelX += levelSize;
        else if(i === 2) {levelX -= levelSize; levelY += levelSize;}
        ctx.drawImage(othOnloadImg[moonN > i ? 'moon' : 'star']!, levelX, levelY, levelSize, levelSize)
      }
    }
  } else {
    ctx.drawImage(othOnloadImg.sun!, x - hp.size * 2, y - hp.size * 3 / 2, hp.size * 2, hp.size * 2)
  }
}

export {
  enemyMap,
  enemyState,
  slowEnemy,
  drawEnemyImg,
  drawEnemySlow,
  drawEnemyPoison,
  drawEnemySkill,
  drawEnemyHp,
  drawEnemyLevel,
}

