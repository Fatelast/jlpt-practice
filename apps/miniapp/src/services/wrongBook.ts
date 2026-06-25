import { request } from './request';
import type { WrongQuestionItem } from '@jlpt-practice/shared';

export function getWrongQuestions() {
  return request<WrongQuestionItem[]>({
    url: '/wrong-questions',
    method: 'GET',
  });
}

export function markWrongQuestionMastered(questionId: string) {
  return request<{ questionId: string; mastered: boolean }>({
    url: `/wrong-questions/${questionId}/mastered`,
    method: 'PATCH',
  });
}
