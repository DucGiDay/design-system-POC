// Phần contract dùng chung host ↔ sub-app. Sub copy nguyên file này (hoặc khai báo lại
// đúng các giá trị) — KHÔNG import từ host. Xem docs/i18n-micro-frontend.md.

/** Bộ mã locale chung. Mỗi app tự quyết hỗ trợ những mã nào, mã còn thiếu thì tự fallback. */
export const LOCALES = ['vi', 'en', 'ko', 'zh', 'ja'] as const
export type AppLocale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'vi'

/** Trùng khoá của CMS cũ: sub chạy độc lập (không có host) đọc khoá này để lấy ngôn ngữ ban đầu */
export const LOCALE_STORAGE_KEY = 'currentLanguage'

export const isAppLocale = (value: unknown): value is AppLocale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value)

/** Tên hiển thị theo chính ngôn ngữ đó, để người dùng nhận ra dù đang ở ngôn ngữ nào */
export const LOCALE_NAMES: Record<AppLocale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  ko: '한국어',
  zh: '中文',
  ja: '日本語',
}

/** Backend dùng mã riêng cho header accept-language (giống MAP_LOCALE của CMS Vue 2) */
export const API_LOCALE: Partial<Record<AppLocale, string>> = {
  vi: 'vi',
  en: 'en',
  ko: 'kr',
  zh: 'cn',
}
