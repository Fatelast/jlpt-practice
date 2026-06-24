<script setup lang="ts">
import Taro from '@tarojs/taro';
import { ref } from 'vue';
import type {
  PracticeCategory,
  PracticeConfig,
  PracticeMode,
} from '@jlpt-practice/shared';
import { createPracticeRecord } from '@/services/practice';
import { getPracticeQuestions } from '@/services/question';
import { usePracticeStore } from '@/stores/practice';
import { useUserStore } from '@/stores/user';
import { t } from '@/utils/i18n';
import { getNavigationMetrics } from '@/utils/navigation';

const userStore = useUserStore();
const practiceStore = usePracticeStore();

userStore.restoreSession();

const level = ref<PracticeConfig['level']>(
  userStore.currentLevel === 'N4' ? 'N4' : 'N5',
);
const category = ref<PracticeCategory>('mixed');
const mode = ref<PracticeMode>('sequence');
const count = ref<PracticeConfig['count']>(10);
const starting = ref(false);
const navigationMetrics = getNavigationMetrics();
const pageStyle = { paddingTop: `${navigationMetrics.contentTop}px` };
const headerStyle = {
  height: `${navigationMetrics.headerHeight}px`,
  paddingTop: `${navigationMetrics.statusBarHeight}px`,
  paddingRight: `${navigationMetrics.rightReserved}px`,
};

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
  { label: t('文字词汇'), meta: t('词汇与汉字'), icon: '文', value: 'moji_goi', tone: 'mint' },
  { label: t('语法'), meta: t('句型与助词'), icon: '法', value: 'grammar', tone: 'peach' },
  { label: t('阅读'), meta: t('短文理解'), icon: '读', value: 'reading', tone: 'sand' },
  { label: t('混合练习'), meta: t('全部题型'), icon: '综', value: 'mixed', tone: 'mint' },
];

const modes: Array<{
  label: string;
  value: PracticeMode;
  disabled?: boolean;
}> = [
  { label: t('顺序'), value: 'sequence' },
  { label: t('随机'), value: 'random' },
  { label: t('错题'), value: 'wrong', disabled: true },
  { label: t('收藏'), value: 'favorite', disabled: true },
];

const counts: PracticeConfig['count'][] = [10, 20, 30, 50];

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
      Taro.showToast({ title: t('暂无可练习题目'), icon: 'none' });
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
        <button
          class="icon-button"
          hover-class="tap-feedback"
          :aria-label="t('返回')"
          @tap="goBack"
        >
          ‹
        </button>
        <text class="setup-title">{{ t('练习配置') }}</text>
      </view>
      <view class="avatar-dot">{{ userStore.userInfo?.nickname?.slice(0, 1) ?? t('练') }}</view>
    </view>

    <view class="setup-content">
      <view class="setup-section">
        <view class="section-heading">
          <text class="section-icon level-icon" />
          <text class="section-label">{{ t('选择等级') }}</text>
        </view>
        <view class="level-row">
          <button
            v-for="item in levels"
            :key="item.value"
            class="level-pill"
            :class="{ active: level === item.value }"
            hover-class="tap-feedback"
            @tap="level = item.value"
          >
            {{ item.label }}
          </button>
        </view>
      </view>

      <view class="setup-section">
        <view class="section-heading">
          <text class="section-icon card-icon" />
          <text class="section-label">{{ t('题目分类') }}</text>
        </view>
        <view class="category-grid">
          <button
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
          </button>
        </view>
      </view>

      <view class="setup-section">
        <view class="section-heading">
          <text class="section-icon mode-icon" />
          <text class="section-label">{{ t('练习模式') }}</text>
        </view>
        <view class="mode-row">
          <button
            v-for="item in modes"
            :key="item.value"
            class="mode-chip"
            :class="{ active: mode === item.value, disabled: item.disabled }"
            :disabled="Boolean(item.disabled)"
            hover-class="tap-feedback"
            @tap="selectMode(item.value, item.disabled)"
          >
            <text>{{ item.label }}</text>
            <text v-if="item.disabled" class="mode-soon">{{ t('未开放') }}</text>
          </button>
        </view>
      </view>

      <view class="setup-section">
        <view class="section-heading">
          <text class="section-icon count-icon" />
          <text class="section-label">{{ t('题目数量') }}</text>
        </view>
        <view class="count-row">
          <button
            v-for="item in counts"
            :key="item"
            class="count-toggle"
            :class="{ active: count === item }"
            hover-class="tap-feedback"
            @tap="count = item"
          >
            {{ item }}
          </button>
        </view>
      </view>

      <view class="reflection-card">
        <view class="reflection-icon">i</view>
        <text class="reflection-text">
          {{ t('稳定练习是掌握日语的关键。每天完成一小组，也是在向目标靠近。') }}
        </text>
      </view>
    </view>

    <view class="start-shell safe-bottom-spacer">
      <button
        class="start-button"
        :disabled="starting"
        :loading="starting"
        hover-class="tap-feedback"
        @tap="startPractice"
      >
        {{ t('开始练习') }}
      </button>
    </view>
  </view>
</template>

<style lang="scss">
.setup-page {
  min-height: 100vh;
  padding: 128px 32px 176px;
  background: #f8faf8;
  box-sizing: border-box;
}

.setup-header {
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

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  min-width: 0;
}

.icon-button,
.avatar-dot {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f4f2;
  color: #28695c;
  font-size: 34px;
  font-weight: 700;
  box-shadow: 0 10px 30px rgba(152, 216, 200, 0.12);
  flex-shrink: 0;
  transition: opacity 180ms ease, transform 180ms ease;
}

.icon-button {
  line-height: 64px;
}

.setup-title {
  color: #28695c;
  font-size: 38px;
  line-height: 48px;
  font-weight: 700;
}

.setup-content {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.setup-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #3f4946;
}

.section-icon {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: #28695c;
  flex-shrink: 0;
}

.level-icon {
  transform: rotate(8deg);
}

.card-icon {
  background: transparent;
  border: 3px solid #28695c;
}

.mode-icon {
  width: 18px;
  height: 18px;
  border: 5px solid #98d8c8;
  background: #28695c;
}

.count-icon {
  width: 22px;
  height: 22px;
  border-radius: 999px;
}

.section-label {
  color: #3f4946;
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
  letter-spacing: 0;
}

.level-row,
.mode-row,
.count-row,
.category-grid {
  display: flex;
}

.level-row,
.mode-row {
  gap: 16px;
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
  height: 80px;
  border-radius: 999px;
  background: #eceeec;
  color: #3f4946;
  font-size: 28px;
  font-weight: 700;
  line-height: 80px;
}

.level-pill {
  flex: 1;
  min-width: 0;
}

.mode-chip {
  min-width: 144px;
  padding: 0 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  line-height: 1;
}

.level-pill.active,
.mode-chip.active {
  background: #28695c;
  color: #ffffff;
  box-shadow: 0 10px 30px rgba(152, 216, 200, 0.3);
}

.mode-chip.disabled {
  color: #7d8783;
  background: #f2f4f2;
  border: 2px dashed #d7dfdb;
  opacity: 1;
}

.mode-soon {
  color: #8f9894;
  font-size: 18px;
  line-height: 24px;
  font-weight: 600;
}

.category-grid {
  flex-wrap: wrap;
  gap: 20px;
}

.category-card {
  width: calc((100% - 20px) / 2);
  min-height: 220px;
  padding: 28px;
  border-radius: 32px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  background: #ffffff;
  border: 1px solid #d7dfdb;
}

.category-card.active {
  background: #98d8c8;
  border: 2px solid #28695c;
  box-shadow: 0 10px 30px rgba(152, 216, 200, 0.18);
}

.category-icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #28695c;
  background: rgba(175, 239, 223, 0.45);
  font-size: 30px;
  font-weight: 700;
}

.category-card.peach .category-icon {
  color: #795745;
  background: #fed0b9;
}

.category-card.sand .category-icon {
  color: #665f34;
  background: #d6cc98;
}

.category-card.active .category-icon {
  background: rgba(255, 255, 255, 0.58);
}

.category-title {
  color: #191c1b;
  font-size: 34px;
  line-height: 44px;
  font-weight: 700;
}

.category-meta {
  color: #6f7976;
  font-size: 24px;
  line-height: 36px;
  margin-top: 4px;
}

.count-row {
  justify-content: space-between;
  gap: 16px;
}

.count-toggle {
  width: 120px;
  height: 120px;
  border-radius: 32px;
  background: #f2f4f2;
  color: #3f4946;
  border: 1px solid #d7dfdb;
  font-size: 36px;
  font-weight: 700;
  line-height: 120px;
}

.count-toggle.active {
  background: #28695c;
  color: #ffffff;
  border-color: #28695c;
  box-shadow: 0 10px 30px rgba(40, 105, 92, 0.2);
}

.reflection-card {
  padding: 32px;
  border-radius: 32px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
  background: rgba(254, 208, 185, 0.35);
  border: 1px solid rgba(121, 87, 69, 0.12);
}

.reflection-icon {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  color: #ffffff;
  background: #795745;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  flex-shrink: 0;
}

.reflection-text {
  color: #5f402f;
  font-size: 28px;
  line-height: 42px;
}

.start-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  padding: 24px 32px 32px;
  background: rgba(248, 250, 248, 0.94);
  backdrop-filter: blur(12px);
}

.start-button {
  width: 100%;
  height: 104px;
  border-radius: 32px;
  color: #ffffff;
  background: #28695c;
  font-size: 36px;
  font-weight: 700;
  line-height: 104px;
  box-shadow: 0 10px 30px rgba(40, 105, 92, 0.2);
}

.start-button[disabled] {
  opacity: 0.68;
}
</style>
