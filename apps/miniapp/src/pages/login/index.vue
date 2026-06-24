<script setup lang="ts">
import Taro from '@tarojs/taro';
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const loadingType = ref<'wechat' | 'guest' | ''>('');

async function enterPractice() {
  await Taro.redirectTo({ url: '/pages/practice/index' });
}

async function handleWechatLogin() {
  if (loadingType.value) {
    return;
  }

  loadingType.value = 'wechat';

  try {
    await userStore.loginWithWechat();
    await enterPractice();
  } catch (error) {
    Taro.showToast({ title: 'Login failed', icon: 'none' });
    console.error(error);
  } finally {
    loadingType.value = '';
  }
}

async function handleGuestLogin() {
  if (loadingType.value) {
    return;
  }

  loadingType.value = 'guest';

  try {
    await userStore.loginAsGuest();
    await enterPractice();
  } catch (error) {
    Taro.showToast({ title: 'Login failed', icon: 'none' });
    console.error(error);
  } finally {
    loadingType.value = '';
  }
}
</script>

<template>
  <view class="login-page page">
    <view class="brand-block">
      <view class="logo-mark">
        <text class="logo-symbol">JP</text>
      </view>
      <text class="brand-title">JLPT Prep</text>
    </view>

    <text class="intro-copy">
      Sign in to keep practice history, mistakes, and favorites in sync.
    </text>

    <view class="action-stack">
      <button
        class="primary-button"
        :loading="loadingType === 'wechat'"
        @tap="handleWechatLogin"
      >
        WeChat Login
      </button>
      <button
        class="secondary-button"
        :loading="loadingType === 'guest'"
        @tap="handleGuestLogin"
      >
        Try as Guest
      </button>
    </view>
  </view>
</template>

<style lang="scss">
.login-page {
  min-height: 100vh;
  padding: 96px 32px 48px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8faf8;
  text-align: center;
}

.brand-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48px;
}

.logo-mark {
  width: 144px;
  height: 144px;
  border-radius: 999px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f4f2;
  border: 1px solid #e1e3e1;
  box-shadow: 0 10px 30px rgba(152, 216, 200, 0.15);
}

.logo-symbol {
  color: #28695c;
  font-size: 42px;
  font-weight: 700;
  letter-spacing: 2px;
}

.brand-title {
  color: #28695c;
  font-size: 48px;
  line-height: 64px;
  font-weight: 700;
}

.intro-copy {
  max-width: 560px;
  color: #3f4946;
  font-size: 32px;
  line-height: 48px;
  margin-bottom: 64px;
}

.action-stack {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.primary-button,
.secondary-button {
  width: 100%;
  height: 112px;
  border-radius: 999px;
  font-size: 32px;
  font-weight: 600;
  line-height: 112px;
}

.primary-button {
  color: #ffffff;
  background: #28695c;
  box-shadow: 0 10px 30px rgba(40, 105, 92, 0.2);
}

.secondary-button {
  color: #28695c;
  background: transparent;
  border: 2px solid #28695c;
}
</style>
