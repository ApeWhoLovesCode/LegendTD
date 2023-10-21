import { getAngle } from "@/utils/handleCircle"
import { powAndSqrt } from "@/utils/tools"

type LinearGradientRoundRectParams = {
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  tx: number
  ty: number
  globalAlpha?: number
  thickness: number
  thicknessPre: number
  linearGradient: {value: number, color: string}[]
}
/** 绘画渐变色 */
export function drawLinearGradientRoundRect({
  ctx, x, y, tx, ty, thickness, thicknessPre, linearGradient: linearGradientArr, globalAlpha = 1
}: LinearGradientRoundRectParams) {
  const deg = getAngle({x, y}, {x: tx, y: ty})
  const xy = powAndSqrt(x - tx, y - ty)
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(deg * Math.PI / 180)
  ctx.globalAlpha = globalAlpha
  ctx.translate(-x, -y)
  const newY = y - (thickness - thicknessPre) / 2
  // 设置渐变色
  if(ctx.createLinearGradient) {
    const linearGradient = ctx.createLinearGradient(x, newY, x, newY + thickness)
    linearGradientArr.forEach(item => {
      linearGradient.addColorStop(item.value, item.color);
    })
    ctx.strokeStyle = linearGradient
    ctx.fillStyle = linearGradient
  } else {
    ctx.strokeStyle = linearGradientArr[0].color
    ctx.fillStyle = linearGradientArr[2].color
  }
  ctx.beginPath()
  if((ctx as any).roundRect) {
    (ctx as any).roundRect(x, newY, xy, thickness, thickness / 2)
  } else {
    ctx.moveTo(x + thickness / 2, newY)
    ctx.arcTo(x + xy, newY, x + xy, newY + thickness, thickness / 2)
    ctx.arcTo(x + xy, newY + thickness, x, newY + thickness, thickness / 2)
    ctx.arcTo(x, newY + thickness, x, newY, thickness / 2)
    ctx.arcTo(x, newY, x + xy, newY, thickness / 2)
  }
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}