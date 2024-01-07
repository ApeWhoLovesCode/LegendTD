<script setup lang='ts'>
import { useSourceStore } from '@/stores/source';
import { onMounted, ref } from 'vue';
import TowerCanvas from '@/components/towerCanvas.vue';
import SelectTips from '@/components/selectTips.vue';
import UserBall from '@/components/userBall.vue';
import ToolsFolder from '@/components/toolsFolder/index.vue';
import MyToolsFolder from '@/components/toolsFolder/myToolsFolder.vue';

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
    <!-- <div class="towerImg"> 
      <TowerCanvas 
        :enemy-list="[{enemyName: 'godzilla', level: 1}]"
        :tower-list="[{towerName: 'nanqiang', x: 2, y: 2}, {towerName: 'jin', x: 3, y: 2}]"
      />
    </div> -->
    <!-- <UserBall /> -->
    <MyToolsFolder />
  </div>
</template>

<style lang='less' scoped>
.test {
  width: 100vw;
  height: 100vh;
  @gridSize: 2.3rem;
  background-color: #ccc;
  .towerImg {
    width: calc(9 * @gridSize);
    height: calc(7 * @gridSize);
  }
}
</style>