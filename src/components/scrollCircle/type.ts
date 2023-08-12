import { VueElement } from "vue"

export type ScrollCircleProvide = {
  circleR: number
  cardDeg: number
  isVertical: boolean
  isFlipDirection: boolean
  isClick: boolean
  centerPoint: CenterPointType
}

export type ScrollCircleProps = {
  /** 传入卡片的数组长度 */
  listLength: number;
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
   * 圆心的位置
   * @default auto (宽度大于高度时在底部，否则在右侧)
   */
  centerPoint?: CenterPointType;
  /** 
   * 圆的半径
   * @default 取组件宽和高中的最大值
   */
  radius?: number
  /**
   * 当 centerPoint = 'center' 时，设置圆形的内边距
   * @default 5
   */
  circlePadding?: number
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
  isAverage?: boolean;
  /**
   * 是否将当前方向翻转
   */
  isFlipDirection?: boolean;
  /**
   * 是否分页
   * @default true
   */
  isPagination?: boolean
  /** 左边分页箭头的内容区域 */
  leftArrow?: VueElement;
  /** 右边分页箭头的内容区域 */
  rightArrow?: VueElement;
  /** 禁止触摸滚动 */
  disableTouch?: boolean
  /** 发生触摸的回调 */
  onTouchStart?: () => void;
  /** 发生滚动的回调 */
  onTouchMove?: () => void;
  /** 触摸结束的回调 */
  onTouchEnd?: () => void;
  /** 
   * 触摸结束的回调
   * @curIndex 当前处于正中的索引
   * @deg 当前旋转的角度
   */
  onScrollEnd?: (curIndex: number, deg: number) => void
  /** 分页触发回调改变页码 */
  onPageChange?: (page: ScrollCirclePageType) => void;
} 
export type ScrollRotateItemProps = {
  /** 当前item的索引 */
  index: number
}

export type ScrollCirclePageType = { pageNum: number; pageSize: number }

export type CenterPointType = 'auto' | 'center' | 'left' | 'top' | 'right' | 'bottom'