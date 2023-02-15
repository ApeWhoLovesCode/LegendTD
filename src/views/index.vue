<script setup lang='ts'>
import { onMounted, reactive } from 'vue';
import ScrollCircle from '@/components/scrollCircle/index.vue'
import ScrollCircleItem from '@/components/scrollCircle/item.vue'
import levelData, {levelNullItem, LevelDataItem} from '@/dataSource/levelData';

const state = reactive({
  // 遍历的数据列表
  items: [] as LevelDataItem[],
  pageNum: 1,
  pageSize: 20
})

const init = () => {
  const preIndex = (state.pageNum - 1) * state.pageSize
  state.items = levelData.slice(preIndex, preIndex + state.pageSize)
}

const onPageChange = ({pageNum, pageSize}: {pageNum: number, pageSize: number}) => {
  const preIndex = (pageNum - 1) * pageSize
  const arr = levelData.slice(preIndex, preIndex + pageSize)
  // 填充空数据
  const length = arr.length
  for(let i = 0; i < pageSize - length; i++) {
    arr.push(levelNullItem)
  }
  state.items = arr
  state.pageNum = pageNum
  state.pageSize = pageSize
}

onMounted(() => {
  init()
})

</script>

<template>
  <div class='page-index'>
    <div class="header">
      <div class="left">

      </div>
      <div class="center">
        
      </div>
      <div class="right">

      </div>
    </div>
    <ScrollCircle 
      :list="levelData" 
      :on-page-change="onPageChange"
    >
      <ScrollCircleItem 
        v-for="(item, i) in state.items" 
        :key="i" 
        :index="i"
      >
        <div class="card">
          <img class="card-bg" :src="item.cover" alt="">
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
    position: relative;
    width: 24rem;
    height: 18rem;
    border: 3px solid #000;
    border-radius: 12px;
    overflow: hidden;
    &-bg {
      position: absolute;
      left: 0;
      top: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      user-select: none;
      -webkit-user-drag: none;
    }
  }
}
</style>