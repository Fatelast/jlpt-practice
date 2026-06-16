import { request } from './request';
import type { SubmitAnswerPayload, SubmitAnswerResult } from '@/types/practice';

export interface CreatePracticeRecordPayload {
  level: string;
  category: string;
  mode: string;
  questionIds: string[];
}

export function createPracticeRecord(data: CreatePracticeRecordPayload) {
  return request<{ practiceRecordId: string }>({
    url: '/practice-records',
    method: 'POST',
    data,
  });
}

export function submitAnswer(recordId: string, data: SubmitAnswerPayload) {
  return request<SubmitAnswerResult>({
    url: `/practice-records/${recordId}/answers`,
    method: 'POST',
    data,
  });
}
