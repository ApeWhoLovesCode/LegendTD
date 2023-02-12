<script setup lang='ts'>
import { getLineAngle } from '@/utils/handleCircle';
import { randomStr } from '@/utils/random';
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from 'vue';
import { provideKey, classPrefix } from './provide';
import { CircleInfoType, CircleTouchType, ScrollCircleProvide } from './type';

const systemInfo = {
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight
}

type ScrollCircleProps = {
  /** 传入卡片的数组 */
  list?: any[];
  /**
   * 滚动列表的高度
   * @default 100%
   */
  height?: string;
  /**
   * 卡片间增加的角度
   * @default 1
   */
  cardAddDeg?: number;
  /**
   * 索引为多少的卡片位于中间区域 从0开始算
   * @default 3
   */
  initCartNum?: number;
};

const props = withDefaults(defineProps<ScrollCircleProps>(), {
  cardAddDeg: 1,
  height: '100%',
  initCartNum: 3,
})
const provideState = reactive<ScrollCircleProvide>({
  circleR: 0,
  cardDeg: 0,
  isVertical: false
})
provide(provideKey, provideState)
const idRef = ref(randomStr(classPrefix))
/** 滚动盒子需要的信息 */
const info = reactive<CircleInfoType>({
  circleWrapHeight: 0,
  cardH: 0,
  circleR: 0,
  scrollViewDeg: 0,
});
/** 触摸信息 */
const touchInfo = reactive<CircleTouchType>({
  isTouch: false,
  startY: 0,
  startDeg: 0,
  time: 0,
});
/** 卡片间的度数 */
const cardDeg = ref<number>(0);
/** 旋转的度数 */
const rotateDeg = ref<number>(0);

onMounted(() => {
  setTimeout(() => {
    init()
  }, 10);
  window.addEventListener('resize', init)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', init)
})

const circleStyle = computed(() => {
  let x = '-100%', y = '0'
  if(provideState.isVertical) {
    x = '-50%';
    y = '-50%';
  }
  return {
    width: `${info.circleR * 2}px`,
    height: `${info.circleR * 2}px`,
    transform: `translate(calc(${x} + ${systemInfo.screenWidth / 2}px), ${y}) rotate(${rotateDeg.value}deg)`
  }
})

watch(() => props.list, () => {
  init()
})

const init = () => {
  const cWrapH = document.querySelector(`.${classPrefix}-wrap`)?.clientHeight ?? 0
  info.circleWrapHeight = cWrapH
  const cInfo = document.querySelector(`.${classPrefix}-cardWrap`)
  info.cardH = cInfo?.clientHeight ?? 0
  const cW = cInfo?.clientWidth ?? 0
  info.circleR = Math.round(systemInfo.screenHeight)
  // 卡片间的角度
  cardDeg.value = 2 * 180 * Math.atan(((info.cardH ?? 0) / 2) / (info.circleR - cW / 2)) / Math.PI + props.cardAddDeg
  // 屏幕高度对应的圆的角度
  info.scrollViewDeg = getLineAngle(info.circleWrapHeight, info.circleR)
  console.log(`可滚动区域高度: ${info.circleWrapHeight};\n卡片高度: ${info.cardH};\n圆的半径: ${info.circleR};\n卡片间的角度: ${cardDeg.value}度;\n可滚动区域占的度数: ${info.scrollViewDeg}度;`);
  rotateDeg.value = cardDeg.value * props.initCartNum
  provideState.circleR = info.circleR
  provideState.cardDeg = cardDeg.value
  provideState.isVertical = systemInfo.screenHeight > systemInfo.screenWidth
}

const onTouchStart = (e: MouseEvent) => {
  touchInfo.isTouch = true
  touchInfo.startY = provideState.isVertical ? e.clientY : -e.clientX
  touchInfo.startDeg = rotateDeg.value
  touchInfo.time = Date.now()
}
const onTouchMove = (e: MouseEvent) => {
  if(!touchInfo.isTouch) {
    return
  }
  const y = (provideState.isVertical ? e.clientY : -e.clientX) - touchInfo.startY
  const deg = Math.round(touchInfo.startDeg - info.scrollViewDeg * (y / info.circleWrapHeight))
  rotateDeg.value = deg
}
const onTouchEnd = (e: MouseEvent) => {
  const {startY, startDeg, time } = touchInfo
  // 移动的距离
  const _y = (provideState.isVertical ? e.clientY : -e.clientX) - startY
  // 触摸的时间
  const _time = Date.now() - time
  let deg = rotateDeg.value
  // 触摸的始末距离大于卡片高度的一半，并且触摸时间小于300ms，则触摸距离和时间旋转更多
  if((Math.abs(_y) > info.cardH / 2) && (_time < 300)) {
    // 增加角度变化 
    const v = _time / 300
    const changeDeg = info.scrollViewDeg * (_y / info.circleWrapHeight) / v
    deg = Math.round(startDeg - changeDeg)
  }
  // 处理转动的角度为：卡片的角度的倍数 (_y > 0 表示向上滑动)
  const _deg = cardDeg.value * Math[_y > 0 ? 'floor' : 'ceil'](deg / cardDeg.value)
  rotateDeg.value = _deg
  touchInfo.isTouch = false
}

</script>

<template>
  <div 
    :class="`${classPrefix}-wrap ${idRef}`"
    :style="{
      width: `${info.circleR * 2}px`,
      height: props.height,
    }"
  >
    <div 
      :class="classPrefix"
      @mousedown="onTouchStart"
      @mousemove="onTouchMove"
      @mouseup="onTouchEnd"
      @mouseleave="onTouchEnd"
      :style="circleStyle"
    >
    <!-- {
        width: `${info.circleR * 2}px`,
        height: `${info.circleR * 2}px`,
        transform: `translate(calc(-50% + ${systemInfo.screenWidth / 2}px), -50%) rotate(${rotateDeg}deg)`
      } -->
      <slot></slot>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.protect-scroll-circle-wrap {
  position: relative;
  overflow: hidden;
  user-select: none;
  .protect-scroll-circle {
    position: absolute;
    left: 50%;
    top: 50%;
    transform-origin: center center;
    transition: transform .6s ease-out;
  }
}
</style>