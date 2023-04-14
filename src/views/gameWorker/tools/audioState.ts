import audioData from "@/dataSource/audioData"
import { GameAudio } from "@/type/game"
import { reactive, nextTick } from "vue"

export default function useAudioState() {
  const audioState = reactive<GameAudio>({
    // 所有音乐数据
    audioList: audioData,
    // 终点音乐
    audioEnd: '',
    // 当前技能音乐
    audioSkill: '',
  })
  
  /** 生成音频播放器 */
  function createAudio(audioKey: string, id: string) {
    if(!audioState.audioList[audioKey]) return
    const audioWrap = document.querySelector('#audio-wrap')
    const audio = document.createElement('audio') //生成一个audio元素 
    audio.src = audioState.audioList[audioKey]  //音乐的路径
    audio.id = id
    audioWrap?.appendChild(audio)  //把它添加到页面中
  }
  
  /** 播放创建出来的dom(防御塔和僵尸)的音乐 */
  function playDomAudio({id, audioKey, volume = 0.5}: {id: string, audioKey?: string, volume?: number}) {
    const audioWrap = document.querySelector('#audio-wrap')
    const audioDom = (audioWrap?.querySelector(`#${id}`) as HTMLAudioElement)
    if(!audioDom) return
    if(audioKey) audioDom.src = audioState.audioList[audioKey]
    audioDom.volume = volume
    audioDom.play()
  }

  /** 清除音频播放器 */
  function removeAudio(id: string) {
    // 删除该 video dom 节点
    const videoDom = document.querySelector(`#${id}`)
    if(videoDom) {
      videoDom.remove()
    }
  }
  
  return {
    audioState,
    createAudio,
    playDomAudio,
    removeAudio,
  }

}
