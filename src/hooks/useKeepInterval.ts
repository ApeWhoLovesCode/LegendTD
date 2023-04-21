import { TimerMap } from '@/utils/keepInterval';
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
   * @param isTimeOut 是否setTimeout
   */
  function set(key: string, fn?: () => void, intervalTime = 1000, isTimeOut = false) {
    if(!timerMap.has(key) && fn) {
      timerMap.set(key, {
        timeout: null,
        interval: null,
        cur: 0,
        end: 0,
        fn,
        intervalTime,
        remainTime: intervalTime,
        isTimeOut,
      })
    }
    const timeItem = timerMap.get(key)!
    stopTime(key)
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
      timeItem.timeout = null
    }
    if(timeItem?.interval) {
      clearInterval(timeItem.interval)
      timeItem.interval = null
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
