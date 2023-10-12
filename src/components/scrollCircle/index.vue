<script setup lang='ts'>
import { randomStr } from '@/utils/random';
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from 'vue';
import { provideKey, classPrefix } from './provide';
import { ScrollCircleProps, ScrollCircleProvide } from './type';
import {changeEvent, classBem} from '@/utils/handleDom'
import { isMobile } from '@/utils/tools';
import { calcAngle, getCircleTransformXy, getRotateDegAbs, roundingAngle } from './utils';

const props = withDefaults(defineProps<ScrollCircleProps>(), {
  listLength: 0,
  cardAddDeg: 1,
  width: '100%',
  height: '100%',
  centerPoint: 'auto',
  circlePadding: 5,
  initCartNum: 0,
  isAverage: true,
  isFlipDirection: false,
  isPagination: true,
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
  /** 
   * 触摸结束的回调
   * @curIndex 当前处于正中的索引
   * @deg 当前旋转的角度
   */
  (event: 'onScrollEnd', curIndex: number, deg: number): void
}>()

const idRef = ref(randomStr(classPrefix))
const provideState = reactive<ScrollCircleProvide>({
  circleR: 0,
  cardDeg: 0,
  isVertical: (document.querySelector(`.${idRef.value}`)?.clientHeight ?? 0) > (document.querySelector(`.${idRef.value}`)?.clientWidth ?? 0),
  isFlipDirection: !!props.isFlipDirection,
  isClick: false,
  centerPoint: props.centerPoint,
})
provide(provideKey, provideState)
/** 组件盒子的宽和高 */
const circleDiv = reactive({
  w: 0,
  h: 0,
  left: 0,
  top: 0,
})
/** 圆心的位置 */
const circleCenter = reactive({
  x: 0,
  y: 0,
})
/** 滚动盒子需要的信息 */
const info = reactive({
  circleR: 0,
  /** 卡片间的度数 */
  cardDeg: 0
});
/** 触摸信息 */
const touchInfo = reactive({
  /** 记录开始时刻的滚动度数 */
  startDeg: 0,
  /** 记录之前滚动的旋转度数 */
  preDeg: 0,
  /** 当前是否是点击 */
  isClick: false,
  /** 前一圈的角度 */
  preRoundDeg: 0,
  /** 触摸时间 */
  time: 0,
});
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
  const {x, y} = getCircleTransformXy(props.centerPoint, provideState.isVertical, info.circleR)
  return {
    width: `${info.circleR * 2}px`,
    height: `${info.circleR * 2}px`,
    transitionDuration: duration.value + 'ms',
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotateDeg.value}deg)`,
  }
})

watch(() => props.listLength, () => {
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
  const {centerPoint, radius, circlePadding, listLength} = props
  // 获取滚动区域和卡片的宽高信息
  const circleWrap = document.querySelector(`.${idRef.value}`)
  const cInfo = document.querySelector(`.${idRef.value} .${classPrefix}-cardWrap`)
  const cw = circleWrap?.clientWidth ?? 0;
  const ch = circleWrap?.clientHeight ?? 0;
  provideState.isVertical = ch > cw;
  const cardWH = cInfo?.[provideState.isVertical ? 'clientHeight' : 'clientWidth'] ?? 0;
  const cWH = cInfo?.[provideState.isVertical ? 'clientWidth' : 'clientHeight'] ?? 0;
  info.circleR = Math.round(
    centerPoint === 'center' ? (
      radius ?? Math.min(ch, cw) / 2 - circlePadding - cWH / 2
    ) : (
      radius ?? Math.max(ch, cw)
    )
  );
  // 每张卡片所占用的角度
  const _cardDeg = (2 * 180 * Math.atan(cardWH / 2 / (info.circleR - cWH / 2))) / Math.PI + props.cardAddDeg;
  // 是否采用均分卡片的方式
  if(props.isAverage && listLength) {
    const cardNum = Math.floor(360 / _cardDeg)
    const _cardNum = Math.min(cardNum, listLength)  // 判断总卡片数是否超过一个圆
    pageState.pageSize = _cardNum
    info.cardDeg = 360 / _cardNum
  } else {
    info.cardDeg = _cardDeg;
  }
  provideState.circleR = info.circleR
  provideState.cardDeg = info.cardDeg
  emit('onPageChange', {...pageState})
  if(isInit) {
    scrollTo({index: props.initCartNum})
  }
}

/** 获取整个大圆的信息 */
const getCircleDivInfo = (tInfo: {clientX: number, clientY: number}) => {
  const circleWrap = document.querySelector(`.${idRef.value} .${classPrefix}-area`)!
  circleDiv.w = circleWrap.clientWidth
  circleDiv.h = circleWrap.clientHeight
  const circleDivRect = circleWrap.getBoundingClientRect()
  circleDiv.left = circleDivRect.left
  circleDiv.top = circleDivRect.top
  circleCenter.x = circleDivRect.left + circleDivRect.width / 2
  circleCenter.y = circleDivRect.top + circleDivRect.height / 2
  touchInfo.startDeg = calcAngle(
    {x: tInfo.clientX, y: tInfo.clientY},
    {x: circleCenter.x, y: circleCenter.y},
  )
}

const onTouchStart = (event: MouseEvent | TouchEvent) => {
  event.stopPropagation()
  const e = changeEvent(event)
  if (!isMobile()) {
    document.addEventListener('mousemove', onTouchMove, true);
    document.addEventListener('mouseup', onTouchEnd, true);
  }
  getCircleDivInfo({clientX: e.clientX, clientY: e.clientY})
  touchInfo.time = Date.now()
  duration.value = 10
  touchInfo.preDeg = rotateDeg.value
  emit('onTouchStart')
}
const onTouchMove = (event: MouseEvent | TouchEvent) => {
  event.stopPropagation()
  const e = changeEvent(event)
  let deg = calcAngle(
    {x: e.clientX, y: e.clientY},
    {x: circleCenter.x, y: circleCenter.y},
  ) - touchInfo.startDeg;
  // 越过一圈的边界位置，需要翻转角度，只会在边界的时候触发一次； 
  // 250(不用360): 是为了解决该区域下滚动过快，导致两次move的触发相差很大，无法满足条件
  if(Math.abs(deg - touchInfo.preRoundDeg) > 250) { 
    const roundVal = deg > 0 ? -360 : 360
    deg += roundVal
    touchInfo.startDeg -= roundVal
  }
  touchInfo.preRoundDeg = deg;
  deg += touchInfo.preDeg
  rotateDeg.value = deg
  emit('onTouchMove')
}
const onTouchEnd = (event: MouseEvent | TouchEvent) => {
  event.stopPropagation()
  if (!isMobile()) {
    document.removeEventListener('mousemove', onTouchMove, true);
    document.removeEventListener('mouseup', onTouchEnd, true);
  }
  let _duration = 600;
  let deg = rotateDeg.value;
  const changeDeg = deg - touchInfo.preDeg
  const time = Date.now() - touchInfo.time
  // 触摸的角度大于10度，并且触摸时间小于250ms，则触摸距离和时间旋转更多
  if (Math.abs(changeDeg) > 10 && time < 250) {
    const IncreaseVal = time / 250; // 增加角度变化
    _duration = 1000;
    deg = touchInfo.preDeg + Math.round((changeDeg) / IncreaseVal);
  }
  const _deg = roundingAngle({changeDeg, deg, cardDeg: info.cardDeg})
  // 触摸距离小于10，并且触摸时间小于120ms才算点击
  provideState.isClick = Math.abs(changeDeg) < 1 && time < 120;
  duration.value = _duration
  rotateDeg.value = _deg
  emit('onTouchEnd')
  _onScrollEnd(_deg, _duration)
}

const disableLeft = computed(() => (
  pageState.pageNum <= 1
))
const disableRight = computed(() => (
  pageState.pageNum * pageState.pageSize >= props.listLength
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

const scrollTo = ({deg, index, duration: _duration}: {deg?: number, index?: number, duration?: number}) => {
  if(typeof index === 'number' || typeof deg === 'number') {
    const _deg = typeof index === 'number' ? info.cardDeg * index : deg!
    const absV = getRotateDegAbs(props.centerPoint, provideState.isVertical, props.isFlipDirection)
    rotateDeg.value = _deg * absV
    if(typeof _duration === 'number') {
      duration.value = _duration
    }
    _onScrollEnd(_deg * absV, _duration ?? duration.value)
  }
}

const _onScrollEnd = (deg: number, _duration: number) => {
  if(props.onScrollEnd) {
    setTimeout(() => {
      const absV = getRotateDegAbs(props.centerPoint, provideState.isVertical, props.isFlipDirection)
      let index = Math.floor(deg / info.cardDeg) % props.listLength * absV
      if(index < 0) {
        index += props.listLength 
      }
      emit('onScrollEnd', index, deg)
    }, _duration ?? duration);
  }
}

</script>

<template>
  <div 
    :class="`${classPrefix} ${idRef}`"
    :style="{
      width: props.width,
      height: props.height,
    }"
    @mousedown="onTouchStart"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <div 
      :class="`${classPrefix}-area`"
      :style="circleStyle"
    >
      <slot></slot>
    </div>
    <template v-if="props.isPagination">
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
    </template>
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