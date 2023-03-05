/**
 * 音频资源
 */
export default {
  'pvz-morning': new URL('@/assets/audio/pvz-morning.mp3', import.meta.url).href,
  'pvz-comein': new URL('@/assets/audio/pvz-comein.mp3', import.meta.url).href,
  'pvz-dance': new URL('../assets/audio/pvz-dance.mp3', import.meta.url).href,
  'pvz-fulisha': new URL('../assets/audio/pvz-fulisha.mp3', import.meta.url).href,
  'ma-pvz': new URL("../assets/audio/ma-pvz.mp3", import.meta.url).href,
  'ma-qifei': new URL("../assets/audio/ma-qifei.mp3", import.meta.url).href,
  'ma-nansou': new URL("../assets/audio/ma-nansou.wav", import.meta.url).href,
  'ma-zhata': new URL("../assets/audio/ma-zhata.wav", import.meta.url).href,
  'ma-roudan': new URL("../assets/audio/ma-roudan.mp3", import.meta.url).href,
  'ma-gameover': new URL("../assets/audio/ma-gameover.mp3", import.meta.url).href,
  'ma-haha': new URL("../assets/audio/ma-haha.mp3", import.meta.url).href,
  'qizi-choose': new URL("../assets/audio/qizi-wujie.mp3", import.meta.url).href,
  'pdd-choose': new URL("../assets/audio/pdd-heihaha.wav", import.meta.url).href,
  'kunkun': new URL("../assets/audio/kunkun.mp3", import.meta.url).href,
  'lanbo-choose': new URL("../assets/audio/lanbo-choose.wav", import.meta.url).href,
} as {[key in string]: string}