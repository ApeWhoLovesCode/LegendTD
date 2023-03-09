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

export function isFunction(val: any) {
  return typeof val === 'function';
}
export function isPlainObject(val: any) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}
export function isPromise(val: any) {
  return isPlainObject(val) && isFunction(val.then) && isFunction(val.catch);
}
export function isDef(value: any) {
  return value !== undefined && value !== null;
}
export function isObj(x: any) {
  const type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}
export function isNumber(value: any) {
  return /^\d+(\.\d+)?$/.test(value);
}
export function isBoolean(value: any) {
  return typeof value === 'boolean';
}