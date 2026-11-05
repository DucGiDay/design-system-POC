import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from './components/auth/auth.routes'
import { hasSession } from './components/auth/session'
import { watch } from 'vue'
import DesktopShell from './components/navigation/DesktopShell.vue'
import { currentLocale, i18n } from './i18n'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    { path: '/ui', component: () => import('./components/ui/UiCompare.vue') },
    { path: '/table', component: () => import('./components/VxeTablePoC.vue') },
    // The shell resolves module and report path from the URL itself: `/`, `/:module`, `/reports/a/a01/a01-1`.
    { path: '/:segments(.*)*', component: DesktopShell, props: { stackLabel: 'VxeTable' } },
  ],
})

router.beforeEach(to => (to.meta.guestOnly && hasSession() ? '/' : true))

const APP_TITLE = 'FABI CMS'
function updateTitle() {
  const { title, titleKey } = router.currentRoute.value.meta as { title?: string; titleKey?: string }
  const text = titleKey ? i18n.global.t(titleKey) : title
  document.title = text ? `${text} · ${APP_TITLE}` : APP_TITLE
}
router.afterEach(updateTitle)
watch(currentLocale, updateTitle)
