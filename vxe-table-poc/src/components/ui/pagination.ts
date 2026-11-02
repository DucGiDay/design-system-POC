export type PageItem = number | 'gap-start' | 'gap-end'

/**
 * Danh sách nút trang, luôn 7 ô khi nhiều trang để thanh phân trang không nhảy độ rộng:
 * 1 2 3 4 5 … 20 · 1 … 9 10 11 … 20 · 1 … 16 17 18 19 20
 */
export function pageItems(current: number, count: number): PageItem[] {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1)
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => from + index)
  if (current <= 4) return [...range(1, 5), 'gap-end', count]
  if (current >= count - 3) return [1, 'gap-start', ...range(count - 4, count)]
  return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', count]
}
