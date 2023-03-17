/****   request.js   ****/
// 导入axios
import axios from 'axios'
// 使用element-ui Message做消息提醒
import { ElMessage } from 'element-plus';
//1. 创建新的axios实例，
const service = axios.create({
  baseURL: '',
  timeout: 10 * 1000
})
// 2.请求拦截器
service.interceptors.request.use(config => {
  //发请求前做的一些处理，数据转化，配置请求头，设置token,设置loading等，根据需求去添加
  config.data = JSON.stringify(config.data);
  // config.headers.set('Content-Type', 'application/json; charset=utf-8')
  return config
}, error => {
  Promise.reject(error)
})

// 3.响应拦截器
service.interceptors.response.use(response => {
  // 处理后端返回的一些失败的请求
  if(response.data?.code !== 200) {
    let errMsg = ''
    switch (response.data?.code) {
      case -2: break;
      case -1: errMsg = `${response.data.data || '请求错误'}`; break;
      case 401: {
        errMsg = '登录凭证过期，请重新登录'
        // router.push('/')
        break;
      }
      default: errMsg = `连接错误${response.data.data}`
    }
    errMsg && ElMessage.error(errMsg)
    return Promise.reject(errMsg)
  }
  return response.data.data
}, error => {
  console.log('error: ', error);
  /***** 接收到异常响应的处理开始 *****/
  if (error && error.response) {
    switch (error.response.status) {
      case 400:
        error.message = '错误请求'
        break;
      case 401:
        ElMessage.error('未授权，请重新登录')
        return
      case 403:
        error.message = '拒绝访问'
        break;
      case 500:
        error.message = '服务器端出错'
        break;
      default:
        error.message = `连接错误${error.response.status}`
    }
  } else {
    // 超时处理
    if (JSON.stringify(error).includes('timeout')) {
      ElMessage.error('服务器响应超时，请刷新当前页')
    }
    error.message = '服务器出现了点问题，请稍后再试吧'
  }

  ElMessage.error(error.message)
  return Promise.reject(error)
})

const http = {
  get<T>(url: string, params?: any) {
    const config = {
      method: 'get',
      url: url,
      params
    }
    return service(config) as Promise<T>
  },
  post<T>(url: string, data?: any) {
    const config = {
      method: 'post',
      url: url,
      data
    }
    return service(config) as Promise<T>
  },
  put<T>(url: string, params?: any) {
    const config = {
      method: 'put',
      url: url,
      params
    }
    return service(config) as Promise<T>
  },
  delete<T>(url: string, params?: any) {
    const config = {
      method: 'delete',
      url: url,
      params
    }
    return service(config) as Promise<T>
  }
}

export default http
