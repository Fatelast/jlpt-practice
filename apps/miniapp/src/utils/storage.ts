import Taro from '@tarojs/taro';

export const STORAGE_KEYS = {
  token: 'jlpt_practice_token',
  userInfo: 'jlpt_practice_user_info',
  guestCode: 'jlpt_practice_guest_code',
} as const;

export function getStorage<T>(key: string): T | null {
  return Taro.getStorageSync<T>(key) ?? null;
}

export function setStorage<T>(key: string, value: T) {
  Taro.setStorageSync(key, value);
}

export function removeStorage(key: string) {
  Taro.removeStorageSync(key);
}
