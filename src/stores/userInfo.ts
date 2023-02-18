import {defineStore} from 'pinia';

export type UserInfo = {
  id: string
  name: string
}

type StateType = {
  userInfo?: UserInfo
}

export const useUserInfoStore = defineStore('userInfo', {
  state: (): StateType => ({
    userInfo: void 0
  }),
})