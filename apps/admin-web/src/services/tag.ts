import { request } from './request';

export interface TagItem {
  id: string;
  name: string;
  category?: string;
}

export function getAdminTags() {
  return request.get<TagItem[]>('/admin/tags');
}
