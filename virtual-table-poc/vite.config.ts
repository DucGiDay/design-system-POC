import { fileURLToPath, URL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// Also covers direct `vite` / IDE launches that skip npm's predev hook.
execFileSync(process.execPath, [fileURLToPath(new URL('./scripts/sync-design.mjs', import.meta.url))], {
  stdio: 'inherit',
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)))
  return {
    plugins: [vue()],
    // Cờ build của vue-i18n: chỉ dùng Composition API, bỏ legacy để bundle nhẹ hơn
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // testposapi không trả CORS cho localhost -> dev gọi qua proxy cùng origin (xem src/api/http.ts)
      proxy: env.VITE_API_BASE_URL
        ? {
            '/__api': {
              target: env.VITE_API_BASE_URL,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/__api/, ''),
            },
          }
        : undefined,
    },
  }
})
