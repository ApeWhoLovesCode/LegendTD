<script setup lang='ts'>
import { onMounted, reactive } from 'vue';

import Worker from "@/workers/index.ts?worker"

const state = reactive({
  x: 125,
  y: 125,
  w: 50,
  h: 50,
  speed: 1,
  r: 300,
})

const openWorker = () => {
  const canvasBitmap = document.getElementById('canvas');
  const offscreen = canvasBitmap.transferControlToOffscreen();
  const worker = new Worker()
  worker.postMessage({ state, canvas: offscreen }, [offscreen]);
  worker.onmessage = e => {
    console.log(e.data)
    // setTimeout(() => {
    //   worker.postMessage('线程关闭')
    //   worker.terminate()
    // }, 1000)
  }
}

onMounted(() => {
  // source.loadingAllImg().then(() => {
  //   isOnload.value = true
  // })
})

</script>

<template>
  <div class='worker'>
    <canvas id="canvas" width="1000" height="450"></canvas>
    <button @click="openWorker">开启</button>
  </div>
</template>

<style lang='less' scoped>
.worker {
  width: 100vw;
  height: 100vh;
  background-color: #aaa;
}
</style>