import { createApp } from 'vue'
import VxeUI from 'vxe-pc-ui'
import VxeUITable from 'vxe-table'
import viVN from 'vxe-pc-ui/es/language/vi-VN'
import 'vxe-pc-ui/lib/style.css'
import 'vxe-table/lib/style.css'
import './styles/main.scss'
import App from './App.vue'
import { router } from './router'

VxeUI.setI18n('vi-VN', viVN)
VxeUI.setLanguage('vi-VN')
createApp(App).use(router).use(VxeUI).use(VxeUITable).mount('#app')
