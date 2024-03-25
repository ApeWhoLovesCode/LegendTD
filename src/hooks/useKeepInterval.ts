import { reactive, onUnmounted } from 'vue';

/**
 * 会保持剩余时间的定时器钩子
 */
export default function useKeepInterval() {
  const timerMap = reactive<Map<string, TimerMap>>(new Map())

  /**
   * 设置/开启计时器
   * @param key 计时器的索引
   * @param fn 执行函数
   * @param intervalTime 间隔时间 
   * @param p KeepIntervalSetParams
   */
  function set(key: string, fn?: () => void, intervalTime = 0, {isTimeOut = false, isCover}: KeepIntervalSetParams = {}) {
    stopTime(key)
    if((!timerMap.has(key) || isCover) && fn) {
      timerMap.set(key, {
        timeout: undefined,
        interval: undefined,
        cur: 0,
        end: 0,
        fn,
        intervalTime,
        remainTime: intervalTime,
        isTimeOut,
      })
    }
    const timeItem = timerMap.get(key)!
    if(intervalTime && timeItem.intervalTime !== intervalTime) {
      timeItem.intervalTime = intervalTime
      timeItem.remainTime = intervalTime
    }
    timeItem.remainTime -= timeItem.end - timeItem.cur
    timeItem.cur = Date.now()
    timeItem.end = timeItem.cur
    timeItem.timeout = setTimeout(() => { 
      timeItem.cur = Date.now()
      timeItem.end = timeItem.cur
      timeItem.remainTime = timeItem.intervalTime
      if(!timeItem.isTimeOut) {
        timeItem.interval = setInterval(() => { 
          timeItem.cur = Date.now()
          timeItem.end = timeItem.cur
          timeItem.fn() 
        }, timeItem.intervalTime)
      }
      timeItem.fn()
      if(timeItem.isTimeOut) {
        deleteFn(key)
      }
    }, timeItem.remainTime)
  }
  /** 暂停计时器 */
  function pause(key: string) {
    const timeItem = timerMap.get(key)
    if(timeItem) {
      timeItem.end = Date.now()
      stopTime(key)
      return timeItem.end - timeItem.cur
    }
  }
  /** 全部暂停或开始 */
  function allPause(isPause = true) {
    timerMap.forEach((_, key) => {
      isPause ? pause(key) : set(key)
    })
  }
  /** 删除其中一个 */
  function deleteFn(key: string) {
    stopTime(key)
    if(timerMap.has(key)) {
      timerMap.delete(key)
    }
  }
  /** 清空数据 */
  function clear() {
    if(timerMap) {
      timerMap.forEach((val, key) => {
        stopTime(key)
      })
      timerMap.clear()
    }
  }
  /** 停止定时器 */
  function stopTime(key: string) {
    const timeItem = timerMap.get(key)
    if(timeItem?.timeout) {
      clearTimeout(timeItem.timeout)
      timeItem.timeout = undefined
    }
    if(timeItem?.interval) {
      clearInterval(timeItem.interval)
      timeItem.interval = undefined
    }
  }

  onUnmounted(() => {
    clear()
  })

  return {
    set,
    pause,
    allPause,
    delete: deleteFn,
    clear,
    stopTime,
  }
}

export type KeepIntervalSetParams = {
  /** 是否仅仅是倒计时 */
  isTimeOut?: boolean
  /** 是否覆盖之前的内容 */
  isCover?: boolean
}

export type TimerMap = {
  // 第一层的setTimeout
  timeout: NodeJS.Timeout | undefined
  // 第二层的setInterval
  interval: NodeJS.Timeout | undefined
  // 当前时间
  cur: number
  // 暂停时间
  end: number
  // 传入的执行函数
  fn: () => void
  // 固定的时间间隔
  intervalTime: number
  // 用于setTimeout的剩余时间间隔
  remainTime: number
  /** 是否只是倒计时 */
  isTimeOut: boolean
}