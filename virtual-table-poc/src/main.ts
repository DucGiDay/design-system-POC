import { createApp } from 'vue'
import App from './App.vue'
import { i18n, initLocale } from './i18n'
import { router } from './router'
import './style.scss'

void initLocale().then(() => createApp(App).use(i18n).use(router).mount('#app'))
