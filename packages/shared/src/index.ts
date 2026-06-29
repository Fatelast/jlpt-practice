export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type QuestionCategory =
  | 'moji_goi'
  | 'grammar'
  | 'reading'
  | 'listening';

export type PracticeCategory = QuestionCategory | 'mixed';

export type QuestionType =
  | 'single_choice'
  | 'kanji_reading'
  | 'word_context'
  | 'paraphrase'
  | 'usage'
  | 'grammar_choice'
  | 'sentence_order'
  | 'text_grammar'
  | 'reading_choice'
  | 'listening_choice';

export type PracticeMode =
  | 'sequence'
  | 'random'
  | 'wrong'
  | 'favorite'
  | 'mock_exam';

export type QuestionStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'offline'
  | 'rejected';

export type SourceType =
  | 'original'
  | 'authorized'
  | 'public_license';

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface QuestionOption {
  key: OptionKey;
  text: string;
}

export interface Question {
  id: string;
  level: JLPTLevel;
  category: QuestionCategory;
  type: QuestionType;
  stem: string;
  passage?: string;
  options: QuestionOption[];
  answer?: OptionKey;
  explanation?: string;
  translation?: string;
  audioUrl?: string;
  audioText?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  sourceType?: SourceType;
  status?: QuestionStatus;
  isFavorite?: boolean;
}

export interface WrongQuestionItem {
  question: Question;
  wrongCount: number;
  lastWrongAnswer: string | null;
  lastWrongAt: string;
  mastered: boolean;
}

export interface ProgressOverview {
  totalAnswered: number;
  correctCount: number;
  accuracy: number;
  wrongQuestionCount: number;
  todayAnswered: number;
  streakDays: number;
}

export interface ProgressRecentDay {
  date: string;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
}

export interface ProgressCategoryMastery {
  category: QuestionCategory;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
}

export interface ProgressSummary {
  overview: ProgressOverview;
  recentDays: ProgressRecentDay[];
  categoryMastery: ProgressCategoryMastery[];
}


export const FEEDBACK_TYPES = [
  'stem_error',
  'option_error',
  'answer_error',
  'explanation_error',
  'translation_error',
  'other',
] as const;

export type FeedbackType = typeof FEEDBACK_TYPES[number];

export type FeedbackStatus = 'pending' | 'processing' | 'resolved' | 'closed';

export interface FeedbackQuestionSnapshot {
  id: string;
  level: JLPTLevel;
  category: QuestionCategory;
  stem: string;
}

export interface CreateFeedbackPayload {
  questionId: string;
  type: FeedbackType;
  content: string;
}

export interface FeedbackItem {
  id: string;
  questionId: string | null;
  question: FeedbackQuestionSnapshot | null;
  type: FeedbackType;
  content: string;
  status: FeedbackStatus;
  handlerRemark: string | null;
  createdAt: string;
  handledAt: string | null;
}
export interface PracticeConfig {
  level: 'N5' | 'N4';
  category: PracticeCategory;
  mode: PracticeMode;
  count: 10 | 20 | 30 | 50;
}
