import { initGlobalState, type MicroAppStateActions } from 'qiankun'

// Dữ liệu host chia sẻ cho sub-app. Cùng khoá và cùng cách lấy với host Vue 2
// (ipos-cms-pos-android/src/main.js: syncConfig) để 3 sub chạy được ở cả 2 host mà không phải sửa.
// Nguồn là localStorage chung của domain (host Vue 2 và host này cùng origin trên server).
export interface SharedState {
  brandUid: string | null
  currentBrand: Record<string, any>
  currentUser: Record<string, any>
  customReportTypesIndexObj: Record<string, number>
}

interface SubMessage { type: string; payload?: any; ts?: number }

const readJson = <T>(key: string): T | null => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') as T | null
  } catch {
    return null
  }
}

const readUser = () => readJson<Record<string, any>>('user') ?? {}

// Thương hiệu đang chọn: host Vue 2 lưu ở current_brand. Phiên đăng nhập ở host này chưa có
// bước chọn thương hiệu nên lấy thương hiệu đầu tiên của user.
const readBrand = (user: Record<string, any>) => readJson<Record<string, any>>('current_brand') ?? user.brands?.[0] ?? {}

// Như getUserAllowedCustomReports (ipos-cms-pos-android/src/helpers/report.js)
const customReportTypes = (user: Record<string, any>): Record<string, number> =>
  ([...(user.company?.extra_data?.report_type ?? [])] as string[])
    .filter(type => !['AEON', 'GONGCHA', 'DAILY'].includes(type))
    .sort()
    .reduce((acc, type, index) => ({ ...acc, [type]: index + 1 }), {})

export function readSharedState(): SharedState {
  const user = readUser()
  const brand = readBrand(user)
  return {
    brandUid: brand.id ?? null,
    currentBrand: brand,
    currentUser: user,
    customReportTypesIndexObj: customReportTypes(user),
  }
}

export const actions: MicroAppStateActions = initGlobalState({ ...readSharedState(), messageFromSub: null })

let lastPushed = ''
/** Đẩy lại state khi phiên đổi (đăng nhập, đăng xuất, sub sửa thương hiệu). Không đổi thì bỏ qua. */
export function pushSharedState() {
  const next = readSharedState()
  const serialized = JSON.stringify(next)
  if (serialized === lastPushed) return
  lastPushed = serialized
  // Clone để qiankun nhận reference mới và emit sang sub
  actions.setGlobalState(JSON.parse(serialized))
}

// Kênh sub → host: sub gửi actions.setGlobalState({ messageFromSub: { type, payload, ts } }).
// Cùng tên lệnh với host Vue 2. Lệnh host này chưa có màn tương ứng (SET_GUIDE_STEP) thì bỏ qua.
const SUB_MESSAGE_HANDLERS: Record<string, (payload: any) => void> = {
  // Sub sửa danh sách nhà hàng ⇒ thay cities của thương hiệu đang chọn
  UPDATE_CURRENT_BRAND: ({ cities, brandUid } = {}) => {
    const brand = readBrand(readUser())
    if (!Array.isArray(cities) || !brand.id || (brandUid && brandUid !== brand.id)) return
    localStorage.setItem('current_brand', JSON.stringify({ ...brand, cities }))
    pushSharedState()
  },
  // Sub tạo / sửa / ngừng nhà hàng ⇒ thay brands của user
  UPDATE_USER_BRANDS: ({ brands, brandUid } = {}) => {
    const user = readUser()
    const brand = readBrand(user)
    if (!Array.isArray(brands) || !brands.length || !brand.id || (brandUid && brandUid !== brand.id)) return
    localStorage.setItem('user', JSON.stringify({ ...user, brands }))
    pushSharedState()
  },
}

let lastMessageTs: number | undefined
actions.onGlobalStateChange(({ messageFromSub }) => {
  // Sub gửi chuỗi "pong" lúc mount — không phải lệnh
  const message = messageFromSub as SubMessage | string | null
  if (!message || typeof message !== 'object' || message.ts == null || message.ts === lastMessageTs) return
  lastMessageTs = message.ts
  SUB_MESSAGE_HANDLERS[message.type]?.(message.payload)
})

// Phiên đổi trong tab này (session.ts bắn updateStorage) hoặc tab khác (storage)
window.addEventListener('updateStorage', pushSharedState)
window.addEventListener('storage', pushSharedState)
