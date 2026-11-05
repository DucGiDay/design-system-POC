import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import vue from '@vitejs/plugin-vue'

// Port dev mặc định 5170 (5173 / 5174 / 5175 là 3 sub-app, 6969 là host Vue 2).
// Chạy song song 2 bản (vd poc trong design-system) thì đặt VITE_DEV_PORT trong .env.development.local.
const DEFAULT_DEV_PORT = 5170

// Giả lập nginx của host Vue 2 (ipos-cms-pos-android/nginx) khi chạy local: entry sub-app cùng
// origin (/_sub_*/) chuyển sang dev server của sub. Sub chạy dev với base tuyệt đối
// http://localhost:517x/ nên bỏ prefix khi chuyển.
const subProxy = (prefix: string, port: number): Record<string, ProxyOptions> => ({
  [prefix]: {
    target: `http://localhost:${port}`,
    changeOrigin: true,
    rewrite: path => path.replace(new RegExp(`^${prefix}`), ''),
  },
})

export default defineConfig(({ command, mode }) => {
  // '.' = root mặc định của Vite (process.cwd())
  const env = loadEnv(mode, '.')
  return {
    // Bản build nằm dưới /_v3_host/ trên domain chung (nginx của host Vue 2 proxy sang).
    // URL trang vẫn là "/" vì router đặt base riêng (src/router.ts). Dev giữ "/" cho đơn giản.
    base: command === 'build' ? '/_v3_host/' : '/',
    plugins: [vue()],
    // Cờ build của vue-i18n: chỉ dùng Composition API, bỏ legacy để bundle nhẹ hơn
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
    },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: Number(env.VITE_DEV_PORT) || DEFAULT_DEV_PORT,
      strictPort: true,
      proxy: {
        // testposapi không trả CORS cho localhost -> dev gọi qua proxy cùng origin (xem src/api/http.ts)
        ...(env.VITE_API_BASE_URL
          ? {
              '/__api': {
                target: env.VITE_API_BASE_URL,
                changeOrigin: true,
                rewrite: (path: string) => path.replace(/^\/__api/, ''),
              },
            }
          : {}),
        ...subProxy('/_sub_main', 5173),
        ...subProxy('/_sub_multichannel', 5174),
        ...subProxy('/_sub_tableorder', 5175),
        // Host Vue 2 (publicPath /_legacy/) — dùng ở đợt 2 khi nạp Vue 2 làm sub-app.
        '/_legacy': { target: 'http://localhost:6969', changeOrigin: true, ws: true },
      },
    },
  }
})
