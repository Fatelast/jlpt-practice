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
  padding: 96px 32px 180px;
  box-sizing: border-box;
  background: #f8faf8;
}

.page-hero {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 40px;
}

.eyebrow {
  color: #28695c;
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
}

.hero-title {
  color: #191c1b;
  font-size: 48px;
  line-height: 62px;
  font-weight: 700;
}

.hero-copy,
.note-copy {
  color: #3f4946;
  font-size: 28px;
  line-height: 44px;
}

.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  flex: 1;
  min-height: 176px;
  padding: 28px;
  border-radius: 32px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #d7dfdb;
}

.stat-card.mint {
  background: rgba(175, 239, 223, 0.45);
}

.stat-value {
  color: #28695c;
  font-size: 52px;
  line-height: 66px;
  font-weight: 700;
}

.stat-label {
  color: #3f4946;
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
}

.note-card {
  padding: 32px;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(254, 208, 185, 0.35);
  border: 1px solid rgba(121, 87, 69, 0.12);
}

.note-title {
  color: #5f402f;
  font-size: 30px;
  line-height: 40px;
  font-weight: 700;
}
</style>
