export type Status = 'Success' | 'Warning' | 'Danger'
export interface ProductRecord {
  id: number
  code: string
  name: string
  category: string
  price: number
  status: Status
  createdAt: string
}

const products = [
  ['Cà phê sữa đá', 'Cà phê', 35000],
  ['Trà đào cam sả', 'Trà trái cây', 45000],
  ['Bánh croissant', 'Bánh ngọt', 39000],
  ['Matcha latte', 'Trà sữa', 55000],
  ['Nước ép cam', 'Nước ép', 49000],
  ['Cà phê đen', 'Cà phê', 29000],
] as const
const statuses: Status[] = ['Success', 'Warning', 'Danger']

/** Deterministic mock records; IDs remain unique across appended batches. */
export function createRecords(startId: number, count: number): ProductRecord[] {
  return Array.from({ length: count }, (_, index) => {
    const id = startId + index
    const [name, category, price] = products[(id - 1) % products.length]!
    return {
      id, code: `SP-${String(id).padStart(6, '0')}`, name, category,
      price: price + (id % 5) * 1000,
      status: statuses[(id - 1) % statuses.length]!,
      createdAt: new Date(Date.UTC(2026, 0, 1) + ((id - 1) % 300) * 86400000).toISOString().slice(0, 10),
    }
  })
}
