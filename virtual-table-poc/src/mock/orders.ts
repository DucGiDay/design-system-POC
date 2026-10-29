export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'paused'

export interface Order {
  id: number
  code: string
  name: string
  category: string
  /** VND */
  price: number
  status: OrderStatus
  /** epoch ms — rẻ hơn giữ Date object cho 10k dòng */
  createdAt: number
}

export interface OrderPage {
  items: Order[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export const TOTAL_ORDERS = 10_000
export const PAGE_SIZE = 50

interface CategorySeed {
  name: string
  dishes: string[]
  /** khoảng giá, đơn vị nghìn đồng */
  price: [number, number]
}

const CATEGORIES: CategorySeed[] = [
  {
    name: 'Đồ uống',
    dishes: ['Trà sữa trân châu', 'Cà phê sữa đá', 'Trà đào cam sả', 'Bạc xỉu', 'Matcha latte', 'Sinh tố bơ', 'Nước ép cam'],
    price: [25, 69],
  },
  {
    name: 'Món chính',
    dishes: ['Phở bò tái', 'Cơm tấm sườn bì', 'Bún chả Hà Nội', 'Bún bò Huế', 'Mì xào hải sản', 'Cơm gà xối mỡ'],
    price: [45, 129],
  },
  {
    name: 'Khai vị',
    dishes: ['Gỏi cuốn tôm thịt', 'Chả giò rế', 'Súp cua', 'Gỏi ngó sen', 'Khoai tây chiên'],
    price: [35, 89],
  },
  {
    name: 'Tráng miệng',
    dishes: ['Chè khúc bạch', 'Bánh flan', 'Kem dừa', 'Panna cotta chanh dây', 'Sữa chua nếp cẩm'],
    price: [19, 55],
  },
  {
    name: 'Bánh mì',
    dishes: ['Bánh mì thịt nướng', 'Bánh mì chả cá', 'Bánh mì ốp la', 'Bánh mì xíu mại'],
    price: [20, 45],
  },
  {
    name: 'Combo',
    dishes: ['Combo trưa văn phòng', 'Combo gia đình', 'Combo đôi', 'Combo sinh nhật'],
    price: [99, 459],
  },
]

const VARIANTS = ['Size M', 'Size L', 'Ít đá', 'Thêm topping', 'Phần lớn', 'Mang đi', 'Tại quán', 'Không cay']

/** Cộng dồn trọng số: hoàn tất 45%, đang làm 20%, chờ 20%, huỷ 8%, tạm ngưng 7% */
const STATUS_WEIGHTS: Array<[OrderStatus, number]> = [
  ['completed', 0.45],
  ['processing', 0.65],
  ['pending', 0.85],
  ['cancelled', 0.93],
  ['paused', 1],
]

/** Mốc thời gian cố định để dữ liệu giống hệt nhau giữa các lần reload */
const NEWEST_ORDER_AT = Date.UTC(2026, 9, 28, 4, 30)
const MINUTE = 60_000

/** PRNG có seed: cùng id → cùng record, không cần sinh trước cả 10k dòng */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(items: readonly T[], rand: () => number): T {
  return items[Math.floor(rand() * items.length)]!
}

export function createOrder(id: number): Order {
  const rand = mulberry32(id * 2654435761)
  const category = pick(CATEGORIES, rand)
  const [minPrice, maxPrice] = category.price
  const roll = rand()

  return {
    id,
    code: `DH${String(id).padStart(6, '0')}`,
    name: `${pick(category.dishes, rand)} · ${pick(VARIANTS, rand)}`,
    category: category.name,
    price: Math.round(minPrice + rand() * (maxPrice - minPrice)) * 1000,
    status: STATUS_WEIGHTS.find(([, upTo]) => roll < upTo)?.[0] ?? 'completed',
    // Mới nhất trước: mỗi đơn cách nhau 1–6 phút
    createdAt: NEWEST_ORDER_AT - (id - 1) * 3.5 * MINUTE - Math.floor(rand() * 150) * 1000,
  }
}

/** Sinh đồng bộ một dải record liên tiếp, id bắt đầu từ `startId` */
export function generateOrders(startId: number, count: number): Order[] {
  const end = Math.min(startId + count - 1, TOTAL_ORDERS)
  const items: Order[] = []
  for (let id = startId; id <= end; id++) items.push(createOrder(id))
  return items
}

/** Giả lập API phân trang (page bắt đầu từ 1) có độ trễ mạng */
export function fetchOrderPage(page: number, pageSize = PAGE_SIZE, delayMs = 350): Promise<OrderPage> {
  const items = generateOrders((page - 1) * pageSize + 1, pageSize)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        items,
        page,
        pageSize,
        total: TOTAL_ORDERS,
        hasMore: page * pageSize < TOTAL_ORDERS,
      })
    }, delayMs)
  })
}
