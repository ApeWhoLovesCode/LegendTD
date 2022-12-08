import audioData from "@/dataSource/audioData"
import { GameAudio } from "@/type/game"
import { reactive } from "vue"

const audioState = reactive<GameAudio>({
  // 所有音乐数据
  audioList: audioData,
  // 终点音乐
  audioEnd: '',
  // 当前技能音乐
  audioSkill: '',
})

export {
  audioState
}