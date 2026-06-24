<script setup lang="ts">
import Taro from '@tarojs/taro';
import { computed, onMounted, ref } from 'vue';
import type { OptionKey } from '@jlpt-practice/shared';
import { finishPracticeRecord, submitAnswer } from '@/services/practice';
import { usePracticeStore } from '@/stores/practice';
import type { SubmitAnswerResult } from '@/types/practice';

const practiceStore = usePracticeStore();
const selectedAnswer = ref<OptionKey | ''>('');
const answerResult = ref<SubmitAnswerResult | null>(null);
const submitting = ref(false);
const questionStartedAt = ref(Date.now());

const currentQuestion = computed(
  () => practiceStore.questions[practiceStore.currentIndex] ?? null,
);
const progressText = computed(
  () => `${practiceStore.currentIndex + 1}/${practiceStore.questions.length}`,
);
const progressPercent = computed(() => {
  if (practiceStore.questions.length === 0) {
    return 0;
  }

  return ((practiceStore.currentIndex + 1) / practiceStore.questions.length) * 100;
});
const isLastQuestion = computed(
  () => practiceStore.currentIndex >= practiceStore.questions.length - 1,
);

onMounted(() => {
  if (!practiceStore.practiceRecordId || practiceStore.questions.length === 0) {
    Taro.redirectTo({ url: '/pages/practice/index' });
  }
});

function resetQuestionState() {
  selectedAnswer.value = '';
  answerResult.value = null;
  submitting.value = false;
  questionStartedAt.value = Date.now();
}

function getDurationSeconds() {
  return Math.max(1, Math.round((Date.now() - questionStartedAt.value) / 1000));
}

function getOptionClass(optionKey: OptionKey) {
  if (!answerResult.value) {
    return selectedAnswer.value === optionKey ? 'selected' : '';
  }

  if (optionKey === answerResult.value.correctAnswer) {
    return 'correct';
  }

  if (optionKey === answerResult.value.selectedAnswer) {
    return 'wrong';
  }

  return 'muted';
}

function getOptionBadge(optionKey: OptionKey) {
  if (!answerResult.value) {
    return optionKey;
  }

  if (optionKey === answerResult.value.correctAnswer) {
    return '✓';
  }

  if (optionKey === answerResult.value.selectedAnswer) {
    return '×';
  }

  return optionKey;
}

async function handleSelect(optionKey: OptionKey) {
  if (!currentQuestion.value || submitting.value || answerResult.value) {
    return;
  }

  selectedAnswer.value = optionKey;
  submitting.value = true;

  try {
    const response = await submitAnswer(practiceStore.practiceRecordId, {
      questionId: currentQuestion.value.id,
      selectedAnswer: optionKey,
      durationSeconds: getDurationSeconds(),
    });
    answerResult.value = response.data;
    practiceStore.addAnswer(response.data);
  } catch (error) {
    selectedAnswer.value = '';
    Taro.showToast({ title: 'Submit failed', icon: 'none' });
    console.error(error);
  } finally {
    submitting.value = false;
  }
}

async function handleNext() {
  if (!answerResult.value || submitting.value) {
    return;
  }

  if (!isLastQuestion.value) {
    practiceStore.nextQuestion();
    resetQuestionState();
    return;
  }

  submitting.value = true;
  Taro.showLoading({ title: 'Saving' });

  try {
    const response = await finishPracticeRecord(practiceStore.practiceRecordId);
    practiceStore.finish(response.data);
    await Taro.redirectTo({ url: '/pages/result/index' });
  } catch (error) {
    Taro.showToast({ title: 'Finish failed', icon: 'none' });
    console.error(error);
  } finally {
    Taro.hideLoading();
    submitting.value = false;
  }
}

async function closeSession() {
  practiceStore.reset();
  await Taro.redirectTo({ url: '/pages/practice/index' });
}
</script>

<template>
  <view class="question-page page" v-if="currentQuestion">
    <view class="question-header">
      <view class="header-left">
        <button class="close-button" @tap="closeSession">×</button>
        <text class="brand-word">ZenJLPT</text>
      </view>
      <view class="progress-block">
        <view class="progress-copy">
          <text>Lesson Progress</text>
          <text>{{ progressText }}</text>
        </view>
        <view class="progress-track">
          <view class="progress-value" :style="{ width: `${progressPercent}%` }" />
        </view>
      </view>
    </view>

    <view class="question-main">
      <view class="question-card">
        <view class="question-badge">
          {{ currentQuestion.category }} · {{ currentQuestion.level }}
        </view>
        <text v-if="currentQuestion.passage" class="passage-text">
          {{ currentQuestion.passage }}
        </text>
        <text class="stem-text">{{ currentQuestion.stem }}</text>
        <text v-if="currentQuestion.translation" class="translation-text">
          {{ currentQuestion.translation }}
        </text>
      </view>

      <view class="option-grid">
        <button
          v-for="option in currentQuestion.options"
          :key="option.key"
          class="option-card"
          :class="getOptionClass(option.key)"
          :disabled="Boolean(answerResult) || submitting"
          @tap="handleSelect(option.key)"
        >
          <view class="option-badge">{{ getOptionBadge(option.key) }}</view>
          <text class="option-text">{{ option.text }}</text>
        </button>
      </view>

      <view v-if="answerResult" class="analysis-card">
        <view class="analysis-title">
          {{ answerResult.isCorrect ? 'Correct' : 'Review' }}
        </view>
        <text class="analysis-text">{{ answerResult.explanation }}</text>
      </view>
    </view>

    <view class="question-footer">
      <button class="ghost-action" @tap="Taro.showToast({ title: 'Coming soon', icon: 'none' })">
        Bookmark
      </button>
      <button
        class="next-button"
        :class="{ disabled: !answerResult }"
        :disabled="!answerResult || submitting"
        @tap="handleNext"
      >
        {{ isLastQuestion ? 'Finish' : 'Next Question' }}
      </button>
    </view>
  </view>
</template>

<style lang="scss">
.question-page {
  min-height: 100vh;
  padding: 120px 32px 160px;
  background: #f8faf8;
  box-sizing: border-box;
}

.question-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  min-height: 104px;
  padding: 18px 32px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 24px;
  background: rgba(248, 250, 248, 0.92);
  backdrop-filter: blur(12px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.close-button {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  color: #3f4946;
  background: #f2f4f2;
  font-size: 44px;
  line-height: 60px;
}

.brand-word {
  color: #28695c;
  font-size: 32px;
  font-weight: 700;
}

.progress-block {
  flex: 1;
}

.progress-copy {
  display: flex;
  justify-content: space-between;
  color: #6f7976;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.progress-track {
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: #afefdf;
}

.progress-value {
  height: 100%;
  border-radius: 999px;
  background: #28695c;
  transition: width 0.3s ease;
}

.question-main {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.question-card,
.analysis-card {
  padding: 40px;
  border-radius: 32px;
  background: #ffffff;
  border: 2px solid #bfc9c5;
  box-shadow: 0 10px 30px rgba(152, 216, 200, 0.15);
}

.question-badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 8px 20px;
  border-radius: 999px;
  margin-bottom: 32px;
  color: #7a5745;
  background: #fed0b9;
  font-size: 22px;
  font-weight: 700;
  text-transform: uppercase;
}

.passage-text {
  display: block;
  color: #3f4946;
  font-size: 30px;
  line-height: 48px;
  margin-bottom: 32px;
}

.stem-text {
  display: block;
  color: #191c1b;
  font-size: 40px;
  line-height: 60px;
  font-weight: 700;
}

.translation-text {
  display: block;
  color: #3f4946;
  font-size: 28px;
  line-height: 44px;
  margin-top: 24px;
  font-style: italic;
}

.option-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-card {
  min-height: 104px;
  padding: 24px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  gap: 24px;
  text-align: left;
  background: #f2f4f2;
  border: 2px solid #bfc9c5;
}

.option-card.selected {
  background: #afefdf;
  border-color: #28695c;
}

.option-card.correct {
  background: #98d8c8;
  border-color: #28695c;
}

.option-card.wrong {
  background: #ffdad6;
  border-color: #ba1a1a;
}

.option-card.muted {
  opacity: 0.55;
}

.option-badge {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #3f4946;
  background: #e1e3e1;
  font-size: 28px;
  font-weight: 700;
}

.option-card.correct .option-badge {
  color: #ffffff;
  background: #28695c;
}

.option-card.wrong .option-badge {
  color: #ffffff;
  background: #ba1a1a;
}

.option-text {
  color: #191c1b;
  font-size: 32px;
  line-height: 46px;
}

.analysis-card {
  background: rgba(214, 204, 152, 0.3);
  border-color: #d6cc98;
  box-shadow: none;
}

.analysis-title {
  color: #5d562c;
  font-size: 36px;
  line-height: 48px;
  font-weight: 700;
  margin-bottom: 16px;
}

.analysis-text {
  color: #5d562c;
  font-size: 30px;
  line-height: 48px;
}

.question-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  padding: 24px 32px 32px;
  box-sizing: border-box;
  display: flex;
  gap: 20px;
  background: rgba(248, 250, 248, 0.94);
  backdrop-filter: blur(12px);
}

.ghost-action {
  width: 180px;
  height: 88px;
  border-radius: 999px;
  color: #28695c;
  background: transparent;
  border: 2px solid #bfc9c5;
  font-size: 26px;
  font-weight: 700;
}

.next-button {
  flex: 1;
  height: 88px;
  border-radius: 999px;
  color: #ffffff;
  background: #28695c;
  font-size: 32px;
  font-weight: 700;
  box-shadow: 0 10px 30px rgba(40, 105, 92, 0.2);
}

.next-button.disabled {
  opacity: 0.45;
}
</style>
