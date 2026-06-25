<script setup lang="ts">
import Taro from '@tarojs/taro';
import { computed, onMounted, ref } from 'vue';
import type { QuestionCategory, WrongQuestionItem } from '@jlpt-practice/shared';
import BottomTabBar from '@/components/BottomTabBar/index.vue';
import {
  getWrongQuestions,
  markWrongQuestionMastered,
} from '@/services/wrongBook';
import { getQuestionCategoryText } from '@/utils/enumText';
import { t } from '@/utils/i18n';

const loading = ref(false);
const wrongItems = ref<WrongQuestionItem[]>([]);
const expandedQuestionId = ref('');
const hasWrongItems = computed(() => wrongItems.value.length > 0);
const totalWrongCount = computed(() =>
  wrongItems.value.reduce((total, item) => total + item.wrongCount, 0),
);

onMounted(() => {
  loadWrongQuestions();
});

async function loadWrongQuestions() {
  loading.value = true;

  try {
    const response = await getWrongQuestions();
    wrongItems.value = response.data;
  } catch (error) {
    Taro.showToast({ title: t('加载错题失败'), icon: 'none' });
    console.error(error);
  } finally {
    loading.value = false;
  }
}

function getCategoryText(category: QuestionCategory) {
  return getQuestionCategoryText(category);
}

function getLastWrongAnswer(item: WrongQuestionItem) {
  if (!item.lastWrongAnswer) {
    return t('暂无');
  }

  const option = item.question.options.find(
    (questionOption) => questionOption.key === item.lastWrongAnswer,
  );

  return option ? `${option.key}. ${option.text}` : item.lastWrongAnswer;
}

function getLastWrongDate(lastWrongAt: string) {
  if (!lastWrongAt) {
    return t('暂无');
  }

  return lastWrongAt.slice(0, 10);
}

function toggleExplanation(questionId: string) {
  expandedQuestionId.value = expandedQuestionId.value === questionId ? '' : questionId;
}

async function markAsMastered(item: WrongQuestionItem) {
  try {
    await markWrongQuestionMastered(item.question.id);
    wrongItems.value = wrongItems.value.filter(
      (wrongItem) => wrongItem.question.id !== item.question.id,
    );
    Taro.showToast({ title: t('已标记掌握'), icon: 'success' });
  } catch (error) {
    Taro.showToast({ title: t('操作失败'), icon: 'none' });
    console.error(error);
  }
}

async function practiceWrongQuestions() {
  await Taro.navigateTo({ url: '/pages/practice/index?mode=wrong' });
}
</script>

<template>
  <view class="wrong-page page">
    <view class="wrong-hero">
      <view class="hero-copy">
        <text class="eyebrow">{{ t('复盘') }}</text>
        <text class="hero-title">{{ t('错题本') }}</text>
        <text class="hero-text">
          {{ t('集中处理还没掌握的题目，复盘后再用错题模式练一组。') }}
        </text>
      </view>
      <view class="hero-badge">
        <text class="badge-value">{{ wrongItems.length }}</text>
        <text class="badge-label">{{ t('未掌握') }}</text>
      </view>
    </view>

    <view v-if="hasWrongItems" class="summary-card">
      <view class="summary-item">
        <text class="summary-value">{{ wrongItems.length }}</text>
        <text class="summary-label">{{ t('错题数') }}</text>
      </view>
      <view class="summary-divider" />
      <view class="summary-item">
        <text class="summary-value">{{ totalWrongCount }}</text>
        <text class="summary-label">{{ t('累计错误') }}</text>
      </view>
      <button class="summary-action" hover-class="tap-feedback" @tap="practiceWrongQuestions">
        {{ t('再练一组') }}
      </button>
    </view>

    <view v-if="loading" class="state-card">
      <view class="state-mark skeleton-mark" />
      <text class="state-title">{{ t('正在加载错题') }}</text>
      <text class="state-copy">{{ t('请稍等，正在整理最近的薄弱题。') }}</text>
    </view>

    <view v-else-if="!hasWrongItems" class="state-card">
      <view class="state-mark">0</view>
      <text class="state-title">{{ t('暂无未掌握错题') }}</text>
      <text class="state-copy">
        {{ t('答错的题会自动进入这里，标记掌握后会从列表中移除。') }}
      </text>
      <button class="state-action" hover-class="tap-feedback" @tap="practiceWrongQuestions">
        {{ t('去练习') }}
      </button>
    </view>

    <view v-else class="wrong-list">
      <view
        v-for="item in wrongItems"
        :key="item.question.id"
        class="wrong-card"
      >
        <view class="card-topline">
          <text class="question-badge">
            {{ item.question.level }} / {{ getCategoryText(item.question.category) }}
          </text>
          <text class="wrong-count">{{ item.wrongCount }}{{ t('次错误') }}</text>
        </view>

        <text class="question-stem">{{ item.question.stem }}</text>
        <text v-if="item.question.translation" class="question-translation">
          {{ item.question.translation }}
        </text>

        <view class="wrong-meta">
          <view class="meta-item">
            <text class="meta-label">{{ t('上次错选') }}</text>
            <text class="meta-value">{{ getLastWrongAnswer(item) }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-label">{{ t('最近出错') }}</text>
            <text class="meta-value">{{ getLastWrongDate(item.lastWrongAt) }}</text>
          </view>
        </view>

        <view
          v-if="expandedQuestionId === item.question.id"
          class="explanation-panel"
        >
          <text class="explanation-label">{{ t('解析') }}</text>
          <text class="explanation-text">
            {{ item.question.explanation || t('暂无解析') }}
          </text>
        </view>

        <view class="card-actions">
          <button
            class="outline-action"
            hover-class="tap-feedback"
            @tap="toggleExplanation(item.question.id)"
          >
            {{ expandedQuestionId === item.question.id ? t('收起解析') : t('查看解析') }}
          </button>
          <button
            class="solid-action"
            hover-class="tap-feedback"
            @tap="markAsMastered(item)"
          >
            {{ t('标记已掌握') }}
          </button>
        </view>
      </view>
    </view>

    <BottomTabBar active="review" />
  </view>
</template>

<style lang="scss">
.wrong-page {
  min-height: 100vh;
  padding: 112rpx 32rpx calc(220rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: var(--jp-bg);
}

.wrong-hero,
.summary-card,
.state-card,
.wrong-card {
  border: 1rpx solid var(--jp-border);
  background: var(--jp-surface);
  box-shadow: 0 14rpx 38rpx rgba(40, 105, 92, 0.08);
}

.wrong-hero {
  min-height: 232rpx;
  padding: 36rpx;
  border-radius: 36rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28rpx;
  background: linear-gradient(135deg, #1e6a5b 0%, #174f46 100%);
  color: #fff;
}

.hero-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.eyebrow {
  color: rgba(255, 255, 255, 0.72);
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 800;
}

.hero-title {
  color: #fff;
  font-size: 48rpx;
  line-height: 60rpx;
  font-weight: 900;
}

.hero-text {
  color: rgba(255, 255, 255, 0.88);
  font-size: 26rpx;
  line-height: 40rpx;
}

.hero-badge {
  width: 128rpx;
  height: 128rpx;
  border-radius: 999rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.18);
  border: 1rpx solid rgba(255, 255, 255, 0.24);
}

.badge-value {
  color: #fff;
  font-size: 44rpx;
  line-height: 52rpx;
  font-weight: 900;
}

.badge-label {
  color: rgba(255, 255, 255, 0.78);
  font-size: 20rpx;
  line-height: 26rpx;
  font-weight: 800;
}

.summary-card {
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  gap: 22rpx;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.summary-value {
  color: var(--jp-primary);
  font-size: 36rpx;
  line-height: 44rpx;
  font-weight: 900;
}

.summary-label,
.meta-label,
.explanation-label {
  color: var(--jp-text-muted);
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 800;
}

.summary-divider {
  width: 1rpx;
  height: 54rpx;
  background: var(--jp-border);
}

.summary-action {
  flex: 1;
  height: 74rpx;
  margin: 0;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--jp-primary);
  color: #fff;
  font-size: 26rpx;
  line-height: 34rpx;
  font-weight: 900;
}

.state-card {
  min-height: 520rpx;
  margin-top: 28rpx;
  padding: 48rpx;
  border-radius: 34rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  text-align: center;
}

.state-mark {
  width: 118rpx;
  height: 118rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(175, 239, 223, 0.58);
  color: var(--jp-primary);
  font-size: 42rpx;
  line-height: 50rpx;
  font-weight: 900;
}

.skeleton-mark {
  opacity: 0.62;
}

.state-title {
  color: var(--jp-text);
  font-size: 36rpx;
  line-height: 48rpx;
  font-weight: 900;
}

.state-copy {
  color: var(--jp-text-secondary);
  font-size: 26rpx;
  line-height: 42rpx;
}

.state-action {
  width: 280rpx;
  height: 82rpx;
  margin: 20rpx 0 0;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--jp-primary);
  color: #fff;
  font-size: 28rpx;
  line-height: 36rpx;
  font-weight: 900;
}

.wrong-list {
  margin-top: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.wrong-card {
  padding: 30rpx;
  border-radius: 32rpx;
  box-sizing: border-box;
}

.card-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 22rpx;
}

.question-badge,
.wrong-count {
  height: 48rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 900;
}

.question-badge {
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.52);
}

.wrong-count {
  color: #8a4b32;
  background: rgba(254, 208, 185, 0.45);
}

.question-stem {
  display: block;
  color: var(--jp-text);
  font-size: 34rpx;
  line-height: 52rpx;
  font-weight: 900;
  word-break: break-word;
}

.question-translation {
  display: block;
  margin-top: 14rpx;
  color: var(--jp-text-secondary);
  font-size: 26rpx;
  line-height: 42rpx;
}

.wrong-meta {
  margin-top: 24rpx;
  display: flex;
  gap: 16rpx;
}

.meta-item {
  flex: 1;
  min-width: 0;
  padding: 18rpx;
  border-radius: 22rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  background: var(--jp-surface-soft);
}

.meta-value {
  color: var(--jp-text);
  font-size: 24rpx;
  line-height: 34rpx;
  font-weight: 800;
  word-break: break-word;
}

.explanation-panel {
  margin-top: 22rpx;
  padding: 22rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  background: rgba(245, 235, 220, 0.72);
}

.explanation-text {
  color: var(--jp-text-secondary);
  font-size: 26rpx;
  line-height: 42rpx;
}

.card-actions {
  margin-top: 26rpx;
  display: flex;
  gap: 18rpx;
}

.outline-action,
.solid-action {
  flex: 1;
  height: 76rpx;
  margin: 0;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  line-height: 34rpx;
  font-weight: 900;
}

.outline-action {
  color: var(--jp-primary);
  background: #fff;
  border: 1rpx solid var(--jp-primary);
}

.solid-action {
  color: #fff;
  background: var(--jp-primary);
}

.summary-action::after,
.state-action::after,
.outline-action::after,
.solid-action::after {
  border: 0;
}
</style>
