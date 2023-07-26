<script setup lang='ts'>
import { inject, computed } from "vue";
import { classPrefix, provideKey } from "./provide";
import { ScrollCircleProvide } from "./type";
import { getCardDegXY } from "./utils";

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
  const {circleR, cardDeg, isVertical, centerPoint, isFlipDirection} = provideState as ScrollCircleProvide 
  const {initDeg, nx, ny, isAddDeg} = getCardDegXY({centerPoint, isFlipDirection, isVertical})
  const deg = initDeg + cardDeg * props.index;
  const top = circleR * (1 - ny * Math.cos((deg * Math.PI) / 180));
  const left = circleR * (1 - nx * Math.sin((deg * Math.PI) / 180));
  const rotate = initDeg - nx * ny * deg + (isAddDeg ? 180 : 0);
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