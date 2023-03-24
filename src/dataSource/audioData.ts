import { requireCDN } from "@/utils/handleDom";
const prefix = 'audio';
/**
 * 音频资源
 */
export default {
  'pvz-morning': requireCDN('pvz-morning.mp3', prefix),
  'pvz-comein': requireCDN('pvz-comein.mp3', prefix),
  'pvz-dance': requireCDN('pvz-dance.mp3', prefix),
  'pvz-fulisha': requireCDN('pvz-fulisha.mp3', prefix),
  'ma-pvz': requireCDN('ma-pvz.mp3', prefix),
  'ma-nansou': requireCDN('ma-nansou.mp3', prefix),
  'ma-zhata': requireCDN('ma-zhata.mp3', prefix),
  'ma-roudan': requireCDN('ma-roudan.mp3', prefix),
  'ma-gameover': requireCDN('ma-gameover.mp3', prefix),
  'ma-haha': requireCDN('ma-haha.mp3', prefix),
  'kunkun': requireCDN('kunkun.mp3', prefix),
  'aixi-choose': requireCDN('aixi-choose.mp3', prefix),
  'pdd-choose': requireCDN('pdd-heihaha.mp3', prefix),
  'lanbo-choose': requireCDN('lanbo-choose.mp3', prefix),
  'jin-choose': requireCDN('jin-choose.mp3', prefix),
  'ejiate-choose': requireCDN('ejiate-choose.mp3', prefix),
  'nanqiang-choose': requireCDN('nanqiang-choose.mp3', prefix),
  'ez-choose': requireCDN('ez-choose.mp3', prefix),
  'delaiwen-choose': requireCDN('delaiwen-choose.mp3', prefix),
  'huonan-choose': requireCDN('huonan-choose.mp3', prefix),
  'twitch-choose': requireCDN('twitch-choose.mp3', prefix),
  'create-money': requireCDN('coin-2s.mp3', prefix),
  'skill-coin': requireCDN('coin-4s.mp3', prefix),
} as {[key in string]: string}