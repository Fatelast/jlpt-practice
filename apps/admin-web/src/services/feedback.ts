import { request } from './request';

export interface FeedbackItem {
  id: string;
  type: string;
  content: string;
  status: 'pending' | 'processing' | 'resolved' | 'ignored';
}

export function getAdminFeedback() {
  return request.get<FeedbackItem[]>('/admin/feedback');
}
