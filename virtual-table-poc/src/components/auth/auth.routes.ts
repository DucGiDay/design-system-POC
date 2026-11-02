import type { RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Chỉ dành cho khách: đã có phiên thì chuyển về trang chủ */
    guestOnly?: boolean
    /** Khoá i18n cho tiêu đề tab */
    titleKey?: string
  }
}

const pending = () => import('./AuthPendingPage.vue')

// Đường dẫn giữ nguyên như host Vue 2 để link cũ (email, bookmark) vẫn chạy
export const authRoutes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('./LoginPage.vue'), meta: { guestOnly: true, titleKey: 'auth.pageTitle.login' } },
  { path: '/register', name: 'register', component: () => import('./RegisterPage.vue'), meta: { guestOnly: true, titleKey: 'auth.pageTitle.register' } },
  // TODO: chưa chuyển từ host Vue 2 — đang là trang giữ chỗ
  { path: '/forgot-password', name: 'forgot-password', component: pending, meta: { titleKey: 'auth.pageTitle.forgotPassword' } },
  { path: '/login-token', name: 'login-token', component: pending, meta: { guestOnly: true, titleKey: 'auth.pageTitle.loginToken' } },
  { path: '/request-verify-email', name: 'verify-email', component: pending, meta: { titleKey: 'auth.pageTitle.verifyEmail' } },
]
