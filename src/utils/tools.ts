/** 用于限制 num 最大和最小不能超过边界值 */
export function limitRange(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/** 生成范围内的随机数 */
export function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

/** 根据概率生成敌人索引 */
export function createProbNum(isUpdate) {
  // 各个僵尸出现的概率，加起来 100
  const probList = [
    0, 1, 2, 2, 3, 4, 2,
    16,   // 舞王
    5, 5, 10, 
    35,   // 弗利萨
    0, 0, 
    15,   // 坤坤
  ]
  // 升级的概率
  const probList2 = [
    0, 1, 1, 1, 1, 2, 2,
    15,   // 舞王
    3, 3, 6, 
    45,   // 弗利萨
    0, 0, 
    20,   // 坤坤
  ]
  const list = !isUpdate ? probList : probList2
  const num = randomNum(1, 100)
  let sum = 100
  for(const index in list) {
    if(!list[index]) continue
    sum -= list[index]
    if(num > sum) {
      return +index
    }
  }
}

/** 等待多久 */
export function waitTime(time) {
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