<script setup lang="ts">
import Taro from '@tarojs/taro';
import { computed, onMounted, ref } from 'vue';
import type {
  ProgressCategoryMastery,
  ProgressRecentDay,
  ProgressSummary,
  QuestionCategory,
} from '@jlpt-practice/shared';
import AppIcon from '@/components/AppIcon/index.vue';
import BottomTabBar from '@/components/BottomTabBar/index.vue';
import { getProgressSummary } from '@/services/progress';
import { useUserStore } from '@/stores/user';
import { getQuestionCategoryText } from '@/utils/enumText';
import { t } from '@/utils/i18n';

const userStore = useUserStore();

userStore.restoreSession();

const loading = ref(false);
const summary = ref<ProgressSummary | null>(null);

const overview = computed(() => summary.value?.overview ?? {
  totalAnswered: 0,
  correctCount: 0,
  accuracy: 0,
  wrongQuestionCount: 0,
  todayAnswered: 0,
  streakDays: 0,
});
const recentDays = computed(() => summary.value?.recentDays ?? []);
const categoryMastery = computed(() => summary.value?.categoryMastery ?? []);
const maxRecentAnswered = computed(() =>
  Math.max(1, ...recentDays.value.map((item) => item.answeredCount)),
);
const hasProgress = computed(() => overview.value.totalAnswered > 0);
const heroTitle = computed(() =>
  hasProgress.value ? t('学习轨迹正在形成') : t('从第一组练习开始'),
);
const heroCopy = computed(() =>
  hasProgress.value
    ? t('持续复盘正确率、错题和题型掌握度，决定下一组练习方向。')
    : t('完成练习后，这里会沉淀你的正确率、错题和近 7 天趋势。'),
);
const accuracyText = computed(() => formatPercent(overview.value.accuracy));

onMounted(() => {
  loadProgressSummary();
});

async function loadProgressSummary() {
  if (!userStore.token) {
    await Taro.redirectTo({ url: '/pages/login/index' });
    return;
  }

  loading.value = true;

  try {
    const response = await getProgressSummary();
    summary.value = response.data;
  } catch (error) {
    Taro.showToast({ title: t('加载进度失败'), icon: 'none' });
    console.error(error);
  } finally {
    loading.value = false;
  }
}

function getCategoryText(category: QuestionCategory) {
  return getQuestionCategoryText(category);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function getRecentDayLabel(date: string) {
  return date.slice(5).replace('-', '/');
}

function getRecentBarStyle(item: ProgressRecentDay) {
  const height = item.answeredCount === 0
    ? 8
    : Math.max(18, Math.round((item.answeredCount / maxRecentAnswered.value) * 100));

  return { height: `${height}%` };
}

function getMasteryBarStyle(item: ProgressCategoryMastery) {
  const width = item.answeredCount === 0 ? 0 : Math.max(8, Math.round(item.accuracy));

  return { width: `${width}%` };
}

async function startPractice() {
  await Taro.navigateTo({ url: '/pages/practice/index' });
}
</script>

<template>
  <view class="progress-page page">
    <view class="progress-hero">
      <view class="hero-main">
        <text class="eyebrow">{{ t('学习进度') }}</text>
        <text class="hero-title">{{ heroTitle }}</text>
        <text class="hero-copy">{{ heroCopy }}</text>
      </view>
      <view class="hero-ring">
        <text class="ring-value">{{ accuracyText }}</text>
        <text class="ring-label">{{ t('正确率') }}</text>
      </view>
    </view>

    <view class="overview-grid">
      <view class="metric-card primary">
        <view class="metric-icon">
          <AppIcon name="pen" />
        </view>
        <text class="metric-value">{{ overview.totalAnswered }}</text>
        <text class="metric-label">{{ t('累计答题') }}</text>
      </view>
      <view class="metric-card">
        <view class="metric-icon peach">
          <AppIcon name="check" />
        </view>
        <text class="metric-value">{{ overview.correctCount }}</text>
        <text class="metric-label">{{ t('答对题数') }}</text>
      </view>
      <view class="metric-card">
        <view class="metric-icon sand">
          <AppIcon name="target" />
        </view>
        <text class="metric-value">{{ overview.wrongQuestionCount }}</text>
        <text class="metric-label">{{ t('未掌握错题') }}</text>
      </view>
      <view class="metric-card">
        <view class="metric-icon blue">
          <AppIcon name="clock" />
        </view>
        <text class="metric-value">{{ overview.streakDays }}</text>
        <text class="metric-label">{{ t('连续天数') }}</text>
      </view>
    </view>

    <view v-if="loading" class="state-card">
      <text class="state-title">{{ t('正在整理学习进度') }}</text>
      <text class="state-copy">{{ t('请稍等，正在读取你的练习记录。') }}</text>
    </view>

    <view v-else-if="!hasProgress" class="state-card">
      <text class="state-title">{{ t('还没有练习记录') }}</text>
      <text class="state-copy">{{ t('先完成一组练习，再回来查看学习曲线。') }}</text>
      <button class="state-action" hover-class="tap-feedback" @tap="startPractice">
        {{ t('开始练习') }}
      </button>
    </view>

    <view class="panel-card">
      <view class="section-heading">
        <view class="section-icon">
          <AppIcon name="chart" />
        </view>
        <view class="section-title-stack">
          <text class="section-title">{{ t('近 7 天趋势') }}</text>
          <text class="section-subtitle">{{ t('每天完成的题量和正确率') }}</text>
        </view>
      </view>
      <view class="trend-chart">
        <view
          v-for="item in recentDays"
          :key="item.date"
          class="trend-item"
        >
          <view class="trend-bar-track">
            <view
              class="trend-bar"
              :class="{ empty: item.answeredCount === 0 }"
              :style="getRecentBarStyle(item)"
            />
          </view>
          <text class="trend-count">{{ item.answeredCount }}</text>
          <text class="trend-date">{{ getRecentDayLabel(item.date) }}</text>
        </view>
      </view>
    </view>

    <view class="panel-card mastery-panel">
      <view class="section-heading">
        <view class="section-icon mint">
          <AppIcon name="layers" />
        </view>
        <view class="section-title-stack">
          <text class="section-title">{{ t('题型掌握度') }}</text>
          <text class="section-subtitle">{{ t('按文字词汇、语法、阅读拆分') }}</text>
        </view>
      </view>
      <view class="mastery-list">
        <view
          v-for="item in categoryMastery"
          :key="item.category"
          class="mastery-row"
        >
          <view class="mastery-topline">
            <text class="mastery-name">{{ getCategoryText(item.category) }}</text>
            <text class="mastery-value">{{ formatPercent(item.accuracy) }}</text>
          </view>
          <view class="mastery-track">
            <view class="mastery-bar" :style="getMasteryBarStyle(item)" />
          </view>
          <text class="mastery-meta">
            {{ item.correctCount }}/{{ item.answeredCount }} {{ t('题答对') }}
          </text>
        </view>
      </view>
    </view>

    <view class="action-card">
      <view class="action-copy">
        <text class="action-title">{{ t('下一步建议') }}</text>
        <text class="action-text">
          {{ overview.wrongQuestionCount > 0 ? t('先复盘未掌握错题，再开始下一组练习。') : t('保持节奏，继续完成一组轻量练习。') }}
        </text>
      </view>
      <button class="practice-button" hover-class="tap-feedback" @tap="startPractice">
        {{ t('继续练习') }}
      </button>
    </view>

    <BottomTabBar active="progress" />
  </view>
</template>

<style lang="scss">
.progress-page {
  min-height: 100vh;
  padding: 112rpx 32rpx calc(220rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: var(--jp-bg);
}

.progress-hero {
  min-height: 276rpx;
  padding: 38rpx;
  border-radius: 38rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 26rpx;
  color: #fff;
  background:
    radial-gradient(circle at 88% 16%, rgba(175, 239, 223, 0.28), transparent 34%),
    linear-gradient(135deg, #1f6b5d 0%, #153f39 100%);
  box-shadow: 0 18rpx 44rpx rgba(40, 105, 92, 0.18);
}

.hero-main {
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
  font-size: 46rpx;
  line-height: 58rpx;
  font-weight: 900;
}

.hero-copy {
  color: rgba(255, 255, 255, 0.86);
  font-size: 26rpx;
  line-height: 40rpx;
}

.hero-ring {
  width: 148rpx;
  height: 148rpx;
  border-radius: 999rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.16);
  border: 1rpx solid rgba(255, 255, 255, 0.28);
}

.ring-value {
  color: #fff;
  font-size: 42rpx;
  line-height: 50rpx;
  font-weight: 900;
}

.ring-label {
  color: rgba(255, 255, 255, 0.74);
  font-size: 20rpx;
  line-height: 26rpx;
  font-weight: 800;
}

.overview-grid {
  margin-top: 26rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.metric-card,
.panel-card,
.state-card,
.action-card {
  border: 1rpx solid var(--jp-border);
  background: var(--jp-surface);
  box-shadow: 0 12rpx 34rpx rgba(40, 105, 92, 0.07);
}

.metric-card {
  min-height: 176rpx;
  padding: 24rpx;
  border-radius: 30rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8rpx;
}

.metric-card.primary {
  background: rgba(175, 239, 223, 0.42);
}

.metric-icon,
.section-icon {
  width: 58rpx;
  height: 58rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.42);
  transform: scale(0.86);
  transform-origin: left center;
}

.metric-icon.peach {
  color: #9a5a3d;
  background: rgba(254, 208, 185, 0.46);
}

.metric-icon.sand {
  color: #75692f;
  background: rgba(214, 204, 152, 0.42);
}

.metric-icon.blue {
  color: #43636a;
  background: rgba(205, 226, 231, 0.58);
}

.metric-value {
  color: var(--jp-text);
  font-size: 44rpx;
  line-height: 52rpx;
  font-weight: 900;
}

.metric-label {
  color: var(--jp-text-secondary);
  font-size: 23rpx;
  line-height: 30rpx;
  font-weight: 800;
}

.state-card {
  margin-top: 26rpx;
  padding: 34rpx;
  border-radius: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.state-title {
  color: var(--jp-text);
  font-size: 32rpx;
  line-height: 42rpx;
  font-weight: 900;
}

.state-copy,
.section-subtitle,
.action-text {
  color: var(--jp-text-secondary);
  font-size: 25rpx;
  line-height: 38rpx;
}

.state-action,
.practice-button {
  height: 76rpx;
  margin: 18rpx 0 0;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--jp-primary);
  font-size: 26rpx;
  line-height: 34rpx;
  font-weight: 900;
}

.panel-card {
  margin-top: 26rpx;
  padding: 30rpx;
  border-radius: 34rpx;
  box-sizing: border-box;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 28rpx;
}

.section-icon {
  flex-shrink: 0;
  transform-origin: center;
}

.section-icon.mint {
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.52);
}

.section-title-stack {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.section-title {
  color: var(--jp-text);
  font-size: 32rpx;
  line-height: 42rpx;
  font-weight: 900;
}

.trend-chart {
  height: 250rpx;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: end;
  gap: 12rpx;
}

.trend-item {
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
}

.trend-bar-track {
  width: 42rpx;
  height: 150rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: flex-end;
  background: var(--jp-surface-soft);
  overflow: hidden;
}

.trend-bar {
  width: 100%;
  min-height: 8rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #2f7c6e 0%, #a5ecd9 100%);
}

.trend-bar.empty {
  background: rgba(63, 73, 70, 0.16);
}

.trend-count {
  color: var(--jp-primary);
  font-size: 22rpx;
  line-height: 28rpx;
  font-weight: 900;
}

.trend-date,
.mastery-meta {
  color: var(--jp-text-muted);
  font-size: 20rpx;
  line-height: 28rpx;
  font-weight: 800;
}

.mastery-list {
  display: flex;
  flex-direction: column;
  gap: 26rpx;
}

.mastery-row {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.mastery-topline,
.action-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.mastery-name {
  color: var(--jp-text);
  font-size: 28rpx;
  line-height: 36rpx;
  font-weight: 900;
}

.mastery-value {
  color: var(--jp-primary);
  font-size: 28rpx;
  line-height: 36rpx;
  font-weight: 900;
}

.mastery-track {
  height: 18rpx;
  border-radius: 999rpx;
  background: var(--jp-surface-soft);
  overflow: hidden;
}

.mastery-bar {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, var(--jp-primary), var(--jp-primary-soft));
}

.action-card {
  margin-top: 26rpx;
  padding: 30rpx;
  border-radius: 34rpx;
  box-sizing: border-box;
}

.action-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.action-title {
  color: var(--jp-text);
  font-size: 30rpx;
  line-height: 40rpx;
  font-weight: 900;
}

.practice-button {
  width: 200rpx;
  flex-shrink: 0;
  margin: 0;
}

.state-action::after,
.practice-button::after {
  border: 0;
}
</style>
