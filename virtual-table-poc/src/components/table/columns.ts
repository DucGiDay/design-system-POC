import { h } from 'vue'
import { columnOrderingFeature, columnSizingFeature, createColumnHelper, tableFeatures } from '@tanstack/vue-table'
import type { Order } from '@/mock/orders'
import StatusBadge from './StatusBadge.vue'

export interface OrderColumnMeta {
  align?: 'start' | 'end'
  /** Cột co giãn, chiếm phần chiều ngang còn dư */
  grow?: boolean
}

export const DRAG_HANDLE_COLUMN_ID = 'drag-handle'

// TanStack Table v9: chỉ đăng ký feature cần dùng (tree-shaking + type an toàn)
export const features = tableFeatures({
  columnOrderingFeature,
  columnSizingFeature,
  columnMeta: {} as OrderColumnMeta,
})

const helper = createColumnHelper<typeof features, Order>()

// Formatter tạo một lần, dùng lại cho mọi ô
const priceFormatter = new Intl.NumberFormat('vi-VN')
const pad2 = (value: number) => String(value).padStart(2, '0')

function formatDateTime(timestamp: number) {
  const d = new Date(timestamp)
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** Lucide grip-vertical */
export function gripIcon(size = 16) {
  return h(
    'svg',
    { viewBox: '0 0 24 24', width: size, height: size, fill: 'currentColor', 'aria-hidden': 'true' },
    [9, 15].flatMap((cx) => [5, 12, 19].map((cy) => h('circle', { cx, cy, r: 1.6 }))),
  )
}

export const columns = helper.columns([
  helper.display({
    id: DRAG_HANDLE_COLUMN_ID,
    size: 44,
    header: () => h('span', { class: 'fb-sr-only' }, 'Kéo thả hàng'),
    // `.vt-row-handle` là dragHandle của FormKit: chỉ kéo được khi nắm vào đây
    cell: () =>
      h(
        'button',
        {
          type: 'button',
          class:
            'vt-row-handle fb-flex fb-size-7 fb-cursor-grab fb-items-center fb-justify-center fb-rounded-sm fb-text-ink-faint hover:fb-bg-field hover:fb-text-ink-2 active:fb-cursor-grabbing focus-visible:fb-outline-none focus-visible:fb-ring-[3px] focus-visible:fb-ring-primary-soft',
          'aria-label': 'Kéo để đổi vị trí hàng',
          title: 'Kéo để đổi vị trí',
        },
        [gripIcon()],
      ),
  }),
  helper.accessor('id', {
    header: 'ID',
    size: 72,
    cell: (info) => h('span', { class: 'fb-tabular-nums fb-text-ink-muted' }, info.getValue()),
  }),
  helper.accessor('code', {
    header: 'Mã đơn',
    size: 112,
    cell: (info) => h('span', { class: 'fb-font-semibold fb-tabular-nums fb-text-ink' }, info.getValue()),
  }),
  helper.accessor('name', {
    header: 'Sản phẩm',
    size: 280,
    meta: { grow: true },
    cell: (info) => h('span', { class: 'fb-truncate fb-text-ink-2' }, info.getValue()),
  }),
  helper.accessor('category', {
    header: 'Danh mục',
    size: 136,
    cell: (info) => h('span', { class: 'fb-truncate fb-text-ink-2' }, info.getValue()),
  }),
  helper.accessor('price', {
    header: 'Đơn giá',
    size: 128,
    meta: { align: 'end' },
    cell: (info) =>
      h('span', { class: 'fb-tabular-nums fb-text-ink' }, `${priceFormatter.format(info.getValue())} ₫`),
  }),
  helper.accessor('status', {
    header: 'Trạng thái',
    size: 128,
    cell: (info) => h(StatusBadge, { status: info.getValue() }),
  }),
  helper.accessor('createdAt', {
    header: 'Ngày tạo',
    size: 148,
    cell: (info) => h('span', { class: 'fb-tabular-nums fb-text-ink-muted' }, formatDateTime(info.getValue())),
  }),
])
