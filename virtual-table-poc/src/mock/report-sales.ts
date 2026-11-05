// Dữ liệu giả lập cỡ lớn cho các báo cáo (dòng hoá đơn bán hàng). File này GIỐNG HỆT ở cả 2 POC
// (virtual-table-poc / vxe-table-poc) để số đo hiệu năng so sánh được với nhau.
//
// - Sinh tất định (PRNG có seed): reload hay đổi POC đều ra cùng dữ liệu.
// - Chuỗi lặp lại (cửa hàng, món, nhân viên…) dùng chung tham chiếu, mỗi dòng chỉ tạo mới mã hoá đơn
//   → 1.000.000 dòng ≈ 150–250MB heap tuỳ trình duyệt, đủ "nặng" để thấy khác biệt giữa hai thư viện.

export type SalesStatus = 'completed' | 'cancelled' | 'refunded'

export interface SalesLine {
  id: number
  invoice: string
  /** epoch ms */
  time: number
  store: string
  city: string
  channel: string
  staff: string
  dish: string
  group: string
  qty: number
  /** VND */
  price: number
  discount: number
  vat: number
  amount: number
  payment: string
  status: SalesStatus
}

/** Số dòng cho nút chọn nhanh trên trang báo cáo */
export const SALES_PRESETS = [10_000, 100_000, 300_000, 1_000_000] as const
export const DEFAULT_SALES_ROWS = 100_000

const STORES: [string, string][] = [
  ['Chanh Dev Hoàn Kiếm', 'Hà Nội'], ['Chanh Dev Cầu Giấy', 'Hà Nội'], ['Chanh Dev Tây Hồ', 'Hà Nội'],
  ['Chanh Dev Hải Châu', 'Đà Nẵng'], ['Chanh Dev Sơn Trà', 'Đà Nẵng'],
  ['Chanh Dev Quận 1', 'Hồ Chí Minh'], ['Chanh Dev Quận 3', 'Hồ Chí Minh'], ['Chanh Dev Thảo Điền', 'Hồ Chí Minh'], ['Chanh Dev Phú Nhuận', 'Hồ Chí Minh'],
  ['Chanh Dev Ninh Kiều', 'Cần Thơ'], ['Chanh Dev Cái Răng', 'Cần Thơ'], ['Chanh Dev Bình Thạnh', 'Hồ Chí Minh'],
]
const CHANNELS = ['Tại quán', 'Mang đi', 'GrabFood', 'ShopeeFood', 'Zalo', 'Website']
const STAFF = ['Nguyễn An', 'Trần Bình', 'Lê Chi', 'Phạm Dũng', 'Hoàng Giang', 'Vũ Hà', 'Đặng Khoa', 'Bùi Linh', 'Đỗ Minh', 'Ngô Nga', 'Dương Phúc', 'Lý Quân']
const MENU: [string, string, number][] = [
  ['Phở bò tái', 'Món chính', 65_000], ['Bún chả Hà Nội', 'Món chính', 55_000], ['Cơm tấm sườn bì', 'Món chính', 59_000],
  ['Bún bò Huế', 'Món chính', 62_000], ['Mì Quảng', 'Món chính', 55_000], ['Cơm gà xối mỡ', 'Món chính', 52_000],
  ['Gỏi cuốn tôm thịt', 'Khai vị', 45_000], ['Chả giò rế', 'Khai vị', 49_000], ['Súp cua', 'Khai vị', 39_000],
  ['Cà phê sữa đá', 'Đồ uống', 29_000], ['Bạc xỉu', 'Đồ uống', 32_000], ['Trà đào cam sả', 'Đồ uống', 45_000],
  ['Matcha latte', 'Đồ uống', 55_000], ['Sinh tố bơ', 'Đồ uống', 49_000], ['Nước ép cam', 'Đồ uống', 39_000],
  ['Chè khúc bạch', 'Tráng miệng', 35_000], ['Bánh flan', 'Tráng miệng', 25_000], ['Kem dừa', 'Tráng miệng', 39_000],
  ['Combo trưa văn phòng', 'Combo', 99_000], ['Combo gia đình', 'Combo', 459_000],
]
const PAYMENTS = ['Tiền mặt', 'Thẻ ngân hàng', 'MoMo', 'VNPAY-QR', 'Chuyển khoản']

/** mulberry32: PRNG 32-bit nhanh, đủ đều cho dữ liệu giả lập */
function random(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Mốc cố định: dòng 1 là mới nhất, các dòng sau lùi dần (trung bình ~45 giây / dòng) */
const NEWEST = Date.UTC(2026, 9, 31, 14, 0)

let cache: SalesLine[] = []
const next = random(20261104)

function grow(count: number) {
  for (let id = cache.length + 1; id <= count; id++) {
    const [store, city] = STORES[Math.floor(next() * STORES.length)]!
    const [dish, group, base] = MENU[Math.floor(next() * MENU.length)]!
    const roll = next()
    const qty = roll < 0.7 ? 1 : roll < 0.9 ? 2 : 3 + Math.floor(next() * 5)
    const price = base + (next() < 0.25 ? 5_000 : 0)
    const discount = next() < 0.18 ? Math.round(price * qty * 0.1 / 1000) * 1000 : 0
    const vat = Math.round((price * qty - discount) * 0.08)
    const statusRoll = next()
    cache.push({
      id,
      invoice: `HD${String(1_000_000 + Math.ceil(id / 3)).slice(1)}`,
      time: NEWEST - id * 45_000 - Math.floor(next() * 30_000),
      store,
      city,
      channel: CHANNELS[Math.floor(next() * CHANNELS.length)]!,
      staff: STAFF[Math.floor(next() * STAFF.length)]!,
      dish,
      group,
      qty,
      price,
      discount,
      vat,
      amount: price * qty - discount + vat,
      payment: PAYMENTS[Math.floor(next() * PAYMENTS.length)]!,
      status: statusRoll < 0.94 ? 'completed' : statusRoll < 0.98 ? 'cancelled' : 'refunded',
    })
  }
}

/**
 * Trả về `count` dòng đầu tiên (mảng mới mỗi lần để bảng nhận là dữ liệu mới).
 * Dòng đã sinh được giữ lại: đổi 100k → 1M chỉ sinh thêm phần thiếu.
 */
export function getSalesRows(count: number): { rows: SalesLine[]; generateMs: number } {
  const start = performance.now()
  if (cache.length < count) grow(count)
  const rows = cache.slice(0, count)
  return { rows, generateMs: performance.now() - start }
}

/** Giải phóng dữ liệu đã sinh (dùng khi đo heap) */
export function resetSalesRows() {
  cache = []
}

const searchable = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()
/** Cột được tìm kiếm toàn cục — hai POC dùng cùng danh sách */
export const SEARCH_FIELDS = ['invoice', 'store', 'staff', 'dish', 'channel'] as const
/** Bộ lọc tìm kiếm thuần JS, bỏ dấu, dùng cho POC nào không có bộ lọc toàn cục dựng sẵn */
export function filterSalesRows(rows: SalesLine[], query: string): SalesLine[] {
  const term = searchable(query.trim())
  if (!term) return rows
  return rows.filter(row => SEARCH_FIELDS.some(field => searchable(row[field]).includes(term)))
}
export const salesSearchable = searchable

export interface SalesTotals { qty: number; discount: number; vat: number; amount: number }
export function sumSales(rows: readonly SalesLine[]): SalesTotals {
  let qty = 0, discount = 0, vat = 0, amount = 0
  for (const row of rows) { qty += row.qty; discount += row.discount; vat += row.vat; amount += row.amount }
  return { qty, discount, vat, amount }
}

const two = (value: number) => String(value).padStart(2, '0')
export function formatTime(epoch: number) {
  const date = new Date(epoch)
  return `${two(date.getDate())}/${two(date.getMonth() + 1)}/${date.getFullYear()} ${two(date.getHours())}:${two(date.getMinutes())}`
}
