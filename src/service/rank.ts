import request from './request';

const api = 'api'

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
} & RankScore

export const getRankListApi = (gameId: GameIdType) => {
  return request.get<RankItem[]>(`/${api}/games/rankList`, { gameId })
}