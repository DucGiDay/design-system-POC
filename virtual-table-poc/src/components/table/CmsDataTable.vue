<script setup lang="ts" generic="T extends RowData">
import { computed, h, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { FlexRender, functionalUpdate, useTable, type Column, type RowData } from '@tanstack/vue-table'
import AppIcon from '@/components/icon/AppIcon.vue'
import CmsCheckbox from '@/components/ui/CmsCheckbox.vue'
import { dataColumnHelper, dataTableFeatures, type DataColumn, type DataTableFeatures, type RowSelectionState } from './data-table'

/**
 * Bảng danh sách (Figma "Bảng/Ô" 178:273): khung viền line bo md, dòng tiêu đề cao 38, dòng thân cao 54.
 * Dữ liệu là MỘT trang đã phân trang ở server; bảng không tự lọc / sắp xếp.
 * Cột chọn và cột STT do bảng tự thêm (`selectable`, `indexOffset`), trang chỉ khai báo cột nghiệp vụ.
 */
const props = withDefaults(defineProps<{
  columns: DataColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  /** Tên bảng cho trình đọc màn hình */
  label: string
  selectable?: boolean
  /** Có giá trị thì hiện cột "#": số thứ tự = indexOffset + vị trí trong trang + 1 */
  indexOffset?: number
  loading?: boolean
  emptyText?: string
}>(), { selectable: false, loading: false })
/** Chọn dòng giữ theo id nên vẫn còn khi chuyển trang */
const selection = defineModel<RowSelectionState>('selection', { default: () => ({}) })

const { t } = useI18n()
const helper = dataColumnHelper<T>()

const selectColumn = helper.display({
  id: '__select',
  size: 48,
  meta: { pin: 'left', align: 'center' },
  header: ({ table }) => h(CmsCheckbox, {
    ariaLabel: t('ui.table.selectPage'),
    modelValue: table.getIsAllPageRowsSelected(),
    indeterminate: table.getIsSomePageRowsSelected(),
    'onUpdate:modelValue': (value: boolean) => table.toggleAllPageRowsSelected(value),
  }),
  cell: ({ row }) => h(CmsCheckbox, {
    ariaLabel: t('ui.table.selectRow', { n: (props.indexOffset ?? 0) + row.index + 1 }),
    modelValue: row.getIsSelected(),
    'onUpdate:modelValue': (value: boolean) => row.toggleSelected(value),
  }),
})
const indexColumn = helper.display({
  id: '__index',
  size: 48,
  meta: { pin: 'left', align: 'center' },
  header: '#',
  cell: ({ row }) => h('span', { class: 'cms-data-table__index' }, (props.indexOffset ?? 0) + row.index + 1),
})
const allColumns = computed(() => [
  ...(props.selectable ? [selectColumn] : []),
  ...(props.indexOffset !== undefined ? [indexColumn] : []),
  ...props.columns,
])

const table = useTable({
  features: dataTableFeatures,
  columns: allColumns,
  data: computed(() => props.data),
  getRowId: (row: T) => props.getRowId(row),
  enableRowSelection: computed(() => props.selectable),
  state: computed(() => ({ rowSelection: selection.value })),
  onRowSelectionChange: updater => { selection.value = functionalUpdate(updater, selection.value) },
})

const headers = computed(() => table.getHeaderGroups()[0]?.headers ?? [])
const rows = computed(() => table.getRowModel().rows)
const leafColumns = computed(() => table.getAllLeafColumns())
const totalWidth = computed(() => leafColumns.value.reduce((sum, column) => sum + column.getSize(), 0))

// Ghim cột: offset = tổng độ rộng các cột ghim cùng phía đứng trước
const offsets = computed(() => {
  const result = new Map<string, number>()
  let left = 0
  for (const column of leafColumns.value) {
    if (column.columnDef.meta?.pin !== 'left') continue
    result.set(column.id, left)
    left += column.getSize()
  }
  let right = 0
  for (const column of [...leafColumns.value].reverse()) {
    if (column.columnDef.meta?.pin !== 'right') continue
    result.set(column.id, right)
    right += column.getSize()
  }
  return result
})
const lastLeftPinned = computed(() => leafColumns.value.filter(column => column.columnDef.meta?.pin === 'left').at(-1)?.id)
const firstRightPinned = computed(() => leafColumns.value.find(column => column.columnDef.meta?.pin === 'right')?.id)

function cellClass(column: Column<DataTableFeatures, T, unknown>) {
  const meta = column.columnDef.meta
  return {
    [`is-${meta?.align ?? 'start'}`]: true,
    'is-pinned-left': meta?.pin === 'left',
    'is-pinned-right': meta?.pin === 'right',
    'is-pin-edge-left': column.id === lastLeftPinned.value,
    'is-pin-edge-right': column.id === firstRightPinned.value,
    'is-interactive': meta?.interactive,
  }
}
function cellStyle(column: Column<DataTableFeatures, T, unknown>) {
  const pin = column.columnDef.meta?.pin
  return pin ? { [pin]: `${offsets.value.get(column.id) ?? 0}px` } : undefined
}

// Bóng ở mép cột ghim chỉ hiện khi đã cuộn ngang qua nó
const scroller = useTemplateRef<HTMLDivElement>('scroller')
const scrolledX = ref(false)
const scrollableRight = ref(false)
function updateScroll() {
  const element = scroller.value
  if (!element) return
  scrolledX.value = element.scrollLeft > 0
  scrollableRight.value = element.scrollLeft + element.clientWidth < element.scrollWidth - 1
}
let resizeObserver: ResizeObserver | undefined
onMounted(() => {
  updateScroll()
  resizeObserver = new ResizeObserver(updateScroll)
  if (scroller.value) resizeObserver.observe(scroller.value)
})
onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <div class="cms-data-table" :class="{ 'is-scrolled-x': scrolledX, 'is-scrollable-right': scrollableRight, 'is-loading': loading }">
    <div ref="scroller" class="cms-data-table__scroll" tabindex="0" :aria-label="label" role="region" @scroll.passive="updateScroll">
      <table :style="{ width: `max(100%, ${totalWidth}px)` }" :aria-busy="loading || undefined">
        <colgroup>
          <col v-for="column in leafColumns" :key="column.id" :style="{ width: `${column.getSize()}px` }" />
        </colgroup>
        <thead>
          <tr>
            <th v-for="header in headers" :key="header.id" scope="col" :class="cellClass(header.column)" :style="cellStyle(header.column)">
              <span class="cms-data-table__th">
                <FlexRender :header="header" />
                <span v-if="header.column.columnDef.meta?.hint" class="cms-data-table__hint" tabindex="0" :aria-label="header.column.columnDef.meta.hint" :data-tip="header.column.columnDef.meta.hint">
                  <AppIcon name="thong-tin" size=".875rem" />
                </span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" :class="{ 'is-selected': row.getIsSelected() }">
            <td v-for="cell in row.getAllCells()" :key="cell.id" :class="cellClass(cell.column)" :style="cellStyle(cell.column)">
              <FlexRender :cell="cell" />
            </td>
          </tr>
          <tr v-if="!rows.length && !loading" class="cms-data-table__empty">
            <td :colspan="leafColumns.length"><slot name="empty">{{ emptyText ?? t('ui.table.empty') }}</slot></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cms-data-table {
  // Figma dùng #edf0f7 cho dòng tiêu đề, chưa có token
  --cms-table-head: #edf0f7;
  position: relative;
  display: flex;
  min-height: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  overflow: hidden;
}
:global([data-theme='dark']) .cms-data-table { --cms-table-head: var(--field); }

.cms-data-table__scroll {
  flex: 1;
  min-width: 0;
  overflow: auto;
  overscroll-behavior-x: contain;
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
}

table {
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  color: var(--ink-2);
  font-size: var(--type-cell-font-size);
  line-height: var(--type-cell-line-height);
}

// Figma đệm 10/8 nhưng cố định chiều cao (38 / 54) và cắt phần thừa: đệm dọc 0 + height để ô 2 dòng (tên + mã) không đẩy dòng cao lên
th, td {
  padding: 0 var(--space-8);
  background: var(--surface);
  text-align: left;
  vertical-align: middle;
  overflow: hidden;
  &.is-end { text-align: right; }
  &.is-center { text-align: center; }
  &.is-pinned-left, &.is-pinned-right { position: sticky; z-index: 1; }
  &.is-interactive { padding: var(--space-6) var(--space-4); }
  // Ô chọn: bỏ khoảng baseline của phần tử inline để dòng tiêu đề đúng 38
  > :deep(.cms-checkbox) { display: flex; justify-content: center; }
}
th {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 2.375rem;
  border-bottom: 1px solid var(--surface);
  background: var(--cms-table-head);
  color: var(--ink-2);
  font-size: .75rem;
  font-weight: 600;
  line-height: 1.125rem;
  white-space: nowrap;
  // Cho tooltip của icon (i) tràn xuống thân bảng
  overflow: visible;
  &.is-pinned-left, &.is-pinned-right { z-index: 3; }
}
td {
  height: 3.375rem;
  border-bottom: 1px solid var(--line-soft);
  transition: background-color 80ms ease;
}
tbody tr:last-child td { border-bottom: 0; }
tbody tr:hover td { background: var(--subtle); }
tbody tr.is-selected td { background: var(--primary-tint); }

.cms-data-table__th {
  display: inline-flex;
  gap: var(--space-4);
  align-items: center;
  max-width: 100%;
}
th.is-end .cms-data-table__th { justify-content: flex-end; }
.cms-data-table__hint {
  position: relative;
  display: inline-flex;
  color: var(--ink-muted);
  cursor: help;
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 50%; }
}
.cms-data-table__index { color: var(--ink-2); font-variant-numeric: tabular-nums; }
th.is-center :deep(.cms-checkbox), td.is-center :deep(.cms-checkbox) { vertical-align: middle; }

// Bóng mép cột ghim khi nội dung đã trôi dưới nó
.is-pin-edge-left::after, .is-pin-edge-right::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 120ms ease;
}
.is-pin-edge-left::after { right: -8px; background: linear-gradient(to right, rgba(15, 23, 42, .08), transparent); }
.is-pin-edge-right::after { left: -8px; background: linear-gradient(to left, rgba(15, 23, 42, .08), transparent); }
.is-scrolled-x .is-pin-edge-left::after, .is-scrollable-right .is-pin-edge-right::after { opacity: 1; }
// overflow:hidden của ô cắt mất bóng → ô ghim cho tràn
.is-pinned-left, .is-pinned-right { overflow: visible; }

.cms-data-table__empty td { height: 7.5rem; color: var(--ink-muted); text-align: center; }
.cms-data-table.is-loading tbody { opacity: .55; transition: opacity 120ms ease; }
</style>

<style lang="scss">
/* Tooltip của icon (i) ở tiêu đề cột: không scoped vì gắn qua data-tip */
.cms-data-table__hint[data-tip]:hover::after,
.cms-data-table__hint[data-tip]:focus-visible::after {
  content: attr(data-tip);
  position: absolute;
  top: calc(100% + 6px);
  right: -6px;
  z-index: 5;
  width: max-content;
  max-width: 15rem;
  padding: .375rem .625rem;
  border-radius: var(--radius-sm);
  background: var(--ink);
  color: var(--surface);
  font-size: .75rem;
  font-weight: 500;
  line-height: 1.5;
  white-space: normal;
  text-align: left;
}
</style>
