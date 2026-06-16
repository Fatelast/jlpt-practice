import { defineStore } from 'pinia';

interface AuthState {
  token: string;
  username: string;
  role: 'admin' | 'editor' | 'reviewer' | '';
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: '',
    username: '',
    role: '',
  }),
});
