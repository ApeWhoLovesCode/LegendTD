<script setup lang='ts'>
import { onMounted, reactive, ref } from 'vue';
import ScrollCircle from '@/components/scrollCircle/index.vue'
import ScrollCircleItem from '@/components/scrollCircle/item.vue'
import levelData from '@/dataSource/levelData';

/** 一大关的关卡数量（一圈的数量） */
const HIGHER_LEVEL_NUM = 16
// 第几大关
const circleIndex = ref(0)

const state = reactive<{list: any[]}>({
  list: []
})

const init = () => {
  const preIndex = circleIndex.value * HIGHER_LEVEL_NUM
  state.list = levelData.slice(preIndex, preIndex + HIGHER_LEVEL_NUM)
}

onMounted(() => {
  init()
})

</script>

<template>
  <div class='page-index'>
    <ScrollCircle :list="state.list" :height="`calc(100vh)`">
      <ScrollCircleItem 
        v-for="(item, i) in state.list" 
        :key="item._id" 
        :index="i"
      >
        <div class="card">
          <div class="cardTitle">{{ i }}</div>
        </div>
      </ScrollCircleItem>
    </ScrollCircle>
  </div>
</template>

<style lang='scss' scoped>
.page-index {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  .placeholder {
    height: 100px;
    background: green;
  }
  .card {
    width: 17rem;
    height: 25rem;
    border: 3px solid #000;
    border-radius: 12px;
  }
}
</style>