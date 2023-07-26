const source = {
  isMobile: false,
  ratio: 1,
}
const canvasInfo = {
  offscreen: void 0 as unknown as OffscreenCanvas,
  w: 0,
  h: 0,
  size: 50,
}
const state = {
  // requestAnimationFrame api的保存对象
  animationFrame: 0,
  // 得到 canvas 的 2d 上下文
  ctx: null as unknown as CanvasRenderingContext2D,
}

addEventListener('message', e => {
  const { data } = e;
  // 初始化
  if(data.init) {
    const offscreen = data.canvasInfo.offscreen;
    canvasInfo.offscreen = offscreen
    canvasInfo.size = data.canvasInfo.size
    state.ctx = (offscreen.getContext('2d') as CanvasRenderingContext2D);
    source.isMobile = data.source.isMobile
    source.ratio = data.source.ratio
    init()
  } 
  switch (data.fnName) {
    case '': {

    }
  }
})

function init() {

}

export default {}