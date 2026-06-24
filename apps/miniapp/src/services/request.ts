import Taro from '@tarojs/taro';
import type { ApiResponse } from '@/types/common';
import { getStorage, STORAGE_KEYS } from '@/utils/storage';

const API_BASE_URL = process.env.TARO_APP_API_BASE_URL ?? 'http://127.0.0.1:3000/api';

function toRequestFailure(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'object' && error && 'errMsg' in error) {
    return new Error(String(error.errMsg));
  }

  return new Error('request:fail');
}

export async function request<T>(
  options: Taro.request.Option,
): Promise<ApiResponse<T>> {
  const token = getStorage<string>(STORAGE_KEYS.token);
  const result = await Taro.request<ApiResponse<T>>({
    ...options,
    url: `${API_BASE_URL}${options.url}`,
    header: {
      ...(options.header ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).catch((error) => {
    throw toRequestFailure(error);
  });
  const response = result.data;

  if (result.statusCode < 200 || result.statusCode >= 300) {
    throw new Error(response?.message ?? `请求失败：${result.statusCode}`);
  }

  if (!response || response.code !== 0) {
    throw new Error(response?.message ?? '请求失败');
  }

  return response;
}
