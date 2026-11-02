import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // '.' = root mặc định của Vite (process.cwd())
  const env = loadEnv(mode, '.')
  return {
    plugins: [vue()],
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
