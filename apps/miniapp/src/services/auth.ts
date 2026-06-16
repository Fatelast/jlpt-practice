import { request } from './request';
import type { UserInfo } from '@/types/user';

export interface WechatLoginPayload {
  code: string;
  nickname?: string;
  avatarUrl?: string;
}

export interface WechatLoginResult {
  token: string;
  user: UserInfo;
}

export function wechatLogin(data: WechatLoginPayload) {
  return request<WechatLoginResult>({
    url: '/auth/wechat-login',
    method: 'POST',
    data,
  });
}
