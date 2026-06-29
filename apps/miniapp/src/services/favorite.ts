import { request } from './request';
import type { Question } from '@jlpt-practice/shared';

export function getFavorites() {
  return request<Question[]>({
    url: '/favorites',
    method: 'GET',
  });
}

export function favoriteQuestion(questionId: string) {
  return request<{ questionId: string; isFavorite: boolean }>({
    url: `/favorites/${questionId}`,
    method: 'POST',
  });
}

export function unfavoriteQuestion(questionId: string) {
  return request<{ questionId: string; isFavorite: boolean }>({
    url: `/favorites/${questionId}`,
    method: 'DELETE',
  });
}