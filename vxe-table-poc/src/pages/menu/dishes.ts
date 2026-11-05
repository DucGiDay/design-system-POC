// Dữ liệu mẫu "Món ăn tại thành phố" (Figma MA01 / MA05). Thay bằng API thật: giữ nguyên chữ ký fetchCityDishes / getCityDish.

export interface CityDish {
  id: string
  code: string
  name: string
  image?: string
  price: number
  vat: number
  group: string
  type?: string
  unit: string
  unit2?: string
  sideDish: boolean
  city: string
  /** Số món đã cấu hình buffet; 0 = chưa cấu hình */
  buffetCount: number
  customization?: string
  active: boolean
}

export interface CityDishDetail extends CityDish {
  sku?: string
  barcode?: string
  description?: string
  prepMinutes: number
  noSideDishQty: boolean
  allowEditPrice: boolean
  requireQty: boolean
  allowRemoveWithoutPermission: boolean
  allowRemoveBeforeBill: boolean
  isVirtual: boolean
  isBuffetTicket: boolean
  excludedFromBuffet: number
  buffetUpsize: number
  inQrFormula?: string
  isService: boolean
  serviceQty: number
  serviceOverPrice: number
  sourcePrices: { source: string; price: number }[]
  customizationItems: { name: string; code: string; price: number }[]
  days: number[]
  hours: number[]
  sortOrder?: number
}

export const cities = ['Hà Nội', 'Đà Nẵng', 'Hồ Chí Minh', 'Cần Thơ']
export const dishGroups = ['123', 'Gọi thêm', 'Uncategory', 'Coffee', 'Món chính']
export const dishTypes = ['Thịt', 'Hải sản', 'Rau', 'Đồ uống']
export const units = ['Món', 'Ấm', 'Giờ', 'Phần', 'Cốc']

// 10 dòng đầu khớp ảnh Figma; phần còn lại sinh theo seed cố định để phân trang ổn định.
const seed: Partial<CityDish>[] = [
  { code: 'ITEM_HP2E', name: 'Món ten dài dài công tằng tôn nữ cung đình huế', price: 10_000, group: '123', buffetCount: 5, customization: 'custom test', city: 'Đà Nẵng' },
  { code: 'ITEM_HP2F', name: 'Món ten dài dài công tằng tôn nữ cung đình huế', price: 10_000, group: '123' },
  { code: 'ITEM_HP2G', name: 'Món ten dài dài công tằng tôn nữ cung đình huế', price: 10_000, group: '123' },
  { code: 'ITEM_18NW', name: 'Test ko tạo món hg', price: 10_000, group: '123' },
  { code: 'ITEM_18NX', name: 'Test sửa to native', price: 10_000, group: '123' },
  { code: 'FLU', name: 'flu', price: 1_000, vat: 8, group: 'Gọi thêm', type: 'Thịt', unit: 'Ấm', unit2: 'Bao', active: false },
  { code: 'ITEM-7TL0', name: 'vé 200k', price: 200_000, group: 'Uncategory', buffetCount: 12 },
  { code: 'ITEM-96EW', name: 'Nóng cop', price: 0, group: 'Coffee' },
  { code: 'ITEM-UHV8', name: 'Cơm hải sản', price: 40_000, group: 'Món chính', sideDish: true },
  { code: 'ITEM-ISXF', name: 'món giờ', price: 40_000, group: 'Uncategory', unit: 'Giờ' },
]
const names = ['Phở bò tái', 'Bún chả Hà Nội', 'Cà phê sữa đá', 'Trà đào cam sả', 'Gỏi cuốn tôm', 'Bánh xèo', 'Cơm gà xối mỡ', 'Lẩu thái', 'Sinh tố bơ', 'Mì Quảng']
const code = (index: number) => `ITEM-${(index * 7919).toString(36).toUpperCase().padStart(4, '0').slice(-4)}`

const all: CityDish[] = Array.from({ length: 173 }, (_, index) => {
  const base = seed[index] ?? {}
  return {
    id: base.code ?? code(index),
    code: base.code ?? code(index),
    name: base.name ?? `${names[index % names.length]} ${Math.floor(index / names.length) + 1}`,
    image: index % 3 === 2 ? undefined : `${import.meta.env.BASE_URL}mock-dish.jpg`,
    price: base.price ?? 15_000 + (index % 9) * 5_000,
    vat: base.vat ?? (index > 10 && index % 11 === 0 ? 8 : 0),
    group: base.group ?? dishGroups[index % dishGroups.length]!,
    type: base.type ?? (index > 10 && index % 4 === 0 ? dishTypes[index % dishTypes.length] : undefined),
    unit: base.unit ?? 'Món',
    unit2: base.unit2,
    sideDish: base.sideDish ?? index % 13 === 0,
    city: base.city ?? cities[index % cities.length]!,
    buffetCount: base.buffetCount ?? (index % 5 === 0 ? index % 7 : 0),
    customization: base.customization ?? (index % 6 === 0 ? 'topping 23' : undefined),
    active: base.active ?? index % 17 !== 5,
  }
})

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const searchable = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()

export interface CityDishQuery { page: number; pageSize: number; query?: string; city?: string; group?: string }
export async function fetchCityDishes({ page, pageSize, query, city, group }: CityDishQuery) {
  await delay(180)
  const term = searchable(query?.trim() ?? '')
  const rows = all.filter(dish =>
    (!term || searchable(`${dish.name} ${dish.code}`).includes(term))
    && (!city || dish.city === city)
    && (!group || dish.group === group))
  return { items: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length }
}

export async function setCityDishActive(id: string, active: boolean) {
  await delay(120)
  const dish = all.find(item => item.id === id)
  if (dish) dish.active = active
}

export async function getCityDish(id: string): Promise<CityDishDetail | undefined> {
  await delay(150)
  const dish = all.find(item => item.id === id)
  if (!dish) return undefined
  return {
    ...dish,
    prepMinutes: 0,
    noSideDishQty: false,
    allowEditPrice: false,
    requireQty: false,
    allowRemoveWithoutPermission: false,
    allowRemoveBeforeBill: false,
    isVirtual: false,
    isBuffetTicket: true,
    excludedFromBuffet: 0,
    buffetUpsize: 0,
    isService: true,
    serviceQty: 1,
    serviceOverPrice: 0,
    sourcePrices: [{ source: 'GRABFOOD', price: 12_000 }, { source: 'SHOPEEFOOD', price: 12_000 }, { source: 'ZALO', price: 9_000 }],
    customization: dish.customization ?? 'topping 23',
    customizationItems: [{ name: 'bò lát mỏng', code: 'ITEM-WZ0K', price: 20_000 }, { name: 'gà xé sợi', code: 'ITEM-9UEQ', price: 10_000 }],
    days: [4, 8],
    hours: [4, 6, 18],
  }
}
