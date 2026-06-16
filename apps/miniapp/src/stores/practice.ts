import { defineStore } from 'pinia';
import type { PracticeConfig, Question } from '@jlpt-practice/shared';
import type { SubmitAnswerResult } from '@/types/practice';

interface PracticeState {
  practiceRecordId: string;
  questions: Question[];
  currentIndex: number;
  answers: SubmitAnswerResult[];
  config: PracticeConfig | null;
}

export const usePracticeStore = defineStore('practice', {
  state: (): PracticeState => ({
    practiceRecordId: '',
    questions: [],
    currentIndex: 0,
    answers: [],
    config: null,
  }),
});
