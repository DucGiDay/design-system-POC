export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    /** Đường dẫn file trong public/ theo BASE_URL (main.ts) — build nằm dưới /_v3_host/ */
    $pub: (path: string) => string
  }
}
