import { authApi, type SessionPayload } from './auth.api'

// Giữ nguyên khoá localStorage của host Vue 2: sub-app (vd fabi-cms-sub-vue3) đọc
// token/user/fabi-type từ đây, nên đổi khoá là sub mất phiên.
const TOKEN_KEY = 'token'
const USER_KEY = 'user'
const TYPE_KEY = 'fabi-type'

// Phải có đủ cả token lẫn user: user sót lại một mình (token đã bị xoá) không được coi là đăng nhập,
// nếu không route chỉ-cho-khách (/login) sẽ đẩy người dùng về trang chủ mãi
export const hasSession = () => !!localStorage.getItem(TOKEN_KEY) && !!localStorage.getItem(USER_KEY)

/** Lưu phiên giống handleLoginResponse của host cũ: gom store theo thương hiệu → thành phố */
export function saveSession({ user, brands, cities = [], stores = [], token, ...rest }: SessionPayload) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(TYPE_KEY, user?.is_fabi === 3 ? 'box-cms' : 'pos-cms')

  const brandTree = (brands ?? []).map((brand) => {
    const brandStores = stores.filter(store => store.brand_uid === brand.id)
    const cityIds = [...new Set(brandStores.map(store => store.city_uid))]
    return {
      ...brand,
      cities: cityIds.map(cityId => ({
        ...cities.find(city => city.id === cityId),
        stores: brandStores.filter(store => store.city_uid === cityId),
      })),
    }
  })

  const userInfo = { ...user, ...rest, brands: brandTree, company_id: rest.company.company_id }
  localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
  // Sub-app nghe sự kiện này để nạp lại phiên (fabi-cms-sub-vue3/src/stores/auth.store.js)
  window.dispatchEvent(new Event('updateStorage'))
}

/** Vào trang đăng nhập khi còn token cũ: báo backend đăng xuất rồi xoá phiên phía client */
export async function endPreviousSession() {
  if (localStorage.getItem(TOKEN_KEY)) {
    try { await authApi.logout() } catch { /* token đã hết hạn thì bỏ qua */ }
  }
  ;[TOKEN_KEY, USER_KEY, TYPE_KEY].forEach(key => localStorage.removeItem(key))
}

/** Đăng xuất chủ động: như processLogout của host cũ nhưng giữ lại lựa chọn ngôn ngữ và cài đặt giao diện */
export async function logout() {
  await endPreviousSession()
  localStorage.removeItem('requireMoreSecurity')
  // Sub-app lưu state theo phiên trong sessionStorage (pinia sessionStoragePlugin)
  sessionStorage.clear()
  window.dispatchEvent(new Event('updateStorage'))
}

const DEFAULT_PASSWORDS = ['123123', '19004766', '123456', '123456789', 'qwerty', 'password', '1234567', '12345678', '12345', 'iloveyou', '111111']

/** Cờ để màn chính nhắc đổi mật khẩu yếu, bật bằng VITE_ENABLE_REQUIRE_CHANGE_PASSWORD như host cũ */
export function flagWeakPassword(password: string) {
  if (import.meta.env.VITE_ENABLE_REQUIRE_CHANGE_PASSWORD && DEFAULT_PASSWORDS.includes(password)) {
    localStorage.setItem('requireMoreSecurity', 'true')
  } else {
    localStorage.removeItem('requireMoreSecurity')
  }
}
