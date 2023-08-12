import { UserInfo } from '@/stores/userInfo';
import request from './request';
import { prefixAPI } from '@/config';

/** 登录 */
export type LoginApiParams = {
  username: string
  password: string
}
export const loginApi = (
  params: LoginApiParams
) => {
  return request.post<UserInfo>(`/${prefixAPI}/users/login`, params)
}

/** 退出登录 */
export const logoutApi = () => {
  return request.get(`/${prefixAPI}/users/logout`)
}

/** 注册 */
export const registerApi = (params: LoginApiParams) => {
  return request.post(`/${prefixAPI}/users/register`, params)
}
