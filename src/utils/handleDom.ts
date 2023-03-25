/** 处理style的px */
export const handleStylePx = (v: number | string) => {
  return typeof v === 'number' ? v + 'px' : v;
};

/** 处理类名与需要判断的类名 */
export const classBem = (classnames: string, obj?: { [key in string]?: boolean }) => {
  let str = classnames;
  if (obj) {
    Object.keys(obj).forEach((key) => {
      str += ' ' + (obj[key] ? classnames + '-' + key : '');
    });
  }
  return str;
};

export const changeEvent = (event: MouseEvent | TouchEvent) => {
  // changedTouches 是 touchEnd 的值
  return (
    (event as TouchEvent)?.touches?.[0] ??
    (event as TouchEvent)?.changedTouches?.[0] ??
    (event as MouseEvent)
  );
};