import { defineStore } from 'pinia';
import type { JLPTLevel } from '@jlpt-practice/shared';
import type { UserInfo } from '@/types/user';

interface UserState {
  token: string;
  userInfo: UserInfo | null;
  currentLevel: JLPTLevel;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    userInfo: null,
    currentLevel: 'N5',
  }),
});
