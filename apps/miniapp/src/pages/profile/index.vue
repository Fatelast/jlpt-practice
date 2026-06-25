<script setup lang="ts">
import Taro from '@tarojs/taro';
import { computed } from 'vue';
import AppIcon from '@/components/AppIcon/index.vue';
import type { AppIconName } from '@/components/AppIcon/index.vue';
import BottomTabBar from '@/components/BottomTabBar/index.vue';
import { usePracticeStore } from '@/stores/practice';
import { useUserStore } from '@/stores/user';
import { t } from '@/utils/i18n';

interface ProfileStat {
  label: string;
  value: string | number;
  icon: AppIconName;
  tone: 'primary' | 'peach' | 'danger' | 'blue';
}

interface ProfileMenuItem {
  title: string;
  meta: string;
  icon: AppIconName;
  tone: 'primary' | 'peach' | 'sand' | 'blue';
  badge?: string;
}

const userStore = useUserStore();
const practiceStore = usePracticeStore();

userStore.restoreSession();

const displayName = computed(() => userStore.userInfo?.nickname ?? t('学习者'));
const avatarText = computed(() => displayName.value.slice(0, 1));
const answeredCount = computed(() => practiceStore.answers.length);
const correctCount = computed(
  () => practiceStore.answers.filter((answer) => answer.isCorrect).length,
);
const wrongCount = computed(() => Math.max(answeredCount.value - correctCount.value, 0));
const accuracyText = computed(() => {
  if (answeredCount.value === 0) {
    return '0%';
  }

  return `${Math.round((correctCount.value / answeredCount.value) * 100)}%`;
});
const stats = computed<ProfileStat[]>(() => [
  { label: t('累计答题'), value: answeredCount.value, icon: 'check', tone: 'primary' },
  { label: t('平均正确率'), value: accuracyText.value, icon: 'chart', tone: 'peach' },
  { label: t('错题数'), value: wrongCount.value, icon: 'target', tone: 'danger' },
  { label: t('收藏数'), value: 0, icon: 'book', tone: 'blue' },
]);
const menuItems: ProfileMenuItem[] = [
  { title: t('练习记录'), meta: t('查看最近完成的练习'), icon: 'clock', tone: 'primary' },
  { title: t('题目反馈记录'), meta: t('追踪提交过的问题'), icon: 'review', tone: 'peach' },
  { title: t('关于小程序'), meta: t('版本、说明与使用帮助'), icon: 'layers', tone: 'blue' },
  {
    title: t('切换等级'),
    meta: t('调整默认练习等级'),
    icon: 'target',
    tone: 'sand',
    badge: `${t('当前')}：${userStore.currentLevel}`,
  },
];

function handleMenuTap(item: ProfileMenuItem) {
  Taro.showToast({ title: `${item.title}${t('即将开放')}`, icon: 'none' });
}
</script>

<template>
  <view class="profile-page page">
    <view class="profile-hero">
      <view class="avatar-shell">
        <view class="avatar-ring">
          <text class="avatar-text">{{ avatarText }}</text>
        </view>
        <view class="level-badge">{{ userStore.currentLevel }}</view>
      </view>
      <text class="profile-name">{{ displayName }}</text>
      <text class="profile-subtitle">{{ t('保持节奏，下一组练习会更稳。') }}</text>
    </view>

    <view class="stats-grid">
      <view
        v-for="item in stats"
        :key="item.label"
        class="stat-card"
        :class="`tone-${item.tone}`"
      >
        <view class="stat-icon">
          <AppIcon :name="item.icon" />
        </view>
        <text class="stat-value">{{ item.value }}</text>
        <text class="stat-label">{{ item.label }}</text>
      </view>
    </view>

    <view class="menu-card">
      <view
        v-for="item in menuItems"
        :key="item.title"
        class="menu-item"
        hover-class="tap-feedback"
        @tap="handleMenuTap(item)"
      >
        <view class="menu-left">
          <view class="menu-icon" :class="`tone-${item.tone}`">
            <AppIcon :name="item.icon" />
          </view>
          <view class="menu-copy">
            <text class="menu-title">{{ item.title }}</text>
            <text class="menu-meta">{{ item.meta }}</text>
          </view>
        </view>
        <view class="menu-right">
          <text v-if="item.badge" class="menu-badge">{{ item.badge }}</text>
          <text class="chevron">›</text>
        </view>
      </view>
    </view>

    <BottomTabBar active="settings" />
  </view>
</template>

<style lang="scss">
.profile-page {
  min-height: 100vh;
  padding: 42rpx 32rpx calc(184rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background:
    radial-gradient(circle at 50% 0%, rgba(175, 239, 223, 0.34), transparent 34%),
    linear-gradient(180deg, #f8faf8 0%, #f2f6f3 52%, #f8faf8 100%);
}

.profile-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 34rpx;
}

.avatar-shell {
  position: relative;
  width: 188rpx;
  height: 188rpx;
  margin-bottom: 22rpx;
}

.avatar-ring {
  width: 188rpx;
  height: 188rpx;
  border-radius: 999rpx;
  padding: 12rpx;
  box-sizing: border-box;
  background: #ffffff;
  border: 1rpx solid rgba(215, 223, 219, 0.9);
  box-shadow: 0 16rpx 40rpx rgba(40, 105, 92, 0.12);
}

.avatar-text {
  width: 100%;
  height: 100%;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background:
    radial-gradient(circle at 35% 28%, rgba(255, 255, 255, 0.28), transparent 28%),
    linear-gradient(145deg, #28695c, #173d38);
  font-size: 70rpx;
  line-height: 82rpx;
  font-weight: 900;
}

.level-badge {
  position: absolute;
  right: -12rpx;
  bottom: 12rpx;
  min-width: 74rpx;
  height: 48rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00201a;
  background: #a7f5e3;
  border: 8rpx solid #f8faf8;
  box-sizing: content-box;
  font-size: 24rpx;
  line-height: 30rpx;
  font-weight: 900;
}

.profile-name {
  color: var(--jp-text);
  font-size: 40rpx;
  line-height: 52rpx;
  font-weight: 900;
}

.profile-subtitle {
  margin-top: 8rpx;
  color: var(--jp-text-secondary);
  font-size: 24rpx;
  line-height: 34rpx;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-bottom: 28rpx;
}

.stat-card {
  min-height: 198rpx;
  padding: 24rpx;
  border-radius: 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--jp-primary);
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(215, 223, 219, 0.82);
  box-shadow: 0 10rpx 28rpx rgba(25, 28, 27, 0.04);
}

.stat-card.tone-peach {
  color: #8b5a43;
}

.stat-card.tone-danger {
  color: var(--jp-danger);
}

.stat-card.tone-blue {
  color: #446179;
}

.stat-icon {
  width: 62rpx;
  height: 62rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(175, 239, 223, 0.32);
  transform: scale(0.72);
}

.stat-card.tone-peach .stat-icon {
  background: rgba(254, 208, 185, 0.36);
}

.stat-card.tone-danger .stat-icon {
  background: rgba(255, 218, 214, 0.62);
}

.stat-card.tone-blue .stat-icon {
  background: rgba(204, 229, 255, 0.62);
}

.stat-value {
  margin-top: 12rpx;
  color: currentColor;
  font-size: 44rpx;
  line-height: 54rpx;
  font-weight: 900;
}

.stat-label {
  margin-top: 4rpx;
  color: var(--jp-text-secondary);
  font-size: 23rpx;
  line-height: 30rpx;
  font-weight: 800;
}

.menu-card {
  overflow: hidden;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid rgba(215, 223, 219, 0.82);
  box-shadow: 0 12rpx 34rpx rgba(25, 28, 27, 0.05);
}

.menu-item {
  min-height: 118rpx;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  border-bottom: 1rpx solid rgba(215, 223, 219, 0.58);
}

.menu-item:last-child {
  border-bottom: 0;
}

.menu-left,
.menu-right {
  display: flex;
  align-items: center;
}

.menu-left {
  min-width: 0;
  gap: 20rpx;
}

.menu-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.28);
  transform: scale(0.72);
}

.menu-icon.tone-peach {
  color: #8b5a43;
  background: rgba(254, 208, 185, 0.32);
}

.menu-icon.tone-sand {
  color: #665f34;
  background: rgba(214, 204, 152, 0.28);
}

.menu-icon.tone-blue {
  color: #446179;
  background: rgba(204, 229, 255, 0.42);
}

.menu-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.menu-title {
  color: var(--jp-text);
  font-size: 29rpx;
  line-height: 38rpx;
  font-weight: 900;
}

.menu-meta {
  color: var(--jp-text-muted);
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 700;
}

.menu-right {
  flex-shrink: 0;
  gap: 8rpx;
}

.menu-badge {
  max-width: 160rpx;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.34);
  font-size: 20rpx;
  line-height: 26rpx;
  font-weight: 900;
}

.chevron {
  color: var(--jp-text-muted);
  font-size: 40rpx;
  line-height: 40rpx;
  font-weight: 400;
}
</style>
