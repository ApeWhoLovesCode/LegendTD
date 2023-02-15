<template>
  <div class='com-level-select'>
    <div class="map-title">地图</div>
    <div 
      class="item" 
      v-for="(item,index) in mapGridInfoList" 
      :key="index"
      :class="{'active': mapLevel === index}" 
      @click="switchMapLevel(index)"
    >
      {{ index !== mapGridInfoList.length - 1 ? (index + 1) : '卍'}}
    </div>
  </div>
</template>

<script setup lang='ts'>
import { mapGridInfoList } from '../dataSource/mapData'

defineProps({
  mapLevel: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits<{
  (event: 'switchMapLevel', index: number): void
}>()

const switchMapLevel = (index: number) => {
  emit('switchMapLevel', index)
}

</script>
<style lang='less' scoped>
@import '@/style.less';
.com-level-select {
  position: fixed;
  left: calc(@size * -1);
  top: 50%;
  background: rgba(109, 218, 245, 0.8);
  padding: calc(@size * 0.3);
  border-radius: 0 8px 8px 0;
  transform: translate(0, -50%);
  transition: 0.2s transform;
  &:hover {
    transform: translate(@size, -50%);
  }
  .map-title {
    font-size: calc(@size * 0.4);
    font-weight: bold;
    color: #fff;
    text-align: center;
    margin-bottom: 12px;
  }
  .item {
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    width: @size;
    height: @size;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: calc(@size * 0.2);
    margin-bottom: 12px;
    &:hover {
      background: rgba(109, 218, 245, 0.7);
    }
  }
  .active {
    background: rgba(109, 218, 245, 0.6);
  }

}
</style>