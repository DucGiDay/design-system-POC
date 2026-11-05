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

initTableSkin()
VxeUI.setI18n('vi-VN', viVN)
VxeUI.setLanguage('vi-VN')
void initLocale().then(() => createApp(App).use(i18n).use(router).use(VxeUI).use(VxeUITable).mount('#app'))
