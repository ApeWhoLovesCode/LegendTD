import { KeepIntervalSetParams, TimerMap } from "@/hooks/useKeepInterval"

export const KeepIntervalKey = {
  /** 创建敌人 */
  makeEnemy: 'makeEnemy',
  /** 开始创建金币 */
  startMoneyTimer: 'startMoneyTimer',
  /** 减速 */
  slow: 'slow',
  /** 技能 */
  skill: 'skill',
  /** 塔防射击间隔函数 */
  towerShoot: 'towerShoot',
  /** 老鼠中毒 */
  twitch: 'twitch',
  /** 清除老鼠中毒 */
  twitchDelete: 'twitchDelete',
  /** 老鼠中毒间隔函数 */
  poisonFun: 'poisonFun',
  /** 冰冻塔防 */
  frozenTower: 'frozenTower'
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
  set(key: string, fn?: () => void, intervalTime = 0, {isTimeOut = false, isCover}: KeepIntervalSetParams = {}) {
    this.stopTime(key)
    if((!this.timerMap.has(key) || isCover) && fn) {
      this.timerMap.set(key, {
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
    const timeItem = this.timerMap.get(key)!
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
        this.delete(key)
      }
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
    this.timerMap.forEach((_, key) => {
      isPause ? this.pause(key) : this.set(key)
    })
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
      timeItem.timeout = undefined
    }
    if(timeItem?.interval) {
      clearInterval(timeItem.interval)
      timeItem.interval = undefined
    }
  }
}

export default KeepInterval.instance

export type KeepIntervalInstance = {
  set(key: string, fn?: () => void, intervalTime?: number, param?: KeepIntervalSetParams): void
  pause(key: string): number | undefined
  allPause(isPause?: boolean): void
  stopTime(key: string): void
  delete(key: string): void
  clear(): void
}
