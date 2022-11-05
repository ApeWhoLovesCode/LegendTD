/** 
 * 储存所有的定时器集合
 * 可以暂停与继续
 */
class KeepInterval {
  // private timerMap: Map<string, TimerMap> = new Map()
  timerMap = new Map()
  /** 私有的静态的实例对象 */
  static _instance
  /** 公有的、静态的、访问该实例对象的方法 */
  static get instance(){
    if(!this._instance){
      this._instance = new KeepInterval()
    }
    return this._instance
  }
  /** 设置/开启计时器 */
  set(key, fn, intervalTime = 1000) {
    if(!this.timerMap.has(key)) {
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
    const timeItem = this.timerMap.get(key)
    this.stopTime(key)
    timeItem.remainTime -= timeItem.end - timeItem.cur
    timeItem.cur = Date.now()
    timeItem.end = Date.now()
    timeItem.timeout = setTimeout(() => { 
      timeItem.cur = Date.now()
      timeItem.interval = setInterval(() => { 
        timeItem.cur = Date.now()
        timeItem.fn() 
      }, timeItem.intervalTime)
      timeItem.fn()
    }, timeItem.remainTime)
  }
  /** 关闭计时器 */
  pause(key) {
    const timeItem = this.timerMap.get(key)
    if(timeItem) {
      timeItem.end = Date.now()
      this.stopTime(key)
      return timeItem.end - timeItem.cur
    }
  }
  /** 全部暂停或开始 */
  allPause(isPause = true) {
    this.timerMap.forEach((val, key) => 
      isPause ? this.pause(key) : this.set(key)
    )
  }
  /** 删除其中一个 */
  delete(key) {
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
  stopTime(key) {
    const timeItem = this.timerMap.get(key)
    if(timeItem) {
      if(timeItem.timeout) {
        clearTimeout(timeItem.timeout)
        timeItem.timeout = null
      }
      if(timeItem.interval) {
        clearInterval(timeItem.interval)
        timeItem.interval = null
      }
    }
  }
}

export default KeepInterval.instance

/* 
interface TimerMap {
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
*/