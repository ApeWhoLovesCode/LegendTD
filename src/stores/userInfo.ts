import { TowerName } from '@/dataSource/towerData';
import { loginApi, LoginApiParams, logoutApi } from '@/service/login';
import {defineStore} from 'pinia';

export type UserInfo = {
  id: string
  name: string
  avatar: string
  phone: string
  isBan: number
  gameToken: string
}

type StateType = {
  userInfo?: UserInfo
  /** 选择的塔防索引 */
  towerSelectList: TowerName[]
}

export const useUserInfoStore = defineStore('userInfo', {
  state: (): StateType => ({
    userInfo: void 0,
    towerSelectList: ['aixi','delaiwen','ez','huonan','jin','lanbo','twitch','ejiate'],
  }),
  actions: {
    async login({username, password}: LoginApiParams) {
      try {
        const res = await loginApi({username,password})
        if(res) {
          this.$state.userInfo = res
        }
        return res
      } catch (error) {
        console.log('login-error: ', error);
      }
    },
    async logout() {
      try {
        const res = await logoutApi()
        this.$state.userInfo = void 0
        return res
      } catch (error) {
        console.log('logout-error: ', error);
        this.$state.userInfo = void 0
      }
    },
  },
  // 持久化
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'userInfo', //设置存储的key
        storage: localStorage, //表示存储在localStorage
      }
    ]
  }
})