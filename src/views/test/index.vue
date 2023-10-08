<script setup lang='ts'>
import UserBall from '@/components/userBall.vue';
import { useSourceStore } from '@/stores/source';
import { useUserInfoStore } from '@/stores/userInfo';
import { onMounted, reactive, ref } from 'vue';
import TowerCanvas from '@/components/towerCanvas.vue';
import CoverCanvas from '@/components/coverCanvas.vue';
import SelectTips from '@/components/selectTips.vue';

const source = useSourceStore()

const isOnload = ref(false)

onMounted(() => {
  source.loadingAllImg().then(() => {
    isOnload.value = true
  })
})

</script>

<template>
  <div class='test'>
    <!-- <UserBall /> -->
    <div class="towerImg"> 
      <!-- :enemy-list="[{i: 1, level: 1},{i: 1, level: 2},{i: 1, level: 3},{i: 1, level: 4},{i: 1, level: 5},{i: 1, level: 6},{i: 1, level: 7},{i: 1, level: 8},{i: 1, level: 9},{i: 1, level: 10}]" -->
      <!-- <TowerCanvas 
        tname='ejiate' 
        :enemy-list="[{i: 1, level: 2},{i: 1, level: 2},{i: 1, level: 2}]"
      /> -->
      <SelectTips />
    </div>
  </div>
</template>

<style lang='less' scoped>
.test {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(skyblue, green);
  @gridSize: 2.3rem;
  .towerImg {
    width: calc(9 * @gridSize);
    height: calc(7 * @gridSize);
  }
}
</style>