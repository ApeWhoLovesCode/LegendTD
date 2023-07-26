import skillData from "@/dataSource/skillData";
import { addMoney } from "./baseData";
import { enemyMap, removeEnemy, slowEnemy } from "./enemy";
import { towerMap } from "./tower";
import { randomNum } from "@/utils/tools";

export const gameSkillState = {
  // 生产的金钱
  proMoney: {isShow: false, interval: 10000, money: 25},
  // 增加的金钱
  addMoney: {num: '', timer: null, time: 1000},
  // 底部技能栏
  skillList: JSON.parse(JSON.stringify(skillData)),
}

/** 发动技能 */
export function handleSkill(index: number) {
  const { name, money, damage } = gameSkillState.skillList[index]
  addMoney(-money)
  if(name !== '礼物') {
    const e_idList: string[] = []
    enemyMap.forEach(enemy => {
      enemy.hp.cur -= damage
      if(enemy.hp.cur <= 0) {
        addMoney(enemy.reward)
        e_idList.push(enemy.id)
        // 遍历清除防御塔里的该攻击目标
        towerMap.forEach(t => {
          t.targetIdList.splice(t.targetIdList.findIndex(item => item === enemy.id), 1)
        })
      }
      if(name === "肉弹冲击") {
        slowEnemy(enemy.id, {num: 0, time: 6000, type: 'vertigo'})
      }
    })
    removeEnemy(e_idList)
  } else {
    addMoney(randomNum(1, 100))
  }
}