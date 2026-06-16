import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    isReady: false,
  }),
});
