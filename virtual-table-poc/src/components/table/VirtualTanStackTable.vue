<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { FlexRender, functionalUpdate, useTable, type Column, type ColumnOrderState } from '@tanstack/vue-table'
import { defaultRangeExtractor, useVirtualizer, type Range } from '@tanstack/vue-virtual'
import { dragAndDrop, state as dndState, tearDown } from '@formkit/drag-and-drop'
import { fetchOrderPage, generateOrders, PAGE_SIZE, TOTAL_ORDERS, type Order } from '@/mock/orders'
import { columns, DRAG_HANDLE_COLUMN_ID, features, gripIcon } from './columns'

const props = withDefaults(
  defineProps<{
    /** Chiều cao vùng cuộn, tính cả header sticky */
    height?: number
    rowHeight?: number
    pageSize?: number
    /** Còn bấy nhiêu dòng nữa là chạm đáy thì tải trang kế tiếp */
    loadMoreThreshold?: number
    /** Số dòng render dư phía trên/dưới viewport */
    overscan?: number
  }>(),
  { height: 600, rowHeight: 44, pageSize: PAGE_SIZE, loadMoreThreshold: 4, overscan: 3 },
)

const GripIcon = () => gripIcon(14)
const countFormatter = new Intl.NumberFormat('vi-VN')

// ─── Data ────────────────────────────────────────────────────────────────────
// shallowRef: Vue không deep-proxy hàng nghìn object; chỉ thay cả mảng mới trigger.
const rows = shallowRef<Order[]>([])
const total = ref<number | null>(null)
const loadedPages = ref(0)
const isLoading = ref(false)
const loadError = ref<string | null>(null)
const hasMore = computed(() => total.value === null || rows.value.length < total.value)

async function loadNextPage() {
  if (isLoading.value || !hasMore.value) return
  isLoading.value = true
  loadError.value = null
  try {
    const page = await fetchOrderPage(loadedPages.value + 1, props.pageSize)
    // Append = 1 lần gán. Hàng cũ giữ nguyên reference và vị trí, virtualizer chỉ
    // tăng count → scrollTop không đổi, không giật khung hình.
    rows.value = rows.value.concat(page.items)
    loadedPages.value = page.page
    total.value = page.total
  } catch (cause) {
    loadError.value = 'Không tải được dữ liệu. Chọn “Thử lại” để tiếp tục.'
    console.error(cause)
  } finally {
    isLoading.value = false
  }
}

/** Stress test: nạp nốt tới 10.000 dòng trong một lần gán */
function loadAll() {
  if (isLoading.value || !hasMore.value) return
  const loaded = rows.value.length
  loadError.value = null
  rows.value = rows.value.concat(generateOrders(loaded + 1, TOTAL_ORDERS - loaded))
  loadedPages.value = Math.ceil(TOTAL_ORDERS / props.pageSize)
  total.value = TOTAL_ORDERS
}

// ─── TanStack Table (headless) ───────────────────────────────────────────────
// [] = thứ tự tự nhiên theo định nghĩa cột
const columnOrder = ref<ColumnOrderState>([])

const table = useTable({
  features,
  columns,
  data: rows,
  getRowId: (row: Order) => String(row.id),
  state: computed(() => ({ columnOrder: columnOrder.value })),
  onColumnOrderChange: (updater) => {
    columnOrder.value = functionalUpdate(updater, columnOrder.value)
  },
})

const naturalColumnOrder = table
  .getAllLeafColumns()
  .map((column) => column.id)
  .join('|')
const headers = computed(() => table.getHeaderGroups()[0]?.headers ?? [])
const tableRows = computed(() => table.getRowModel().rows)
const totalWidth = computed(() => table.getTotalSize())
/** Khoá cho v-memo: chỉ khi đổi thứ tự cột thì các hàng đang hiển thị mới render lại */
const columnOrderKey = computed(() => columnOrder.value.join('|'))
const isColumnOrderChanged = computed(
  () => columnOrder.value.length > 0 && columnOrderKey.value !== naturalColumnOrder,
)

function cellStyle(column: Column<typeof features, Order, unknown>) {
  return {
    width: `${column.getSize()}px`,
    flex: column.columnDef.meta?.grow ? '1 0 auto' : 'none',
  }
}

// ─── Virtualizer ─────────────────────────────────────────────────────────────
const scrollEl = useTemplateRef<HTMLDivElement>('scrollEl')
const tbodyEl = useTemplateRef<HTMLTableSectionElement>('tbodyEl')
const headerRowEl = useTemplateRef<HTMLTableRowElement>('headerRowEl')

/** Index của hàng đang kéo. Hàng này luôn được giữ trong DOM dù đã trôi khỏi viewport. */
const draggingIndex = ref<number | null>(null)

const rowVirtualizer = useVirtualizer(
  computed(() => {
    // Đọc ở đây (không phải trong closure) để rangeExtractor đổi identity khi ghim hàng khác
    const pinnedIndex = draggingIndex.value
    return {
      count: rows.value.length,
      getScrollElement: () => scrollEl.value,
      // Chiều cao cố định → không phải đo DOM (measureElement) khi cuộn
      estimateSize: () => props.rowHeight,
      overscan: props.overscan,
      rangeExtractor: (range: Range) => {
        const indexes = defaultRangeExtractor(range)
        if (pinnedIndex === null || pinnedIndex >= range.count || indexes.includes(pinnedIndex)) return indexes
        return [...indexes, pinnedIndex].sort((a, b) => a - b)
      },
    }
  }),
)

const visibleRows = computed(() =>
  rowVirtualizer.value.getVirtualItems().flatMap((item) => {
    const row = tableRows.value[item.index]
    return row ? [{ index: item.index, start: item.start, size: item.size, row }] : []
  }),
)
const totalHeight = computed(() => rowVirtualizer.value.getTotalSize())

// ─── Infinite scroll ─────────────────────────────────────────────────────────
// `range` là vùng đang nhìn thấy (không gồm overscan), virtualizer chỉ notify khi
// range đổi chứ không phải mỗi pixel cuộn.
const isNearBottom = computed(() => {
  const endIndex = rowVirtualizer.value.range?.endIndex
  return endIndex !== undefined && endIndex >= rows.value.length - 1 - props.loadMoreThreshold
})

// Theo dõi cả isLoading: tải xong mà vẫn ở gần đáy (viewport cao hơn một trang) thì
// tải tiếp. Đang lỗi thì ngừng tự tải, chờ "Thử lại" để không lặp request hỏng.
watch([isNearBottom, isLoading], ([near, loading]) => {
  if (near && !loading && !loadError.value) void loadNextPage()
})

// ─── Kéo thả (@formkit/drag-and-drop) ────────────────────────────────────────
const DND_CLONE_ID = 'dnd-dragged-node-clone'

function dataIndexOf(el: Element) {
  return Number((el as HTMLElement).dataset.index)
}

/** Các <tr> thật đang có trong DOM (bỏ qua bản clone khi kéo bằng cảm ứng) */
function renderedRowEls(parent: HTMLElement) {
  return Array.from(parent.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el.id !== DND_CLONE_ID && el.dataset.index !== undefined,
  )
}

function moveRow(from: number, to: number) {
  if (from === to || Number.isNaN(from) || Number.isNaN(to)) return
  const next = rows.value.slice()
  const [moved] = next.splice(from, 1)
  if (!moved) return
  next.splice(to, 0, moved)
  rows.value = next
}

onMounted(() => {
  void loadNextPage()

  const tbody = tbodyEl.value
  const headerRow = headerRowEl.value
  if (!tbody || !headerRow) return

  // Hàng: FormKit chỉ "thấy" ~20 <tr> đang render, nên values = lát cắt khớp với DOM
  // (lấy theo data-index). Phép hoán đổi thì làm trên mảng đầy đủ trong performSort.
  dragAndDrop<Order>({
    parent: tbody,
    getValues: (parent) => renderedRowEls(parent).map((el) => rows.value[dataIndexOf(el)]!),
    setValues: (values, parent) => {
      // Dự phòng theo vị trí; luồng sort chính đi qua performSort bên dưới
      const next = rows.value.slice()
      renderedRowEls(parent).forEach((el, i) => {
        const value = values[i]
        if (value) next[dataIndexOf(el)] = value
      })
      rows.value = next
    },
    config: {
      dragHandle: '.vt-row-handle',
      draggingClass: 'vt-dragging',
      // Chỉ dùng dropZoneClass (FormKit gắn lại sau mỗi lần remap). Đặt trùng tên với
      // dragPlaceholderClass sẽ khiến FormKit coi là class sẵn có và không gỡ khi thả.
      dropZoneClass: 'vt-placeholder',
      performSort: ({ draggedNodes, targetNodes }) => {
        const dragged = draggedNodes[0]
        const target = targetNodes[0]
        if (!dragged || !target) return
        const to = dataIndexOf(target.el)
        // Giống performSort mặc định: chặn sort lặp lại trên cùng một hàng đích
        dndState.currentTargetValue = target.data.value
        moveRow(dataIndexOf(dragged.el), to)
        draggingIndex.value = to
      },
      onDragstart: ({ draggedNode }) => {
        draggingIndex.value = dataIndexOf(draggedNode.el)
      },
      onDragend: () => {
        draggingIndex.value = null
      },
    },
  })

  // Cột: values = id cột theo thứ tự <th> trong DOM, ghi ngược vào state columnOrder.
  // Cột tay nắm luôn đứng đầu và không kéo được.
  dragAndDrop<string>({
    parent: headerRow,
    getValues: (parent) =>
      Array.from(parent.children)
        .map((el) => (el as HTMLElement).dataset.columnId ?? '')
        .filter((id) => id !== '' && id !== DRAG_HANDLE_COLUMN_ID),
    setValues: (ids) => table.setColumnOrder([DRAG_HANDLE_COLUMN_ID, ...ids]),
    config: {
      draggable: (el) => el.dataset.columnId !== DRAG_HANDLE_COLUMN_ID,
      draggingClass: 'vt-dragging',
      dropZoneClass: 'vt-placeholder',
    },
  })
})

onBeforeUnmount(() => {
  if (tbodyEl.value) tearDown(tbodyEl.value)
  if (headerRowEl.value) tearDown(headerRowEl.value)
})
</script>

<template>
  <section class="fb-overflow-hidden fb-rounded-lg fb-border fb-border-line fb-bg-surface">
    <header
      class="fb-flex fb-flex-wrap fb-items-center fb-justify-between fb-gap-3 fb-border-b fb-border-line fb-px-4 fb-py-3"
    >
      <div class="fb-min-w-0">
        <h2 class="fb-text-card-title fb-text-ink">Danh sách đơn hàng</h2>
        <p class="fb-text-caption fb-text-ink-muted">
          Nắm tay kéo đầu hàng để đổi vị trí hàng, kéo tiêu đề cột để đổi thứ tự cột.
        </p>
      </div>
      <div class="fb-flex fb-flex-wrap fb-items-center fb-gap-2">
        <button
          type="button"
          class="fb-button fb-button--secondary"
          :disabled="!isColumnOrderChanged"
          @click="table.resetColumnOrder()"
        >
          Đặt lại thứ tự cột
        </button>
        <button
          type="button"
          class="fb-button fb-button--subtle"
          :disabled="!hasMore || isLoading"
          @click="loadAll"
        >
          Nạp đủ {{ countFormatter.format(TOTAL_ORDERS) }} dòng
        </button>
      </div>
    </header>

    <div
      ref="scrollEl"
      class="vt-scroll fb-relative fb-overflow-auto fb-overscroll-contain"
      :style="{ height: `${height}px` }"
    >
      <table class="fb-grid fb-text-cell" :style="{ minWidth: `${totalWidth}px` }" :aria-rowcount="rows.length + 1">
        <thead class="fb-sticky fb-top-0 fb-z-10 fb-grid fb-bg-subtle">
          <!-- class tĩnh: FormKit gắn class trạng thái kéo trực tiếp lên <th>, Vue không được ghi đè -->
          <tr ref="headerRowEl" class="fb-flex fb-w-full fb-border-b fb-border-line">
            <th
              v-for="header in headers"
              :key="header.id"
              :data-column-id="header.column.id"
              scope="col"
              class="vt-th fb-group fb-flex fb-h-[38px] fb-select-none fb-items-center fb-px-2 fb-text-left fb-text-caption fb-font-semibold fb-uppercase fb-text-ink-muted"
              :style="cellStyle(header.column)"
            >
              <div
                v-if="header.column.id !== DRAG_HANDLE_COLUMN_ID"
                class="fb-flex fb-w-full fb-cursor-grab fb-items-center fb-gap-1 active:fb-cursor-grabbing"
                :class="header.column.columnDef.meta?.align === 'end' ? 'fb-flex-row-reverse' : ''"
                title="Kéo để đổi thứ tự cột"
              >
                <span class="fb-truncate"><FlexRender :header="header" /></span>
                <span
                  class="fb-shrink-0 fb-text-ink-faint fb-opacity-0 fb-transition-opacity group-hover:fb-opacity-100"
                  aria-hidden="true"
                >
                  <GripIcon />
                </span>
              </div>
              <FlexRender v-else :header="header" />
            </th>
          </tr>
        </thead>

        <tbody ref="tbodyEl" class="fb-relative fb-grid" :style="{ height: `${totalHeight}px` }">
          <!--
            Chỉ ~15–20 <tr> tồn tại cùng lúc. v-memo bỏ qua render lại những hàng
            không đổi khi cuộn; key theo id để FormKit nhận đúng node khi hoán đổi.
          -->
          <tr
            v-for="item in visibleRows"
            :key="item.row.id"
            v-memo="[item.row, item.start, columnOrderKey]"
            :data-index="item.index"
            :aria-rowindex="item.index + 2"
            class="vt-row fb-absolute fb-left-0 fb-top-0 fb-flex fb-w-full fb-border-b fb-border-line-soft fb-bg-surface hover:fb-bg-subtle"
            :style="{ height: `${item.size}px`, transform: `translateY(${item.start}px)` }"
          >
            <!-- v9: getAllCells() đã sắp theo columnOrder (getVisibleCells cần thêm columnVisibilityFeature) -->
            <td
              v-for="cell in item.row.getAllCells()"
              :key="cell.id"
              class="fb-flex fb-min-w-0 fb-items-center fb-overflow-hidden fb-px-2"
              :class="cell.column.columnDef.meta?.align === 'end' ? 'fb-justify-end' : ''"
              :style="cellStyle(cell.column)"
            >
              <FlexRender :cell="cell" />
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="hasMore && rows.length > 0"
        class="fb-flex fb-h-11 fb-items-center fb-justify-center fb-gap-2 fb-text-caption fb-text-ink-muted"
        :style="{ minWidth: `${totalWidth}px` }"
        role="status"
      >
        <template v-if="loadError">
          <span class="fb-text-danger">{{ loadError }}</span>
          <button type="button" class="fb-button fb-button--secondary" @click="loadNextPage">Thử lại</button>
        </template>
        <template v-else>
          <span
            v-if="isLoading"
            class="fb-size-3.5 fb-animate-spin fb-rounded-full fb-border-2 fb-border-line fb-border-t-primary"
            aria-hidden="true"
          />
          {{ isLoading ? `Đang tải thêm ${pageSize} dòng…` : 'Cuộn xuống để tải thêm' }}
        </template>
      </div>

      <div
        v-if="rows.length === 0"
        class="fb-absolute fb-inset-x-0 fb-top-[38px] fb-flex fb-h-32 fb-items-center fb-justify-center fb-gap-2 fb-text-cell fb-text-ink-muted"
        role="status"
      >
        <template v-if="loadError">
          <span class="fb-text-danger">{{ loadError }}</span>
          <button type="button" class="fb-button fb-button--secondary" @click="loadNextPage">Thử lại</button>
        </template>
        <template v-else>
          <span
            class="fb-size-3.5 fb-animate-spin fb-rounded-full fb-border-2 fb-border-line fb-border-t-primary"
            aria-hidden="true"
          />
          Đang tải dữ liệu…
        </template>
      </div>
    </div>

    <footer
      class="fb-flex fb-flex-wrap fb-items-center fb-justify-between fb-gap-x-4 fb-gap-y-1 fb-border-t fb-border-line fb-bg-subtle fb-px-4 fb-py-2.5 fb-text-caption fb-text-ink-muted"
    >
      <span>
        Đã tải
        <strong class="fb-font-semibold fb-tabular-nums fb-text-ink">{{ countFormatter.format(rows.length) }}</strong>
        / {{ countFormatter.format(total ?? TOTAL_ORDERS) }} dòng · {{ loadedPages }} trang
      </span>
      <span>
        DOM đang render
        <strong class="fb-font-semibold fb-tabular-nums fb-text-ink">{{ visibleRows.length }}</strong>
        hàng
      </span>
    </footer>
  </section>
</template>
