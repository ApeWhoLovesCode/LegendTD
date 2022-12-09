import { Ref, ref } from "vue"

const canvasRef = ref<HTMLCanvasElement>()

/** 背景音乐 */
const audioBgRef = ref<HTMLAudioElement>()
/** 等级音乐 */
const audioLevelRef = ref<HTMLAudioElement>()
/** 技能音乐 */
const audioSkillRef = ref<HTMLAudioElement>()
/** 游戏结束音乐 */
const audioEndRef = ref<HTMLAudioElement>()

export {
  canvasRef,
  audioBgRef,
  audioLevelRef,
  audioSkillRef,
  audioEndRef
}

/** 音乐对象引用 */
export const audioRefObj: {[key in string]: Ref<HTMLAudioElement | undefined>} = {
  audioBgRef,
  audioLevelRef,
  audioSkillRef,
  audioEndRef
}