import { request } from './request';
import type { Question } from '@jlpt-practice/shared';

export function getWrongQuestions() {
  return request<Question[]>({
    url: '/wrong-questions',
    method: 'GET',
  });
}
