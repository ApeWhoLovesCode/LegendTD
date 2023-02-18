import { UserInfo } from '@/stores/userInfo';
import request from './request';

const api = 'api'

/** 登录 */
export type LoginApiParams = {
  username: string
  password: string
}
export const loginApi = (
  params: LoginApiParams
) => {
  return request.post<UserInfo>(`/${api}/users/login`, params)
}

export const logoutApi = () => {
  return request.get(`/${api}/users/logout`)
}
