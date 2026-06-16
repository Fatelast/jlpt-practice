import type { QuestionCategory } from '@jlpt-practice/shared';

type Translate = (text: string) => string;

export function getQuestionCategoryText(
  category: QuestionCategory,
  t: Translate = (text) => text,
) {
  const textMap: Record<QuestionCategory, string> = {
    moji_goi: t('文字词汇'),
    grammar: t('语法'),
    reading: t('阅读'),
    listening: t('听力'),
  };

  return textMap[category];
}
