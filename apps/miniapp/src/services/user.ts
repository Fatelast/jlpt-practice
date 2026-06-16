import { request } from './request';
import type { JLPTLevel } from '@jlpt-practice/shared';
import type { UserInfo } from '@/types/user';

export function getCurrentUser() {
  return request<UserInfo>({
    url: '/users/me',
    method: 'GET',
  });
}

export function updateCurrentLevel(level: JLPTLevel) {
  return request<UserInfo>({
    url: '/users/current-level',
    method: 'PATCH',
    data: { level },
  });
}
