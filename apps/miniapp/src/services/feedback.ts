import type {
  CreateFeedbackPayload,
  FeedbackItem,
} from '@jlpt-practice/shared';
import { request } from './request';

export function createFeedback(data: CreateFeedbackPayload) {
  return request<FeedbackItem>({
    url: '/feedback',
    method: 'POST',
    data,
  });
}

export function getMyFeedback() {
  return request<FeedbackItem[]>({
    url: '/feedback/my',
    method: 'GET',
  });
}