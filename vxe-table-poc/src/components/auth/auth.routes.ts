import type { RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Chỉ dành cho khách: đã có phiên thì chuyển về trang chủ */
    guestOnly?: boolean
    /** Tiêu đề tab (Option 2 chưa có vue-i18n nên ghi thẳng tiếng Việt) */
    title?: string
  }
}

const pending = () => import('./AuthPendingPage.vue')

// Đường dẫn giữ nguyên như host Vue 2 để link cũ (email, bookmark) vẫn chạy
export const authRoutes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('./LoginPage.vue'), meta: { guestOnly: true, title: 'Đăng nhập' } },
  { path: '/register', name: 'register', component: () => import('./RegisterPage.vue'), meta: { guestOnly: true, title: 'Đăng ký' } },
  // TODO: chưa chuyển từ host Vue 2 — đang là trang giữ chỗ
  { path: '/forgot-password', name: 'forgot-password', component: pending, meta: { title: 'Quên mật khẩu' } },
  { path: '/login-token', name: 'login-token', component: pending, meta: { guestOnly: true, title: 'Đăng nhập với mã hỗ trợ' } },
  { path: '/request-verify-email', name: 'verify-email', component: pending, meta: { title: 'Xác thực email' } },
]
