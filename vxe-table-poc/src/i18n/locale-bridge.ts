import { DEFAULT_LOCALE, type AppLocale } from './locales'

/**
 * Kênh duy nhất host chia sẻ ngôn ngữ cho sub-app: truyền qua props khi mount
 * (`props.localeBridge`). Host chỉ phát mã locale; mỗi sub tự giữ vue-i18n, tự nạp
 * bản dịch của mình. Không dùng qiankun globalState vì API đó sẽ bị bỏ ở qiankun 3.
 */
export interface LocaleBridge {
  /** Tăng khi contract đổi không tương thích ngược */
  readonly version: 1
  getLocale(): AppLocale
  /** Gọi listener mỗi lần host đổi ngôn ngữ. Trả hàm huỷ — sub phải gọi khi unmount. */
  subscribe(listener: (locale: AppLocale) => void): () => void
}

let current: AppLocale = DEFAULT_LOCALE
const listeners = new Set<(locale: AppLocale) => void>()

export const localeBridge: LocaleBridge = Object.freeze({
  version: 1 as const,
  getLocale: () => current,
  subscribe(listener: (locale: AppLocale) => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
})

/** Chỉ host gọi (qua setLocale trong ./index.ts) */
export function publishLocale(locale: AppLocale) {
  if (locale === current) return
  current = locale
  listeners.forEach((listener) => {
    // Lỗi trong một sub không được chặn host hay các sub khác
    try { listener(locale) } catch (error) { console.error('[locale-bridge] listener lỗi', error) }
  })
}
