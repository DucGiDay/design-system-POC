import { computed } from 'vue'
import { createI18n } from 'vue-i18n'
import { publishLocale } from './locale-bridge'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isAppLocale, type AppLocale } from './locales'
import vi from './locales/vi.json'

export type MessageSchema = typeof vi

// Chỉ bản dịch của host. Ngôn ngữ mặc định đóng gói sẵn, các ngôn ngữ khác tải khi chọn.
const loaders = import.meta.glob<{ default: MessageSchema }>(['./locales/*.json', '!./locales/vi.json'])
const loaderOf = (locale: AppLocale) => loaders[`./locales/${locale}.json`]

/** Ngôn ngữ host có bản dịch — nút đổi ngôn ngữ chỉ đưa ra các mã này */
export const availableLocales: AppLocale[] = [DEFAULT_LOCALE, ...Object.keys(loaders)
  .map(path => /\/([\w-]+)\.json$/.exec(path)?.[1])
  .filter(isAppLocale)]

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: { [DEFAULT_LOCALE]: vi } as Record<string, MessageSchema>,
})

export const currentLocale = computed(() => i18n.global.locale.value as AppLocale)

function readStoredLocale(): AppLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isAppLocale(stored) && availableLocales.includes(stored)) return stored
  } catch { /* storage bị chặn: dùng mặc định */ }
  return DEFAULT_LOCALE
}

/** Đổi ngôn ngữ cho host rồi báo sub-app qua localeBridge. Không reload trang. */
export async function setLocale(locale: AppLocale) {
  const target = availableLocales.includes(locale) ? locale : DEFAULT_LOCALE
  const load = loaderOf(target)
  if (load && !i18n.global.availableLocales.includes(target)) {
    i18n.global.setLocaleMessage(target, (await load()).default)
  }
  i18n.global.locale.value = target
  document.documentElement.lang = target
  try { localStorage.setItem(LOCALE_STORAGE_KEY, target) } catch { /* bỏ qua */ }
  publishLocale(target)
}

/** Gọi trước khi mount để lần render đầu đã đúng ngôn ngữ */
export const initLocale = () => setLocale(readStoredLocale())
