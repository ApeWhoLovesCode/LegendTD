import { getScreenFps } from "@/utils/tools";
import { defineStore } from "pinia";

type StateType = {
  /** 当前屏幕刷新率 */
  fps: number
  /** 是否为高刷屏 */
  isHighRefreshScreen: boolean
}

export const useSettingStore = defineStore('setting', {
  state: (): StateType => ({
    fps: 60,
    isHighRefreshScreen: false
  }),
  actions: {
    getFps() {
      getScreenFps().then(fps => {
        this.$state.fps = fps
        this.$state.isHighRefreshScreen = fps > 65
      })
    }
  },
  // 持久化
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'setting', //设置存储的key
        storage: localStorage, //表示存储在localStorage
      }
    ]
  }
})