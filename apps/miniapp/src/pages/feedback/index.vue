<script setup lang="ts">
import Taro from '@tarojs/taro';
import { computed, onMounted, ref } from 'vue';
import type { FeedbackItem, FeedbackStatus, FeedbackType } from '@jlpt-practice/shared';
import AppIcon from '@/components/AppIcon/index.vue';
import BottomTabBar from '@/components/BottomTabBar/index.vue';
import { getMyFeedback } from '@/services/feedback';
import { getQuestionCategoryText } from '@/utils/enumText';
import { t } from '@/utils/i18n';

const loading = ref(false);
const feedbackList = ref<FeedbackItem[]>([]);
const hasFeedback = computed(() => feedbackList.value.length > 0);

onMounted(() => {
  loadFeedback();
});

async function loadFeedback() {
  loading.value = true;

  try {
    const response = await getMyFeedback();
    feedbackList.value = response.data;
  } catch (error) {
    Taro.showToast({ title: t('加载反馈失败'), icon: 'none' });
    console.error(error);
  } finally {
    loading.value = false;
  }
}

function getTypeText(type: FeedbackType) {
  const typeMap: Record<FeedbackType, string> = {
    stem_error: t('题干错误'),
    option_error: t('选项错误'),
    answer_error: t('答案错误'),
    explanation_error: t('解析错误'),
    translation_error: t('翻译错误'),
    other: t('其他问题'),
  };

  return typeMap[type];
}

function getStatusText(status: FeedbackStatus) {
  const statusMap: Record<FeedbackStatus, string> = {
    pending: t('待处理'),
    processing: t('处理中'),
    resolved: t('已处理'),
    closed: t('已关闭'),
  };

  return statusMap[status];
}

function getDateText(value: string) {
  return value.slice(0, 10);
}

async function startPractice() {
  await Taro.navigateTo({ url: '/pages/practice/index' });
}
</script>

<template>
  <view class="feedback-page page">
    <view class="feedback-hero">
      <view class="hero-copy">
        <text class="eyebrow">{{ t('题目反馈') }}</text>
        <text class="hero-title">{{ t('反馈记录') }}</text>
        <text class="hero-text">
          {{ t('你提交的问题会集中显示在这里，处理状态会同步更新。') }}
        </text>
      </view>
      <view class="hero-mark">
        <AppIcon name="review" />
      </view>
    </view>

    <view v-if="loading" class="state-card">
      <text class="state-title">{{ t('正在加载反馈') }}</text>
      <text class="state-copy">{{ t('请稍等，正在整理你的反馈记录。') }}</text>
    </view>

    <view v-else-if="!hasFeedback" class="state-card empty">
      <view class="empty-mark"><AppIcon name="review" /></view>
      <text class="state-title">{{ t('暂无反馈记录') }}</text>
      <text class="state-copy">{{ t('做题时发现题干、选项或解析问题，可以直接提交反馈。') }}</text>
      <button class="state-action" hover-class="tap-feedback" @tap="startPractice">
        {{ t('去做题') }}
      </button>
    </view>

    <view v-else class="feedback-list">
      <view
        v-for="item in feedbackList"
        :key="item.id"
        class="feedback-card"
      >
        <view class="card-topline">
          <text class="feedback-type">{{ getTypeText(item.type) }}</text>
          <text class="feedback-status" :class="`status-${item.status}`">
            {{ getStatusText(item.status) }}
          </text>
        </view>

        <view v-if="item.question" class="question-panel">
          <text class="question-meta">
            {{ item.question.level }} · {{ getQuestionCategoryText(item.question.category) }}
          </text>
          <text class="question-stem">{{ item.question.stem }}</text>
        </view>

        <view class="content-panel">
          <text class="content-label">{{ t('反馈内容') }}</text>
          <text class="content-text">{{ item.content }}</text>
        </view>

        <view v-if="item.handlerRemark" class="remark-panel">
          <text class="content-label">{{ t('处理说明') }}</text>
          <text class="content-text">{{ item.handlerRemark }}</text>
        </view>

        <view class="card-footer">
          <text>{{ t('提交于') }} {{ getDateText(item.createdAt) }}</text>
          <text v-if="item.handledAt">{{ t('处理于') }} {{ getDateText(item.handledAt) }}</text>
        </view>
      </view>
    </view>

    <BottomTabBar active="settings" />
  </view>
</template>

<style lang="scss">
.feedback-page {
  min-height: 100vh;
  padding: 112rpx 32rpx calc(220rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background:
    radial-gradient(circle at 50% 0%, rgba(175, 239, 223, 0.28), transparent 35%),
    var(--jp-bg);
}

.feedback-hero,
.state-card,
.feedback-card {
  border: 1rpx solid var(--jp-border);
  background: var(--jp-surface);
  box-shadow: 0 14rpx 38rpx rgba(40, 105, 92, 0.08);
}

.feedback-hero {
  min-height: 232rpx;
  padding: 36rpx;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28rpx;
  box-sizing: border-box;
  color: #fff;
  background: linear-gradient(135deg, #1e6a5b 0%, #174f46 100%);
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

.hero-mark,
.empty-mark {
  width: 92rpx;
  height: 92rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-mark {
  color: #d9fff5;
  background: rgba(255, 255, 255, 0.16);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  transform: scale(0.92);
}

.state-card {
  margin-top: 24rpx;
  min-height: 320rpx;
  padding: 46rpx 34rpx;
  border-radius: 34rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-mark {
  margin-bottom: 20rpx;
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.52);
  transform: scale(0.9);
}

.state-title {
  color: var(--jp-text);
  font-size: 34rpx;
  line-height: 44rpx;
  font-weight: 900;
}

.state-copy {
  margin-top: 10rpx;
  color: var(--jp-text-secondary);
  font-size: 25rpx;
  line-height: 38rpx;
}

.state-action {
  margin-top: 28rpx;
  min-width: 220rpx;
  height: 78rpx;
  padding: 0 34rpx;
  border-radius: 999rpx;
  color: #fff;
  background: var(--jp-primary);
  font-size: 28rpx;
  line-height: 78rpx;
  font-weight: 900;
}

.feedback-list {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.feedback-card {
  padding: 28rpx;
  border-radius: 32rpx;
  box-sizing: border-box;
}

.card-topline,
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.feedback-type,
.feedback-status {
  height: 46rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  font-size: 22rpx;
  line-height: 46rpx;
  font-weight: 900;
}

.feedback-type {
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.42);
}

.feedback-status {
  color: #665f34;
  background: rgba(214, 204, 152, 0.32);
}

.feedback-status.status-resolved {
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.42);
}

.feedback-status.status-closed {
  color: var(--jp-text-muted);
  background: rgba(225, 227, 225, 0.7);
}

.question-panel,
.content-panel,
.remark-panel {
  margin-top: 22rpx;
  padding: 22rpx;
  border-radius: 24rpx;
  box-sizing: border-box;
}

.question-panel {
  background: var(--jp-surface-soft);
  border: 1rpx solid var(--jp-border);
}

.question-meta {
  display: block;
  color: var(--jp-text-muted);
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
}

.question-stem {
  color: var(--jp-text);
  font-size: 29rpx;
  line-height: 44rpx;
  font-weight: 800;
}

.content-panel {
  background: rgba(175, 239, 223, 0.18);
}

.remark-panel {
  background: rgba(254, 208, 185, 0.26);
}

.content-label {
  display: block;
  color: var(--jp-text-muted);
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 900;
  margin-bottom: 8rpx;
}

.content-text {
  color: var(--jp-text-secondary);
  font-size: 26rpx;
  line-height: 40rpx;
}

.card-footer {
  margin-top: 20rpx;
  color: var(--jp-text-muted);
  font-size: 21rpx;
  line-height: 30rpx;
  font-weight: 700;
}
</style>
