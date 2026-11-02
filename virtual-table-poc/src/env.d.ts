/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ACCESS_TOKEN?: string
  readonly VITE_API_TIMEOUT?: string
  /** Bật nhắc đổi mật khẩu khi đăng nhập bằng mật khẩu mặc định */
  readonly VITE_ENABLE_REQUIRE_CHANGE_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
