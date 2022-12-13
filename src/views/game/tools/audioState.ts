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

/** 生成音频播放器 */
function createAudio(audioKey: string, id: string) {
  if(!audioState.audioList[audioKey]) return
  const audioWrap = document.querySelector('#audio-wrap')
  const audio = document.createElement('audio') //生成一个audio元素 
  audio.src = audioState.audioList[audioKey]  //音乐的路径
  audio.id = audioKey + id
  audioWrap?.appendChild(audio)  //把它添加到页面中
}

/** 播放创建出来的dom(防御塔和僵尸)的音乐 */
function playDomAudio(id: string, volume?: number) {
  const audioWrap = document.querySelector('#audio-wrap')
  const audioDom = (audioWrap?.querySelector(`#${id}`) as HTMLAudioElement)
  if(!audioDom) return
  audioDom!.play()
  audioDom.volume = volume || 1
}

/** 清除音频播放器 */
function removeAudio(id: string) {
  // 删除该 video dom 节点
  const videoDom = document.querySelector(`#${id}`)
  if(videoDom) {
    videoDom.remove()
  }
}

/** 播放技能音乐和结束音乐 */
function playAudio(audioKey: string, key: 'End' | 'Skill') {
  const audio_key: 'audioEnd' | 'audioSkill' = `audio${key}`
  if(audioState[audio_key] === undefined) return
  if(audioState[audio_key] !== audioKey) {
    audioState[audio_key] = audioKey
  }
  // vue.nextTick(()=>{
  //   // 调节音量
  //   audioRefObj[audio_key + 'Ref'].value!.volume = 0.9
  //   audioRefObj[audio_key + 'Ref'].value!.play()
  // })
}

export {
  audioState,
  createAudio,
  playDomAudio,
  removeAudio,
  playAudio,
}