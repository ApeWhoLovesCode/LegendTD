/**
 * 音频资源
 */
export default {
  'pvz-morning': new URL('@/assets/audio/pvz-morning.mp3', import.meta.url).href,
  'pvz-comein': new URL('@/assets/audio/pvz-comein.mp3', import.meta.url).href,
  'pvz-dance': new URL('../assets/audio/pvz-dance.mp3', import.meta.url).href,
  'pvz-fulisha': new URL('../assets/audio/pvz-fulisha.mp3', import.meta.url).href,
  'ma-pvz': new URL("../assets/audio/ma-pvz.mp3", import.meta.url).href,
  'ma-nansou': new URL("../assets/audio/ma-nansou.wav", import.meta.url).href,
  'ma-zhata': new URL("../assets/audio/ma-zhata.wav", import.meta.url).href,
  'ma-roudan': new URL("../assets/audio/ma-roudan.mp3", import.meta.url).href,
  'ma-gameover': new URL("../assets/audio/ma-gameover.mp3", import.meta.url).href,
  'ma-haha': new URL("../assets/audio/ma-haha.mp3", import.meta.url).href,
  'kunkun': new URL("../assets/audio/kunkun.mp3", import.meta.url).href,
  'aixi-choose': new URL("../assets/audio/aixi-choose.wav", import.meta.url).href,
  'pdd-choose': new URL("../assets/audio/pdd-heihaha.wav", import.meta.url).href,
  'lanbo-choose': new URL("../assets/audio/lanbo-choose.wav", import.meta.url).href,
  'jin-choose': new URL("../assets/audio/jin-choose.wav", import.meta.url).href,
  'ejiate-choose': new URL("../assets/audio/ejiate-choose.wav", import.meta.url).href,
  'nanqiang-choose': new URL("../assets/audio/nanqiang-choose.wav", import.meta.url).href,
  'ez-choose': new URL("../assets/audio/ez-choose.wav", import.meta.url).href,
  'delaiwen-choose': new URL("../assets/audio/delaiwen-choose.wav", import.meta.url).href,
  'huonan-choose': new URL("../assets/audio/huonan-choose.wav", import.meta.url).href,
  'twitch-choose': new URL("../assets/audio/twitch-choose.wav", import.meta.url).href,
} as {[key in string]: string}