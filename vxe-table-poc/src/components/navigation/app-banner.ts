import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

// Banner cấp ứng dụng. Bản demo chọn bằng ?banner=expiry | maintenance | incident; bản thật lấy từ API gói và trạng thái hệ thống.
// Sự cố đang diễn ra không cho ẩn; ẩn chỉ có hiệu lực trong phiên đang mở.
export const BANNERS = {
  expiry: { tone: 'warning', icon: 'goi-pro', dismissible: true, params: { plan: 'Cafe so 1 pro', days: 5, date: '18/10/2026' } },
  maintenance: { tone: 'info', icon: 'thong-tin', dismissible: true, params: { from: '23:00', to: '23:30', date: '14/10/2026' } },
  incident: { tone: 'danger', icon: 'canh-bao', dismissible: false, params: { channel: 'ShopeeFood' } },
} as const
export type BannerKind = keyof typeof BANNERS

// Dùng chung giữa shell (vẽ banner) và các màn hình (ẩn lối tắt trùng với banner, ví dụ nút gia hạn trên dashboard)
const dismissed = ref(new Set<BannerKind>())

export function useAppBanner() {
  const route = useRoute()
  const kind = computed(() => {
    const value = route.query.banner
    return typeof value === 'string' && value in BANNERS && !dismissed.value.has(value as BannerKind) ? value as BannerKind : undefined
  })
  const dismiss = (value: BannerKind) => { dismissed.value.add(value) }
  return { kind, dismiss }
}
