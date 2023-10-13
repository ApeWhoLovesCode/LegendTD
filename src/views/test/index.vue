<script setup lang='ts'>
import { useSourceStore } from '@/stores/source';
import { onMounted, ref } from 'vue';
import TowerCanvas from '@/components/towerCanvas.vue';
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
    <!-- <div class="towerImg"> 
      <TowerCanvas 
        tname='nanqiang' 
        :enemy-list="[{i: 1, level: 2}]"
      />
    </div> -->
    <SelectTips />
  </div>
</template>

<style lang='less' scoped>
.test {
  width: 100vw;
  height: 100vh;
  // background: linear-gradient(skyblue, green);
  @gridSize: 2.3rem;
  .towerImg {
    width: calc(9 * @gridSize);
    height: calc(7 * @gridSize);
  }
}
</style>