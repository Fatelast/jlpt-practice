import Taro from '@tarojs/taro';

export function getStorage<T>(key: string): T | null {
  return Taro.getStorageSync<T>(key) ?? null;
}

export function setStorage<T>(key: string, value: T) {
  Taro.setStorageSync(key, value);
}
