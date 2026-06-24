import type { QuestionCategory } from '@jlpt-practice/shared';
import { t } from '@/utils/i18n';

type Translate = (text: string) => string;

export function getQuestionCategoryText(
  category: QuestionCategory,
  translate: Translate = t,
) {
  const textMap: Record<QuestionCategory, string> = {
    moji_goi: translate('文字词汇'),
    grammar: translate('语法'),
    reading: translate('阅读'),
    listening: translate('听力'),
  };

  return textMap[category];
}
