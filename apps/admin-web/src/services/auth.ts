import { request } from './request';

export interface AdminLoginPayload {
  username: string;
  password: string;
}

export interface AdminLoginResult {
  token: string;
  admin: {
    id: string;
    username: string;
    role: 'admin' | 'editor' | 'reviewer';
  };
}

export function adminLogin(data: AdminLoginPayload) {
  return request.post<AdminLoginResult>('/auth/admin-login', data);
}
