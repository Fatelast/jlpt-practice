<script setup lang="ts">
import Taro from '@tarojs/taro';
import { computed, onMounted } from 'vue';
import { usePracticeStore } from '@/stores/practice';
import { t } from '@/utils/i18n';
import { getNavigationMetrics } from '@/utils/navigation';

const practiceStore = usePracticeStore();
const navigationMetrics = getNavigationMetrics();
const pageStyle = { paddingTop: `${navigationMetrics.contentTop}px` };
const headerStyle = {
  height: `${navigationMetrics.headerHeight}px`,
  paddingTop: `${navigationMetrics.statusBarHeight}px`,
  paddingRight: `${navigationMetrics.rightReserved}px`,
};

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

  return `conic-gradient(#28695c 0deg, #98d8c8 ${degrees}deg, #eceeec ${degrees}deg)`;
});
const durationText = computed(() => {
  const durationSeconds = practiceStore.finishedResult?.durationSeconds ?? 0;
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}秒`;
  }

  return `${minutes}分${seconds}秒`;
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
      <button
        class="menu-button"
        hover-class="tap-feedback"
        :aria-label="t('返回练习配置')"
        @tap="tryAgain"
      >
        ‹
      </button>
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

    <view class="result-actions safe-bottom-spacer">
      <button class="review-button disabled" disabled hover-class="tap-feedback">
        <text>{{ t('复盘错题') }}</text>
        <text class="action-soon">{{ t('未开放') }}</text>
      </button>
      <button class="again-button" hover-class="tap-feedback" @tap="tryAgain">
        {{ t('再练一组') }}
      </button>
    </view>
  </view>
</template>

<style lang="scss">
.result-page {
  min-height: 100vh;
  padding: 128px 32px 64px;
  box-sizing: border-box;
  background: #f8faf8;
}

.result-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 0 32px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(248, 250, 248, 0.92);
  backdrop-filter: blur(12px);
}

.menu-button,
.avatar-dot {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f4f2;
  color: #28695c;
  font-size: 36px;
  font-weight: 700;
  transition: opacity 180ms ease, transform 180ms ease;
}

.result-brand {
  color: #28695c;
  font-size: 36px;
  line-height: 48px;
  font-weight: 700;
}

.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48px;
}

.score-ring {
  width: 320px;
  height: 320px;
  border-radius: 999px;
  margin-bottom: 40px;
  padding: 24px;
  box-sizing: border-box;
  box-shadow: 0 10px 30px rgba(152, 216, 200, 0.25);
}

.score-inner {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8faf8;
}

.score-value {
  color: #28695c;
  font-size: 64px;
  line-height: 80px;
  font-weight: 700;
}

.score-label {
  color: #3f4946;
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
  letter-spacing: 0;
}

.result-copy {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
}

.result-title {
  color: #191c1b;
  font-size: 40px;
  line-height: 54px;
  font-weight: 700;
}

.result-subtitle {
  color: #3f4946;
  font-size: 28px;
  line-height: 44px;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 48px;
}

.stat-card {
  width: calc((100% - 20px) / 2);
  min-height: 172px;
  padding: 28px;
  border-radius: 32px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  border: 1px solid #d7dfdb;
}

.stat-card.peach {
  background: rgba(254, 208, 185, 0.35);
}

.stat-card.sand {
  background: rgba(214, 204, 152, 0.35);
}

.stat-mark {
  color: #28695c;
  font-size: 34px;
  line-height: 40px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  color: #3f4946;
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-value {
  color: #191c1b;
  font-size: 44px;
  line-height: 60px;
  font-weight: 700;
}

.stat-value.compact {
  font-size: 34px;
  line-height: 48px;
}

.reflection-card {
  padding: 32px;
  border-radius: 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  background: rgba(254, 208, 185, 0.35);
  border: 1px solid rgba(121, 87, 69, 0.12);
  margin-bottom: 48px;
}

.sprout-mark {
  width: 88px;
  height: 88px;
  border-radius: 999px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #28695c;
  background: rgba(255, 255, 255, 0.65);
  font-size: 44px;
  font-weight: 300;
}

.reflection-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reflection-label {
  color: #7a5745;
  font-size: 22px;
  line-height: 30px;
  font-weight: 700;
  letter-spacing: 0;
}

.reflection-text {
  color: #5f402f;
  font-size: 28px;
  line-height: 42px;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.review-button,
.again-button {
  width: 100%;
  height: 96px;
  border-radius: 999px;
  font-size: 32px;
  font-weight: 700;
  line-height: 96px;
  transition: opacity 180ms ease, transform 180ms ease;
}

.review-button {
  color: #28695c;
  background: transparent;
  border: 1px solid #28695c;
}

.review-button.disabled {
  color: #7d8783;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  line-height: 1;
  background: #f2f4f2;
  border-color: #d7dfdb;
  opacity: 1;
}

.action-soon {
  color: #8f9894;
  font-size: 20px;
  line-height: 26px;
  font-weight: 600;
}

.again-button {
  color: #ffffff;
  background: #28695c;
  box-shadow: 0 10px 30px rgba(40, 105, 92, 0.2);
}
</style>

