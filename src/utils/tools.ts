import { EnemyName } from "@/dataSource/enemyData";

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
export function createProbNum(level: number): EnemyName {
  const obj: {[key in EnemyName]: number} = {
    'zombie-1': 4,
    'zombie-2': 5,
    'zombie-3': 6,
    'iron-gate': 7,
    'rugby': 7,
    'newspaper': 7,
    'zombie-dance': 14,
    'pole-vault': 10,
    'ice-car': 14,
    'afu': 12,
    'kunkun': 16,
    'rabbish': 12,
    'rabbish-2': 15,
    'godzilla': 18,
    'zombie-boom': 15,
  };
  const powN = Math.sqrt(Math.sqrt(level))
  let sum = 0
  for(const key in obj) {
    let item = obj[key as EnemyName]
    item = Math.pow(item, powN)
    sum += item
  }
  const num = randomNum(1, sum)
  for(const key in obj) {
    if(!obj[key as EnemyName]) continue
    sum -= obj[key as EnemyName]
    if(num > sum) {
      return key as EnemyName
    }
  }
  return 'zombie-1' // 这里是不会走到的
}

/** 根据概率生成敌人索引数组 */
export const randomEnemyNameList = (level: number): EnemyName[] => {
  const arr: EnemyName[] = []
  // 等值是: 16
  const levelVal = Math.pow(Math.sqrt(level), Math.sqrt(Math.sqrt(level)))
  const len = 5 + Math.floor(levelVal * Math.min(level, 10) / level)
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
