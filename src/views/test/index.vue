<script setup lang='ts'>
import { useSourceStore } from '@/stores/source';
import { onMounted, ref } from 'vue';
import TowerCanvas from '@/components/towerCanvas.vue';
import SelectTips from '@/components/selectTips.vue';
import UserBall from '@/components/userBall.vue';
import ToolsFolder from '@/components/toolsFolder/index.vue';
import GithubWhiteIcon from '@/assets/img/githubWhite.svg';
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
        tname='nanqiang' 
        :enemy-list="[{i: 1, level: 2}]"
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