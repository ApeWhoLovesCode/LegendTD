<script setup lang='ts'>
import { onMounted, reactive, ref } from 'vue';
import ScrollCircle from '@/components/scrollCircle/index.vue'
import ScrollCircleItem from '@/components/scrollCircle/item.vue'
import levelData from '@/dataSource/levelData';

const state = reactive({
  // 总的数据列表
  list: [] as any[],
  // 遍历的数据列表
  items: [] as any[],
  pageNum: 1,
  pageSize: 20
})

const init = () => {
  const preIndex = (state.pageNum - 1) * state.pageSize
  state.items = levelData.slice(preIndex, preIndex + state.pageSize)
  state.list = levelData
}

const onPageChange = ({pageNum, pageSize}: {pageNum: number, pageSize: number}) => {
  const preIndex = (pageNum - 1) * pageSize
  state.items = levelData.slice(preIndex, preIndex + pageSize)
  state.pageNum = pageNum
  state.pageSize = pageSize
}

onMounted(() => {
  init()
})

</script>

<template>
  <div class='page-index'>
    <ScrollCircle 
      :list="state.list" 
      :height="`calc(100vh)`"
      :on-page-change="onPageChange"
    >
      <ScrollCircleItem 
        v-for="(item, i) in state.items" 
        :key="i" 
        :index="i"
      >
        <div class="card">
          <div class="cardTitle">页码：{{ state.pageNum }}-{{ i }}</div>
        </div>
      </ScrollCircleItem>
    </ScrollCircle>
  </div>
</template>

<style lang='less' scoped>
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