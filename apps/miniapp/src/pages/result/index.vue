<script setup lang="ts">
import Taro from '@tarojs/taro';
import { computed, onMounted } from 'vue';
import { usePracticeStore } from '@/stores/practice';

const practiceStore = usePracticeStore();

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
const durationText = computed(() => {
  const durationSeconds = practiceStore.finishedResult?.durationSeconds ?? 0;
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
});

const resultMessage = computed(() => {
  if (accuracy.value >= 85) {
    return 'Great job. Your focus is paying off.';
  }

  if (accuracy.value >= 60) {
    return 'Steady progress. Review the misses and try again.';
  }

  return 'Keep it light. A short review will make the next round easier.';
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

function reviewMistakes() {
  Taro.showToast({ title: 'Coming soon', icon: 'none' });
}
</script>

<template>
  <view class="result-page page">
    <view class="result-header">
      <button class="menu-button" @tap="tryAgain">‹</button>
      <text class="result-brand">ZenJLPT</text>
      <view class="avatar-dot">J</view>
    </view>

    <view class="score-section">
      <view class="score-ring">
        <view class="score-inner">
          <text class="score-value">{{ accuracy }}%</text>
          <text class="score-label">SUCCESS</text>
        </view>
      </view>
      <view class="result-copy">
        <text class="result-title">{{ resultMessage }}</text>
        <text class="result-subtitle">
          Every session adds one more layer of confidence.
        </text>
      </view>
    </view>

    <view class="stats-grid">
      <view class="stat-card">
        <text class="stat-label">Total</text>
        <text class="stat-value">{{ totalCount }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-label">Correct</text>
        <text class="stat-value">{{ correctCount }}</text>
      </view>
      <view class="stat-card peach">
        <text class="stat-label">Mistakes</text>
        <text class="stat-value">{{ wrongCount }}</text>
      </view>
      <view class="stat-card sand">
        <text class="stat-label">Time</text>
        <text class="stat-value">{{ durationText }}</text>
      </view>
    </view>

    <view class="reflection-card">
      <view class="sprout-mark">+</view>
      <view class="reflection-copy">
        <text class="reflection-label">Mindful Reflection</text>
        <text class="reflection-text">
          Take a moment to breathe and notice what became easier today.
        </text>
      </view>
    </view>

    <view class="result-actions">
      <button class="review-button" @tap="reviewMistakes">Review Mistakes</button>
      <button class="again-button" @tap="tryAgain">Try Again</button>
    </view>
  </view>
</template>

<style lang="scss">
.result-page {
  min-height: 100vh;
  padding: 120px 32px 64px;
  box-sizing: border-box;
  background: #f8faf8;
}

.result-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  height: 96px;
  padding: 16px 32px;
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
}

.result-brand {
  color: #28695c;
  font-size: 36px;
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
  background: conic-gradient(#28695c 0deg, #98d8c8 306deg, #eceeec 306deg);
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
  letter-spacing: 2px;
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
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 48px;
}

.stat-card {
  min-height: 168px;
  padding: 28px;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  border: 2px solid #bfc9c5;
}

.stat-card.peach {
  background: rgba(254, 208, 185, 0.35);
}

.stat-card.sand {
  background: rgba(214, 204, 152, 0.35);
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

.reflection-card {
  padding: 32px;
  border-radius: 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  background: rgba(254, 208, 185, 0.35);
  border: 2px solid rgba(121, 87, 69, 0.12);
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
  font-size: 48px;
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
  letter-spacing: 2px;
  text-transform: uppercase;
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
}

.review-button {
  color: #28695c;
  background: transparent;
  border: 2px solid #28695c;
}

.again-button {
  color: #ffffff;
  background: #28695c;
  box-shadow: 0 10px 30px rgba(40, 105, 92, 0.2);
}
</style>
