<script setup lang="ts">
import Taro from '@tarojs/taro';
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { t } from '@/utils/i18n';

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
    Taro.showToast({ title: t('登录失败'), icon: 'none' });
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
    Taro.showToast({ title: t('登录失败'), icon: 'none' });
    console.error(error);
  } finally {
    loadingType.value = '';
  }
}
</script>

<template>
  <view class="login-page page">
    <view class="login-canvas">
      <view class="brand-block">
        <view class="logo-mark">
          <text class="logo-symbol">訳</text>
        </view>
        <text class="brand-title">{{ t('JLPT 刷题') }}</text>
      </view>

      <text class="intro-copy">
        {{ t('登录后可保存刷题记录、错题和收藏。') }}
      </text>

      <view class="action-stack">
        <button
          class="primary-button"
          :disabled="Boolean(loadingType)"
          :loading="loadingType === 'wechat'"
          hover-class="tap-feedback"
          @tap="handleWechatLogin"
        >
          {{ t('微信授权登录') }}
        </button>
        <button
          class="secondary-button"
          :disabled="Boolean(loadingType)"
          :loading="loadingType === 'guest'"
          hover-class="tap-feedback"
          @tap="handleGuestLogin"
        >
          {{ t('暂不登录，先体验') }}
        </button>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.login-page {
  min-height: 100vh;
  padding: calc(env(safe-area-inset-top) + 80px) 32px 56px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8faf8;
  text-align: center;
}

.login-canvas {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48px;
}

.logo-mark {
  width: 152px;
  height: 152px;
  border-radius: 999px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f4f2;
  border: 2px solid #e1e3e1;
  box-shadow: 0 10px 30px rgba(152, 216, 200, 0.15);
}

.logo-symbol {
  color: #28695c;
  font-size: 64px;
  line-height: 72px;
  font-weight: 700;
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
  font-size: 30px;
  line-height: 46px;
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
  font-weight: 700;
  line-height: 112px;
  transition: opacity 180ms ease, transform 180ms ease;
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

.primary-button[disabled],
.secondary-button[disabled] {
  opacity: 0.68;
}
</style>
