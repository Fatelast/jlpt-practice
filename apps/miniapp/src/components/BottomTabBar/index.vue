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
      <view
        v-for="item in tabs"
        :key="item.key"
        class="bottom-tab-item"
        :class="[`tab-${item.key}`, { active: active === item.key }]"
        hover-class="bottom-tab-press"
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
      </view>
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
  --safe-bottom-extra: 24rpx;
  padding: 14rpx 28rpx 24rpx;
  box-sizing: border-box;
  background: rgba(248, 250, 248, 0.94);
  backdrop-filter: blur(18px);
  border-top: 1rpx solid rgba(215, 223, 219, 0.5);
}

.bottom-tab-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  gap: 10rpx;
}

.bottom-tab-item {
  min-width: 0;
  height: 82rpx;
  border-radius: 999rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3rpx;
  color: var(--jp-text-muted);
  background: transparent;
  transition: opacity 160ms ease, transform 160ms ease, background-color 160ms ease, color 160ms ease;
}

.bottom-tab-item.active {
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.78);
  box-shadow: 0 8rpx 18rpx rgba(40, 105, 92, 0.08);
}

.bottom-tab-press {
  opacity: 0.78;
  transform: scale(0.96);
}

.tab-icon {
  width: 34rpx;
  height: 32rpx;
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
  width: 28rpx;
  height: 22rpx;
  display: flex;
  gap: 2rpx;
}

.book-page {
  flex: 1;
  border: 2rpx solid currentColor;
  border-radius: 6rpx 3rpx 3rpx 6rpx;
  border-right-width: 1rpx;
}

.book-page.right {
  border-radius: 3rpx 6rpx 6rpx 3rpx;
  border-right-width: 2rpx;
  border-left-width: 1rpx;
}

.icon-review {
  position: relative;
  width: 28rpx;
  height: 28rpx;
}

.review-ring {
  width: 22rpx;
  height: 22rpx;
  border: 2rpx solid currentColor;
  border-radius: 999rpx;
  border-left-color: transparent;
}

.review-hand {
  position: absolute;
  left: 3rpx;
  top: 2rpx;
  width: 9rpx;
  height: 9rpx;
  border-left: 2rpx solid currentColor;
  border-bottom: 2rpx solid currentColor;
  transform: rotate(35deg);
}

.icon-progress {
  width: 28rpx;
  height: 26rpx;
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
  height: 10rpx;
}

.progress-bar.medium {
  height: 18rpx;
}

.progress-bar.tall {
  height: 26rpx;
}

.icon-settings {
  width: 26rpx;
  height: 26rpx;
  border: 2rpx solid currentColor;
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
