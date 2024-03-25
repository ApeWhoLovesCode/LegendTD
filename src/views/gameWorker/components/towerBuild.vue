<script setup lang='ts'>
import { computed } from 'vue';
import { useSourceStore } from '@/stores/source';
import { GameBaseData, TowerState, TowerName } from '@/type';
import otherImgData from '@/dataSource/otherImgData';
import { useUserInfoStore } from '@/stores/userInfo';

const props = defineProps<{
  towerState: TowerState
  baseDataState: GameBaseData
  size: number
}>()
const emit = defineEmits<{
  (event: 'buildTower', tname: TowerName) : void
  (event: 'saleTower', towerId: string) : void
}>()

// 全局资源
const source = useSourceStore()
const userInfoStore = useUserInfoStore()

/** 塔防容器的样式 */
const buildingStyle = computed(() => {
  const {left, top} = props.towerState.building
  const size = transRatio(props.size)
  return {left: transRatio(left) + size + 'px', top: transRatio(top) + size + 'px'}
})
/** 塔防容器的类名 */
const buildingClass = computed(() => {
  const {left, top} = props.towerState.building
  const {x_num, y_num} = props.baseDataState.gridInfo
  const size = props.size
  const _x_num = Math.round(left / size), _y_num = Math.round(top / size)
  let className = ''
  if(_y_num >= y_num - 5) {
    className += 'tower-wrap-bottom '
  }
  // 点击在左右两边的情况
  if(_x_num <= 1 || _x_num >= x_num - 2) {
    className += 'tower-wrap-row '
    if(_y_num >= 2) className += 'tower-wrap-row-top '
    if(_x_num <= 1) className += 'tower-wrap-left'
    else className += 'tower-wrap-right'
  }
  return className
})
/** 攻击范围的样式 */
const buildingScopeStyle = computed(() => {
  const size = transRatio(props.size)
  const {left, top, r} = props.towerState.buildingScope
  return {
    left: transRatio(left) + size + size / 2 + 'px',
    top: transRatio(top) + size + size / 2 + 'px',
    width: transRatio(r) * 2 + 'px',
    height: transRatio(r) * 2 + 'px'
  }
})
/** 售卖防御塔按钮的样式 */
const saleTowerStyle = computed(() => {
  const {y_num} = props.baseDataState.gridInfo
  const size = props.size
  const _y_num = Math.round(props.towerState.buildingScope.top / size)
  return _y_num >= y_num / 2 ? { top: 0 } : { bottom: 0 }
})

/** 清晰度转化 */
function transRatio(v: number) {
  return v / source.ratio
}

</script>

<template>
  <div 
    class="towerBuild" 
    :style="{
      '--buildSize': (source.isMobile 
        ? (props.size / source.ratio) * 1.5
        : props.size / source.ratio
      ) + 'px'
      }"
    >
    <div v-show="towerState.building.isShow" class="building-wrap" :style="buildingStyle">
      <!-- 塔防的容器 -->
      <img :src="otherImgData.building" alt="" class="add-icon">
      <div v-if="source.towerSource" class="tower-wrap" :class="buildingClass">
        <div 
          v-for="(tname, index) in userInfoStore.towerSelectList" 
          class="tower" 
          :class="{
            'tower-no-money': baseDataState.money < source.towerSource[tname].money,
            'tower-mobile': source.isMobile
          }" 
          :key="index"
          @click="emit('buildTower', tname)"
        >
          <img :src="source.towerSource[tname].cover || source.towerSource[tname].img" alt="" class="tower-icon">
          <div class="tower-info">￥{{source.towerSource[tname].money}}</div>
        </div>
      </div>
    </div>
    <!-- 塔防的攻击范围 -->
    <div v-show="towerState.buildingScope.isShow" class="building-scope" :style="buildingScopeStyle">
      <span class="sale-wrap" @click="emit('saleTower', towerState.buildingScope.towerId)" :style="saleTowerStyle">
        <span class="iconfont icon-ashbin"></span>
        <span class="sale-num">{{ towerState.buildingScope?.saleMoney }}</span>
      </span>
    </div>
  </div>
</template>

<style lang='less' scoped>
@import '@/style.less';
@size: var(--size);
.towerBuild {
  @buildSize: var(--buildSize);
  .building-wrap {
    position: absolute;
    user-select: none;
    .add-icon {
      width: @size;
      height: @size;
    }
    .tower-wrap {
      position: absolute;
      top: calc(@size + 8px);
      left: calc(50% - (@buildSize * 2 + @buildSize / 2));
      display: grid;
      grid-template-columns: repeat(4, @buildSize);
      grid-template-rows: repeat(2, @buildSize);
      gap: calc(@buildSize / 5);
      background: rgba(255, 255, 255, .4);
      border-radius: 16px;
      padding: 10px;
      z-index: 99;
      @towerInfoSize: calc(@size * 0.26);
      .tower {
        position: relative;
        width: @buildSize;
        height: @buildSize;
        border-radius: 8px;
        border: 2px solid #fff;
        margin-bottom: 10px;
        box-sizing: border-box;
        .tower-icon {
          width: 100%;
          height: 100%;
          user-select: none;
          -webkit-user-drag: none;
        }
        .tower-info {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          text-align: center;
          font-size: @towerInfoSize;
          color: #fff;
          background: rgba(0, 0, 0, .4);
        }
      }
      .tower-mobile {
        border-radius: 2px;
        .tower-info {
          bottom: calc(-1 * @towerInfoSize);
        }
      }
      .tower-no-money {
        opacity: .3;
      }
    }
    .tower-wrap-row {
      grid-template-rows: repeat(4, @buildSize);
      grid-template-columns: repeat(2, @buildSize);
      grid-auto-flow: column;
      width: auto;
      .tower {
        margin-bottom: 0;
        margin-right: 10px;
      }
    }
    .tower-wrap-row-top {
      top: calc(50% - (@size * 2 + @size / 2));
    }
    .tower-wrap-left {
      left: calc(@size + 8px);
    }
    .tower-wrap-right {
      right: calc(@size + 8px);
      left: auto;
    }
    .tower-wrap-bottom {
      bottom: calc(@size + 8px);
      top: auto;
    }
  }
  .building-scope {
    position: absolute;
    z-index: 1;
    transform: translate(-50%, -50%);
    box-sizing: border-box;
    border: 2px solid #3b9bdf;
    border-radius: 50%;
    background: rgba(255, 255, 255, .25);
    .sale-wrap {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      justify-content: center;
      align-items: center;
      // background: rgba(255, 255, 255, 0.4);
      background: #3b9bdf;
      color: #fff;
      border-radius: 8px;
      padding: 0 5px;
      cursor: pointer;
      &:hover {
        opacity: .75;
      }
      .iconfont {
        font-size: 20px;
      }
      .sale-num {
        font-size: 14px;
      }
    }
  }
}
</style>