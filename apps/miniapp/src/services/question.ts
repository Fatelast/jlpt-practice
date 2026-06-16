import { request } from './request';
import type { PracticeConfig, Question } from '@jlpt-practice/shared';

export function getPracticeQuestions(params: PracticeConfig) {
  return request<Question[]>({
    url: '/questions/practice',
    method: 'GET',
    data: params,
  });
}
