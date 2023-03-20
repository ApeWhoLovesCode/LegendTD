import { changeEvent } from '@/utils/handleDom';
import { makeStringProp } from '@/utils/props';
import { randomStr } from '@/utils/random';
import { isMobile } from '@/utils/tools';
import { defineComponent, ExtractPropTypes, onMounted, reactive, ref } from 'vue';
import type { PropType } from 'vue';
import { StyleType } from '@/utils/native-props';

const classPrefix = `legendTD-floating-ball`;

type StyleItem = 
| '--initial-position-left'
| '--initial-position-right'
| '--initial-position-top'
| '--initial-position-bottom'
| '--z-index'

export type FloatingBallEmit = {
  /** 贴边时触发 isLeft: true 代表是左或上方向上贴边 */
  onMagnetic?: (isLeft: boolean) => void
  /** 位置偏移时触发 */
  onOffsetChange?: (offset: {x: number, y: number}) => void
}

export const floatingBallProps = {
  /** 可以进行拖动的方向，'xy' 表示自由移动 默认值xy */
  axis: makeStringProp<'x' | 'y' | 'xy'>('xy'),
  /** 自动磁吸到边界 */
  magnetic: String as PropType<'x' | 'y'>,
  style: Object as PropType<StyleType<StyleItem>>
}

export type FloatingBallProps = ExtractPropTypes<typeof floatingBallProps>

const FloatingBall = defineComponent({
  props: floatingBallProps,
  emits: ['onMagnetic', 'onOffsetChange'],
  setup(props, ctx) {
    const {emit, slots} = ctx
    const idRef = ref(randomStr(classPrefix))
    /** 悬浮球的宽，高，上下左右距离 */
    const ball = reactive({w: 0, h: 0, r: 0, l: 0, t: 0, b: 0})
    const touchRef = reactive({
      startX: 0,
      startY: 0,
    })
    const info = reactive({
      x: 0,
      y: 0,
    })
    const buttonRef = ref<HTMLDivElement | null>(null)
    /** 动画时间 */
    const duration = ref(0.1);
  
    const onTouchStart = (e: MouseEvent | TouchEvent) => {
      e.stopPropagation()
      const newE = changeEvent(e)
      touchRef.startX = newE.clientX - info.x
      touchRef.startY = newE.clientY - info.y
      if(!isMobile()) {
        document.addEventListener('mousemove', onTouchMove, true)
        document.addEventListener('mouseup', onTouchEnd, true)
      }
      duration.value = 0.1
    }
    const onTouchMove = (e: MouseEvent | TouchEvent) => {
      e.stopPropagation()
      const newE = changeEvent(e)
      const x = props.axis === 'y' ? 0 : newE.clientX - touchRef.startX
      const y = props.axis === 'x' ? 0 : newE.clientY - touchRef.startY
      info.x = x
      info.y = y
      emit('onOffsetChange', {x, y})
    }
    const onTouchEnd = (e: MouseEvent | TouchEvent) => {
      e.stopPropagation()
      if(!isMobile()) {
        document.removeEventListener('mousemove', onTouchMove, true)
        document.removeEventListener('mouseup', onTouchEnd, true)
      }
      const newE = changeEvent(e)
      let x = props.axis === 'y' ? 0 : newE.clientX - touchRef.startX
      let y = props.axis === 'x' ? 0 : newE.clientY - touchRef.startY
      const {w, h, l, r, t, b} = ball
      if (props.magnetic === 'x') {
        const l_r = l < r ? l : r
        const _v = l < r ? -1 : 1
        const middleX = window.innerWidth / 2 - l_r - w / 2 // 中间分隔线的值
        const distance = -1 * _v * (window.innerWidth - w - l_r * 2) // 另一边的位置
        x = (Math.abs(x) > middleX) ? (x * _v < 0 ? distance : 0) : 0
        emit('onMagnetic', x === 0 ? l < r : l > r)
      } else if (props.magnetic === 'y') {
        const l_r = t < b ? t : b
        const _v = t < b ? -1 : 1
        const middleX = window.innerHeight / 2 - l_r - h / 2 // 中间分隔线的值
        const distance = -1 * _v * (window.innerHeight - h - l_r * 2) // 另一边的位置
        y = (Math.abs(y) > middleX) ? (y * _v < 0 ? distance : 0) : 0
        emit('onMagnetic', y === 0 ? t < b : t > b)
      }
      duration.value = 0.3
      info.x = x
      info.y = y
    }
  
    onMounted(() => {
      const init = () => {
        const ballDom = document.querySelector(`.${idRef.value} .${classPrefix}-button`)
        if(!ballDom) return
        const ballInfo = ballDom.getBoundingClientRect()
        ball.w = ballInfo.width
        ball.h = ballInfo.height
        ball.l = ballInfo.left
        ball.r = window.innerWidth - ballInfo.right
        ball.t = ballInfo.top
        ball.b = window.innerHeight - ballInfo.bottom
      }
      setTimeout(() => {
        init()
      }, 10);
    })
  
    const handleEvent = () => {
      if(!isMobile()) {
        return {
          onMousedown: onTouchStart,
          onMouseup: onTouchEnd,
        }
      } else {
        return {
          onTouchstart: onTouchStart,
          onTouchmove: onTouchMove,
          onTouchend: onTouchEnd,
          onTouchcancel: onTouchEnd,
        }
      }
    }
  
    return () => (
      <div class={`${classPrefix} ${idRef.value}`} {...props}>
        <div
          ref={buttonRef}
          class={`${classPrefix}-button`}
          style={{ 
            transitionDuration: duration.value + 's',
            transform: `translate(${info.x}px, ${info.y}px)`
           }}
          {...handleEvent()}
        >
          {slots?.default && slots.default()}
        </div>
      </div>
    )

  }
})

export default FloatingBall;