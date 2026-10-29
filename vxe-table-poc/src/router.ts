import { createRouter, createWebHistory } from 'vue-router'
import DesktopShell from './components/navigation/DesktopShell.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/table', component: () => import('./components/VxeTablePoC.vue') },
    // The shell resolves module and report path from the URL itself: `/`, `/:module`, `/reports/a/a01/a01-1`.
    { path: '/:segments(.*)*', component: DesktopShell, props: { stackLabel: 'VxeTable' } },
  ],
})
