import { request } from './request';
import type { Question } from '@jlpt-practice/shared';

export function getFavorites() {
  return request<Question[]>({
    url: '/favorites',
    method: 'GET',
  });
}
