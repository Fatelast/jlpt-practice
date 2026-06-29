<script setup lang="ts">
import Taro from '@tarojs/taro';
import { computed, onMounted, ref } from 'vue';
import type { FeedbackType, OptionKey, QuestionCategory } from '@jlpt-practice/shared';
import { favoriteQuestion, unfavoriteQuestion } from '@/services/favorite';
import { createFeedback } from '@/services/feedback';
import { finishPracticeRecord, submitAnswer } from '@/services/practice';
import { usePracticeStore } from '@/stores/practice';
import type { SubmitAnswerResult } from '@/types/practice';
import { getQuestionCategoryText } from '@/utils/enumText';
import { t } from '@/utils/i18n';
import {
  getDefaultNavigationMetrics,
  getNavigationMetrics,
} from '@/utils/navigation';

const practiceStore = usePracticeStore();
const selectedAnswer = ref<OptionKey | ''>('');
const answerResult = ref<SubmitAnswerResult | null>(null);
const submitting = ref(false);
const favoriteUpdating = ref(false);
const feedbackVisible = ref(false);
const feedbackSubmitting = ref(false);
const feedbackType = ref<FeedbackType>('answer_error');
const feedbackContent = ref('');
const questionStartedAt = ref(Date.now());
const navigationMetrics = ref(getDefaultNavigationMetrics());
const pageStyle = computed(() => ({
  paddingTop: `${navigationMetrics.value.contentTop}px`,
}));
const headerStyle = computed(() => ({
  height: `${navigationMetrics.value.headerHeight}px`,
  paddingTop: `${navigationMetrics.value.statusBarHeight}px`,
  paddingRight: `${navigationMetrics.value.rightReserved}px`,
}));

const feedbackOptions = computed<Array<{ value: FeedbackType; label: string }>>(() => [
  { value: 'stem_error', label: t('题干错误') },
  { value: 'option_error', label: t('选项错误') },
  { value: 'answer_error', label: t('答案错误') },
  { value: 'explanation_error', label: t('解析错误') },
  { value: 'translation_error', label: t('翻译错误') },
  { value: 'other', label: t('其他问题') },
]);

onMounted(() => {
  navigationMetrics.value = getNavigationMetrics();
});

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

function getCategoryText(category: QuestionCategory) {
  return getQuestionCategoryText(category);
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

function getOptionStateText(optionKey: OptionKey) {
  if (!answerResult.value) {
    return '';
  }

  if (optionKey === answerResult.value.correctAnswer) {
    return t('正确答案');
  }

  if (optionKey === answerResult.value.selectedAnswer) {
    return t('你的选择');
  }

  return '';
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
    Taro.showToast({ title: t('提交失败'), icon: 'none' });
    console.error(error);
  } finally {
    submitting.value = false;
  }
}

async function toggleFavorite() {
  if (!currentQuestion.value || favoriteUpdating.value) {
    return;
  }

  favoriteUpdating.value = true;
  const question = currentQuestion.value;
  const nextFavorite = !question.isFavorite;

  try {
    const response = nextFavorite
      ? await favoriteQuestion(question.id)
      : await unfavoriteQuestion(question.id);
    practiceStore.setQuestionFavorite(question.id, response.data.isFavorite);
    Taro.showToast({
      title: response.data.isFavorite ? t('已收藏') : t('已取消收藏'),
      icon: 'none',
    });
  } catch (error) {
    Taro.showToast({ title: t('操作失败'), icon: 'none' });
    console.error(error);
  } finally {
    favoriteUpdating.value = false;
  }
}
function openFeedback() {
  if (!currentQuestion.value || feedbackSubmitting.value) {
    return;
  }

  feedbackVisible.value = true;
}

function closeFeedback() {
  if (feedbackSubmitting.value) {
    return;
  }

  feedbackVisible.value = false;
  feedbackType.value = 'answer_error';
  feedbackContent.value = '';
}

async function submitFeedback() {
  if (!currentQuestion.value || feedbackSubmitting.value) {
    return;
  }

  const content = feedbackContent.value.trim();

  if (!content) {
    Taro.showToast({ title: t('请填写反馈内容'), icon: 'none' });
    return;
  }

  feedbackSubmitting.value = true;

  try {
    await createFeedback({
      questionId: currentQuestion.value.id,
      type: feedbackType.value,
      content,
    });
    Taro.showToast({ title: t('已提交反馈'), icon: 'none' });
    feedbackVisible.value = false;
    feedbackType.value = 'answer_error';
    feedbackContent.value = '';
  } catch (error) {
    Taro.showToast({ title: t('提交反馈失败'), icon: 'none' });
    console.error(error);
  } finally {
    feedbackSubmitting.value = false;
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
  Taro.showLoading({ title: t('保存中') });

  try {
    const response = await finishPracticeRecord(practiceStore.practiceRecordId);
    practiceStore.finish(response.data);
    await Taro.redirectTo({ url: '/pages/result/index' });
  } catch (error) {
    Taro.showToast({ title: t('完成练习失败'), icon: 'none' });
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
  <view class="question-page page" v-if="currentQuestion" :style="pageStyle">
    <view class="question-header" :style="headerStyle">
      <view class="header-left">
        <view class="close-button" hover-class="tap-feedback" :aria-label="t('结束练习')" @tap="closeSession"><text class="close-glyph">×</text></view>
        <text class="brand-word">{{ t('JLPT 刷题') }}</text>
      </view>
      <view class="progress-block">
        <view class="progress-copy">
          <text>{{ t('练习进度') }}</text>
          <text class="progress-number">{{ progressText }}</text>
        </view>
        <view class="progress-track">
          <view class="progress-value" :style="{ width: `${progressPercent}%` }" />
        </view>
      </view>
    </view>

    <view class="question-main">
      <view class="question-card">
        <view class="question-badge">
          {{ getCategoryText(currentQuestion.category) }} · {{ currentQuestion.level }}
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
          hover-class="tap-feedback"
          @tap="handleSelect(option.key)"
        >
          <view class="option-badge">{{ getOptionBadge(option.key) }}</view>
          <view class="option-copy">
            <text class="option-text">{{ option.text }}</text>
            <text v-if="getOptionStateText(option.key)" class="option-state">
              {{ getOptionStateText(option.key) }}
            </text>
          </view>
        </button>
      </view>

      <view v-if="answerResult" class="analysis-card">
        <view class="analysis-title">
          <text class="analysis-icon">i</text>
          <text>{{ answerResult.isCorrect ? t('回答正确') : t('查看解析') }}</text>
        </view>
        <text class="analysis-text">{{ answerResult.explanation }}</text>
      </view>
    <view v-if="feedbackVisible" class="feedback-mask" @tap="closeFeedback">
      <view class="feedback-sheet" @tap.stop>
        <view class="feedback-sheet-head">
          <view>
            <text class="feedback-title">{{ t('提交题目反馈') }}</text>
            <text class="feedback-subtitle">{{ t('选择问题类型，并补充具体说明。') }}</text>
          </view>
          <button class="feedback-close" hover-class="tap-feedback" @tap="closeFeedback">×</button>
        </view>

        <view class="feedback-type-grid">
          <button
            v-for="item in feedbackOptions"
            :key="item.value"
            class="feedback-type-chip"
            :class="{ active: feedbackType === item.value }"
            hover-class="tap-feedback"
            @tap="feedbackType = item.value"
          >
            {{ item.label }}
          </button>
        </view>

        <textarea
          v-model="feedbackContent"
          class="feedback-textarea"
          :placeholder="t('请描述具体问题，便于后续处理。')"
          maxlength="500"
        />

        <view class="feedback-actions">
          <button class="feedback-cancel" hover-class="tap-feedback" @tap="closeFeedback">
            {{ t('取消') }}
          </button>
          <button
            class="feedback-submit"
            :disabled="feedbackSubmitting"
            hover-class="tap-feedback"
            @tap="submitFeedback"
          >
            {{ feedbackSubmitting ? t('提交中') : t('提交反馈') }}
          </button>
        </view>
      </view>
    </view>
    </view>

    <view class="question-footer safe-bottom-spacer">
      <button
        class="ghost-action"
        :class="{ favorite: currentQuestion.isFavorite }"
        :disabled="favoriteUpdating"
        hover-class="tap-feedback"
        @tap="toggleFavorite"
      >
        <text class="favorite-mark">{{ currentQuestion.isFavorite ? '★' : '☆' }}</text>
        <text>{{ currentQuestion.isFavorite ? t('已收藏') : t('收藏') }}</text>
      </button>
      <button
        class="ghost-action feedback-action"
        :disabled="feedbackSubmitting"
        hover-class="tap-feedback"
        @tap="openFeedback"
      >
        <text class="feedback-mark">!</text>
        <text>{{ t('反馈') }}</text>
      </button>
      <button
        class="next-button"
        :class="{ disabled: !answerResult }"
        :disabled="!answerResult || submitting"
        hover-class="tap-feedback"
        @tap="handleNext"
      >
        {{ isLastQuestion ? t('完成练习') : t('下一题') }}
      </button>
    </view>
  </view>
</template>

<style lang="scss">
.question-page {
  min-height: 100vh;
  padding: 136rpx 32rpx calc(176rpx + env(safe-area-inset-bottom));
  background: var(--jp-bg);
  box-sizing: border-box;
}

.question-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 0 32rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 22rpx;
  background: rgba(248, 250, 248, 0.92);
  backdrop-filter: blur(12px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex-shrink: 0;
}

.close-button {
  width: 88rpx;
  height: 88rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--jp-text-secondary);
  background: rgba(242, 244, 242, 0.92);
  box-shadow: 0 8rpx 22rpx rgba(40, 105, 92, 0.06);
  transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease;
}

.close-glyph {
  color: currentColor;
  font-size: 34rpx;
  line-height: 34rpx;
  transform: translateY(-1rpx);
}

.brand-word {
  color: var(--jp-primary);
  font-size: 30rpx;
  line-height: 40rpx;
  font-weight: 800;
}

.progress-block {
  flex: 1;
  min-width: 0;
}

.progress-copy {
  display: flex;
  justify-content: space-between;
  color: var(--jp-text-muted);
  font-size: 20rpx;
  line-height: 28rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
}

.progress-number {
  color: var(--jp-primary);
}

.progress-track {
  height: 12rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background: var(--jp-primary-faint);
}

.progress-value {
  height: 100%;
  border-radius: 999rpx;
  background: var(--jp-primary);
  transition: width 280ms ease-out;
}

.question-main {
  display: flex;
  flex-direction: column;
  gap: 34rpx;
}

.question-card,
.analysis-card {
  padding: 38rpx;
  border-radius: 34rpx;
  background: var(--jp-surface);
  border: 1rpx solid var(--jp-border);
  box-shadow: var(--jp-shadow-soft);
}

.question-badge {
  align-self: flex-start;
  display: inline-flex;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  margin-bottom: 30rpx;
  color: #7a5745;
  background: var(--jp-peach);
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 800;
}

.passage-text {
  display: block;
  color: var(--jp-text-secondary);
  font-size: 30rpx;
  line-height: 48rpx;
  margin-bottom: 30rpx;
}

.stem-text {
  display: block;
  color: var(--jp-text);
  font-size: 40rpx;
  line-height: 62rpx;
  font-weight: 800;
}

.translation-text {
  display: block;
  color: var(--jp-text-secondary);
  font-size: 28rpx;
  line-height: 44rpx;
  margin-top: 22rpx;
}

.option-grid {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  width: 100%;
}

.option-card {
  width: 100%;
  min-height: 104rpx;
  padding: 22rpx 24rpx;
  border-radius: 28rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 22rpx;
  text-align: left;
  background: var(--jp-surface-soft);
  border: 1rpx solid var(--jp-border);
  transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

.option-card.selected {
  background: var(--jp-primary-faint);
  border-color: var(--jp-primary);
}

.option-card.correct {
  background: var(--jp-primary-soft);
  border-color: var(--jp-primary);
}

.option-card.wrong {
  background: var(--jp-danger-soft);
  border-color: var(--jp-danger);
}

.option-card.muted {
  opacity: 0.58;
}

.option-badge {
  width: 64rpx;
  height: 64rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--jp-text-secondary);
  background: #e1e3e1;
  font-size: 28rpx;
  font-weight: 800;
}

.option-card.correct .option-badge {
  color: #ffffff;
  background: var(--jp-primary);
}

.option-card.wrong .option-badge {
  color: #ffffff;
  background: var(--jp-danger);
}

.option-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.option-text {
  color: var(--jp-text);
  font-size: 32rpx;
  line-height: 46rpx;
}

.option-state {
  color: var(--jp-text-secondary);
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 700;
}

.analysis-card {
  background: rgba(214, 204, 152, 0.3);
  border-color: var(--jp-sand);
  box-shadow: none;
}

.analysis-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #5d562c;
  font-size: 32rpx;
  line-height: 44rpx;
  font-weight: 800;
  margin-bottom: 14rpx;
}

.analysis-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: #665f34;
  font-size: 24rpx;
  line-height: 40rpx;
}

.analysis-text {
  color: #5d562c;
  font-size: 28rpx;
  line-height: 46rpx;
}

.question-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  padding: 22rpx 32rpx 30rpx;
  box-sizing: border-box;
  display: flex;
  gap: 14rpx;
  background: rgba(248, 250, 248, 0.94);
  backdrop-filter: blur(12px);
  border-top: 1rpx solid rgba(215, 223, 219, 0.72);
}

.ghost-action {
  width: 144rpx;
  height: 90rpx;
  border-radius: 999rpx;
  color: var(--jp-primary);
  background: rgba(255, 255, 255, 0.55);
  border: 1rpx solid #bfc9c5;
  font-size: 26rpx;
  font-weight: 800;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: opacity 180ms ease, transform 180ms ease;
}

.ghost-action[disabled] {
  color: #7d8783;
  background: var(--jp-surface-soft);
  opacity: 1;
}

.ghost-action.favorite {
  color: #7a5745;
  background: rgba(254, 208, 185, 0.48);
  border-color: rgba(122, 87, 69, 0.28);
}

.favorite-mark {
  font-size: 30rpx;
  line-height: 30rpx;
}

.next-button {
  flex: 1;
  height: 90rpx;
  border-radius: 999rpx;
  color: #ffffff;
  background: var(--jp-primary);
  font-size: 32rpx;
  font-weight: 800;
  line-height: 90rpx;
  box-shadow: var(--jp-shadow-primary);
  transition: opacity 180ms ease, transform 180ms ease;
}

.next-button.disabled {
  color: rgba(255, 255, 255, 0.88);
  background: #9bbdb5;
  box-shadow: none;
  opacity: 1;
}
.feedback-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 40;
  display: flex;
  align-items: flex-end;
  background: rgba(18, 30, 27, 0.42);
}

.feedback-sheet {
  width: 100%;
  padding: 34rpx 32rpx calc(36rpx + env(safe-area-inset-bottom));
  border-radius: 34rpx 34rpx 0 0;
  box-sizing: border-box;
  background: var(--jp-bg);
  box-shadow: 0 -18rpx 50rpx rgba(18, 30, 27, 0.18);
}

.feedback-sheet-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.feedback-title,
.feedback-subtitle {
  display: block;
}

.feedback-title {
  color: var(--jp-text);
  font-size: 34rpx;
  line-height: 44rpx;
  font-weight: 900;
}

.feedback-subtitle {
  margin-top: 6rpx;
  color: var(--jp-text-secondary);
  font-size: 24rpx;
  line-height: 34rpx;
  font-weight: 700;
}

.feedback-close {
  width: 64rpx;
  height: 64rpx;
  border-radius: 999rpx;
  color: var(--jp-text-secondary);
  background: var(--jp-surface-soft);
  font-size: 34rpx;
  line-height: 60rpx;
  font-weight: 700;
}

.feedback-type-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
}

.feedback-type-chip {
  height: 68rpx;
  border-radius: 999rpx;
  color: var(--jp-text-secondary);
  background: var(--jp-surface);
  border: 1rpx solid var(--jp-border);
  font-size: 24rpx;
  line-height: 68rpx;
  font-weight: 800;
}

.feedback-type-chip.active {
  color: #fff;
  background: var(--jp-primary);
  border-color: var(--jp-primary);
}

.feedback-textarea {
  width: 100%;
  min-height: 180rpx;
  margin-top: 22rpx;
  padding: 22rpx;
  border-radius: 26rpx;
  box-sizing: border-box;
  color: var(--jp-text);
  background: var(--jp-surface);
  border: 1rpx solid var(--jp-border);
  font-size: 28rpx;
  line-height: 42rpx;
}

.feedback-actions {
  margin-top: 22rpx;
  display: flex;
  gap: 16rpx;
}

.feedback-cancel,
.feedback-submit {
  flex: 1;
  height: 82rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  line-height: 82rpx;
  font-weight: 900;
}

.feedback-cancel {
  color: var(--jp-primary);
  background: rgba(255, 255, 255, 0.62);
  border: 1rpx solid #bfc9c5;
}

.feedback-submit {
  color: #fff;
  background: var(--jp-primary);
  box-shadow: var(--jp-shadow-primary);
}

.feedback-submit[disabled] {
  color: rgba(255, 255, 255, 0.86);
  background: #9bbdb5;
  box-shadow: none;
}

.feedback-action {
  color: #665f34;
  background: rgba(214, 204, 152, 0.24);
  border-color: rgba(102, 95, 52, 0.22);
}

.feedback-mark {
  width: 30rpx;
  height: 30rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #665f34;
  font-size: 20rpx;
  line-height: 30rpx;
  font-weight: 900;
}
</style>
