<script setup lang='ts'>
import { onMounted, reactive, computed } from 'vue';
import { ElDrawer, ElMessage, ElMessageBox, ElTooltip } from 'element-plus';
import towerData, { towerStaticData } from '@/dataSource/towerData';
import ScrollCircle from '@/components/scrollCircle/index.vue'
import ScrollCircleItem from '@/components/scrollCircle/item.vue'
import { useUserInfoStore } from '@/stores/userInfo';
import TowerCanvas from './towerCanvas.vue';
import { useSourceStore } from '@/stores/source';
import { TowerName, TowerType } from '@/type';

const userStore = useUserInfoStore()
const source = useSourceStore()
defineProps({
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
  pageSize: Object.keys(towerData).length,
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

const onClose = () => {
  emit('update:visible', false)
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
    :class="{'selectTowerPopMobile': source.isMobile}"
    :with-header="false"
    :size="source.isMobile ? '80vh' : '90vh'"
    direction="btt"
    @close="onClose"
    :style="{ 
      '--selectCardSize': source.isMobile ? '10vh' : '12vw',
      '--cardGridSize': source.isMobile ? '6vw' : '16px',
    }"
  >
    <div class="selectTowerPop-header">
      <div class="selectTowerPop-header-content">
        <div class="mask mask-left"></div>
        <div 
          v-for="key in userStore.towerSelectList" 
          :key="towerData[key]?.name" 
          class="towerBox" 
        >
          <img :src="towerData[key]?.img" alt="" class="towerImg">
          <ElTooltip :content="towerStaticData[towerData[key]?.name]?.explain">
            <div class="towerName">{{ towerStaticData[towerData[key]?.name]?.name }}</div>
          </ElTooltip>
          <span class="closeIcon iconfont icon-close" @click="handleSelectTower(key)"></span>
        </div>
        <div class="mask mask-right"></div>
      </div>
      <div class="selectNum">{{ userStore.towerSelectList.length }} / 8</div>
    </div>
    <div class="selectTowerPop-content">
      <ScrollCircle 
        :list-length="towerList.length" 
        :card-add-deg="3"
        :center-point="source.isMobile ? 'right' : 'center'"
        @on-page-change="onPageChange"
      >
        <ScrollCircleItem 
          v-for="(item, i) in state.items" 
          :key="item.name" 
          :index="i"
          @on-click="() => {
            handleSelectTower(item.name)
          }"
        >
          <div class="card">
            <div class="towerImg"> 
              <TowerCanvas :tname="item.name" :enemy-list="towerStaticData[item.name].enemyList" :is-pause="!visible" />
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
    <span class="close" @click="onClose">×</span>
  </ElDrawer>
</template>

<style lang='less'>
@import '@/style.less'; 
.selectTowerPop {
  background-image: radial-gradient(circle 350px at center, #bcf1f3 0%, #95e0f3 47%, #68baf5 100%);
  .el-drawer__body {
    padding: 0;
    display: flex;
  }
  &-header {
    position: relative;
    display: flex;
    flex-direction: column-reverse;
    width: var(--selectCardSize);
    height: 100%;
    @headerPadding: 0.8rem;
    @selectCardSize: calc(var(--selectCardSize) - 2 * @headerPadding);
    &-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: scroll;
      padding: @headerPadding;
      border-right: 2px solid @red;
      &::-webkit-scrollbar {
        display: none!important;
        width: 0px;  
        height: 0px;  
      }
      .towerBox {
        flex-shrink: 0;
        position: relative;
        box-sizing: border-box;
        width: @selectCardSize;
        height: @selectCardSize;
        border: 2px solid @yellow;
        margin-bottom: 10px;
        &:last-of-type {
          margin-bottom: 0;
        }
        .towerImg {
          width: 100%;
          height: 100%;
          display: block;
          user-select: none;
          -webkit-user-drag: none;
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
          user-select: none;
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
      left: 0;
      width: 100%;
      height: calc(@headerPadding * 4);
      z-index: 1;
      &-left {
        top: 3rem;
        background: linear-gradient(to bottom, #68baf5, rgba(255, 255, 255, 0));
      }
      &-right {
        bottom: 0;
        background: linear-gradient(to top, #68baf5, rgba(255, 255, 255, 0));
      }
    }
    .selectNum {
      width: 100%;
      height: 3rem;
      line-height: 2.8rem;
      font-size: 1.3rem;
      font-weight: bold;
      color: #fff;
      text-align: center;
      border-radius: 18px;
      border: 2px solid @theme3;
      box-shadow: inset 2px 2px 6px #082a74;
    }
  }
  &-content {
    flex: 1;
    @gridSize: var(--cardGridSize);
    .card {
      position: relative;
      box-sizing: border-box;
      width: calc(9 * @gridSize + 8px);
      border: 2px solid @yellow;
      background-color: @black;
      padding: 2px;
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
        color: #fff;
        margin-top: 2px;
        border-top: 2px solid @yellow;
        .name {
          font-size: 12px;
          margin-right: 10px;
        }
        .money {
          font-size: 12px;
          color: @yellow;
        }
      }
      .explain {
        color: #fff;
        font-size: 10px;
        line-height: 14px;
        height: 28px;
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      &-select {
        position: absolute;
        right: -24px;
        top: 16px;
        width: 100px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        letter-spacing: 8px;
        color: #fff;
        background: @red;
        transform: rotate(45deg);
        filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3));
      }
    }
  }
  .close {
    position: absolute;
    top: 1.5rem;
    right: 2rem;
    font-size: 2rem;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
}
/** 移动端的样式 */
.selectTowerPopMobile {
  .el-drawer__body {
    flex-direction: column;
  }
  .selectTowerPop {
    &-header {
      width: 100%;
      height: 10vh;
      @maskWidth: 2rem;
      &-content {
        flex-direction: row;
        align-items: center;
        width: 100%;
        height: 100%;
        overflow-x: scroll;
        padding: 0 calc(0.8 * @maskWidth);
        border-bottom: 2px solid @red;
        .towerBox {
          margin-right: 10px;
          margin-bottom: 0;
          &:last-of-type {
            margin-right: 0;
          }
        }
      }
      .mask {
        top: 0;
        width: @maskWidth;
        height: 100%;
        &-left {
          top: auto;
          left: 0;
          background: linear-gradient(to right, #68baf5, rgba(255, 255, 255, 0));
        }
        &-right {
          bottom: auto;
          left: auto;
          right: 0;
          background: linear-gradient(to left, #68baf5, rgba(255, 255, 255, 0));
        }
      }
      .selectNum {
        position: absolute;
        top: calc(100% + 1.2rem);
        left: 1.2rem;
        width: fit-content;
        padding: 0 20px;
      }
    }
    &-content {
      width: 100%;
      top: 0;
      flex: 1;
      .card {
        .nameWrap {
          font-size: 14px;
        }
        .explain {
          font-size: 12px;
          line-height: 16px;
          height: 32px;
        }
        &-select {
          position: absolute;
          right: -32px;
          top: 16px;
          width: 120px;
          height: 32px;
          line-height: 32px;
          font-size: 16px;
        }
      }

    }
  }
  .close {
    top: calc(10vh + 1.2rem);
  }
}
</style>