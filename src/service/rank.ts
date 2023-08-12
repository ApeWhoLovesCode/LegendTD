import { prefixAPI } from '@/config';
import request from './request';

export type GameIdType = '101'

export type RankScore = {
  /** key: 游戏id value: 游戏得分 */
  [key in GameIdType]: number;
}

export type RankItem = {
  /** 用户id */
  id: string
  /** 用户头像 */
  avatar: string
  /** 用户名 */
  name: string
  /** 所有关卡得分数组 */
  scoreList?: number[]
  /** 所有关卡中的最大得分以及对应的等级 */
  max: {
    score: number
    level: number
  }
} & RankScore

export const getRankListApi = () => {
  return request.get<RankItem[]>(`/${prefixAPI}/legendTD/getScoreList`)
}

export type UpdateScoreParasm = {
  /** 选择的地铁 */
  level: number
  /** 闯过的关卡 */
  score: number
  userId: string
}
export type UpdateScoreRes = {
  /** 得分是否有更新 */
  isUpdate: boolean
  /** 上传的成绩 */
  score: number
}
/** 上传得分 */
export const updateScoreApi = (params: UpdateScoreParasm) => {
  return request.post<UpdateScoreRes>(`/${prefixAPI}/legendTD/setScore`, params)
}