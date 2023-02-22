/** 首页的数据类型 */
export type IndexType = {
  /** 标题 */
  title: string,
  /** 当前加载进度 */
  progress: number,
  /** 加载进度条的显示与隐藏 */
  isProgressBar: boolean,
  // 控制游戏区域的显示与隐藏
  isProtectTheHorse: boolean,
}

/** 图片加载完成的类型 */
export type ImgLoadType = {
  [key: string]: HTMLImageElement
}