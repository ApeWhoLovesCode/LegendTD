/**
 * 技能栏
 */
export default [
  {name: '炸他一波', instructions: '对场上所有敌人造成100点伤害', icon: 'icon-remen1', money: 300, damage: 100, cd: 30000, curTime: 0, audioKey: 'ma-zhata', isShow: false, showTime: 2000 },
  {name: '肉弹冲击', instructions: '眩晕场上所有敌人6秒，并造成1点伤害', icon: 'icon-jianshen-daduzi-pijiudu', money: 500, damage: 1, cd: 60000, curTime: 0, audioKey: 'ma-roudan', isShow: false, showTime: 2000 },
  {name: '礼物', instructions: '随机获得1-100金币', icon: 'icon-gift', money: 0, damage: 0, cd: 30000, curTime: 0, audioKey: 'skill-coin', isShow: false, showTime: 2000 },
] as SkillType[]

/** 技能类型 */
export type SkillType = {
  name: string
  instructions: string
  icon: string
  money: number
  damage: number
  cd: number
  curTime: number
  audioKey: string
  isShow: boolean
  showTime: number
}