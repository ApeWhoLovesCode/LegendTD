/** 校验手机 */
export const validatePhone = (rule: any, value: any, callback: any) => {
  if(value === '') {
    callback(new Error('请输入手机号'))
  } else {
    const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
    if(!reg.test(value)) {
      callback(new Error('请输入正确的手机号'))
    }
    callback()
  }
}