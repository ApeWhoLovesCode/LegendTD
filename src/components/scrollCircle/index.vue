<script setup lang='ts'>
import { getLineAngle } from '@/utils/handleCircle';
import { randomStr } from '@/utils/random';
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from 'vue';
import { provideKey, classPrefix } from './provide';
import { CircleInfoType, CircleTouchType, ScrollCircleProvide } from './type';
import {changeEvent, classBem} from '@/utils/handleDom'
import { isMobile } from '@/utils/tools';

type ScrollCircleProps = {
  /** 传入卡片的数组 */
  list?: any[];
  /**
   * 滚动列表的宽度
   * @default 100%
   */
  width?: string;
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
   * @default 0
   */
  initCartNum?: number;
  /** 
   * 卡片是否平均分配圆形轨迹
   * @default true
   */
  isAverage?: boolean
  /** 
   * 是否是顺时针 (注意：垂直方向时，顺逆是相反的)
   * @default true
   */
  isClockwise?: boolean
};

const props = withDefaults(defineProps<ScrollCircleProps>(), {
  cardAddDeg: 1,
  width: '100%',
  height: '100%',
  initCartNum: 0,
  isAverage: true,
  isClockwise: true,
})
const emit = defineEmits<{
  /** 分页触发回调改变页码 */
  (event: 'onPageChange', page: {pageNum: number, pageSize: number}): void;
  /** 发生触摸的回调 */
  (event: 'onTouchStart'): void
  /** 发生滚动的回调 */
  (event: 'onTouchMove'): void
  /** 触摸结束的回调 */
  (event: 'onTouchEnd'): void
}>()

const idRef = ref(randomStr(classPrefix))
const provideState = reactive<ScrollCircleProvide>({
  circleR: 0,
  cardDeg: 0,
  isVertical: (document.querySelector(`.${idRef.value}`)?.clientHeight ?? 0) > (document.querySelector(`.${idRef.value}`)?.clientWidth ?? 0),
  isClockwise: !!props.isClockwise,
  isClick: false
})
provide(provideKey, provideState)
/** 组件盒子的宽和高 */
const circleDiv = reactive({
  w: 0,
  h: 0,
})
/** 滚动盒子需要的信息 */
const info = reactive<CircleInfoType>({
  circleWrapWH: 0,
  cardWH: 0,
  circleR: 0,
  scrollViewDeg: 0,
});
/** 触摸信息 */
const touchInfo = reactive<CircleTouchType>({
  startXY: 0,
  startDeg: 0,
  time: 0,
});
/** 卡片间的度数 */
const cardDeg = ref<number>(0);
/** 旋转的度数 */
const rotateDeg = ref<number>(0);
const pageState = reactive({
  /** 当前的页码 */
  pageNum: 1,
  /** 每页条数 */
  pageSize: 10
})
/** 动画时间 */
const duration = ref(0.6);

const circleStyle = computed(() => {
  let w = 0, h = info.circleR;
  if(provideState.isVertical) {
    w = info.circleR;
    h = 0
  }
  return {
    width: `${info.circleR * 2}px`,
    height: `${info.circleR * 2}px`,
    transitionDuration: duration.value + 's',
    transform: `translate(calc(-50% + ${w}px), calc(-50% + ${h}px)) rotate(${rotateDeg.value}deg)`
  }
})

watch(() => props.list, () => {
  init()
})
// 垂直方向发生改变重新获取
watch(() => provideState.isVertical, () => {
  init()
})

onMounted(() => {
  setTimeout(() => {
    init()
  }, 0);
  window.addEventListener('resize', resizeFn)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeFn)
})

const resizeFn = () => {
  init(false)
}

const init = (isInit = true) => {
  // 获取滚动区域和卡片的宽高信息
  const circleWrap = document.querySelector(`.${idRef.value}`)
  const cInfo = document.querySelector(`.${idRef.value} .${classPrefix}-cardWrap`)
  // 组件的宽和高
  circleDiv.w = circleWrap?.clientWidth ?? 0;
  circleDiv.h = circleWrap?.clientHeight ?? 0;
  provideState.isVertical = circleDiv.h > circleDiv.w
  info.circleWrapWH = provideState.isVertical ? circleDiv.h : circleDiv.w
  info.cardWH = cInfo?.[provideState.isVertical ? 'clientHeight' : 'clientWidth'] ?? 0
  const cWH = cInfo?.[provideState.isVertical ? 'clientWidth' : 'clientHeight'] ?? 0
  info.circleR = Math.round(provideState.isVertical ? circleDiv.h : circleDiv.w)
  // 屏幕宽高度对应的圆的角度
  info.scrollViewDeg = getLineAngle(info.circleWrapWH, info.circleR)
  // 每张卡片所占用的角度
  const _cardDeg = 2 * 180 * Math.atan(((info.cardWH ?? 0) / 2) / (info.circleR - cWH / 2)) / Math.PI + props.cardAddDeg
  // 是否采用均分卡片的方式
  if(props.isAverage && props.list) {
    const cardNum = Math.floor(360 / _cardDeg)
    // 判断总卡片数是否超过一个圆
    const _cardNum = Math.min(cardNum, props.list.length)
    pageState.pageSize = _cardNum
    cardDeg.value = 360 / _cardNum
  } else {
    cardDeg.value = _cardDeg
  }
  // const text = provideState.isVertical ? '高' : '宽' 
  // console.log(
  //   `可滚动区域${text}度: ${info.circleWrapWH}px\n` +
  //   `可滚动区域占的度数: ${info.scrollViewDeg}°\n` +
  //   `卡片${text}度: ${info.cardWH}px\n` +
  //   `圆的半径: ${info.circleR}px\n` +
  //   `卡片间的角度: ${cardDeg.value}°`
  // );
  provideState.circleR = info.circleR
  provideState.cardDeg = cardDeg.value
  emit('onPageChange', {...pageState})
  if(isInit) {
    rotateDeg.value = cardDeg.value * props.initCartNum
  }
}

const onTouchStart = (event: MouseEvent | TouchEvent) => {
  event.stopPropagation()
  const e = changeEvent(event)
  if (!isMobile()) {
    document.addEventListener('mousemove', onTouchMove, true);
    document.addEventListener('mouseup', onTouchEnd, true);
  }
  touchInfo.startXY = provideState.isVertical ? e.clientY : -e.clientX
  touchInfo.startDeg = rotateDeg.value
  touchInfo.time = Date.now()
  duration.value = 0.1
  emit('onTouchStart')
}
const onTouchMove = (event: MouseEvent | TouchEvent) => {
  event.stopPropagation()
  const e = changeEvent(event)
  const xy = (provideState.isVertical ? e.clientY : -e.clientX) - touchInfo.startXY
  const deg = Math.round(touchInfo.startDeg - info.scrollViewDeg * (xy / info.circleWrapWH))
  rotateDeg.value = deg
  emit('onTouchMove')
}
const onTouchEnd = (event: MouseEvent | TouchEvent) => {
  event.stopPropagation()
  const e = changeEvent(event)
  if (!isMobile()) {
    document.removeEventListener('mousemove', onTouchMove, true);
    document.removeEventListener('mouseup', onTouchEnd, true);
  }
  const {startXY, startDeg, time } = touchInfo
  // 移动的距离
  const xy = (provideState.isVertical ? e.clientY : -e.clientX) - startXY
  // 触摸的时间
  const _time = Date.now() - time
  let _duration = 0.6
  let deg = rotateDeg.value
  // 触摸的始末距离大于卡片高度的一半，并且触摸时间小于300ms，则触摸距离和时间旋转更多
  if((Math.abs(xy) > info.cardWH / 2) && (_time < 300)) {
    // 增加角度变化 
    const v = _time / 300
    const changeDeg = info.scrollViewDeg * (xy / info.circleWrapWH) / v
    deg = Math.round(startDeg - changeDeg)
  }
  // 处理转动的角度为：卡片的角度的倍数 (xy > 0 表示向上滑动)
  let mathMethods: 'ceil' | 'floor' = 'ceil'
  if(Math.abs(xy) < info.cardWH / 3) {
    mathMethods = xy > 0 ? 'ceil' : 'floor'
  } else {
    mathMethods = xy > 0 ? 'floor' : 'ceil'
  }
  // 触摸距离小于10，并且触摸时间小于150ms才算点击
  provideState.isClick = Math.abs(xy) < 10 && _time < 150
  duration.value = _duration
  const _deg = cardDeg.value * Math[mathMethods](deg / cardDeg.value)
  rotateDeg.value = _deg
  emit('onTouchEnd')
}

const disableLeft = computed(() => (
  pageState.pageNum <= 1
))
const disableRight = computed(() => (
  pageState.pageNum * pageState.pageSize >= (props.list?.length ?? 0)
))

const onPageChange = (isAdd?: boolean) => {
  if(isAdd) {
    if(disableRight.value) return
  } else {
    if(disableLeft.value) return
  }
  pageState.pageNum += isAdd ? 1 : -1
  rotateDeg.value = 0
  emit('onPageChange', {...pageState})
}

</script>

<template>
  <div 
    :class="`${classPrefix} ${idRef}`"
    :style="{
      width: props.width,
      height: props.height,
    }"
  >
    <div 
      :class="`${classPrefix}-area`"
      @mousedown="onTouchStart"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
      :style="circleStyle"
    >
      <slot></slot>
    </div>
    <div 
      :class="`${classBem(`${classPrefix}-arrow`, {left: true, disable: disableLeft})}`"
      @click="onPageChange()"
    >
      <div v-if="!$slots['left-arrow']" :class="`${classBem(`${classPrefix}-arrow-area`, {left: true})}`">{{ '<' }}</div>
      <slot name="left-arrow"></slot>
    </div>
    <div 
      :class="`${classBem(`${classPrefix}-arrow`, {right: true, disable: disableRight})}`"
      @click="onPageChange(true)"
    >
      <div v-if="!$slots['right-arrow']" :class="`${classBem(`${classPrefix}-arrow-area`, {right: true})}`">{{ '>' }}</div>
      <slot name="right-arrow"></slot>
    </div>
  </div>
</template>

<style lang='less' scoped>
@class-prefix: ~'legendTD-scroll-circle';
.@{class-prefix} {
  position: relative;
  overflow: hidden;
  user-select: none;
  &-area {
    position: absolute;
    left: 50%;
    top: 50%;
    transform-origin: center center;
    transition: transform .6s ease-out;
  }
  &-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    &-right {
      right: 0;
    }
    &-left {
      left: 0;
    }
    &-disable {
      opacity: .6;
      cursor: not-allowed;
    }
    &-area {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      color: #fff;
      padding: 0 20px;
      &-left {
        background: linear-gradient(to left, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
        &:hover {
          background: linear-gradient(to left, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.45));
        }
      }
      &-right {
        background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
        &:hover {
          background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.45));
        }
      }
    }
  }
}
</style>