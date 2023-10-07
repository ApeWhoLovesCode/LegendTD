<script setup lang='ts'>
import { onMounted, reactive } from 'vue';
import ScrollCircle from '@/components/scrollCircle/index.vue'
import ScrollCircleItem from '@/components/scrollCircle/item.vue'
import levelData, {levelNullItem, LevelDataItem, LevelDataItemEnum} from '@/dataSource/levelData';
import CoverCanvas from '@/components/coverCanvas.vue';
import { ElDrawer } from 'element-plus';
import { useSourceStore } from '@/stores/source';

const source = useSourceStore()

const {visible} = defineProps({
  visible: {
    type: Boolean,
    default: false,
    require: true
  }
})
const emit = defineEmits<{
  (event: 'update:visible', v: boolean): void;
  (event: 'switchMapLevel', index: number): void;
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

const cardIndex = (i: number) => (state.pageNum - 1) * state.pageSize + i

const getCardText = (i: number) => {
  switch (levelData[i].type) {
    case LevelDataItemEnum.Endless: return '卍';
    case LevelDataItemEnum.Experience: return '试玩';
    default: return i
  }
}

</script>

<template>
  <ElDrawer 
    :modelValue="visible"
    class='selectLevelPop' 
    :with-header="false"
    size="50vh"
    @close="emit('update:visible', false)"
  >
    <div class="selectLevelPop-area">
      <ScrollCircle 
        :list-length="levelData.length" 
        :init-cart-num="source.mapLevel"
        @on-page-change="onPageChange"
        :card-add-deg="3"
      >
        <ScrollCircleItem 
          v-for="(_, i) in state.items" 
          :key="cardIndex(i)" 
          :index="i"
          @on-click="() => {
            if(levelData[cardIndex(i)]) {
              emit('switchMapLevel', cardIndex(i));
              emit('update:visible', false);
            }
          }"
        >
          <div class="card">
            <div v-if="source.mapLevel === cardIndex(i)" class="card-selected"></div>
            <div class="card-bg">
              <CoverCanvas :index="cardIndex(i)" />
              <div v-if="!levelData[cardIndex(i)]" class="card-disable iconfont icon-disablecase"></div>
            </div>
            <div class="card-level">{{ getCardText(i) }}</div>
          </div>
        </ScrollCircleItem>
      </ScrollCircle>
      <div class="selectLevelPop-close iconfont icon-close" @click="emit('update:visible', false)"></div>
    </div>
  </ElDrawer>
</template>

<style lang='less'>
@import '@/style.less'; 
.selectLevelPop {
  background-color: transparent;
  .el-drawer__body {
    padding: 0;
  }
  &-area {
    width: 50vh;
    height: 100vh;
    .card {
      position: relative;
      width: 12.5rem;
      height: 7.5rem;
      border: 2px solid #fff;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
      -webkit-user-drag: none;
      &-bg {
        position: absolute;
        left: 0;
        top: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
      }
      &-disable {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        text-align: center;
        line-height: 8rem;
        font-size: 3rem;
        color: rgba(255, 255, 255, .5);
      }
      &-level {
        position: absolute;
        left: -1rem;
        top: -1rem;
        width: 2rem;
        height: 2rem;
        line-height: 2rem;
        text-align: center;
        font-size: 1rem;
        font-weight: bold;
        color: #fff;
        border-radius: 50%;
        background: @red;
      }
      &-selected {
        @size: 0.5rem;
        position: absolute;
        left: -@size;
        top: -@size;
        width: calc(100% + @size * 2);
        height: calc(100% + @size * 2);
        // border: @size dashed @red;
        background: repeating-linear-gradient(135deg, transparent, transparent 3px, @red 3px, @red 8px);
        border-radius: 8px;
        animation: shine 2s infinite linear;
        opacity: 0.8;
        overflow: hidden;
        z-index: -2;
      }
      @keyframes shine {
        0% { background-position: -1px -1px;}
        100% { background-position: -12px -12px;}
      }
    }
  }
  &-close {
    position: absolute;
    left: 0;
    top: 0;
    color: #fff;
    font-size: 2rem;
    font-weight: bold;
    padding: 20px;
    cursor: pointer;
    &:hover {
      filter: drop-shadow(1px 1px 5px rgba(255, 255, 255, 0.8));
    }
  }
}
</style>