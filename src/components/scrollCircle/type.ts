export type ScrollCircleProvide = {
  circleR: number
  cardDeg: number
}

export type ScrollCircleProps = {
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
export type ScrollRotateItemProps = {
  /** 当前item的索引 */
  index: number
}

export type CircleInfoType = {
  /** 滚动盒子的高度 (不是可滚动元素的总高度) */
  circleWrapHeight: number;
  /** 卡片高度 */
  cardH: number;
  /** 圆的半径 */
  circleR: number;
  /** 可滚动区域高度对应的圆的角度 */
  scrollViewDeg: number;
};

export type CircleTouchType = {
  /** 记录是否发生了触摸 */
  isTouch: boolean
  /** 记录初始化触摸的y */
  startY: number;
  /** 记录滚动触摸的旋转度数 */
  startDeg: number;
  /** 记录触摸开始的时间，用于与触摸结束进行比较 */
  time: number;
};