<template>
  <div class="com-progress-bar">
    <div class="progress-wrap">
      <div class="progress-title">正在努力加载中~</div>
      <canvas ref="progressCanvasRef" id="canvas-progress" :width="this.canvasInfo.w" :height="this.canvasInfo.h" :style="canvasStyle"></canvas>
      <div class="progress-text">{{Math.round(progress)}} / 100%</div>
    </div>
  </div>
</template>

<script>
export default {
  name: '',
  props: {
    progress: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      canvasInfo: {w: 0, h: 0},
      curProgress: 0,
      animationFrame: null,
    };
  },
  computed: {
    canvasStyle() {
      const { h } = this.canvasInfo
      return {background: '#fff', borderRadius: `${h / 2}px`}
    }
  },
  watch: {
    progress(newVal, oldVal) {
      this.curProgress = oldVal
      this.startAnimation(newVal)
    }
  },
  mounted() {
    // background-image: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
    this.getCanvasInfo();
  },
  beforeDestroy() {
    cancelAnimationFrame(this.animationFrame)
  },
  methods: {
    getCanvasInfo() {
      this.canvas = this.$refs.progressCanvasRef;
      this.ctx = this.canvas.getContext("2d");
      this.canvasInfo.w = Math.round(document.documentElement.clientWidth * 0.6)
      this.canvasInfo.h = Math.round(document.documentElement.clientHeight * 0.05)
    },
    /** 开启动画绘画 */
    startAnimation(newVal) {
      const that = this;
      (function go() {
        that.drawProgress(++that.curProgress);
        if (that.curProgress < newVal ) {
          // 时间间隔为 1000/60 每秒 60 帧
          that.animationFrame = requestAnimationFrame(go);
        } else {
          cancelAnimationFrame(that.animationFrame)
        }
      })();
    },
    drawProgress(newVal) {
      const { w, h } = this.canvasInfo
      this.ctx.clearRect(0, 0, w, h);
      const _w = w * newVal / 100
      //创建一个渐变色线性对象
      const grad = this.ctx.createLinearGradient(0, 0, _w, h);
      //定义渐变色颜色
      grad.addColorStop(0,"#00f2fe");
      grad.addColorStop(1,"#4facfe");                  
      this.ctx.fillStyle = grad
      this.ctx.fillRect(0, 0, _w, h)
    },
  }
}
</script>
<style lang='less' scoped>
@import '@/style.less';
.com-progress-bar {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, .3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  .progress-wrap {
    .progress-title {
      margin-bottom: 12px;
      text-align: center;
      color: #3fb5f9;
      font-size: 20px;
      font-weight: bold;
    }
    .progress-text {
      text-align: right;
      margin-top: 8px;
      font-size: 16px;
      font-weight: bold;
      color: #5bb3e5;
    }
  }
}
</style>