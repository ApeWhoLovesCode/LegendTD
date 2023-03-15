export const KeepIntervalKey = {
  /** 创建敌人 */
  makeEnemy: 'makeEnemy',
  /** 开始创建金币 */
  startMoneyTimer: 'startMoneyTimer',
  /** 减速 */
  slow: 'slow',
  /** 技能 */
  skill: 'skill',
  /** 老鼠中毒 */
  twitch: 'twitch',
  /** 清除老鼠中毒 */
  twitchDelete: 'twitchDelete',
}

class KeepInterval {
  private timerMap: Map<string, TimerMap> = new Map()
  static _instance: KeepIntervalInstance
  /** 
   * 储存所有的定时器集合 (可以暂停与继续)
   */
  static get instance(){
    if(!this._instance){
      this._instance = new KeepInterval()
    }
    return this._instance
  }
  /** 设置/开启计时器 */
  set(key: string, fn?: () => void, intervalTime = 1000, isTimeOut?: boolean) {
    if(!this.timerMap.has(key) && fn) {
      this.timerMap.set(key, {
        timeout: null,
        interval: null,
        cur: 0,
        end: 0,
        fn,
        intervalTime,
        remainTime: intervalTime
      })
    }
    // console.log(`---${key}---`);
    const timeItem = this.timerMap.get(key)!
    this.stopTime(key)
    timeItem.remainTime -= timeItem.end - timeItem.cur
    timeItem.cur = Date.now()
    timeItem.end = Date.now()
    timeItem.timeout = setTimeout(() => { 
      timeItem.cur = Date.now()
      if(!isTimeOut) {
        timeItem.interval = setInterval(() => { 
          timeItem.cur = Date.now()
          timeItem.fn() 
        }, timeItem.intervalTime)
      }
      timeItem.fn()
    }, timeItem.remainTime)
  }
  /** 暂停计时器 */
  pause(key: string) {
    const timeItem = this.timerMap.get(key)
    if(timeItem) {
      timeItem.end = Date.now()
      this.stopTime(key)
      return timeItem.end - timeItem.cur
    }
  }
  /** 全部暂停或开始 */
  allPause(isPause = true) {
    this.timerMap.forEach((val, key) => (
      isPause ? this.pause(key) : this.set(key)
    ))
  }
  /** 删除其中一个 */
  delete(key: string) {
    this.stopTime(key)
    if(this.timerMap.has(key)) {
      this.timerMap.delete(key)
    }
  }
  /** 清空数据 */
  clear() {
    if(this.timerMap) {
      this.timerMap.forEach((val, key) => {
        this.stopTime(key)
      })
      this.timerMap.clear()
    }
  }
  /** 停止定时器 */
  stopTime(key: string) {
    const timeItem = this.timerMap.get(key)
    if(timeItem?.timeout) {
      clearTimeout(timeItem.timeout)
      timeItem.timeout = null
    }
    if(timeItem?.interval) {
      clearInterval(timeItem.interval)
      timeItem.interval = null
    }
  }
}

export default KeepInterval.instance

export type KeepIntervalInstance = {
  set(key: string, fn?: () => void, intervalTime?: number, isTimeOut?: boolean): void
  pause(key: string): number | undefined
  allPause(isPause?: boolean): void
  stopTime(key: string): void
  delete(key: string): void
  clear(): void
}

export type TimerMap = {
  // 第一层的setTimeout
  timeout: NodeJS.Timeout | null
  // 第二层的setInterval
  interval: NodeJS.Timeout | null
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
}