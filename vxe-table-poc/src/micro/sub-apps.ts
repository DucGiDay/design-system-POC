import { registerMicroApps, start } from 'qiankun'
import type { Router } from 'vue-router'
import { i18n } from '@/i18n'
import { localeBridge } from '@/i18n/locale-bridge'
import { actions, pushSharedState } from './shared-state'

// 3 sub-app dùng chung với host Vue 2: cùng tên app, cùng URL /micro/*, cùng props.
// Entry trên server là đường dẫn cùng domain (/_sub_*/, nginx proxy); local trỏ thẳng dev server
// của sub (.env.development.local). Entry trống = môi trường chưa có sub đó ⇒ module chạy trong sub main.
const SPLIT_SUB_APPS = [
  {
    name: 'fabi-cms-sub-tableorder',
    entry: import.meta.env.VITE_SUB_TABLEORDER_URL,
    match: (path: string) => path.startsWith('/micro/table-order'),
  },
  {
    name: 'fabi-cms-sub-multichannel',
    entry: import.meta.env.VITE_SUB_MULTICHANNEL_URL,
    match: (path: string) => path.startsWith('/micro/menu/multi-channel-menu') || path.startsWith('/micro/order-multi-channel'),
  },
].filter((app): app is typeof app & { entry: string } => !!app.entry)

export const isMicroPath = (path: string) => path === '/micro' || path.startsWith('/micro/')
const isSplitPath = (path: string) => SPLIT_SUB_APPS.some(app => app.match(path))

// Sub đọc i18n.locale (ngôn ngữ đang dùng), te/t để hỏi key dùng chung và tc như vue-i18n 8 của host cũ.
// Host này dùng Composition API nên bọc lại đúng bề mặt đó.
const legacyI18n = {
  get locale() { return i18n.global.locale.value },
  te: (key: string) => i18n.global.te(key),
  t: (key: string, params?: Record<string, unknown>) => i18n.global.t(key, params ?? {}),
  tc: (key: string, choice = 1, params?: Record<string, unknown>) => i18n.global.t(key, params ?? {}, choice),
}

export function startSubApps(router: Router) {
  const props = {
    actions,
    i18n: legacyI18n,
    // Kênh ngôn ngữ mới (đổi ngôn ngữ không reload). Sub nào chưa dùng thì bỏ qua.
    localeBridge,
    // Sub mở trang của host. Trả Promise để sub tự await / catch.
    navigateHost: (path: string) => router.push(path),
    // Chưa có cửa gửi event events.ipos.vn ở host này: sub tự no-op khi thiếu (common/analytics.js).
    analytics: undefined,
  }

  registerMicroApps(
    [
      {
        name: 'fabi-cms-sub-vue3',
        entry: import.meta.env.VITE_SUB_MAIN_URL,
        container: '#subapp-container',
        activeRule: ({ pathname }) => isMicroPath(pathname) && !isSplitPath(pathname),
        props,
      },
      ...SPLIT_SUB_APPS.map(({ name, entry, match }) => ({
        name,
        entry,
        container: '#subapp-container',
        activeRule: ({ pathname }: Location) => match(pathname),
        props,
      })),
    ],
    {
      // Phiên có thể đã đổi từ lúc host khởi động (đăng nhập xong mới vào /micro)
      beforeMount: [async () => pushSharedState()],
    },
  )

  start({ sandbox: { strictStyleIsolation: false }, prefetch: false })
}
