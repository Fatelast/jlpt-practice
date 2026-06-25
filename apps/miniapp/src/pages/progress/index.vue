<script setup lang="ts">
import { computed } from 'vue';
import BottomTabBar from '@/components/BottomTabBar/index.vue';
import { usePracticeStore } from '@/stores/practice';
import { t } from '@/utils/i18n';

const practiceStore = usePracticeStore();

const answeredCount = computed(() => practiceStore.answers.length);
const correctCount = computed(
  () => practiceStore.answers.filter((answer) => answer.isCorrect).length,
);
const accuracyText = computed(() => {
  if (answeredCount.value === 0) {
    return '0%';
  }

  return `${Math.round((correctCount.value / answeredCount.value) * 100)}%`;
});
</script>

<template>
  <view class="tab-page page">
    <view class="page-hero">
      <text class="eyebrow">{{ t('学习进度') }}</text>
      <text class="hero-title">{{ t('保持一点点前进') }}</text>
      <text class="hero-copy">
        {{ t('这里会逐步沉淀你的练习统计、正确率和题型掌握情况。') }}
      </text>
    </view>

    <view class="stats-row">
      <view class="stat-card">
        <text class="stat-value">{{ answeredCount }}</text>
        <text class="stat-label">{{ t('已答题') }}</text>
      </view>
      <view class="stat-card mint">
        <text class="stat-value">{{ accuracyText }}</text>
        <text class="stat-label">{{ t('当前正确率') }}</text>
      </view>
    </view>

    <view class="note-card">
      <text class="note-title">{{ t('进度面板开发中') }}</text>
      <text class="note-copy">
        {{ t('后续会加入等级维度、题型趋势和连续练习天数。') }}
      </text>
    </view>

    <BottomTabBar active="progress" />
  </view>
</template>

<style lang="scss">
.tab-page {
  min-height: 100vh;
  padding: 96rpx 32rpx 180rpx;
  box-sizing: border-box;
  background: var(--jp-bg);
}

.page-hero {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-bottom: 40rpx;
}

.eyebrow {
  color: var(--jp-primary);
  font-size: 24rpx;
  line-height: 32rpx;
  font-weight: 700;
}

.hero-title {
  color: var(--jp-text);
  font-size: 48rpx;
  line-height: 62rpx;
  font-weight: 700;
}

.hero-copy,
.note-copy {
  color: var(--jp-text-secondary);
  font-size: 28rpx;
  line-height: 44rpx;
}

.stats-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  flex: 1;
  min-height: 176rpx;
  padding: 28rpx;
  border-radius: 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--jp-surface);
  border: 1rpx solid var(--jp-border);
}

.stat-card.mint {
  background: rgba(175, 239, 223, 0.45);
}

.stat-value {
  color: var(--jp-primary);
  font-size: 52rpx;
  line-height: 66rpx;
  font-weight: 700;
}

.stat-label {
  color: var(--jp-text-secondary);
  font-size: 24rpx;
  line-height: 32rpx;
  font-weight: 700;
}

.note-card {
  padding: 32rpx;
  border-radius: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  background: rgba(254, 208, 185, 0.35);
  border: 1rpx solid rgba(121, 87, 69, 0.12);
}

.note-title {
  color: #5f402f;
  font-size: 30rpx;
  line-height: 40rpx;
  font-weight: 700;
}
</style>