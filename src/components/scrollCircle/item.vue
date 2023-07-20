<script setup lang='ts'>
import { inject, computed } from "vue";
import { classPrefix, provideKey } from "./provide";
import { ScrollCircleProvide } from "./type";

type ScrollRotateItemProps = {
  /** 当前item的索引 */
  index: number
}

const props = defineProps<ScrollRotateItemProps>()

const emit = defineEmits<{
  (event: 'onClick', i: number): void
}>()

const provideState = inject<ScrollCircleProvide>(provideKey)

const cardStyle = computed(() => {
  const {cardDeg = 1, circleR = 1, isVertical, isClockwise} = provideState as ScrollCircleProvide 
  const initDeg = isVertical ? 90 : 0
  const deg = initDeg + cardDeg * props.index
  let n = isClockwise ? -1 : 1
  n *= isVertical ? -1 : 1
  const top = circleR * (1 - Math.cos(deg * Math.PI / 180))
  const left = circleR * (1 - n * Math.sin(deg * Math.PI / 180))
  const rotate = initDeg - n * deg
  return {
    top: `${top}px`,
    left: `${left}px`,
    transform: `translate(-50%, -50%) rotate(${rotate}deg)`
  }
})

</script>

<template>
  <div 
    :class="`${classPrefix}-cardWrap`" 
    :style="cardStyle" 
    @click="() => {
      if(provideState?.isClick) {
        emit('onClick', props.index)
      }
    }"
  >
    <slot></slot>
  </div>
</template>

<style lang='less' scoped>
.legendTD-scroll-circle-cardWrap {
  position: absolute;
  transform-origin: center center;
}
</style>