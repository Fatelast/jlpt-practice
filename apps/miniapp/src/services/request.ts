import Taro from '@tarojs/taro';
import type { ApiResponse } from '@/types/common';

const API_BASE_URL =
  process.env.TARO_APP_API_BASE_URL ?? 'http://localhost:3000/api';

export async function request<T>(
  options: Taro.request.Option,
): Promise<ApiResponse<T>> {
  const result = await Taro.request<ApiResponse<T>>({
    ...options,
    url: `${API_BASE_URL}${options.url}`,
  });

  return result.data;
}
