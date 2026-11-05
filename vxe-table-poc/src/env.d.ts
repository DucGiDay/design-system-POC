/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ACCESS_TOKEN?: string
  readonly VITE_API_TIMEOUT?: string
  /** Bật nhắc đổi mật khẩu khi đăng nhập bằng mật khẩu mặc định */
  readonly VITE_ENABLE_REQUIRE_CHANGE_PASSWORD?: string
  /** Entry qiankun của sub main (fabi-cms-sub-vue3) */
  readonly VITE_SUB_MAIN_URL: string
  /** Entry sub Đa kênh. Trống = module chạy trong sub main */
  readonly VITE_SUB_MULTICHANNEL_URL?: string
  /** Entry sub Đặt món tại bàn. Trống = module chạy trong sub main */
  readonly VITE_SUB_TABLEORDER_URL?: string
  /** Chỉ dev local: địa chỉ host Vue 2 để nút "Giao diện cũ" chuyển sang (trên server cùng URL) */
  readonly VITE_LEGACY_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
