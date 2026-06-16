import axios from 'axios';
import type { ApiResponse } from '@jlpt-practice/shared';

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  timeout: 10000,
});

request.interceptors.response.use((response) => {
  return response.data as ApiResponse<unknown>;
});
