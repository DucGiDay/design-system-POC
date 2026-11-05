import { createApp } from 'vue'
import VxeUI from 'vxe-pc-ui'
import VxeUITable from 'vxe-table'
import viVN from 'vxe-pc-ui/es/language/vi-VN'
import 'vxe-pc-ui/lib/style.css'
import 'vxe-table/lib/style.css'
import './styles/main.scss'
import App from './App.vue'
import { router } from './router'
import { i18n, initLocale } from './i18n'
import { initTableSkin } from './table-skin/tableSkin'
import { startSubApps } from './micro/sub-apps'

initTableSkin()
VxeUI.setI18n('vi-VN', viVN)
VxeUI.setLanguage('vi-VN')
void initLocale().then(() => {
  const app = createApp(App).use(i18n).use(router).use(VxeUI).use(VxeUITable)
  // public/ nằm dưới BASE_URL (/_v3_host/ khi build): template dùng $pub('navigation/x.svg')
  app.config.globalProperties.$pub = (path: string) => `${import.meta.env.BASE_URL}${path}`
  app.mount('#app')
  // Đăng ký sub-app sau khi mount để vùng #subapp-container đã có trong DOM
  startSubApps(router)
})
