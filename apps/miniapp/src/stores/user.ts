import Taro from '@tarojs/taro';
import { defineStore } from 'pinia';
import type { JLPTLevel } from '@jlpt-practice/shared';
import { wechatLogin } from '@/services/auth';
import type { UserInfo } from '@/types/user';
import {
  getStorage,
  removeStorage,
  setStorage,
  STORAGE_KEYS,
} from '@/utils/storage';

interface UserState {
  token: string;
  userInfo: UserInfo | null;
  currentLevel: JLPTLevel;
}

function getStoredUserInfo() {
  return getStorage<UserInfo>(STORAGE_KEYS.userInfo);
}

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    const storedUserInfo = getStoredUserInfo();

    return {
      token: getStorage<string>(STORAGE_KEYS.token) ?? '',
      userInfo: storedUserInfo,
      currentLevel: storedUserInfo?.currentLevel ?? 'N5',
    };
  },
  actions: {
    setSession(token: string, userInfo: UserInfo) {
      this.token = token;
      this.userInfo = userInfo;
      this.currentLevel = userInfo.currentLevel;
      setStorage(STORAGE_KEYS.token, token);
      setStorage(STORAGE_KEYS.userInfo, userInfo);
    },
    restoreSession() {
      const token = getStorage<string>(STORAGE_KEYS.token);
      const userInfo = getStoredUserInfo();

      if (!token || !userInfo) {
        return false;
      }

      this.token = token;
      this.userInfo = userInfo;
      this.currentLevel = userInfo.currentLevel;
      return true;
    },
    async loginWithCode(code: string, nickname = 'JLPT Learner') {
      const response = await wechatLogin({ code, nickname });
      this.setSession(response.data.token, response.data.user);
      return response.data.user;
    },
    async loginWithWechat() {
      try {
        const result = await Taro.login();

        if (result.code) {
          return this.loginWithCode(result.code, 'JLPT Learner');
        }
      } catch (error) {
        console.warn('Taro login fallback to guest mode.', error);
      }

      return this.loginAsGuest();
    },
    async loginAsGuest() {
      const storedCode = getStorage<string>(STORAGE_KEYS.guestCode);
      const code = storedCode ?? `guest-${Date.now()}`;

      if (!storedCode) {
        setStorage(STORAGE_KEYS.guestCode, code);
      }

      return this.loginWithCode(code, 'Guest Learner');
    },
    logout() {
      this.token = '';
      this.userInfo = null;
      this.currentLevel = 'N5';
      removeStorage(STORAGE_KEYS.token);
      removeStorage(STORAGE_KEYS.userInfo);
    },
  },
});
