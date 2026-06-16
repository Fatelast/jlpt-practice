import { request } from './request';

export interface CreateFeedbackPayload {
  questionId: string;
  type: 'wrong_answer' | 'unclear_explanation' | 'typo' | 'difficulty' | 'other';
  content: string;
}

export function createFeedback(data: CreateFeedbackPayload) {
  return request<{ id: string }>({
    url: '/feedback',
    method: 'POST',
    data,
  });
}
