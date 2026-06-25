<script setup lang="ts">
import Taro from '@tarojs/taro';
import AppIcon from '@/components/AppIcon/index.vue';
import type { AppIconName } from '@/components/AppIcon/index.vue';
import { t } from '@/utils/i18n';

export type BottomTabKey = 'study' | 'review' | 'progress' | 'settings';

const props = defineProps<{
  active: BottomTabKey;
}>();

const tabs: Array<{
  key: BottomTabKey;
  label: string;
  url: string;
  icon: AppIconName;
}> = [
  { key: 'study', label: t('学习'), url: '/pages/home/index', icon: 'book' },
  { key: 'review', label: t('复盘'), url: '/pages/wrong-book/index', icon: 'review' },
  { key: 'progress', label: t('进度'), url: '/pages/progress/index', icon: 'chart' },
  { key: 'settings', label: t('我的'), url: '/pages/profile/index', icon: 'user' },
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
        <view class="tab-icon-shell" aria-hidden="true">
          <AppIcon :name="item.icon" />
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
  --safe-bottom-extra: 20rpx;
  padding: 18rpx 24rpx 18rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgba(248, 250, 248, 0), rgba(248, 250, 248, 0.94) 36%, rgba(248, 250, 248, 0.98));
}

.bottom-tab-bar {
  min-height: 116rpx;
  padding: 12rpx;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
  gap: 8rpx;
  border-radius: 38rpx;
  background: rgba(255, 255, 255, 0.94);
  border: 1rpx solid rgba(215, 223, 219, 0.82);
  box-shadow:
    0 -6rpx 24rpx rgba(25, 28, 27, 0.04),
    0 18rpx 42rpx rgba(40, 105, 92, 0.12);
  backdrop-filter: blur(24px);
}

.bottom-tab-item {
  position: relative;
  min-width: 0;
  height: 92rpx;
  border-radius: 30rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  color: var(--jp-text-muted);
  background: transparent;
  transition: opacity 160ms ease, transform 160ms ease, background-color 160ms ease, color 160ms ease;
}

.bottom-tab-item.active {
  color: var(--jp-primary);
  background: linear-gradient(180deg, rgba(175, 239, 223, 0.48), rgba(175, 239, 223, 0.26));
}

.bottom-tab-press {
  opacity: 0.78;
  transform: translateY(2rpx) scale(0.97);
}

.tab-icon-shell {
  width: 52rpx;
  height: 52rpx;
  border-radius: 19rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  background: rgba(242, 244, 242, 0.86);
  transform: scale(0.76);
  transition: transform 160ms ease, background-color 160ms ease, color 160ms ease, box-shadow 160ms ease;
}

.bottom-tab-item.active .tab-icon-shell {
  color: #ffffff;
  background: var(--jp-primary);
  box-shadow: 0 10rpx 22rpx rgba(40, 105, 92, 0.22);
  transform: translateY(-2rpx) scale(0.82);
}

.tab-label {
  color: currentColor;
  font-size: 20rpx;
  line-height: 24rpx;
  font-weight: 800;
}

.bottom-tab-item:not(.active) .tab-label {
  color: rgba(63, 73, 70, 0.82);
}

</style>
