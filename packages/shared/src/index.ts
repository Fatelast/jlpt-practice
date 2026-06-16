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

export interface PracticeConfig {
  level: 'N5' | 'N4';
  category: PracticeCategory;
  mode: PracticeMode;
  count: 10 | 20 | 30 | 50;
}
