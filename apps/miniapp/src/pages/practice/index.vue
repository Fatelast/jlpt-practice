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

const levels: Array<{ label: string; value: PracticeConfig['level'] }> = [
  { label: 'N5', value: 'N5' },
  { label: 'N4', value: 'N4' },
];

const categories: Array<{
  label: string;
  meta: string;
  value: PracticeCategory;
  tone: string;
}> = [
  { label: 'Vocab', meta: 'Words', value: 'moji_goi', tone: 'mint' },
  { label: 'Grammar', meta: 'Patterns', value: 'grammar', tone: 'peach' },
  { label: 'Reading', meta: 'Texts', value: 'reading', tone: 'sand' },
  { label: 'Mixed', meta: 'All Content', value: 'mixed', tone: 'mint' },
];

const modes: Array<{
  label: string;
  value: PracticeMode;
  disabled?: boolean;
}> = [
  { label: 'Sequential', value: 'sequence' },
  { label: 'Random', value: 'random' },
  { label: 'Mistakes', value: 'wrong', disabled: true },
  { label: 'Favorites', value: 'favorite', disabled: true },
];

const counts: PracticeConfig['count'][] = [10, 20, 30, 50];

function selectMode(nextMode: PracticeMode, disabled?: boolean) {
  if (disabled) {
    Taro.showToast({ title: 'Coming soon', icon: 'none' });
    return;
  }

  mode.value = nextMode;
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
  Taro.showLoading({ title: 'Loading' });

  try {
    const questionsResponse = await getPracticeQuestions(config);
    const questions = questionsResponse.data;

    if (questions.length === 0) {
      Taro.showToast({ title: 'No questions yet', icon: 'none' });
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
    Taro.showToast({ title: 'Start failed', icon: 'none' });
    console.error(error);
  } finally {
    Taro.hideLoading();
    starting.value = false;
  }
}
</script>

<template>
  <view class="setup-page page">
    <view class="setup-header">
      <button class="icon-button" @tap="Taro.navigateBack()">‹</button>
      <text class="setup-title">Practice Setup</text>
      <view class="avatar-dot">{{ userStore.userInfo?.nickname?.slice(0, 1) ?? 'J' }}</view>
    </view>

    <view class="setup-content">
      <section class="setup-section">
        <view class="section-label">Select Level</view>
        <view class="pill-row">
          <button
            v-for="item in levels"
            :key="item.value"
            class="level-pill"
            :class="{ active: level === item.value }"
            @tap="level = item.value"
          >
            {{ item.label }}
          </button>
        </view>
      </section>

      <section class="setup-section">
        <view class="section-label">Category</view>
        <view class="category-grid">
          <button
            v-for="item in categories"
            :key="item.value"
            class="category-card"
            :class="[{ active: category === item.value }, item.tone]"
            @tap="category = item.value"
          >
            <view class="category-icon">{{ item.label.slice(0, 1) }}</view>
            <text class="category-title">{{ item.label }}</text>
            <text class="category-meta">{{ item.meta }}</text>
          </button>
        </view>
      </section>

      <section class="setup-section">
        <view class="section-label">Mode Selection</view>
        <view class="chip-row">
          <button
            v-for="item in modes"
            :key="item.value"
            class="mode-chip"
            :class="{ active: mode === item.value, disabled: item.disabled }"
            @tap="selectMode(item.value, item.disabled)"
          >
            {{ item.label }}
          </button>
        </view>
      </section>

      <section class="setup-section">
        <view class="section-label">Question Count</view>
        <view class="count-row">
          <button
            v-for="item in counts"
            :key="item"
            class="count-toggle"
            :class="{ active: count === item }"
            @tap="count = item"
          >
            {{ item }}
          </button>
        </view>
      </section>

      <view class="reflection-card">
        <view class="reflection-icon">i</view>
        <text class="reflection-text">
          Consistency is the secret to mastery. Even one short session counts.
        </text>
      </view>
    </view>

    <view class="start-shell">
      <button class="start-button" :loading="starting" @tap="startPractice">
        Start Practice
      </button>
    </view>
  </view>
</template>

<style lang="scss">
.setup-page {
  min-height: 100vh;
  padding: 112px 32px 160px;
  background: #f8faf8;
  box-sizing: border-box;
}

.setup-header {
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
  font-size: 36px;
  font-weight: 700;
}

.setup-title {
  color: #28695c;
  font-size: 36px;
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

.section-label {
  color: #3f4946;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.pill-row,
.chip-row,
.count-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.level-pill,
.mode-chip {
  min-width: 144px;
  height: 72px;
  border-radius: 999px;
  background: #eceeec;
  color: #3f4946;
  font-size: 28px;
  font-weight: 700;
}

.level-pill.active,
.mode-chip.active {
  background: #28695c;
  color: #ffffff;
  box-shadow: 0 10px 30px rgba(152, 216, 200, 0.3);
}

.mode-chip.disabled {
  opacity: 0.45;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.category-card {
  min-height: 220px;
  padding: 32px;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  background: #ffffff;
  border: 2px solid #bfc9c5;
}

.category-card.active {
  background: #98d8c8;
  border-color: #28695c;
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
  background: rgba(255, 255, 255, 0.55);
  font-size: 32px;
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

.category-title {
  color: #191c1b;
  font-size: 36px;
  line-height: 48px;
  font-weight: 700;
}

.category-meta {
  color: #6f7976;
  font-size: 24px;
  line-height: 36px;
}

.count-row {
  justify-content: space-between;
}

.count-toggle {
  width: 120px;
  height: 120px;
  border-radius: 32px;
  background: #f2f4f2;
  color: #3f4946;
  border: 2px solid #bfc9c5;
  font-size: 36px;
  font-weight: 700;
}

.count-toggle.active {
  background: #28695c;
  color: #ffffff;
  border-color: #28695c;
}

.reflection-card {
  padding: 32px;
  border-radius: 32px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
  background: rgba(254, 208, 185, 0.35);
  border: 2px solid rgba(121, 87, 69, 0.12);
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
  font-style: italic;
}

.start-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
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
  box-shadow: 0 10px 30px rgba(40, 105, 92, 0.2);
}
</style>
