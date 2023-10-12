import { Ref, ref } from "vue"

export default function useDomRef() {
  const canvasRef = ref<HTMLCanvasElement>()
  
  /** 背景音乐 */
  const audioBgRef = ref<HTMLAudioElement>()
  /** 等级音乐 */
  const audioLevelRef = ref<HTMLAudioElement>()
  /** 技能音乐 */
  const audioSkillRef = ref<HTMLAudioElement>()
  /** 游戏结束音乐 */
  const audioEndRef = ref<HTMLAudioElement>()
  
  /** 音乐对象引用 */
  const audioRefObj: {[key in string]: Ref<HTMLAudioElement | undefined>} = {
    audioBgRef,
    audioLevelRef,
    audioSkillRef,
    audioEndRef
  }

  return {
    canvasRef,
    audioBgRef,
    audioLevelRef,
    audioSkillRef,
    audioEndRef,
    audioRefObj
  }
}
