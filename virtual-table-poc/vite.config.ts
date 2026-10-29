import { fileURLToPath, URL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Also covers direct `vite` / IDE launches that skip npm's predev hook.
execFileSync(process.execPath, [fileURLToPath(new URL('./scripts/sync-design.mjs', import.meta.url))], {
  stdio: 'inherit',
})

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
