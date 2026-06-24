import { defineStore } from 'pinia';
import type { PracticeConfig, Question } from '@jlpt-practice/shared';
import type { FinishPracticeRecordResult } from '@/services/practice';
import type { SubmitAnswerResult } from '@/types/practice';

interface PracticeState {
  practiceRecordId: string;
  questions: Question[];
  currentIndex: number;
  answers: SubmitAnswerResult[];
  config: PracticeConfig | null;
  startedAt: number;
  finishedResult: FinishPracticeRecordResult | null;
}

export const usePracticeStore = defineStore('practice', {
  state: (): PracticeState => ({
    practiceRecordId: '',
    questions: [],
    currentIndex: 0,
    answers: [],
    config: null,
    startedAt: 0,
    finishedResult: null,
  }),
  actions: {
    startPractice(
      practiceRecordId: string,
      questions: Question[],
      config: PracticeConfig,
    ) {
      this.practiceRecordId = practiceRecordId;
      this.questions = questions;
      this.currentIndex = 0;
      this.answers = [];
      this.config = config;
      this.startedAt = Date.now();
      this.finishedResult = null;
    },
    addAnswer(answer: SubmitAnswerResult) {
      const existingIndex = this.answers.findIndex(
        (item) => item.questionId === answer.questionId,
      );

      if (existingIndex >= 0) {
        this.answers.splice(existingIndex, 1, answer);
        return;
      }

      this.answers.push(answer);
    },
    nextQuestion() {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex += 1;
      }
    },
    finish(result: FinishPracticeRecordResult) {
      this.finishedResult = result;
    },
    reset() {
      this.practiceRecordId = '';
      this.questions = [];
      this.currentIndex = 0;
      this.answers = [];
      this.config = null;
      this.startedAt = 0;
      this.finishedResult = null;
    },
  },
});
