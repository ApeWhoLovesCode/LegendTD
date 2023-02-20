import { UserInfo } from '@/stores/userInfo';
import request from './request';

const api = 'api'

export type EditUserParams = {
  id: string
  username?: string
  phone?: string
  avatar?: string
}

/** 修改用户信息 */
export const editUserApi = (
  params: EditUserParams
) => {
  return request.post<UserInfo>(`/${api}/users/editUser`, params)
}

export type EditPassParams = {
  id: string
  password: string
  newPassword: string
}

/** 修改密码 */
export const editPassApi = (
  params: EditPassParams
) => {
  return request.post(`/${api}/users/editPassword`, params)
}