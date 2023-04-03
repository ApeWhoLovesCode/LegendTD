import { powAndSqrt } from "@/utils/tools";

const state = {
  x: 125,
  y: 125,
  w: 50,
  h: 50,
  speed: 1,
  r: 300,
}

addEventListener('message', e => {
  const { data } = e;
  console.log('data: ', data);
  const offscreen = data.canvas;
  const ctx = offscreen.getContext('2d');
  // setTimeout(() => {
  //     return postMessage('线程完成')
  // }, 1000)
  draw()
  function draw() {
    let scale = 1;
    const {w, h, r, speed} = state
    const l = powAndSqrt(w / 2, h / 2);
    const addScale = (r / l - 1) / ((r - l) / speed);
    (function go() {
      const {x, y, w, h} = state
      if (scale < 4) {
        scale += addScale
      } else {
        scale = 1;
      }
      ctx.clearRect(0,0,offscreen.width,offscreen.height)
      // 放大
      ctx.save()
      ctx.translate((x + w / 2) * (1 - scale), (y + h / 2) * (1 - scale))
      ctx.scale(scale, scale)
      ctx.beginPath()
      ctx.fillStyle = 'skyblue'
      ctx.roundRect(x, y, w, h, 10)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
      requestAnimationFrame(go)
    })()
  }
})

export default {}
