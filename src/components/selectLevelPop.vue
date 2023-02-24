<script setup lang='ts'>
import { onMounted, reactive, ref } from 'vue';
import ScrollCircle from '@/components/scrollCircle/index.vue'
import ScrollCircleItem from '@/components/scrollCircle/item.vue'
import levelData, {levelNullItem, LevelDataItem} from '@/dataSource/levelData';

const {visible} = defineProps({
  visible: {
    type: Boolean,
    default: false,
    require: true
  }
})
const emit = defineEmits<{
  (event: 'update:visible', v: boolean): void
}>()

const state = reactive({
  // 遍历的数据列表
  items: [] as LevelDataItem[],
  pageNum: 1,
  pageSize: 20,
})

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

const init = () => {
  const preIndex = (state.pageNum - 1) * state.pageSize
  state.items = levelData.slice(preIndex, preIndex + state.pageSize)
}

onMounted(() => {
  init()
})

const onCardClick = (i: number) => {
  console.log('i: ', i);
}

</script>

<template>
  <div 
    v-show="visible"
    class='selectLevelPop' 
  >
    <div class="area" :style="{transform: `translateX(${visible ? '-30vw' : '0'})`}">
      <ScrollCircle 
        :list="levelData" 
        @on-page-change="onPageChange"
      >
        <ScrollCircleItem 
          v-for="(item, i) in state.items" 
          :key="(state.pageNum - 1) * state.pageSize + i" 
          :index="i"
          @on-click="onCardClick(i)"
        >
          <div class="card">
            <div class="card-level">{{ (state.pageNum - 1) * state.pageSize + i + 1 }}</div>
          </div>
        </ScrollCircleItem>
      </ScrollCircle>
    </div>
  </div>
</template>

<style lang='less' scoped>
.selectLevelPop {
  position: fixed;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1001;
  background-color: rgba(0, 0, 0, 0.5);
  .area {
    position: absolute;
    right: -30vw;
    top: 0;
    width: 30vw;
    height: 100vh;
    box-shadow: 0px 16px 48px 16px rgba(0, 0, 0, 0.08),0px 12px 32px rgba(0, 0, 0, 0.12),0px 8px 16px -8px rgba(0, 0, 0, 0.16);
    transition: transform 0.6s;
  }
  .card {
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    font-size: 14px;
    background-color: skyblue;
  }
  
}
</style>