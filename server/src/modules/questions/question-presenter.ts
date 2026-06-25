import type { Question } from '@jlpt-practice/shared';

export type QuestionWithClientRelations = {
  id: bigint;
  level: string;
  category: string;
  type: string;
  stem: string;
  passage: string | null;
  translation: string | null;
  explanation: string;
  answer: string;
  difficulty: number;
  audioUrl: string | null;
  audioText: string | null;
  sourceType: string;
  status: string;
  options: Array<{
    optionKey: string;
    optionText: string;
  }>;
  questionTags: Array<{
    tag: {
      name: string;
    };
  }>;
  favoriteQuestions: Array<{
    questionId: bigint;
  }>;
};

export function formatQuestion(question: QuestionWithClientRelations): Question {
  const result: Question = {
    id: String(question.id),
    level: question.level as Question['level'],
    category: question.category as Question['category'],
    type: question.type as Question['type'],
    stem: question.stem,
    options: question.options.map((option) => ({
      key: option.optionKey as Question['options'][number]['key'],
      text: option.optionText,
    })),
    answer: question.answer as Question['answer'],
    explanation: question.explanation,
    difficulty: question.difficulty as Question['difficulty'],
    tags: question.questionTags.map((item) => item.tag.name),
    sourceType: question.sourceType as Question['sourceType'],
    status: question.status as Question['status'],
    isFavorite: question.favoriteQuestions.length > 0,
  };

  if (question.passage) {
    result.passage = question.passage;
  }

  if (question.translation) {
    result.translation = question.translation;
  }

  if (question.audioUrl) {
    result.audioUrl = question.audioUrl;
  }

  if (question.audioText) {
    result.audioText = question.audioText;
  }

  return result;
}
