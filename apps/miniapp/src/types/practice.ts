export type {
  PracticeCategory,
  PracticeConfig,
  PracticeMode,
} from '@jlpt-practice/shared';

export interface SubmitAnswerPayload {
  questionId: string;
  selectedAnswer: string;
  durationSeconds: number;
}

export interface SubmitAnswerResult {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}
