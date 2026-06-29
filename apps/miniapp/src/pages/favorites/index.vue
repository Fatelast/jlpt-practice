<script setup lang="ts">
import Taro from '@tarojs/taro';
import { computed, onMounted, ref } from 'vue';
import type { Question, QuestionCategory } from '@jlpt-practice/shared';
import AppIcon from '@/components/AppIcon/index.vue';
import BottomTabBar from '@/components/BottomTabBar/index.vue';
import { getFavorites, unfavoriteQuestion } from '@/services/favorite';
import { getQuestionCategoryText } from '@/utils/enumText';
import { t } from '@/utils/i18n';

const loading = ref(false);
const favorites = ref<Question[]>([]);
const expandedQuestionId = ref('');
const hasFavorites = computed(() => favorites.value.length > 0);

onMounted(() => {
  loadFavorites();
});

async function loadFavorites() {
  loading.value = true;

  try {
    const response = await getFavorites();
    favorites.value = response.data;
  } catch (error) {
    Taro.showToast({ title: t('加载收藏失败'), icon: 'none' });
    console.error(error);
  } finally {
    loading.value = false;
  }
}

function getCategoryText(category: QuestionCategory) {
  return getQuestionCategoryText(category);
}

function toggleExplanation(questionId: string) {
  expandedQuestionId.value = expandedQuestionId.value === questionId ? '' : questionId;
}

async function removeFavorite(question: Question) {
  try {
    await unfavoriteQuestion(question.id);
    favorites.value = favorites.value.filter((item) => item.id !== question.id);
    Taro.showToast({ title: t('已取消收藏'), icon: 'none' });
  } catch (error) {
    Taro.showToast({ title: t('操作失败'), icon: 'none' });
    console.error(error);
  }
}

async function practiceFavorites() {
  await Taro.navigateTo({ url: '/pages/practice/index?mode=favorite' });
}

async function startPractice() {
  await Taro.navigateTo({ url: '/pages/practice/index' });
}
</script>

<template>
  <view class="favorites-page page">
    <view class="favorites-hero">
      <view class="hero-copy">
        <text class="eyebrow">{{ t('收藏') }}</text>
        <text class="hero-title">{{ t('收藏题') }}</text>
        <text class="hero-text">
          {{ t('把想反复看的题目留在这里，集中复习更省时间。') }}
        </text>
      </view>
      <view class="hero-badge">
        <text class="badge-value">{{ favorites.length }}</text>
        <text class="badge-label">{{ t('题') }}</text>
      </view>
    </view>

    <view v-if="hasFavorites" class="summary-card">
      <view class="summary-icon"><AppIcon name="book" /></view>
      <view class="summary-copy">
        <text class="summary-title">{{ t('已收藏题目') }}</text>
        <text class="summary-text">{{ t('从收藏模式再练一组，优先巩固主动标记的题。') }}</text>
      </view>
      <button class="summary-action" hover-class="tap-feedback" @tap="practiceFavorites">
        {{ t('练收藏题') }}
      </button>
    </view>

    <view v-if="loading" class="state-card">
      <text class="state-title">{{ t('正在加载收藏') }}</text>
      <text class="state-copy">{{ t('请稍等，正在整理你的收藏题。') }}</text>
    </view>

    <view v-else-if="!hasFavorites" class="state-card empty">
      <view class="empty-mark"><AppIcon name="book" /></view>
      <text class="state-title">{{ t('暂无收藏题') }}</text>
      <text class="state-copy">{{ t('做题时点收藏，题目会集中显示在这里。') }}</text>
      <button class="state-action" hover-class="tap-feedback" @tap="startPractice">
        {{ t('去练习') }}
      </button>
    </view>

    <view v-else class="favorite-list">
      <view
        v-for="question in favorites"
        :key="question.id"
        class="favorite-card"
      >
        <view class="card-topline">
          <text class="question-badge">
            {{ question.level }} / {{ getCategoryText(question.category) }}
          </text>
          <text class="favorite-chip">★ {{ t('已收藏') }}</text>
        </view>

        <text class="question-stem">{{ question.stem }}</text>
        <text v-if="question.translation" class="question-translation">
          {{ question.translation }}
        </text>

        <view
          v-if="expandedQuestionId === question.id"
          class="explanation-panel"
        >
          <text class="explanation-label">{{ t('解析') }}</text>
          <text class="explanation-text">
            {{ question.explanation || t('暂无解析') }}
          </text>
        </view>

        <view class="card-actions">
          <button
            class="outline-action"
            hover-class="tap-feedback"
            @tap="toggleExplanation(question.id)"
          >
            {{ expandedQuestionId === question.id ? t('收起解析') : t('查看解析') }}
          </button>
          <button
            class="solid-action"
            hover-class="tap-feedback"
            @tap="removeFavorite(question)"
          >
            {{ t('取消收藏') }}
          </button>
        </view>
      </view>
    </view>

    <BottomTabBar active="review" />
  </view>
</template>

<style lang="scss">
.favorites-page {
  min-height: 100vh;
  padding: 112rpx 32rpx calc(220rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: var(--jp-bg);
}

.favorites-hero,
.summary-card,
.state-card,
.favorite-card {
  border: 1rpx solid var(--jp-border);
  background: var(--jp-surface);
  box-shadow: 0 14rpx 38rpx rgba(40, 105, 92, 0.08);
}

.favorites-hero {
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

.hero-copy,
.summary-copy {
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
  gap: 18rpx;
}

.summary-icon,
.empty-mark {
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.52);
  transform: scale(0.9);
}

.summary-title {
  color: var(--jp-text);
  font-size: 28rpx;
  line-height: 36rpx;
  font-weight: 900;
}

.summary-text,
.state-copy,
.question-translation,
.explanation-text {
  color: var(--jp-text-secondary);
  font-size: 26rpx;
  line-height: 40rpx;
}

.summary-action,
.state-action,
.outline-action,
.solid-action {
  margin: 0;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.summary-action {
  width: 188rpx;
  height: 74rpx;
  flex-shrink: 0;
  background: var(--jp-primary);
  color: #fff;
  font-size: 24rpx;
}

.state-card {
  min-height: 420rpx;
  margin-top: 28rpx;
  padding: 44rpx;
  border-radius: 34rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  text-align: center;
}

.state-title {
  color: var(--jp-text);
  font-size: 34rpx;
  line-height: 46rpx;
  font-weight: 900;
}

.state-action {
  width: 260rpx;
  height: 80rpx;
  margin-top: 12rpx;
  background: var(--jp-primary);
  color: #fff;
  font-size: 28rpx;
}

.favorite-list {
  margin-top: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.favorite-card {
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
.favorite-chip {
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

.favorite-chip {
  color: #7a5745;
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

.explanation-label {
  color: var(--jp-text-muted);
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 800;
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
  font-size: 26rpx;
  line-height: 34rpx;
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