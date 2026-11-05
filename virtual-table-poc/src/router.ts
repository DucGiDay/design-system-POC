import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from './components/auth/auth.routes'
import { hasSession } from './components/auth/session'
import DesktopShell from './components/navigation/DesktopShell.vue'
import { currentLocale, i18n } from './i18n'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    { path: '/table', component: () => import('./components/TableDemo.vue') },
    { path: '/spike', component: () => import('./spike/SpikePage.vue'), meta: { titleKey: 'spike.title' } },
    { path: '/ui', component: () => import('./components/ui/UiPreview.vue'), meta: { titleKey: 'uiPreview.title' } },
    // The shell resolves module and report path from the URL itself: `/`, `/:module`, `/reports/a/a01/a01-1`.
    { path: '/:segments(.*)*', component: DesktopShell, props: { stackLabel: 'TanStack Table' } },
  ],
})

router.beforeEach(to => (to.meta.guestOnly && hasSession() ? '/' : true))

const APP_TITLE = 'FABI CMS'
function updateTitle() {
  const { titleKey } = router.currentRoute.value.meta
  document.title = titleKey ? `${i18n.global.t(titleKey)} · ${APP_TITLE}` : APP_TITLE
}
router.afterEach(updateTitle)
watch(currentLocale, updateTitle)
