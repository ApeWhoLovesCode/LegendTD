export const randomStr = (v?: string) => `${v ? v + '-' : ''}${Math.ceil(Math.random() * 10e5).toString(36)}-${Date.now().toString(36)}`;
