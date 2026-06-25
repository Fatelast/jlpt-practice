<script setup lang="ts">
import Taro from '@tarojs/taro';
import { computed, onMounted, ref } from 'vue';
import type {
  PracticeCategory,
  PracticeConfig,
  PracticeMode,
} from '@jlpt-practice/shared';
import BottomTabBar from '@/components/BottomTabBar/index.vue';
import { createPracticeRecord } from '@/services/practice';
import { getPracticeQuestions } from '@/services/question';
import { usePracticeStore } from '@/stores/practice';
import { useUserStore } from '@/stores/user';
import { t } from '@/utils/i18n';
import {
  getDefaultNavigationMetrics,
  getNavigationMetrics,
} from '@/utils/navigation';

const userStore = useUserStore();
const practiceStore = usePracticeStore();

userStore.restoreSession();

const initialParams = Taro.getCurrentInstance().router?.params as
  | { mode?: string }
  | undefined;

const level = ref<PracticeConfig['level']>(
  userStore.currentLevel === 'N4' ? 'N4' : 'N5',
);
const category = ref<PracticeCategory>('mixed');
const mode = ref<PracticeMode>(
  initialParams?.mode === 'wrong' ? 'wrong' : 'sequence',
);
const count = ref<PracticeConfig['count']>(10);
const starting = ref(false);
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

const levels: Array<{ label: string; value: PracticeConfig['level'] }> = [
  { label: 'N5', value: 'N5' },
  { label: 'N4', value: 'N4' },
];

const categories: Array<{
  label: string;
  meta: string;
  icon: string;
  value: PracticeCategory;
  tone: 'mint' | 'peach' | 'sand';
}> = [
  { label: t('文字词汇'), meta: t('词汇与汉字'), icon: t('文'), value: 'moji_goi', tone: 'mint' },
  { label: t('语法'), meta: t('句型与助词'), icon: t('法'), value: 'grammar', tone: 'peach' },
  { label: t('阅读'), meta: t('短文理解'), icon: t('读'), value: 'reading', tone: 'sand' },
  { label: t('混合练习'), meta: t('全部题型'), icon: t('综'), value: 'mixed', tone: 'mint' },
];

const modes: Array<{
  label: string;
  value: PracticeMode;
  disabled?: boolean;
}> = [
  { label: t('顺序'), value: 'sequence' },
  { label: t('随机'), value: 'random' },
  { label: t('错题'), value: 'wrong' },
  { label: t('收藏'), value: 'favorite', disabled: true },
];

const counts: PracticeConfig['count'][] = [10, 20, 30, 50];
const currentCategory = computed(
  () => categories.find((item) => item.value === category.value) || categories[0],
);
const estimatedMinutes = computed(() => Math.max(1, Math.ceil(count.value / 6)));
const summaryItems = computed(() => [
  { label: t('等级'), value: level.value },
  { label: t('分类'), value: currentCategory.value.label },
  { label: t('题量'), value: `${count.value}${t('题')}` },
]);

function selectMode(nextMode: PracticeMode, disabled?: boolean) {
  if (disabled) {
    Taro.showToast({ title: t('即将开放'), icon: 'none' });
    return;
  }

  mode.value = nextMode;
}

async function goBack() {
  const pages = Taro.getCurrentPages();

  if (pages.length > 1) {
    await Taro.navigateBack();
    return;
  }

  await Taro.redirectTo({ url: '/pages/login/index' });
}

async function startPractice() {
  if (starting.value) {
    return;
  }

  if (!userStore.token) {
    await Taro.redirectTo({ url: '/pages/login/index' });
    return;
  }

  const config: PracticeConfig = {
    level: level.value,
    category: category.value,
    mode: mode.value,
    count: count.value,
  };

  starting.value = true;
  Taro.showLoading({ title: t('加载中') });

  try {
    const questionsResponse = await getPracticeQuestions(config);
    const questions = questionsResponse.data;

    if (questions.length === 0) {
      Taro.showToast({
        title: mode.value === 'wrong' ? t('暂无错题可练习') : t('暂无可练习题目'),
        icon: 'none',
      });
      return;
    }

    const recordResponse = await createPracticeRecord({
      ...config,
      questionIds: questions.map((question) => question.id),
    });

    practiceStore.startPractice(
      recordResponse.data.practiceRecordId,
      questions,
      config,
    );
    await Taro.navigateTo({ url: '/pages/question/index' });
  } catch (error) {
    Taro.showToast({ title: t('开始练习失败'), icon: 'none' });
    console.error(error);
  } finally {
    Taro.hideLoading();
    starting.value = false;
  }
}
</script>

<template>
  <view class="setup-page page" :style="pageStyle">
    <view class="setup-header" :style="headerStyle">
      <view class="header-left">
        <view class="icon-button" hover-class="tap-feedback" :aria-label="t('返回')" @tap="goBack"><text class="back-glyph">‹</text></view>
        <view class="title-stack">
          <text class="title-kicker">{{ t('今日练习') }}</text>
          <text class="setup-title">{{ t('练习配置') }}</text>
        </view>
      </view>
      <view class="avatar-dot">{{ userStore.userInfo?.nickname?.slice(0, 1) || t('练') }}</view>
    </view>

    <view class="setup-content">
      <view class="summary-card mini-card">
        <view class="summary-topline">
          <text class="summary-kicker">{{ t('本组计划') }}</text>
          <text class="summary-time">{{ estimatedMinutes }}{{ t('分钟') }}</text>
        </view>
        <text class="summary-title">{{ level }} · {{ currentCategory.label }}</text>
        <text class="summary-copy">
          {{ t('先完成一小组，再根据错题决定下一轮练习方向。') }}
        </text>
        <view class="summary-grid">
          <view v-for="item in summaryItems" :key="item.label" class="summary-item">
            <text class="summary-label">{{ item.label }}</text>
            <text class="summary-value">{{ item.value }}</text>
          </view>
        </view>
      </view>

      <view class="setup-section">
        <view class="section-heading">
          <text class="section-icon level-icon" />
          <text class="section-label">{{ t('选择等级') }}</text>
        </view>
        <view class="level-row">
          <view
            v-for="item in levels"
            :key="item.value"
            class="level-pill"
            :class="{ active: level === item.value }"
            hover-class="tap-feedback"
            @tap="level = item.value"
          >
            {{ item.label }}
          </view>
        </view>
      </view>

      <view class="setup-section">
        <view class="section-heading">
          <text class="section-icon card-icon" />
          <text class="section-label">{{ t('题目分类') }}</text>
        </view>
        <view class="category-grid">
          <view
            v-for="item in categories"
            :key="item.value"
            class="category-card"
            :class="[{ active: category === item.value }, item.tone]"
            hover-class="tap-feedback"
            @tap="category = item.value"
          >
            <view class="category-icon">{{ item.icon }}</view>
            <text class="category-title">{{ item.label }}</text>
            <text class="category-meta">{{ item.meta }}</text>
          </view>
        </view>
      </view>

      <view class="setup-section compact-section">
        <view class="section-heading">
          <text class="section-icon mode-icon" />
          <text class="section-label">{{ t('练习模式') }}</text>
        </view>
        <view class="mode-row">
          <view
            v-for="item in modes"
            :key="item.value"
            class="mode-chip"
            :class="{ active: mode === item.value, disabled: item.disabled }"
            hover-class="tap-feedback"
            @tap="selectMode(item.value, item.disabled)"
          >
            <text>{{ item.label }}</text>
            <text v-if="item.disabled" class="mode-soon">{{ t('未开放') }}</text>
          </view>
        </view>
      </view>

      <view class="setup-section compact-section">
        <view class="section-heading">
          <text class="section-icon count-icon" />
          <text class="section-label">{{ t('题目数量') }}</text>
        </view>
        <view class="count-row">
          <view
            v-for="item in counts"
            :key="item"
            class="count-toggle"
            :class="{ active: count === item }"
            hover-class="tap-feedback"
            @tap="count = item"
          >
            {{ item }}
          </view>
        </view>
      </view>
    </view>

    <view class="start-shell">
      <button class="start-button" :disabled="starting" :loading="starting" hover-class="tap-feedback" @tap="startPractice">
        {{ t('开始练习') }}
      </button>
    </view>

    <BottomTabBar active="study" />
  </view>
</template>

<style lang="scss">
.setup-page {
  min-height: 100vh;
  padding: 128rpx 32rpx calc(330rpx + env(safe-area-inset-bottom));
  background: var(--jp-bg);
  box-sizing: border-box;
}

.setup-header {
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

.header-left,
.summary-topline,
.section-heading {
  display: flex;
  align-items: center;
}

.header-left {
  gap: 22rpx;
  min-width: 0;
}

.title-stack {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.title-kicker {
  color: var(--jp-text-muted);
  font-size: 20rpx;
  line-height: 26rpx;
  font-weight: 700;
}

.setup-title {
  color: var(--jp-primary);
  font-size: 40rpx;
  line-height: 50rpx;
  font-weight: 800;
}

.icon-button,
.avatar-dot {
  width: 88rpx;
  height: 88rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 244, 242, 0.92);
  color: var(--jp-primary);
  font-size: 34rpx;
  font-weight: 800;
  flex-shrink: 0;
  transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease;
}

.icon-button {
  box-shadow: 0 8rpx 22rpx rgba(40, 105, 92, 0.06);
}

.back-glyph {
  display: block;
  color: currentColor;
  font-size: 34rpx;
  line-height: 34rpx;
  transform: translateY(-1rpx);
}

.setup-content {
  display: flex;
  flex-direction: column;
  gap: 42rpx;
}

.summary-card {
  padding: 34rpx;
  border-radius: 36rpx;
}

.summary-topline {
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.summary-kicker,
.summary-time,
.section-label {
  color: var(--jp-text-secondary);
  font-size: 24rpx;
  line-height: 32rpx;
  font-weight: 800;
}

.summary-time {
  color: var(--jp-primary);
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(175, 239, 223, 0.62);
}

.summary-title {
  display: block;
  color: var(--jp-text);
  font-size: 42rpx;
  line-height: 54rpx;
  font-weight: 800;
}

.summary-copy {
  display: block;
  color: var(--jp-text-secondary);
  font-size: 26rpx;
  line-height: 40rpx;
  margin-top: 14rpx;
}

.summary-grid {
  display: flex;
  gap: 14rpx;
  margin-top: 28rpx;
}

.summary-item {
  flex: 1;
  min-width: 0;
  padding: 18rpx 12rpx;
  border-radius: 22rpx;
  background: var(--jp-surface-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.summary-label {
  color: var(--jp-text-muted);
  font-size: 20rpx;
  line-height: 26rpx;
  font-weight: 700;
}

.summary-value {
  color: var(--jp-primary);
  font-size: 28rpx;
  line-height: 34rpx;
  font-weight: 800;
}

.setup-section {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.compact-section {
  gap: 18rpx;
}

.section-heading {
  gap: 12rpx;
}

.section-icon {
  width: 20rpx;
  height: 20rpx;
  border-radius: 6rpx;
  background: var(--jp-primary);
  flex-shrink: 0;
}

.card-icon {
  background: transparent;
  border: 3rpx solid var(--jp-primary);
}

.mode-icon {
  width: 18rpx;
  height: 18rpx;
  border: 5rpx solid var(--jp-primary-soft);
  background: var(--jp-primary);
}

.count-icon {
  width: 22rpx;
  height: 22rpx;
  border-radius: 999rpx;
}

.level-row,
.mode-row,
.count-row,
.category-grid {
  display: flex;
}

.level-row,
.mode-row {
  gap: 16rpx;
  flex-wrap: wrap;
}

.level-pill,
.mode-chip,
.count-toggle,
.category-card,
.start-button {
  transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

.level-pill,
.mode-chip {
  height: 88rpx;
  border-radius: 999rpx;
  background: #eceeec;
  color: var(--jp-text-secondary);
  font-size: 28rpx;
  font-weight: 800;
  line-height: 88rpx;
  text-align: center;
}

.level-pill {
  flex: 1;
}

.mode-chip {
  min-width: 132rpx;
  padding: 0 22rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rpx;
  line-height: 1;
}

.level-pill.active,
.mode-chip.active {
  background: var(--jp-primary);
  color: #ffffff;
  box-shadow: var(--jp-shadow-primary);
}

.mode-chip.disabled {
  color: #7d8783;
  background: var(--jp-surface-soft);
  border: 2rpx dashed var(--jp-border);
  opacity: 1;
}

.mode-soon {
  color: #8f9894;
  font-size: 18rpx;
  line-height: 24rpx;
  font-weight: 700;
}

.category-grid {
  flex-wrap: wrap;
  gap: 20rpx;
}

.category-card {
  width: calc((100% - 20rpx) / 2);
  min-height: 214rpx;
  padding: 28rpx;
  border-radius: 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: var(--jp-surface);
  border: 1rpx solid var(--jp-border);
}

.category-card.active {
  background: var(--jp-primary-soft);
  border: 2rpx solid var(--jp-primary);
  box-shadow: var(--jp-shadow-soft);
}

.category-icon {
  width: 70rpx;
  height: 70rpx;
  border-radius: 999rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.52);
  font-size: 30rpx;
  font-weight: 800;
}

.category-card.peach .category-icon {
  color: #795745;
  background: var(--jp-peach);
}

.category-card.sand .category-icon {
  color: #665f34;
  background: var(--jp-sand);
}

.category-card.active .category-icon {
  background: rgba(255, 255, 255, 0.64);
}

.category-title {
  color: var(--jp-text);
  font-size: 34rpx;
  line-height: 44rpx;
  font-weight: 800;
}

.category-meta {
  color: var(--jp-text-muted);
  font-size: 24rpx;
  line-height: 34rpx;
  margin-top: 4rpx;
}

.count-row {
  justify-content: space-between;
  gap: 16rpx;
}

.count-toggle {
  flex: 1;
  height: 104rpx;
  border-radius: 28rpx;
  background: var(--jp-surface-soft);
  color: var(--jp-text-secondary);
  border: 1rpx solid var(--jp-border);
  font-size: 34rpx;
  font-weight: 800;
  line-height: 104rpx;
  text-align: center;
}

.count-toggle.active {
  background: var(--jp-primary);
  color: #ffffff;
  border-color: var(--jp-primary);
  box-shadow: var(--jp-shadow-primary);
}

.start-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(128rpx + env(safe-area-inset-bottom));
  z-index: 20;
  padding: 22rpx 32rpx 28rpx;
  background: rgba(248, 250, 248, 0.94);
  backdrop-filter: blur(12px);
}

.start-button {
  width: 100%;
  height: 104rpx;
  border-radius: 999rpx;
  color: #ffffff;
  background: var(--jp-primary);
  font-size: 34rpx;
  font-weight: 800;
  line-height: 104rpx;
  box-shadow: var(--jp-shadow-primary);
}

.start-button[disabled] {
  opacity: 0.68;
}
</style>
