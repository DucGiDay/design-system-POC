import axios, { type AxiosRequestConfig } from 'axios'
import { localeBridge } from '@/i18n/locale-bridge'
import { API_LOCALE } from '@/i18n/locales'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Không gắn Authorization (login, API public...) */
    noAuth?: boolean
  }
}

/** Lỗi đã chuẩn hoá — service/component chỉ cần đọc `status` và `message` */
export interface ApiError {
  status?: number
  message: string
  data?: unknown
}

const isFormData = (data: unknown): data is FormData =>
  typeof FormData !== 'undefined' && data instanceof FormData

// Cùng backend và cùng bộ header với fabi-cms-sub-vue3 (src/api/axios.js)
const http = axios.create({
  // Dev: đi qua proxy /__api của Vite (vite.config.ts) để tránh CORS
  baseURL: import.meta.env.DEV ? '/__api/' : import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10_000,
})

http.interceptors.request.use((config) => {
  config.headers.set('fabi_type', localStorage.getItem('fabi-type') || 'pos-cms', false)
  if (import.meta.env.VITE_ACCESS_TOKEN) {
    config.headers.set('access_token', import.meta.env.VITE_ACCESS_TOKEN, false)
  }
  config.headers.set('x-client-timezone', String(new Date().getTimezoneOffset() * -60_000), false)
  const apiLocale = API_LOCALE[localeBridge.getLocale()]
  if (apiLocale) config.headers.set('accept-language', apiLocale, false)
  if (!config.noAuth) {
    config.headers.set('Authorization', localStorage.getItem('token') || '', false)
  }
  // FormData: bỏ Content-Type để trình duyệt tự set kèm boundary
  if (isFormData(config.data)) config.headers.setContentType(false)
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) return Promise.reject(error)
    const response = axios.isAxiosError(error) ? error.response : undefined
    const body = response?.data as
      | { message?: string; error?: { message?: string; debug_message?: string } }
      | undefined
    const apiError: ApiError = {
      status: response?.status,
      message:
        body?.message ||
        body?.error?.debug_message ||
        body?.error?.message ||
        (error instanceof Error ? error.message : '') ||
        'Có lỗi xảy ra',
      data: response?.data,
    }
    return Promise.reject(apiError)
  },
)

/** Trả thẳng body của response, kiểu do nơi gọi khai báo */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    http.get<T>(url, config).then((res) => res.data),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    http.post<T>(url, data, config).then((res) => res.data),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    http.put<T>(url, data, config).then((res) => res.data),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    http.patch<T>(url, data, config).then((res) => res.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    http.delete<T>(url, config).then((res) => res.data),
}

export default http
