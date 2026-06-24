<script setup lang="ts">
import Taro from '@tarojs/taro';
import { computed, onMounted, ref } from 'vue';
import BottomTabBar from '@/components/BottomTabBar/index.vue';
import { usePracticeStore } from '@/stores/practice';
import { t } from '@/utils/i18n';
import {
  getDefaultNavigationMetrics,
  getNavigationMetrics,
} from '@/utils/navigation';

const practiceStore = usePracticeStore();
const navigationMetrics = ref(getDefaultNavigationMetrics());
const pageStyle = computed(() => ({
  paddingTop: `${navigationMetrics.value.contentTop}px`,
}));
const headerStyle = computed(() => ({
  height: `${navigationMetrics.value.headerHeight}px`,
  paddingTop: `${navigationMetrics.value.statusBarHeight}px`,
  paddingRight: `${navigationMetrics.value.rightReserved}px`,
}));

onMounted(() => {
  navigationMetrics.value = getNavigationMetrics();
});

const totalCount = computed(
  () => practiceStore.finishedResult?.totalCount ?? practiceStore.answers.length,
);
const correctCount = computed(
  () => practiceStore.finishedResult?.correctCount
    ?? practiceStore.answers.filter((answer) => answer.isCorrect).length,
);
const wrongCount = computed(() => Math.max(totalCount.value - correctCount.value, 0));
const accuracy = computed(() => {
  if (practiceStore.finishedResult) {
    return Math.round(practiceStore.finishedResult.accuracy);
  }

  if (totalCount.value === 0) {
    return 0;
  }

  return Math.round((correctCount.value / totalCount.value) * 100);
});
const scoreBackground = computed(() => {
  const degrees = Math.round((accuracy.value / 100) * 360);

  return `conic-gradient(var(--jp-primary) 0deg, var(--jp-primary-soft) ${degrees}deg, var(--jp-surface-soft) ${degrees}deg)`;
});
const durationText = computed(() => {
  const durationSeconds = practiceStore.finishedResult?.durationSeconds ?? 0;
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}${t('秒')}`;
  }

  return `${minutes}${t('分')}${seconds}${t('秒')}`;
});

const resultMessage = computed(() => {
  if (accuracy.value >= 85) {
    return t('完成得很好，专注练习正在产生效果。');
  }

  if (accuracy.value >= 60) {
    return t('进步很稳定，复盘错题后再来一组。');
  }

  return t('先轻松复盘一遍，下一组会更顺手。');
});

onMounted(() => {
  if (!practiceStore.finishedResult && practiceStore.answers.length === 0) {
    Taro.redirectTo({ url: '/pages/practice/index' });
  }
});

async function tryAgain() {
  practiceStore.reset();
  await Taro.redirectTo({ url: '/pages/practice/index' });
}
</script>

<template>
  <view class="result-page page" :style="pageStyle">
    <view class="result-header" :style="headerStyle">
      <view class="menu-button" hover-class="tap-feedback" :aria-label="t('返回练习配置')" @tap="tryAgain"><text class="back-glyph">‹</text></view>
      <text class="result-brand">{{ t('JLPT 刷题') }}</text>
      <view class="avatar-dot">{{ t('练') }}</view>
    </view>

    <view class="score-section">
      <view class="score-ring" :style="{ background: scoreBackground }">
        <view class="score-inner">
          <text class="score-value">{{ accuracy }}%</text>
          <text class="score-label">{{ t('正确率') }}</text>
        </view>
      </view>
      <view class="result-copy">
        <text class="result-title">{{ resultMessage }}</text>
        <text class="result-subtitle">
          {{ t('每一次练习，都会让你离目标更近一点。') }}
        </text>
      </view>
    </view>

    <view class="stats-grid">
      <view class="stat-card">
        <text class="stat-mark">□</text>
        <text class="stat-label">{{ t('总题数') }}</text>
        <text class="stat-value">{{ totalCount }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-mark">✓</text>
        <text class="stat-label">{{ t('答对') }}</text>
        <text class="stat-value">{{ correctCount }}</text>
      </view>
      <view class="stat-card peach">
        <text class="stat-mark">×</text>
        <text class="stat-label">{{ t('错题') }}</text>
        <text class="stat-value">{{ wrongCount }}</text>
      </view>
      <view class="stat-card sand">
        <text class="stat-mark">◷</text>
        <text class="stat-label">{{ t('用时') }}</text>
        <text class="stat-value compact">{{ durationText }}</text>
      </view>
    </view>

    <view class="reflection-card">
      <view class="sprout-mark">＋</view>
      <view class="reflection-copy">
        <text class="reflection-label">{{ t('练习回顾') }}</text>
        <text class="reflection-text">
          {{ t('停下来回想一下，今天有哪些题型已经变得更熟悉了。') }}
        </text>
      </view>
    </view>

    <view class="result-actions">
      <button class="review-button disabled" disabled hover-class="tap-feedback">
        <text>{{ t('复盘错题') }}</text>
        <text class="action-soon">{{ t('未开放') }}</text>
      </button>
      <button class="again-button" hover-class="tap-feedback" @tap="tryAgain">
        {{ t('再练一组') }}
      </button>
    </view>

    <BottomTabBar active="review" />
  </view>
</template>

<style lang="scss">
.result-page {
  min-height: 100vh;
  padding: 128rpx 32rpx calc(214rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: var(--jp-bg);
}

.result-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 0 32rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(248, 250, 248, 0.92);
  backdrop-filter: blur(12px);
}

.menu-button {
  width: 88rpx;
  height: 88rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 244, 242, 0.92);
  color: var(--jp-primary);
  box-shadow: 0 8rpx 22rpx rgba(40, 105, 92, 0.06);
  transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease;
}

.back-glyph {
  display: block;
  color: currentColor;
  font-size: 34rpx;
  line-height: 34rpx;
  transform: translateY(-1rpx);
}

.avatar-dot {
  width: 64rpx;
  height: 64rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--jp-surface-soft);
  color: var(--jp-primary);
  font-size: 36rpx;
  font-weight: 800;
  transition: opacity 180ms ease, transform 180ms ease;
}

.result-brand {
  color: var(--jp-primary);
  font-size: 34rpx;
  line-height: 46rpx;
  font-weight: 800;
}

.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 42rpx;
}

.score-ring {
  width: 306rpx;
  height: 306rpx;
  border-radius: 999rpx;
  margin-bottom: 34rpx;
  padding: 22rpx;
  box-sizing: border-box;
  box-shadow: 0 10rpx 30rpx rgba(152, 216, 200, 0.25);
}

.score-inner {
  width: 100%;
  height: 100%;
  border-radius: 999rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--jp-bg);
}

.score-value {
  color: var(--jp-primary);
  font-size: 64rpx;
  line-height: 78rpx;
  font-weight: 800;
}

.score-label {
  color: var(--jp-text-secondary);
  font-size: 24rpx;
  line-height: 32rpx;
  font-weight: 800;
}

.result-copy {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  text-align: center;
}

.result-title {
  color: var(--jp-text);
  font-size: 38rpx;
  line-height: 52rpx;
  font-weight: 800;
}

.result-subtitle {
  color: var(--jp-text-secondary);
  font-size: 28rpx;
  line-height: 44rpx;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 42rpx;
}

.stat-card {
  width: calc((100% - 20rpx) / 2);
  min-height: 168rpx;
  padding: 26rpx;
  border-radius: 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--jp-surface);
  border: 1rpx solid var(--jp-border);
}

.stat-card.peach {
  background: rgba(254, 208, 185, 0.35);
}

.stat-card.sand {
  background: rgba(214, 204, 152, 0.35);
}

.stat-mark {
  color: var(--jp-primary);
  font-size: 34rpx;
  line-height: 40rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
}

.stat-label {
  color: var(--jp-text-secondary);
  font-size: 24rpx;
  line-height: 32rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
}

.stat-value {
  color: var(--jp-text);
  font-size: 44rpx;
  line-height: 58rpx;
  font-weight: 800;
}

.stat-value.compact {
  font-size: 34rpx;
  line-height: 48rpx;
}

.reflection-card {
  padding: 30rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  gap: 22rpx;
  background: rgba(254, 208, 185, 0.35);
  border: 1rpx solid rgba(121, 87, 69, 0.12);
  margin-bottom: 38rpx;
}

.sprout-mark {
  width: 84rpx;
  height: 84rpx;
  border-radius: 999rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--jp-primary);
  background: rgba(255, 255, 255, 0.65);
  font-size: 42rpx;
  font-weight: 300;
}

.reflection-copy {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.reflection-label {
  color: #7a5745;
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 800;
}

.reflection-text {
  color: #5f402f;
  font-size: 28rpx;
  line-height: 42rpx;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.review-button,
.again-button {
  width: 100%;
  height: 96rpx;
  border-radius: 999rpx;
  font-size: 32rpx;
  font-weight: 800;
  line-height: 96rpx;
  transition: opacity 180ms ease, transform 180ms ease;
}

.review-button {
  color: var(--jp-primary);
  background: rgba(255, 255, 255, 0.55);
  border: 1rpx solid var(--jp-primary);
}

.review-button.disabled {
  color: #7d8783;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  line-height: 1;
  background: var(--jp-surface-soft);
  border-color: var(--jp-border);
  opacity: 1;
}

.action-soon {
  color: #8f9894;
  font-size: 20rpx;
  line-height: 26rpx;
  font-weight: 700;
}

.again-button {
  color: #ffffff;
  background: var(--jp-primary);
  box-shadow: var(--jp-shadow-primary);
}
</style>
