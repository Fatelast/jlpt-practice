import { request } from './request';
import type { Question } from '@jlpt-practice/shared';

export function getAdminQuestions() {
  return request.get<Question[]>('/admin/questions');
}
