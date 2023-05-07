/** 用于限制 num 最大和最小不能超过边界值 */
export function limitRange(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

/** 两值平方相加并开方 求斜边 */
export function powAndSqrt(val1: number, val2: number) {
  return Math.sqrt(Math.pow(val1, 2) + Math.pow(val2, 2))
}

/** 生成范围内的随机数 */
export function randomNum(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min)
}

/** 检查是否在矩形内 */
export function checkInRect(t: {x: number, y: number}, rect: {x?: number, y?: number, w: number, h: number}) {
  const rx = rect.x ?? 0, ry = rect.y ?? 0
  return rx < t.x && t.x < rx + rect.w && ry < t.y && t.y < ry + rect.h
}

/** 根据概率生成敌人索引 */
export function createProbNum(level: number) {
  const list = [
    0, 6, 7, 8, 9, 10, 8,
    15,   // 舞王
    10, 14, 13, 
    20,   // 弗利萨
    0, 0, 
    17,   // 坤坤
    13,
    15,
  ]
  const powN = Math.sqrt(Math.sqrt(level))
  let sum = 0
  for(const i in list) {
    list[i] = Math.pow(list[i], powN)
    sum += list[i]
  }
  const num = randomNum(1, sum)
  for(const i in list) {
    if(!list[i]) continue
    sum -= list[i]
    if(num > sum) {
      return +i
    }
  }
  return 1 // 这里是不会走到的
}

/** 根据概率生成敌人索引数组 */
export const randomNumList = (level: number) => {
  const arr = []
  // 等值是: 16
  const len = Math.floor(Math.pow(Math.sqrt(level), Math.sqrt(Math.sqrt(level))) * 12 / level)
  for(let i = 0; i < len; i++) {
    arr.push(createProbNum(level))
  }
  return arr
}

/** 等待多久 */
export function waitTime(time: number = 1000): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time);
  })
}

/** 判断是移动端还是pc端 */
export function isMobile() {
  return navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
}

/** 经过多少次计算后，获取fps */
export const getScreenFps = (total: number = 60): Promise<number> => {
  return new Promise(resolve => {
    const begin = Date.now();
    let count = 0;
    (function run() {
      requestAnimationFrame(() => {
        if (++count >= total) {
          const fps = Math.ceil((count / (Date.now() - begin)) * 1000)
          return resolve(fps)
        }
        run()
      })
    })()
  })
}

/** 初始化创建二维数组 */
export function createTwoArray<T>(rowNum: number, colNum: number, cb: (i: number) => T) {
  return Array.from({length: rowNum}).map(() => (
    Array.from({length: colNum}).map((_, i) => cb(i))
  ))
}