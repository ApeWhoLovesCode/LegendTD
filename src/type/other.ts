/** 首页的数据类型 */
export type IndexType = {
  /** 标题 */
  title: string,
  // 控制游戏区域的显示与隐藏
  isProtectTheHorse: boolean,
}

/** 图片加载完成的类型 */
export type ImgLoadType = {
  [key: string]: CanvasImageSource
}

/** 让类型的部分转化为可选 */
export type WithPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
