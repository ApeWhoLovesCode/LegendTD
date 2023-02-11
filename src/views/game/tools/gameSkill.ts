import skillData from "@/dataSource/skillData";
import { GameMasterSkill } from "@/type/game";
import { reactive } from "vue";

export default function useGameSkill() {
  const gameSkillState = reactive<GameMasterSkill>({
    // 生产的金钱
    proMoney: {isShow: false, interval: 10000, money: 25},
    // 增加的金钱
    addMoney: {num: '', timer: null, time: 1000},
    // 底部技能栏
    skillList: JSON.parse(JSON.stringify(skillData)),
  })
  
  return {
    gameSkillState,
  }
}
