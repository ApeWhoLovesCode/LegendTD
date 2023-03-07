<script setup lang='ts'>
import { useSourceStore } from '@/stores/source';
import { onMounted, reactive } from 'vue';
import { ElDrawer } from 'element-plus';
import towerData, { TowerType } from '@/dataSource/towerData';
import ScrollCircle from '@/components/scrollCircle/index.vue'
import ScrollCircleItem from '@/components/scrollCircle/item.vue'
import { useUserInfoStore } from '@/stores/userInfo';

const userStore = useUserInfoStore()

const {visible} = defineProps({
  visible: {
    type: Boolean,
    default: false,
    require: true
  }
})
const emit = defineEmits<{
  (event: 'update:visible', v: boolean): void;
}>()

const state = reactive({
  // 遍历的数据列表
  items: [] as TowerType[],
  pageNum: 1,
  pageSize: 20,
})

const onPageChange = ({pageNum, pageSize}: {pageNum: number, pageSize: number}) => {
  const preIndex = (pageNum - 1) * pageSize
  const arr = towerData.slice(preIndex, preIndex + pageSize)
  state.items = arr
  state.pageNum = pageNum
  state.pageSize = pageSize
}

const cardIndex = (i: number) => (state.pageNum - 1) * state.pageSize + i

const selectTower = (i: number) => {
  const index = userStore.towerSelectList.findIndex(ti => ti === i)
  if(index !== -1) {
    userStore.towerSelectList.splice(index, 1)
  } else {
    userStore.towerSelectList.push(i)
  }
}

</script>

<template>
  <ElDrawer 
    v-model="visible"
    custom-class='selectTowerPop' 
    :with-header="false"
    size="70vh"
    direction="btt"
    @close="emit('update:visible', false)"
  >
    <div class="selectTowerPop-header">
      <div class="mask mask-left"></div>
      <div class="selectTowerPop-header-content">
        <div v-for="i in userStore.towerSelectList" :key="towerData[i]?.name" class="towerBox">
          <img :src="towerData[i]?.img" alt="" class="towerImg">
          <div class="towerName">{{ towerData[i]?.name }}</div>
        </div>
      </div>
      <div class="mask mask-right"></div>
    </div>
    <div class="selectTowerPop-content">
      <ScrollCircle 
      :list="towerData" 
      @on-page-change="onPageChange"
      :card-add-deg="3"
    >
      <ScrollCircleItem 
        v-for="(item, i) in state.items" 
        :key="cardIndex(i)" 
        :index="i"
        @on-click="() => {
          selectTower(cardIndex(i))
        }"
      >
        <div class="card">
          <!-- <img :src="item.img" class="towerImg" alt=""> -->
          <div>{{ item.name }}</div>
        </div>
      </ScrollCircleItem>
    </ScrollCircle>
    </div>
  </ElDrawer>
</template>

<style lang='less'>
@import '@/style.less'; 
.selectTowerPop {
  background-color: #fff;
  .el-drawer__body {
    padding: 0;
  }
  @headerHeight: 7rem;
  &-header {
    @maskWidth: 50px;
    position: relative;
    height: @headerHeight;
    &-content {
      display: flex;
      height: 100%;
      overflow-x: scroll;
      padding: 0 @maskWidth;
      &::-webkit-scrollbar {
        display: none!important;
        width: 0px;  
        height: 0px;  
      }
      .towerBox {
        position: relative;
        box-sizing: border-box;
        width: @headerHeight;
        height: 100%;
        border: 2px solid @theme3;
        margin-right: 12px;
        &:last-of-type {
          margin-right: 0;
        }
        .towerImg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .towerName {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          text-align: center;
          height: 1.5rem;
          line-height: 1.5rem;
          background-color: rgba(0, 0, 0, .4);
          color: #fff;
        }
      }
    }
    .mask {
      position: absolute;
      top: 0;
      width: @maskWidth;
      height: 100%;
    }
    .mask-left {
      left: 0;
      background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
    }
    .mask-right {
      right: 0;
      background: linear-gradient(to left, #fff, rgba(255, 255, 255, 0));
    }
  }
  &-content {
    width: 100%;
    height: calc(70vh - @headerHeight);
    .card {
      width: 20rem;
      height: 15rem;
      border: 1px solid #ccc;
      cursor: pointer;
      user-select: none;
      -webkit-user-drag: none;
      .towerImg {
        width: 7rem;
        height: 7rem;
      }
    }
  }
}
</style>