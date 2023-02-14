<script setup lang='ts'>
import { inject, computed } from "vue-demi";
import { classPrefix, provideKey } from "./provide";
import { ScrollCircleProvide } from "./type";

type ScrollRotateItemProps = {
  /** 当前item的索引 */
  index: number
}

const props = defineProps<ScrollRotateItemProps>()
const provideState = inject<ScrollCircleProvide>(provideKey)

const cardStyle = computed(() => {
  const {cardDeg = 1, circleR = 1, isVertical} = provideState as ScrollCircleProvide 
  const deg = (isVertical ? 90 : 0) + cardDeg * props.index
  const top = circleR * (1 - Math.cos(deg * Math.PI / 180))
  const left = circleR * (1 - Math.sin(deg * Math.PI / 180))
  const rotate = 90 - deg
  return {top: `${top}px`, left: `${left}px`, transform: `translate(-50%, -50%) rotate(${rotate}deg)`}
})

</script>

<template>
  <div :class="`${classPrefix}-cardWrap`" :style="cardStyle">
    <slot></slot>
  </div>
</template>

<style lang='less' scoped>
.protect-scroll-circle-cardWrap {
  position: absolute;
  transform-origin: center center;
}
</style>