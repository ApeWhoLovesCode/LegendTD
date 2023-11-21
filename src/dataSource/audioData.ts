import { requireCDN } from "@/utils/handleImg";
const  _requireCDN = (url: string) => requireCDN(url, 'audio')
/**
 * 音频资源
 */
export default {
  'pvz-morning': _requireCDN('pvz-morning.mp3'),
  'pvz-comein': _requireCDN('pvz-comein.mp3'),
  'pvz-dance': _requireCDN('pvz-dance.mp3'),
  'pvz-sound': _requireCDN('pvz-sound.mp3'),
  'pvz-little': _requireCDN('pvz-little.mp3'),
  'ma-pvz': _requireCDN('ma-pvz.mp3'),
  'ma-nansou': _requireCDN('ma-nansou.mp3'),
  'ma-zhata': _requireCDN('ma-zhata.mp3'),
  'ma-roudan': _requireCDN('ma-roudan.mp3'),
  'ma-gameover': _requireCDN('ma-gameover.mp3'),
  'ma-haha': _requireCDN('ma-haha.mp3'),
  'kunkun': _requireCDN('kunkun.mp3'),
  'aixi-choose': _requireCDN('aixi-choose.mp3'),
  'pdd-choose': _requireCDN('pdd-heihaha.mp3'),
  'lanbo-choose': _requireCDN('lanbo-choose.mp3'),
  'jin-choose': _requireCDN('jin-choose.mp3'),
  'ejiate-choose': _requireCDN('ejiate-choose.mp3'),
  'nanqiang-choose': _requireCDN('nanqiang-choose.mp3'),
  'ez-choose': _requireCDN('ez-choose.mp3'),
  'delaiwen-choose': _requireCDN('delaiwen-choose.mp3'),
  'huonan-choose': _requireCDN('huonan-choose.mp3'),
  'twitch-choose': _requireCDN('twitch-choose.mp3'),
  'create-money': _requireCDN('coin-2s.mp3'),
  'skill-coin': _requireCDN('coin-4s.mp3'),
  'game-fail': _requireCDN('game-fail.mp3'),
  'skill-boom': _requireCDN('skill-boom.mp3'),
  'godzilla-fire': _requireCDN('godzilla-fire-short.mp3'),
  'zombie-boom-countdown': _requireCDN('zombie-boom-countdown.mp3'),
  'zombie-boom-scream': _requireCDN('zombie-boom-scream.mp3'),
  'zombie-boom-boom': _requireCDN('zombie-boom-boom.mp3'),
  'ice-car-frozen': _requireCDN('ice-car-frozen.mp3'),
} as {[key in string]: string}