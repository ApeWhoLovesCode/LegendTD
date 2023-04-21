<script setup lang='ts'>
import UserBall from '@/components/userBall.vue';
import { useSourceStore } from '@/stores/source';
import { useUserInfoStore } from '@/stores/userInfo';
import { onMounted, reactive, ref } from 'vue';
import TowerCanvas from '@/components/towerCanvas.vue';
import useKeepInterval from '@/hooks/useKeepInterval';
import { ElButton, ElSpace, ElTag } from 'element-plus';
// import keepInterval from '@/utils/keepInterval';

const source = useSourceStore()
const keepInterval = useKeepInterval()
const state = reactive({
  v1: 0,
  v2: 0,
  v3: 0,
})

const isOnload = ref(false)

onMounted(() => {
  source.loadingAllImg().then(() => {
    isOnload.value = true
  })
  keepInterval.set('val', () => {
    state.v1++
  }, 1000)
  keepInterval.set('val2', () => {
    state.v2 += 1
  }, 1000)
  keepInterval.set('val3', () => {
    state.v3 += 3
  }, 1000)
})

const pause = () => {
  const v = keepInterval.pause('val');
}

</script>

<template>
  <div class='test'>
    <br>
    <ElSpace>
      <ElTag>v1: {{ state.v1 }}</ElTag>
      <ElTag>v2: {{ state.v2 }}</ElTag>
      <ElTag>v3: {{ state.v3 }}</ElTag>
    </ElSpace>
    <br>
    <br>
    <ElButton @click="keepInterval.set('val')">开始v1</ElButton>
    <ElButton @click="pause">暂停v1</ElButton>
    <ElButton @click="keepInterval.set('val2')">开始v2</ElButton>
    <ElButton @click="keepInterval.pause('val2')">暂停v2</ElButton>
    <ElButton @click="keepInterval.set('val3')">开始v3</ElButton>
    <ElButton @click="keepInterval.pause('val3')">暂停v3</ElButton>
    <ElButton @click="keepInterval.allPause(true)">全部暂停</ElButton>
    <ElButton @click="keepInterval.allPause(false)">全部开始</ElButton>
    <!-- <UserBall /> -->
    <div class="towerImg"> 
      <!-- <TowerCanvas 
        v-if="isOnload" 
        tname='lanbo' 
        :enemy-list="[{i: 1, level: 1},{i: 1, level: 2},{i: 1, level: 3},{i: 1, level: 4},{i: 1, level: 5},{i: 1, level: 6},{i: 1, level: 7},{i: 1, level: 8},{i: 1, level: 9},{i: 1, level: 10}]"
      /> -->
    </div>
  </div>
</template>

<style lang='less' scoped>
.test {
  width: 100vw;
  height: 100vh;
  background-color: #aaa;
  @gridSize: 2.3rem;
  .towerImg {
    width: calc(9 * @gridSize);
    height: calc(7 * @gridSize);
  }
}
</style>