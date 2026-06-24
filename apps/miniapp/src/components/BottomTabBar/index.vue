<script setup lang="ts">
import Taro from '@tarojs/taro';
import { t } from '@/utils/i18n';

export type BottomTabKey = 'study' | 'review' | 'progress' | 'settings';

const props = defineProps<{
  active: BottomTabKey;
}>();

const tabs: Array<{
  key: BottomTabKey;
  label: string;
  url: string;
}> = [
  { key: 'study', label: t('学习'), url: '/pages/practice/index' },
  { key: 'review', label: t('复盘'), url: '/pages/wrong-book/index' },
  { key: 'progress', label: t('进度'), url: '/pages/home/index' },
  { key: 'settings', label: t('我的'), url: '/pages/profile/index' },
];

async function switchTab(url: string, key: BottomTabKey) {
  const pages = Taro.getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const currentPath = currentPage?.route ? `/${currentPage.route}` : '';

  if (props.active === key && currentPath === url) {
    return;
  }

  await Taro.redirectTo({ url });
}
</script>

<template>
  <view class="bottom-tab-shell safe-bottom-spacer">
    <view class="bottom-tab-bar">
      <button
        v-for="item in tabs"
        :key="item.key"
        class="bottom-tab-item"
        :class="[`tab-${item.key}`, { active: active === item.key }]"
        hover-class="tap-feedback"
        :aria-label="item.label"
        @tap="switchTab(item.url, item.key)"
      >
        <view class="tab-icon" aria-hidden="true">
          <view v-if="item.key === 'study'" class="icon-book">
            <view class="book-page left" />
            <view class="book-page right" />
          </view>
          <view v-else-if="item.key === 'review'" class="icon-review">
            <view class="review-ring" />
            <view class="review-hand" />
          </view>
          <view v-else-if="item.key === 'progress'" class="icon-progress">
            <view class="progress-bar short" />
            <view class="progress-bar medium" />
            <view class="progress-bar tall" />
          </view>
          <view v-else class="icon-settings">
            <view class="settings-dot" />
          </view>
        </view>
        <text class="tab-label">{{ item.label }}</text>
      </button>
    </view>
  </view>
</template>

<style lang="scss">
.bottom-tab-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  --safe-bottom-extra: 22rpx;
  padding: 18rpx 32rpx 22rpx;
  box-sizing: border-box;
  background: rgba(248, 250, 248, 0.92);
  backdrop-filter: blur(14px);
  border-top: 1rpx solid rgba(215, 223, 219, 0.72);
}

.bottom-tab-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}

.bottom-tab-item {
  flex: 1 1 0;
  min-width: 0;
  height: 88rpx;
  border-radius: 999rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  color: var(--jp-text-muted);
  background: transparent;
  transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease, color 180ms ease;
}

.bottom-tab-item.active {
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.72);
}

.tab-icon {
  width: 34rpx;
  height: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-label {
  font-size: 20rpx;
  line-height: 24rpx;
  font-weight: 700;
}

.icon-book {
  width: 30rpx;
  height: 24rpx;
  display: flex;
  gap: 2rpx;
}

.book-page {
  flex: 1;
  border: 3rpx solid currentColor;
  border-radius: 6rpx 3rpx 3rpx 6rpx;
  border-right-width: 1rpx;
}

.book-page.right {
  border-radius: 3rpx 6rpx 6rpx 3rpx;
  border-right-width: 3rpx;
  border-left-width: 1rpx;
}

.icon-review {
  position: relative;
  width: 30rpx;
  height: 30rpx;
}

.review-ring {
  width: 24rpx;
  height: 24rpx;
  border: 3rpx solid currentColor;
  border-radius: 999rpx;
  border-left-color: transparent;
}

.review-hand {
  position: absolute;
  left: 3rpx;
  top: 1rpx;
  width: 10rpx;
  height: 10rpx;
  border-left: 3rpx solid currentColor;
  border-bottom: 3rpx solid currentColor;
  transform: rotate(35deg);
}

.icon-progress {
  width: 30rpx;
  height: 28rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4rpx;
}

.progress-bar {
  width: 6rpx;
  border-radius: 999rpx;
  background: currentColor;
}

.progress-bar.short {
  height: 12rpx;
}

.progress-bar.medium {
  height: 20rpx;
}

.progress-bar.tall {
  height: 28rpx;
}

.icon-settings {
  width: 28rpx;
  height: 28rpx;
  border: 3rpx solid currentColor;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: currentColor;
}
</style>
