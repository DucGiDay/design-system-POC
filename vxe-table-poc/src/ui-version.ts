// Chuyển giữa giao diện cũ (host Vue 2) và giao diện mới (host này) trên cùng URL.
// Cùng cookie với host Vue 2 (ipos-cms-pos-android/src/helpers/cms-ui.js): nginx đọc cookie
// này để trả index.html của host tương ứng. Lối thoát khi host này lỗi: mở URL kèm ?ui=v2.
const COOKIE = 'ui_version'
const ONE_YEAR = 60 * 60 * 24 * 365

export type UiVersion = 'v2' | 'v3'

export function switchUiVersion(version: UiVersion) {
  document.cookie = `${COOKIE}=${version}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`
  // Local không có nginx: mỗi host chạy một cổng, nên chuyển hẳn sang host kia (cookie
  // localhost dùng chung mọi cổng). Trên server chỉ cần tải lại, nginx chọn host.
  const legacyUrl = import.meta.env.VITE_LEGACY_URL
  if (version === 'v2' && legacyUrl) {
    window.location.href = legacyUrl.replace(/\/$/, '') + window.location.pathname + window.location.search
    return
  }
  window.location.reload()
}
