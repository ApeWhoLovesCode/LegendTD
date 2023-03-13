<script setup lang='ts'>
import UserBall from '@/components/userBall.vue';
import { useSourceStore } from '@/stores/source';
import { useUserInfoStore } from '@/stores/userInfo';
import { onMounted, ref } from 'vue';
import TowerCanvas from '@/components/towerCanvas.vue';

const userInfoStore = useUserInfoStore()
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
    <UserBall />
    <div class="towerImg"> 
      <TowerCanvas v-if="isOnload" :index="9" :e-index-list="[3]" />
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