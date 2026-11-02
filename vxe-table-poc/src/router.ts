import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from './components/auth/auth.routes'
import { hasSession } from './components/auth/session'
import DesktopShell from './components/navigation/DesktopShell.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    { path: '/table', component: () => import('./components/VxeTablePoC.vue') },
    // The shell resolves module and report path from the URL itself: `/`, `/:module`, `/reports/a/a01/a01-1`.
    { path: '/:segments(.*)*', component: DesktopShell, props: { stackLabel: 'VxeTable' } },
  ],
})

router.beforeEach(to => (to.meta.guestOnly && hasSession() ? '/' : true))

const APP_TITLE = 'FABI CMS'
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ${APP_TITLE}` : APP_TITLE
})
