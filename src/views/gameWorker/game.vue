<script setup lang='ts'>
import { useSourceStore } from '@/stores/source';
import { onMounted, reactive, toRaw } from 'vue';
import useDomRef from '../game/tools/domRef';

import Worker from "./workers/index.ts?worker"

const source = useSourceStore()

const { canvasRef, audioBgRef, audioLevelRef, audioSkillRef, audioEndRef, audioRefObj } = useDomRef()

const state = reactive({
  x: 125,
  y: 125,
  w: 50,
  h: 50,
  speed: 1,
  r: 300,
})

const openWorker = () => {
  const canvasBitmap = document.getElementById('game-canvas') as HTMLCanvasElement;
  const offscreen = canvasBitmap.transferControlToOffscreen();
  const worker = new Worker()
  worker.postMessage({
    screenInfo: {
      width: document.documentElement.clientWidth, 
      height: document.documentElement.clientHeight, 
    }, 
    canvasInfo: {
      offscreen,
      width: canvasRef.value!.width,
      height: canvasRef.value!.height
    }
  }, [offscreen]);
  worker.onmessage = e => {
    console.log(e.data)
    // setTimeout(() => {
    //   worker.postMessage('线程关闭')
    //   worker.terminate()
    // }, 1000)
  }
}

const gamePause = () => {
  
}

/** 监听用户的键盘事件 */
function onKeyDown() {
  document.onkeydown = (e) => {
    // if(gameConfigState.isGameBeginMask) return
    switch (e.code) {
      case "Space":{
        gamePause()
        break;
      } 
    }
  };
}

const init = () => {
  openWorker()
  onKeyDown()
}


onMounted(() => {
  init()
})

</script>

<template>
  <div class='worker'>
    <canvas 
      ref="canvasRef"
      id="game-canvas" 
      width="1050" 
      height="600"
    ></canvas>
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