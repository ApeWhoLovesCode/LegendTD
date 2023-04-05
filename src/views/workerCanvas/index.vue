<script setup lang='ts'>
import { onMounted, reactive } from 'vue';

import Worker from "@/workers/test.ts?worker"

const state = reactive({
  x: 125,
  y: 125,
  w: 50,
  h: 50,
  speed: 1,
  r: 300,
  pause: false,
  worker: void 0 as any, 
})

const openWorker = () => {
  const canvasBitmap = document.getElementById('canvas') as HTMLCanvasElement;
  const offscreen = canvasBitmap.transferControlToOffscreen();
  state.worker = new Worker()
  state.worker.postMessage({ init: true, canvas: offscreen }, [offscreen]);
  state.worker.onmessage = e => {
    console.log(e.data)
    // setTimeout(() => {
    //   worker.postMessage('线程关闭')
    //   worker.terminate()
    // }, 1000)
  }
}

const pause = () => {
  state.pause = !state.pause
  state.worker.postMessage({pause: state.pause});
}

onMounted(() => {
  // source.loadingAllImg().then(() => {
  //   isOnload.value = true
  // })
})

</script>

<template>
  <div class='worker'>
    <canvas id="canvas" width="1000" height="450" :style="{border: '1px solid #fff'}"></canvas>
    <button @click="openWorker">开启</button>
    <button @click="pause">暂停</button>
  </div>
</template>

<style lang='less' scoped>
.worker {
  width: 100vw;
  height: 100vh;
  background-color: #aaa;
}
</style>