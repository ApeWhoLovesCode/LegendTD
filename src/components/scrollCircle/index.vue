<script setup lang='ts'>
import { getLineAngle } from '@/utils/handleCircle';
import { randomStr } from '@/utils/random';
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from 'vue';
import { provideKey, classPrefix } from './provide';
import { CircleInfoType, CircleTouchType, ScrollCircleProvide } from './type';
import {classBem} from '@/utils/handleDom'

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
  /** 
   * 卡片是否平均分配圆形轨迹
   * @default true
   */
  isAverage?: boolean
  /** 分页完成，触发回调改变页码 */
  onPageChange?: (page: {pageNum: number, pageSize: number}) => void
};

const props = withDefaults(defineProps<ScrollCircleProps>(), {
  cardAddDeg: 1,
  height: '100%',
  initCartNum: 3,
  isAverage: true,
  pageNum: 1,
  pageSize: 10,
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
const pageState = reactive({
  /** 当前的页码 */
  pageNum: 1,
  /** 每页条数 */
  pageSize: 10
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
    transform: `translate(calc(${x} + ${window.innerWidth / 2}px), ${y}) rotate(${rotateDeg.value}deg)`
  }
})

watch(() => props.list, () => {
  init(true)
})

onMounted(() => {
  setTimeout(() => {
    init(true)
  }, 10);
  window.addEventListener('resize', resizeFn)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeFn)
})

const resizeFn = () => {
  init()
}

const init = (isInit = false) => {
  const cWrapH = document.querySelector(`.${idRef.value}`)?.clientHeight ?? 0
  info.circleWrapHeight = cWrapH
  const cInfo = document.querySelector(`.${idRef.value} .${classPrefix}-cardWrap`)
  info.cardH = cInfo?.clientHeight ?? 0
  const cW = cInfo?.clientWidth ?? 0
  info.circleR = Math.round(provideState.isVertical ? window.innerHeight : window.innerWidth)
  // 每张卡片所占用的角度
  const _cardDeg = 2 * 180 * Math.atan(((info.cardH ?? 0) / 2) / (info.circleR - cW / 2)) / Math.PI + props.cardAddDeg
  // 是否采用均分卡片的方式
  if(props.isAverage && props.list) {
    const cardNum = 360 / _cardDeg
    let _cardNum = props.list.length
    // 总卡片超过一个圆
    if(_cardNum > cardNum) {
      _cardNum = Math.floor(cardNum)
      pageState.pageSize = _cardNum
    }
    cardDeg.value = 360 / _cardNum
  } else {
    cardDeg.value = _cardDeg
  }
  // 屏幕高度对应的圆的角度
  info.scrollViewDeg = getLineAngle(info.circleWrapHeight, info.circleR)
  console.log(`可滚动区域高度: ${info.circleWrapHeight};\n卡片高度: ${info.cardH};\n圆的半径: ${info.circleR};\n卡片间的角度: ${cardDeg.value}度;\n可滚动区域占的度数: ${info.scrollViewDeg}度;`);
  provideState.circleR = info.circleR
  provideState.cardDeg = cardDeg.value
  provideState.isVertical = window.innerHeight > window.innerWidth
  if(isInit) {
    rotateDeg.value = cardDeg.value * props.initCartNum
    props.onPageChange?.({...pageState})
  }
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
  // 处理转动的角度为：卡片的角度的倍数
  let mathMethods: 'ceil' | 'floor' = 'ceil'
  if(Math.abs(_y) < info.cardH / 3) {
    mathMethods = _y > 0 ? 'ceil' : 'floor'
  } else {
    mathMethods = _y > 0 ? 'floor' : 'ceil'
  }
  const _deg = cardDeg.value * Math[mathMethods](deg / cardDeg.value)
  rotateDeg.value = _deg
  touchInfo.isTouch = false
}

const disableLeft = computed(() => (
  pageState.pageNum <= 1
))
const disableRight = computed(() => (
  pageState.pageNum * pageState.pageSize > (props.list?.length ?? 0)
))

const onPageChange = (isAdd?: boolean) => {
  if(isAdd) {
    if(disableRight.value) return
  } else {
    if(disableLeft.value) return
  }
  pageState.pageNum += isAdd ? 1 : -1
  props.onPageChange?.({...pageState})
}

</script>

<template>
  <div 
    :class="`${classPrefix} ${idRef}`"
    :style="{
      width: `${info.circleR * 2}px`,
      height: props.height,
    }"
  >
    <div 
      :class="`${classPrefix}-area`"
      @mousedown="onTouchStart"
      @mousemove="onTouchMove"
      @mouseup="onTouchEnd"
      @mouseleave="onTouchEnd"
      :style="circleStyle"
    >
      <slot></slot>
    </div>
    <div 
      :class="`${classBem(`${classPrefix}-arrow`, {left: true, disable: disableLeft})}`"
      @click="onPageChange()"
    >
      <span>{{ '<' }}</span>
    </div>
    <div 
      :class="`${classBem(`${classPrefix}-arrow`, {right: true, disable: disableRight})}`"
      @click="onPageChange(true)"
    >
      <span>{{ '>' }}</span>
    </div>
  </div>
</template>

<style lang='less' scoped>
@class-prefix: ~'protect-scroll-circle';
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
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    padding: 15px 12px;
    &-right {
      right: 0;
      background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
    }
    &-left {
      left: 0;
      background: linear-gradient(to left, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
    }
    &-disable {
      opacity: .6;
    }
  }
}
</style>