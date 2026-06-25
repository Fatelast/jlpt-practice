<script setup lang="ts">
import Taro from '@tarojs/taro';
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { t } from '@/utils/i18n';

const userStore = useUserStore();
const loadingType = ref<'wechat' | 'guest' | ''>('');

function getLoginErrorTitle(error: unknown) {
  if (error instanceof Error && error.message.includes('request:fail')) {
    return t('无法连接后端服务');
  }

  return t('登录失败');
}

async function enterHome() {
  await Taro.redirectTo({ url: '/pages/home/index' });
}

async function handleWechatLogin() {
  if (loadingType.value) {
    return;
  }

  loadingType.value = 'wechat';

  try {
    await userStore.loginWithWechat();
    await enterHome();
  } catch (error) {
    Taro.showToast({ title: getLoginErrorTitle(error), icon: 'none' });
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
    await enterHome();
  } catch (error) {
    Taro.showToast({ title: getLoginErrorTitle(error), icon: 'none' });
    console.error(error);
  } finally {
    loadingType.value = '';
  }
}
</script>

<template>
  <view class="login-page page">
    <view class="login-canvas">
      <view class="brand-panel">
        <view class="logo-mark">
          <text class="logo-symbol">訳</text>
        </view>
        <text class="brand-kicker">{{ t('轻量日语练习') }}</text>
        <text class="brand-title">{{ t('JLPT 刷题') }}</text>
        <text class="intro-copy">
          {{ t('把每次练习、错题和收藏都沉淀下来，按自己的节奏稳定推进。') }}
        </text>
      </view>

      <view class="action-stack">
        <view
          class="primary-button"
          :class="{ disabled: Boolean(loadingType) }"
          hover-class="tap-feedback"
          @tap="handleWechatLogin"
        >
          {{ loadingType === 'wechat' ? t('登录中') : t('微信授权登录') }}
        </view>
        <view
          class="secondary-button"
          :class="{ disabled: Boolean(loadingType) }"
          hover-class="tap-feedback"
          @tap="handleGuestLogin"
        >
          {{ loadingType === 'guest' ? t('进入中') : t('暂不登录，先体验') }}
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.login-page {
  min-height: 100vh;
  padding: calc(env(safe-area-inset-top) + 92rpx) 40rpx calc(env(safe-area-inset-bottom) + 56rpx);
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  justify-content: center;
  background:
    linear-gradient(180deg, rgba(175, 239, 223, 0.2) 0%, rgba(248, 250, 248, 0) 34%),
    var(--jp-bg);
  text-align: center;
}

.login-canvas {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.brand-panel {
  width: 100%;
  padding-top: 104rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-mark {
  width: 168rpx;
  height: 168rpx;
  border-radius: 999rpx;
  margin-bottom: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.84);
  border: 1rpx solid var(--jp-border);
  box-shadow: var(--jp-shadow-soft);
}

.logo-symbol {
  color: var(--jp-primary);
  font-size: 72rpx;
  line-height: 80rpx;
  font-weight: 700;
}

.brand-kicker {
  color: var(--jp-text-muted);
  font-size: 24rpx;
  line-height: 34rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}

.brand-title {
  color: var(--jp-primary);
  font-size: 52rpx;
  line-height: 66rpx;
  font-weight: 800;
}

.intro-copy {
  width: 560rpx;
  max-width: 100%;
  color: var(--jp-text-secondary);
  font-size: 28rpx;
  line-height: 44rpx;
  margin-top: 28rpx;
}

.action-stack {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.primary-button,
.secondary-button {
  width: 100%;
  height: 108rpx;
  border-radius: 999rpx;
  box-sizing: border-box;
  font-size: 32rpx;
  font-weight: 800;
  line-height: 108rpx;
  transition: opacity 180ms ease, transform 180ms ease;
}

.primary-button {
  color: #ffffff;
  background: var(--jp-primary);
  box-shadow: var(--jp-shadow-primary);
}

.secondary-button {
  color: var(--jp-primary);
  background: rgba(255, 255, 255, 0.55);
  border: 2rpx solid var(--jp-primary);
}

.primary-button.disabled,
.secondary-button.disabled {
  opacity: 0.68;
}
</style>
