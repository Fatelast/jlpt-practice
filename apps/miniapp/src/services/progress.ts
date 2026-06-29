import { request } from './request';
import type { ProgressSummary } from '@jlpt-practice/shared';

export function getProgressSummary() {
  return request<ProgressSummary>({
    url: '/progress/summary',
    method: 'GET',
  });
}
