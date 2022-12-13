import skillData from "@/dataSource/skillData";
import { GameMasterSkill } from "@/type/game";
import keepInterval from "@/utils/keepInterval";
import { randomNum } from "@/utils/tools";
import { reactive } from "vue";
import { playAudio } from "./audioState";
import { baseInfoState } from "./baseInfo";
import { enemyList, removeEnemy, slowEnemy } from "./enemy";
import { towerList } from "./tower";

const gameSkillState = reactive<GameMasterSkill>({
  // 生产的金钱
  proMoney: {isShow: false, interval: 10000, money: 25},
  // 增加的金钱
  addMoney: {num: '', timer: null, time: 1000},
  // 底部技能栏
  skillList: JSON.parse(JSON.stringify(skillData)),
})

/** 发动技能 */
function handleSkill(index: number) {
  const { name, money, damage, audioKey, showTime, cd } = gameSkillState.skillList[index]
  baseInfoState.money -= money
  if(name !== '礼物') {
    const e_idList = []
    for(const enemy of enemyList) {
      const e_id = enemy.id
      enemy.hp.cur -= damage
        if(enemy.hp.cur <= 0) {
        baseInfoState.money += enemy.reward
        e_idList.push(e_id)
        // 遍历清除防御塔里的该攻击目标
        for(const t of towerList) {
          t.targetIndexList.splice(t.targetIndexList.findIndex(item => item === e_id), 1)
        }
      }
      if(name === "肉弹冲击") {
        slowEnemy(e_id, {num: 0, time: 6000})
      }
    }
    removeEnemy(e_idList)
  } else {
    baseInfoState.money += randomNum(1, 100)
  }
  playAudio(audioKey, 'Skill')
  // 显示技能效果
  gameSkillState.skillList[index].isShow = true
  setTimeout(() => {
    gameSkillState.skillList[index].isShow = false
  }, showTime);
  // 技能进入cd
  gameSkillState.skillList[index].curTime = cd 
  const skillId = `skill-${name}`
  keepInterval.set(skillId, () => {
    gameSkillState.skillList[index].curTime -= 1000
    if(gameSkillState.skillList[index].curTime <= 0) {
      keepInterval.delete(skillId)
    }
  })
}

export {
  gameSkillState,
  handleSkill,
}