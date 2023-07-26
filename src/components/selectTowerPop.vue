<script setup lang='ts'>
import { onMounted, reactive, computed } from 'vue';
import { ElDrawer, ElMessage, ElMessageBox } from 'element-plus';
import towerData, { TowerType, towerStaticData, TowerName } from '@/dataSource/towerData';
import ScrollCircle from '@/components/scrollCircle/index.vue'
import ScrollCircleItem from '@/components/scrollCircle/item.vue'
import { useUserInfoStore } from '@/stores/userInfo';
import TowerCanvas from './towerCanvas.vue';
import { useSourceStore } from '@/stores/source';

const userStore = useUserInfoStore()
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
  (event: 'reStart'): void;
}>()

const state = reactive({
  // 遍历的数据列表
  items: [] as TowerType[],
  pageNum: 1,
  pageSize: 10,
})

const towerList = computed(() => {
  return Object.values(towerData)
})

const onPageChange = ({pageNum, pageSize}: {pageNum: number, pageSize: number}) => {
  const preIndex = (pageNum - 1) * pageSize
  const arr = towerList.value.slice(preIndex, preIndex + pageSize)
  state.items = arr
  state.pageNum = pageNum
  state.pageSize = pageSize
}

const cardIndex = (i: number) => (state.pageNum - 1) * state.pageSize + i

const isSelect = (name: TowerName) => (userStore.towerSelectList.find(tname => tname === name) !== void 0)

const handleSelectTower = (name: TowerName) => {
  if(source.isGameing) {
    ElMessageBox.confirm(
      '重新选择塔防后，游戏将重新开始，你确定要重选塔防吗？',
      'Warning',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      selectTower(name)
      emit('reStart')
    })
  } else {
    selectTower(name)
  }
}
const selectTower = (name: TowerName) => {
  const index = userStore.towerSelectList.findIndex(tname => tname === name)
  if(index !== -1) {
    userStore.towerSelectList.splice(index, 1)
  } else {
    if(userStore.towerSelectList.length < 8) {
      userStore.towerSelectList.push(name)
    } else {
      ElMessage.info('最多只能选8个英雄~')
    }
  }
}

const init = () => {
  const preIndex = (state.pageNum - 1) * state.pageSize
  state.items = towerList.value.slice(preIndex, preIndex + state.pageSize)
}
onMounted(() => {
  init()
})

</script>

<template>
  <ElDrawer 
    :model-value="visible"
    class='selectTowerPop' 
    :with-header="false"
    size="80vh"
    direction="btt"
    @close="emit('update:visible', false)"
  >
    <div class="selectTowerPop-header">
      <div class="mask mask-left"></div>
      <div class="selectTowerPop-header-content">
        <div 
          v-for="key in userStore.towerSelectList" 
          :key="towerData[key]?.name" 
          class="towerBox" 
        >
          <img :src="towerData[key]?.img" alt="" class="towerImg">
          <div class="towerName">{{ towerStaticData[towerData[key]?.name]?.name }}</div>
          <span class="closeIcon iconfont icon-close" @click="handleSelectTower(key)"></span>
        </div>
      </div>
      <div class="mask mask-right"></div>
      <div class="selectNum">{{ userStore.towerSelectList.length }} / 8</div>
    </div>
    <div class="selectTowerPop-content">
      <ScrollCircle 
        :list-length="towerList.length" 
        @on-page-change="onPageChange"
        :card-add-deg="3"
      >
        <ScrollCircleItem 
          v-for="(item, i) in state.items" 
          :key="cardIndex(i)" 
          :index="i"
          @on-click="() => {
            handleSelectTower(item.name)
          }"
        >
          <div class="card">
            <div class="towerImg"> 
              <TowerCanvas :tname="item.name" :enemy-list="towerStaticData[item.name].enemyList" />
            </div>
            <div class="nameWrap">
              <span class="name">· {{ towerStaticData[item.name].name }}</span>
              <span class="money">金额: {{ towerData[item.name].money }}</span>
            </div>
            <div class="explain">{{ towerStaticData[item.name].explain }}</div>
            <div v-if="isSelect(item.name)" class="card-select">已选</div>
          </div>
        </ScrollCircleItem>
      </ScrollCircle>
    </div>
  </ElDrawer>
</template>

<style lang='less'>
@import '@/style.less'; 
.selectTowerPop {
  background-image: radial-gradient(circle 350px at center, #bcf1f3 0%, #95e0f3 47%, #68baf5 100%);
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
      border-bottom: 2px solid @red;
      &::-webkit-scrollbar {
        display: none!important;
        width: 0px;  
        height: 0px;  
      }
      .towerBox {
        flex-shrink: 0;
        position: relative;
        box-sizing: border-box;
        width: @headerHeight;
        height: 100%;
        border: 2px solid @yellow;
        border-bottom: none;
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
          height: 1.8rem;
          line-height: 1.8rem;
          background-color: rgba(0, 0, 0, .4);
          color: #fff;
        }
        .closeIcon {
          position: absolute;
          right: 0;
          top: 0;
          display: inline-block;
          width: 1.5rem;
          height: 1.5rem;
          line-height: 1.5rem;
          text-align: center;
          background-color: rgba(0, 0, 0, .4);
          color: #fff;
          font-weight: bold;
          font-size: 14px;
          border-bottom-left-radius: 4px;
          cursor: pointer;
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
      background: linear-gradient(to right, #68baf5, rgba(255, 255, 255, 0));
    }
    .mask-right {
      right: 0;
      background: linear-gradient(to left, #68baf5, rgba(255, 255, 255, 0));
    }
    .selectNum {
      position: absolute;
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 36px;
      line-height: 32px;
      font-size: 18px;
      font-weight: bold;
      color: #fff;
      text-align: center;
      border-radius: 18px;
      border: 2px solid @theme3;
      background-color: #1781c2;
      box-shadow: 2px 2px 12px 1px #1781c2,
      inset 2px 2px 6px #082a74;
    }
  }
  &-content {
    width: 100%;
    height: calc(80vh - @headerHeight);
    @gridSize: 36px;
    .card {
      position: relative;
      box-sizing: border-box;
      width: calc(9 * @gridSize + 32px);
      height: calc(7 * @gridSize + 140px);
      border: 2px solid @yellow;
      background-color: @black;
      padding: 16px;
      cursor: pointer;
      user-select: none;
      -webkit-user-drag: none;
      overflow: hidden;
      filter: drop-shadow(4px 4px 10px rgba(0, 0, 0, 0.6));
      .towerImg {
        width: calc(9 * @gridSize);
        height: calc(7 * @gridSize);
        margin: auto;
      }
      .nameWrap {
        font-weight: bold;
        line-height: 16px;
        color: #fff;
        margin-top: 16px;
        padding: 16px 0 12px;
        border-top: 2px solid @yellow;
        .name {
          font-size: 16px;
          margin-right: 12px;
        }
        .money {
          font-size: 12px;
          color: @yellow;
        }
      }
      .explain {
        color: #fff;
        font-size: 14px;
        line-height: 22px;
      }
      &-select {
        position: absolute;
        right: -32px;
        top: 16px;
        width: 120px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        letter-spacing: 8px;
        color: #fff;
        background: @red;
        transform: rotate(45deg);
        filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3));
      }
    }
  }
}
</style>