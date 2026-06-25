<script setup lang="ts">
import Taro from '@tarojs/taro';
import { computed, onMounted } from 'vue';
import AppIcon from '@/components/AppIcon/index.vue';
import type { AppIconName } from '@/components/AppIcon/index.vue';
import BottomTabBar from '@/components/BottomTabBar/index.vue';
import { usePracticeStore } from '@/stores/practice';
import { useUserStore } from '@/stores/user';
import { t } from '@/utils/i18n';

interface HomeStat {
  label: string;
  value: string | number;
  icon: AppIconName;
  tone: 'mint' | 'peach' | 'sand';
}

interface HomeModule {
  label: string;
  meta: string;
  icon: AppIconName;
  tone: 'mint' | 'peach' | 'sand' | 'ink';
  url: string;
}

const userStore = useUserStore();
const practiceStore = usePracticeStore();

userStore.restoreSession();

onMounted(() => {
  Taro.setNavigationBarTitle({ title: 'JLPT刷题' });
});

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
const progressPercent = computed(() => {
  if (answeredCount.value === 0) {
    return 18;
  }

  return Math.max(18, Math.min(100, Math.round((correctCount.value / answeredCount.value) * 100)));
});
const progressBarStyle = computed(() => ({ width: `${progressPercent.value}%` }));
const todayTargetText = computed(() => `${answeredCount.value}/10`);

const stats = computed<HomeStat[]>(() => [
  { label: t('今日答题'), value: answeredCount.value, icon: 'pen', tone: 'mint' },
  { label: t('正确率'), value: accuracyText.value, icon: 'check', tone: 'peach' },
  { label: t('错题数'), value: wrongCount.value, icon: 'target', tone: 'sand' },
]);
const modules: HomeModule[] = [
  { label: t('文字词汇'), meta: t('词汇与汉字'), icon: 'book', tone: 'mint', url: '/pages/practice/index' },
  { label: t('语法专项'), meta: t('句型与助词'), icon: 'layers', tone: 'peach', url: '/pages/practice/index' },
  { label: t('错题复盘'), meta: t('回看薄弱点'), icon: 'review', tone: 'sand', url: '/pages/wrong-book/index' },
  { label: t('学习进度'), meta: t('查看掌握度'), icon: 'chart', tone: 'ink', url: '/pages/progress/index' },
];

async function goPage(url: string) {
  await Taro.navigateTo({ url });
}
</script>

<template>
  <view class="home-page page">
    <view class="hero-card">
      <view class="hero-topline">
        <view class="avatar-badge">{{ avatarText }}</view>
        <view class="hero-title-group">
          <text class="hero-eyebrow">{{ t('欢迎回来') }}</text>
          <text class="hero-title">{{ displayName }}</text>
        </view>
        <view class="level-badge">{{ userStore.currentLevel }}</view>
      </view>

      <view class="hero-body">
        <text class="hero-copy">
          {{ t('今天先完成一组轻量练习，保持日语题感。') }}
        </text>
        <view class="hero-symbol-wrap" aria-hidden="true">
          <view class="hero-symbol-orbit" />
          <text class="hero-symbol">訳</text>
        </view>
      </view>

      <view class="goal-row">
        <view class="goal-copy">
          <text class="goal-label">{{ t('今日目标') }}</text>
          <text class="goal-value">{{ todayTargetText }} {{ t('题') }}</text>
        </view>
        <view class="goal-track">
          <view class="goal-fill" :style="progressBarStyle" />
        </view>
      </view>

      <view class="primary-action" hover-class="tap-feedback" @tap="goPage('/pages/practice/index')">
        <AppIcon name="pen" />
        <text>{{ t('开始练习') }}</text>
      </view>
    </view>

    <view class="stats-grid">
      <view
        v-for="item in stats"
        :key="item.label"
        class="stat-card"
        :class="`tone-${item.tone}`"
      >
        <view class="stat-icon-wrap">
          <AppIcon :name="item.icon" />
        </view>
        <text class="stat-value">{{ item.value }}</text>
        <text class="stat-label">{{ item.label }}</text>
      </view>
    </view>

    <view class="section-title-row">
      <view>
        <text class="section-kicker">{{ t('快速入口') }}</text>
        <text class="section-title">{{ t('选择下一步') }}</text>
      </view>
      <view class="section-action" hover-class="tap-feedback" @tap="goPage('/pages/progress/index')">
        <text>{{ t('进度') }}</text>
        <AppIcon name="chart" />
      </view>
    </view>

    <view class="module-grid">
      <view
        v-for="item in modules"
        :key="item.label"
        class="module-card"
        :class="`tone-${item.tone}`"
        hover-class="tap-feedback"
        @tap="goPage(item.url)"
      >
        <view class="module-icon-wrap">
          <AppIcon :name="item.icon" />
        </view>
        <view class="module-copy">
          <text class="module-title">{{ item.label }}</text>
          <text class="module-meta">{{ item.meta }}</text>
        </view>
      </view>
    </view>

    <BottomTabBar active="study" />
  </view>
</template>

<style lang="scss">
.home-page {
  min-height: 100vh;
  padding: 28rpx 32rpx calc(176rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background:
    radial-gradient(circle at 12% 8%, rgba(175, 239, 223, 0.32), transparent 32%),
    linear-gradient(180deg, #f8faf8 0%, #f2f6f3 52%, #f8faf8 100%);
}

.hero-card {
  position: relative;
  overflow: hidden;
  padding: 32rpx;
  border-radius: 36rpx;
  margin-bottom: 22rpx;
  color: #ffffff;
  background:
    radial-gradient(circle at 86% 20%, rgba(175, 239, 223, 0.34), transparent 28%),
    linear-gradient(138deg, #28695c 0%, #1e5149 54%, #173d38 100%);
  box-shadow: 0 18rpx 44rpx rgba(40, 105, 92, 0.22);
}

.hero-topline,
.goal-row,
.primary-action,
.section-title-row,
.section-action,
.module-card {
  display: flex;
  align-items: center;
}

.hero-topline {
  position: relative;
  z-index: 1;
  gap: 18rpx;
}

.avatar-badge {
  width: 76rpx;
  height: 76rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--jp-primary);
  background: rgba(255, 255, 255, 0.9);
  font-size: 32rpx;
  line-height: 40rpx;
  font-weight: 900;
}

.hero-title-group {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.hero-eyebrow {
  color: rgba(255, 255, 255, 0.72);
  font-size: 22rpx;
  line-height: 28rpx;
  font-weight: 800;
}

.hero-title {
  color: #ffffff;
  font-size: 38rpx;
  line-height: 48rpx;
  font-weight: 900;
}

.level-badge {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  color: #123d36;
  background: rgba(175, 239, 223, 0.86);
  font-size: 24rpx;
  line-height: 30rpx;
  font-weight: 900;
}

.hero-body {
  position: relative;
  z-index: 1;
  min-height: 150rpx;
  padding-top: 34rpx;
  box-sizing: border-box;
}

.hero-copy {
  position: relative;
  z-index: 2;
  width: 410rpx;
  display: block;
  color: rgba(255, 255, 255, 0.88);
  font-size: 29rpx;
  line-height: 44rpx;
  font-weight: 700;
}

.hero-symbol-wrap {
  position: absolute;
  right: 0;
  top: 8rpx;
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-symbol-orbit {
  position: absolute;
  width: 136rpx;
  height: 136rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.hero-symbol {
  position: relative;
  color: rgba(255, 255, 255, 0.95);
  font-size: 76rpx;
  line-height: 86rpx;
  font-weight: 900;
}

.goal-row {
  position: relative;
  z-index: 1;
  gap: 20rpx;
  padding: 20rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.1);
}

.goal-copy {
  width: 132rpx;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.goal-label {
  color: rgba(255, 255, 255, 0.64);
  font-size: 20rpx;
  line-height: 26rpx;
  font-weight: 800;
}

.goal-value {
  color: #ffffff;
  font-size: 30rpx;
  line-height: 38rpx;
  font-weight: 900;
}

.goal-track {
  flex: 1;
  height: 18rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.18);
}

.goal-fill {
  height: 100%;
  border-radius: 999rpx;
  background: #afefdf;
}

.primary-action {
  position: relative;
  z-index: 1;
  height: 88rpx;
  margin-top: 22rpx;
  border-radius: 999rpx;
  justify-content: center;
  gap: 10rpx;
  color: var(--jp-primary);
  background: #ffffff;
  font-size: 30rpx;
  line-height: 38rpx;
  font-weight: 900;
}

.primary-action .app-icon {
  transform: scale(0.7);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-bottom: 34rpx;
}

.stat-card {
  min-height: 178rpx;
  padding: 22rpx 14rpx;
  border-radius: 30rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--jp-primary);
  background: rgba(255, 255, 255, 0.82);
  border: 1rpx solid rgba(215, 223, 219, 0.8);
  box-shadow: 0 10rpx 28rpx rgba(25, 28, 27, 0.04);
}

.stat-card.tone-peach {
  color: #8b5a43;
}

.stat-card.tone-peach .stat-icon-wrap {
  background: rgba(254, 208, 185, 0.34);
}

.stat-card.tone-sand {
  color: #665f34;
}

.stat-card.tone-sand .stat-icon-wrap {
  background: rgba(214, 204, 152, 0.34);
}

.stat-icon-wrap {
  width: 58rpx;
  height: 58rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  background: rgba(175, 239, 223, 0.28);
  transform: scale(0.72);
}

.stat-value {
  margin-top: 8rpx;
  color: var(--jp-text);
  font-size: 36rpx;
  line-height: 44rpx;
  font-weight: 900;
}

.stat-label {
  color: var(--jp-text-muted);
  font-size: 21rpx;
  line-height: 28rpx;
  font-weight: 800;
}

.section-title-row {
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-kicker {
  display: block;
  color: var(--jp-text-muted);
  font-size: 22rpx;
  line-height: 28rpx;
  font-weight: 800;
}

.section-title {
  display: block;
  color: var(--jp-text);
  font-size: 36rpx;
  line-height: 46rpx;
  font-weight: 900;
}

.section-action {
  height: 58rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  gap: 4rpx;
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.32);
  font-size: 22rpx;
  line-height: 28rpx;
  font-weight: 900;
}

.section-action .app-icon {
  transform: scale(0.52);
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.module-card {
  min-height: 168rpx;
  padding: 24rpx;
  border-radius: 32rpx;
  box-sizing: border-box;
  gap: 18rpx;
  color: var(--jp-primary);
  background: rgba(255, 255, 255, 0.82);
  border: 1rpx solid rgba(215, 223, 219, 0.82);
  box-shadow: 0 10rpx 26rpx rgba(25, 28, 27, 0.04);
}

.module-card.tone-peach {
  color: #8b5a43;
  background: rgba(254, 208, 185, 0.18);
}

.module-card.tone-sand {
  color: #665f34;
  background: rgba(214, 204, 152, 0.2);
}

.module-card.tone-ink {
  color: #3f4946;
}

.module-icon-wrap {
  width: 66rpx;
  height: 66rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8rpx 20rpx rgba(25, 28, 27, 0.04);
  transform: scale(0.72);
}

.module-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.module-title {
  color: var(--jp-text);
  font-size: 29rpx;
  line-height: 38rpx;
  font-weight: 900;
}

.module-meta {
  color: var(--jp-text-secondary);
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 700;
}
</style>
