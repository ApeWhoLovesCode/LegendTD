import { range } from '@/utils/format';
import { isObj } from '@/utils/validate';
import { defineComponent, ExtractPropTypes, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { makeNumberProp, makeStringProp, truthProp } from '@/utils/props';

const classPrefix = `legendTD-circle`;
/** 圆的一周 2π */
const PERIMETER = 2 * Math.PI;
/** 一开始的角度，由于是顶部所以是 -90° */
const BEGIN_ANGLE = -Math.PI / 2;
/** 最大值 */
const MAX = 100;

export type CircleEmit = {
  /** 进度变化时触发 */
  onChange?: (v: number) => void
}

export const circleProps = {
  value: makeNumberProp(0),
  /**
   * @description 进度值 最小为0 最大为100
   * @default 0
   */
  size: makeNumberProp(100),
  /**
   * 速度
   * @default 60
   */
  speed: makeNumberProp(60),
  /** 颜色 */
  color: makeStringProp('#68baf5'),
  /** 进度条的底色 */
  layerColor: makeStringProp('#F6F6F6'),
  /** 线条的端点样式 */
  lineCap: makeStringProp<CanvasLineCap>('round'),
  /**
   * 线的宽度
   * @default 6
   */
  strokeWidth: makeNumberProp(6),
  /**
   * 是否是顺时针方向的
   * @default true
   */
  clockwise: truthProp,
  text: String,
  fill: String,
};
export type CircleProps = ExtractPropTypes<typeof circleProps>

const Circle = defineComponent({
  props: circleProps,
  emits: ['onChange'],
  setup(props, ctx) {
    const {emit, slots} = ctx
  
    const canvasRef = ref<HTMLCanvasElement>();
    const state = reactive<CanvasRef>({
      ctx: undefined,
      curVal: 0,
      curColor: '',
      timer: undefined,
      ratio: 1,
    });
    const ready = ref(false);

    watch(() => props.value, (v) => {
      renderCircle();
    })

    watch(() => props.color, () => {
      setCurColor();
      drawCircle(state.curVal);
    })
    watch(() => props.size, () => {
      drawCircle(state.curVal)
    })
  
    /** 在canvas上绘画 */
    const drawCanvas = (
      strokeStyle: string,
      beginAngle: number,
      endAngle: number,
      fill?: string,
    ) => {
      const size = props.size * state.ratio
      const strokeWidth = props.strokeWidth * state.ratio
      const position = size / 2;
      const radius = position - strokeWidth / 2;
      const context = state.ctx!
      context.strokeStyle = strokeStyle;
      context.lineWidth = strokeWidth;
      context.lineCap = props.lineCap;
      context.beginPath();
      context.arc(position, position, radius, beginAngle, endAngle, !props.clockwise);
      context.stroke();
      if (fill) {
        context.fillStyle = fill;
        context.fill();
      }
    };
  
    /** 画圆 */
    const drawCircle = (curVal: number) => {
      const size = props.size * state.ratio
      state.ctx?.clearRect(0, 0, size, size);
      /** 绘画背景圆环 */
      drawCanvas(props.layerColor, 0, PERIMETER, props.fill);
      const formatVal = range(curVal, 0, MAX);
      /** 绘画当前进度的圆环 */
      if (formatVal !== 0) {
        const progress = PERIMETER * (formatVal / 100);
        const endAngle = props.clockwise ? BEGIN_ANGLE + progress : 3 * Math.PI - (BEGIN_ANGLE + progress);
        drawCanvas(state.curColor, BEGIN_ANGLE, endAngle);
      }
    };
  
    /** 设置进度条颜色 */
    const setCurColor = () => {
      const color = props.color
      if (isObj(color)) {
        const _color = color as unknown as Record<string, string>;
        const keysArr = Object.keys(color).sort((a, b) => parseFloat(a) - parseFloat(b));
        state.curColor = _color[keysArr.at(-1) ?? ''];
      } else {
        state.curColor = color as string;
      }
    };
  
    const _cancelAnimationFrame = () => {
      if (state.timer !== void 0) {
        cancelAnimationFrame(state.timer);
        state.timer = void 0;
      }
    };
  
    /** 渲染圆环进度条 */
    const renderCircle = () => {
      const value = props.value
      if (props.speed <= 0 || props.speed > 1000) {
        drawCircle(value);
        return;
      }
      _cancelAnimationFrame();
      const _step = props.speed / MAX;
      const setStep = () => {
        const _v = state.curVal;
        if (Math.abs(_v - value) < _step) {
          state.curVal = value;
        } else {
          state.curVal += (_v < value ? 1 : -1) * _step;
        }
        drawCircle(state.curVal);
      };
      (function run() {
        setStep();
        if (state.curVal !== value) {
          state.timer = requestAnimationFrame(run);
        } else {
          emit('onChange', state.curVal)
          _cancelAnimationFrame();
        }
      })();
    };
  
    /** 初始化获取 canvas 上下文 */
    onMounted(() => {
      const init = () => {
        state.ctx = canvasRef.value!.getContext('2d')!;
        state.ratio = window.devicePixelRatio || 1
        ready.value = true
        setCurColor()
        renderCircle()
      }
      init();
    })

    onUnmounted(() => {
      _cancelAnimationFrame();
    })
  
    return () => (
      <div class={classPrefix} {...props}>
        <canvas
          ref={canvasRef}
          class={`${classPrefix}-canvas`}
          width={props.size * state.ratio}
          height={props.size * state.ratio}
          style={{ width: props.size + 'px', height: props.size + 'px' }}
        ></canvas>
        <div class={`${classPrefix}-text`}>{props.text ?? slots?.default?.()}</div>
      </div>
    );
  },
});

export default Circle;

type CanvasRef = {
  /** canvas 上下文 */
  ctx?: CanvasRenderingContext2D;
  /** 当前进度条的值 */
  curVal: number;
  /** 当前进度条的颜色 */
  curColor: string;
  timer?: number;
  /** 分辨率比例 */
  ratio: number
};
