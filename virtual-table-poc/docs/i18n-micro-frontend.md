# i18n cho host và các sub-app

Host: `virtual-table-poc` (Vue 3). Sub dự kiến: 1 app Vue 2, 3 app Vue 3, trong đó 2 repo do team khác làm.

## Nguyên tắc

1. **Mỗi app tự cấu hình i18n.** Host và từng sub tự cài `vue-i18n` theo bản Vue của mình, tự giữ file dịch, tự chọn ngôn ngữ fallback. Không app nào import bản dịch hay instance i18n của app khác.
2. **Host chỉ chia sẻ mã ngôn ngữ**, qua `props.localeBridge` khi mount sub. Không truyền instance `VueI18n` sang sub như CMS Vue 2 đang làm (`props.i18n`), vì cách đó buộc sub phải chờ host deploy key mới (lý do có hàm `tOr` trong `fabi-cms-sub-vue3`).
3. **Host là bên duy nhất đổi ngôn ngữ.** Nút đổi ngôn ngữ nằm ở host, sub chỉ lắng nghe. Đổi ngôn ngữ không reload trang.

## Contract

Định nghĩa gốc: [`src/i18n/locales.ts`](../src/i18n/locales.ts) và [`src/i18n/locale-bridge.ts`](../src/i18n/locale-bridge.ts). Sub copy phần dưới vào repo của mình, không import từ host.

```ts
type AppLocale = 'vi' | 'en' | 'ko' | 'zh' | 'ja'

interface LocaleBridge {
  readonly version: 1
  getLocale(): AppLocale
  /** Trả hàm huỷ đăng ký — bắt buộc gọi khi sub unmount */
  subscribe(listener: (locale: AppLocale) => void): () => void
}
```

| Mục | Giá trị |
|---|---|
| Prop truyền vào sub | `localeBridge` |
| Mã ngôn ngữ | `vi`, `en`, `ko`, `zh`, `ja` |
| Mặc định | `vi` |
| Khoá localStorage | `currentLanguage` (giống CMS cũ). Chỉ host ghi; sub chỉ đọc khi chạy độc lập |
| Header API `accept-language` | `vi`, `en`, `kr` (ko), `cn` (zh); `ja` không gửi |

`version` chỉ tăng khi contract đổi theo kiểu không tương thích ngược. Sub nên kiểm tra `version === 1` và bỏ qua bridge (dùng chế độ chạy độc lập) nếu không khớp.

## Sub phải làm

1. Khởi tạo i18n của mình với `props.localeBridge?.getLocale()`. Không có bridge (chạy độc lập) thì đọc `localStorage.currentLanguage`, rồi tới `'vi'`.
2. Gọi `subscribe` ngay sau khi mount. Trong callback, đổi locale của i18n **và** của các thư viện UI đang dùng (PrimeVue, Element UI, dayjs…).
3. Gọi hàm huỷ trong `unmount`. qiankun mount/unmount sub nhiều lần, quên huỷ là rò bộ nhớ và cập nhật nhầm app đã gỡ.
4. Nhận mã chưa có bản dịch (ví dụ `ja`) thì dùng `fallbackLocale` của chính sub, không báo lỗi.
5. Lỗi trong callback không ảnh hưởng host và các sub khác (host đã bọc `try/catch`), nhưng sub vẫn phải tự xử lý lỗi của mình.

## Mẫu Vue 3 (vue-i18n ≥ 9, qiankun)

```js
// src/i18n.js
import { createI18n } from 'vue-i18n'
import vi from './locales/vi.json'

const LOCALES = ['vi', 'en', 'ko', 'zh', 'ja']
const loaders = import.meta.glob('./locales/*.json') // vite; webpack dùng import(`./locales/${l}.json`)

export const i18n = createI18n({ legacy: false, locale: 'vi', fallbackLocale: 'vi', messages: { vi } })

export async function applyLocale(locale) {
  const target = LOCALES.includes(locale) ? locale : 'vi'
  const load = loaders[`./locales/${target}.json`]
  if (load && !i18n.global.availableLocales.includes(target)) {
    i18n.global.setLocaleMessage(target, (await load()).default)
  }
  i18n.global.locale.value = target // nếu dùng thư viện UI thì đổi locale của nó tại đây
}

export function initialLocale(bridge) {
  if (bridge?.version === 1) return bridge.getLocale()
  try { return localStorage.getItem('currentLanguage') || 'vi' } catch { return 'vi' }
}
```

```js
// src/main.js — lifecycle qiankun
import { createApp } from 'vue'
import { i18n, applyLocale, initialLocale } from './i18n'

let app, stopLocale

async function render(props = {}) {
  const bridge = props.localeBridge?.version === 1 ? props.localeBridge : undefined
  await applyLocale(initialLocale(bridge))
  app = createApp(App).use(i18n)
  app.mount(props.container ? props.container.querySelector('#app') : '#app')
  stopLocale = bridge?.subscribe(applyLocale)
}

export async function mount(props) { await render(props) }
export async function unmount() {
  stopLocale?.()
  stopLocale = undefined
  app.unmount()
  app = null
}
if (!window.__POWERED_BY_QIANKUN__) render()
```

## Mẫu Vue 2 (vue-i18n 8, qiankun)

```js
// src/i18n.js
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import vi from './locales/vi.json'

Vue.use(VueI18n)
const LOCALES = ['vi', 'en', 'ko', 'zh', 'ja']

export const i18n = new VueI18n({ locale: 'vi', fallbackLocale: 'vi', messages: { vi } })

export async function applyLocale(locale) {
  const target = LOCALES.includes(locale) ? locale : 'vi'
  if (!i18n.availableLocales.includes(target)) {
    try {
      const messages = await import(/* webpackChunkName: "lang-[request]" */ `./locales/${target}.json`)
      i18n.setLocaleMessage(target, messages.default || messages)
    } catch { /* sub chưa có bản dịch này -> để fallbackLocale xử lý */ }
  }
  i18n.locale = target // Element UI: locale.use(...) tại đây
}
```

```js
// src/main.js
let instance, stopLocale

async function render(props = {}) {
  const bridge = props.localeBridge && props.localeBridge.version === 1 ? props.localeBridge : null
  let locale = 'vi'
  if (bridge) locale = bridge.getLocale()
  else { try { locale = localStorage.getItem('currentLanguage') || 'vi' } catch (e) { /* bỏ qua */ } }
  await applyLocale(locale)
  instance = new Vue({ i18n, router, store, render: h => h(App) })
    .$mount(props.container ? props.container.querySelector('#app') : '#app')
  stopLocale = bridge ? bridge.subscribe(applyLocale) : null
}

export async function mount(props) { await render(props) }
export async function unmount() {
  if (stopLocale) stopLocale()
  stopLocale = null
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
}
```

Nếu Vue 2 sub đang ở `vue-i18n@8` cũ hơn 8.10 (chưa có `availableLocales`), dùng `Object.keys(i18n.messages)` thay thế.

## Phía host

```ts
import { localeBridge } from '@/i18n/locale-bridge'

registerMicroApps([
  { name: 'report-vue3', entry: '//localhost:7101', container: '#subapp', activeRule: '/reports', props: { localeBridge } },
  // ...3 sub còn lại, cùng prop
])
```

Đổi ngôn ngữ ở host: gọi `setLocale(locale)` trong [`src/i18n/index.ts`](../src/i18n/index.ts). Hàm này nạp bản dịch của host, đặt `<html lang>`, lưu `currentLanguage`, rồi báo tất cả sub qua bridge.

## Chuyển `fabi-cms-sub-vue3` sang cách mới

Trong giai đoạn sub vẫn phải chạy dưới host Vue 2 cũ (host cũ truyền `props.i18n`), sub ưu tiên `props.localeBridge` nếu có. Nếu không có bridge thì sub tạo instance riêng với locale lấy từ `props.i18n.locale`, và vẫn không dùng messages của host. Khi đã gom key về file dịch riêng của sub thì bỏ `tOr`.

## Checklist cho team sub

- [ ] Có `vue-i18n` và file dịch riêng, ít nhất `vi`
- [ ] Đọc locale ban đầu từ `props.localeBridge`, fallback `localStorage.currentLanguage`, rồi tới `'vi'`
- [ ] `subscribe` sau khi mount, huỷ trong `unmount`
- [ ] Đổi cả locale của thư viện UI trong callback
- [ ] Không ghi `currentLanguage`, không import gì từ repo host
- [ ] Thử: đổi ngôn ngữ ở host khi sub đang mở → sub đổi theo, không reload; chuyển route ra/vào sub 5 lần → không còn listener thừa
