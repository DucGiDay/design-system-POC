<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  columnFilteringFeature, columnSizingFeature, createColumnHelper, createFilteredRowModel, createSortedRowModel,
  globalFilteringFeature, rowSortingFeature, sortFn_alphanumeric, tableFeatures, useTable,
  type SortingState,
} from '@tanstack/vue-table'
import { useVirtualizer } from '@tanstack/vue-virtual'
import CmsTag from '@/components/ui/CmsTag.vue'
import { formatTime, salesSearchable, SEARCH_FIELDS, type SalesLine, type SalesTotals } from '@/mock/report-sales'
import { REPORT_COLUMNS, REPORT_ROW_HEIGHT, settle, type ReportColumn, type ReportField, type ReportGridApi, type ReportGridStats, type SortOrder } from './report'

// ReportGrid · TanStack Table v9 (headless) + @tanstack/vue-virtual.
// Sắp xếp / lọc dùng row model dựng sẵn của TanStack; phần vẽ (div + sticky + cuộn ảo dọc) tự viết.
const emit = defineEmits<{ stats: [stats: ReportGridStats]; timing: [label: string, ms: number] }>()
const { t } = useI18n()

// Lọc toàn cục: so khớp bỏ dấu, chỉ trên các cột SEARCH_FIELDS (giống bộ lọc của POC vxe).
// Khai báo kiểu tham số tối thiểu: gắn FilterFn<typeof features> ở đây sẽ thành vòng kiểu với `features`.
function searchFn(row: { getValue: (columnId: string) => unknown }, columnId: string, term: string) {
  return salesSearchable(String(row.getValue(columnId))).includes(term)
}
// Bỏ dấu chuỗi tìm MỘT lần cho cả lượt lọc, không phải lại cho từng ô
searchFn.resolveFilterValue = (value: string) => salesSearchable(value.trim())
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { search: searchFn },
  columnSizingFeature,
})
const helper = createColumnHelper<typeof features, SalesLine>()
const columns = helper.columns(REPORT_COLUMNS.map(column => helper.accessor(column.field, {
  id: column.field,
  size: column.width,
  sortFn: column.kind === 'text' ? 'alphanumeric' : undefined,
  sortDescFirst: column.kind !== 'text',
})))
const searchable = new Set<string>(SEARCH_FIELDS)

const data = shallowRef<SalesLine[]>([])
const sorting = ref<SortingState>([])
const globalFilter = ref('')
const table = useTable({
  features,
  columns,
  data,
  getRowId: (row: SalesLine) => String(row.id),
  state: computed(() => ({ sorting: sorting.value, globalFilter: globalFilter.value })),
  onSortingChange: updater => { sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater },
  onGlobalFilterChange: updater => { globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater },
  globalFilterFn: 'search',
  getColumnCanGlobalFilter: column => searchable.has(column.id),
  enableSortingRemoval: true,
})
const rows = computed(() => table.getRowModel().rows)

// ─── Cuộn ảo ────────────────────────────────────────────────────────────────
const scroller = useTemplateRef<HTMLDivElement>('scroller')
const virtualizer = useVirtualizer(computed(() => ({
  count: rows.value.length,
  getScrollElement: () => scroller.value ?? null,
  estimateSize: () => REPORT_ROW_HEIGHT,
  overscan: 8,
})))
const virtualRows = computed(() => virtualizer.value.getVirtualItems())

// ─── Cột ghim + định dạng ───────────────────────────────────────────────────
const SEQ_WIDTH = 72
const fixedLeft = new Map<ReportField, number>()
REPORT_COLUMNS.reduce((left, column) => { if (column.fixed) { fixedLeft.set(column.field, left); return left + column.width } return left }, SEQ_WIDTH)
const lastFixed = REPORT_COLUMNS.filter(column => column.fixed).at(-1)?.field
const totalWidth = REPORT_COLUMNS.reduce((sum, column) => sum + column.width, SEQ_WIDTH)
const money = new Intl.NumberFormat('vi-VN')
const statusTone = { completed: 'success', cancelled: 'danger', refunded: 'warning' } as const
function display(row: SalesLine, column: ReportColumn) {
  const value = row[column.field]
  if (column.kind === 'money' || column.kind === 'number') return money.format(value as number)
  if (column.kind === 'time') return formatTime(value as number)
  return value as string
}
function cellStyle(column: ReportColumn) {
  return { width: `${column.width}px`, left: column.fixed ? `${fixedLeft.get(column.field)}px` : undefined }
}
const sortOf = (field: ReportField) => sorting.value[0]?.id === field ? (sorting.value[0].desc ? 'desc' : 'asc') : null
const ariaSort = (field: ReportField) => ({ asc: 'ascending', desc: 'descending', none: 'none' } as const)[sortOf(field) ?? 'none']

// ─── Tổng + thống kê ────────────────────────────────────────────────────────
const totals = computed<SalesTotals>(() => {
  let qty = 0, discount = 0, vat = 0, amount = 0
  for (const row of rows.value) { const line = row.original; qty += line.qty; discount += line.discount; vat += line.vat; amount += line.amount }
  return { qty, discount, vat, amount }
})
watch(totals, value => emit('stats', { visible: rows.value.length, totals: value }), { immediate: true })

// ─── API đo ─────────────────────────────────────────────────────────────────
async function measure(action: () => void) {
  const start = performance.now()
  action()
  await nextTick()
  await settle()
  return performance.now() - start
}
const api: ReportGridApi = {
  load: rowsIn => measure(() => { data.value = rowsIn }),
  search: query => measure(() => { globalFilter.value = query }),
  sort: (field, order: SortOrder) => measure(() => { sorting.value = order ? [{ id: field, desc: order === 'desc' }] : [] }),
  scrollToEnd: () => measure(() => virtualizer.value.scrollToIndex(rows.value.length - 1, { align: 'end' })),
  scrollToTop: () => measure(() => virtualizer.value.scrollToOffset(0)),
}
defineExpose(api)

async function toggleSort(field: ReportField) {
  const current = sortOf(field)
  const kind = REPORT_COLUMNS.find(column => column.field === field)?.kind
  // Chu kỳ: chữ tăng → giảm → bỏ; số / tiền giảm → tăng → bỏ (số lớn thường cần xem trước)
  const cycle: SortOrder[] = kind === 'text' ? ['asc', 'desc', null] : ['desc', 'asc', null]
  const nextOrder = cycle[(cycle.indexOf(current) + 1) % cycle.length] ?? null
  emit('timing', t('report.timing.sort'), await api.sort(field, nextOrder))
}
</script>

<template>
  <div class="report-grid" role="region" :aria-label="t('report.gridLabel')">
    <div ref="scroller" class="report-grid__scroll" tabindex="0">
      <div role="table" :aria-rowcount="rows.length + 2" :style="{ width: `${totalWidth}px` }">
        <div class="report-grid__row report-grid__head" role="row">
          <div class="report-grid__cell is-fixed is-seq" role="columnheader" :style="{ width: `${SEQ_WIDTH}px`, left: 0 }">#</div>
          <div v-for="column in REPORT_COLUMNS" :key="column.field" class="report-grid__cell" :class="{ 'is-fixed': column.fixed, 'is-edge': column.field === lastFixed, 'is-end': column.kind === 'money' || column.kind === 'number' }" role="columnheader" :aria-sort="ariaSort(column.field)" :style="cellStyle(column)">
            <button type="button" class="report-grid__sort" @click="toggleSort(column.field)">
              {{ t(`report.col.${column.title}`) }}<span class="report-grid__arrow" :data-order="sortOf(column.field)" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div class="report-grid__body" role="rowgroup" :style="{ height: `${virtualizer.getTotalSize()}px` }">
          <div v-for="item in virtualRows" :key="rows[item.index]?.id" class="report-grid__row" role="row" :aria-rowindex="item.index + 2" :style="{ transform: `translateY(${item.start}px)` }">
            <template v-if="rows[item.index]">
              <div class="report-grid__cell is-fixed is-seq" role="cell" :style="{ width: `${SEQ_WIDTH}px`, left: 0 }">{{ money.format(item.index + 1) }}</div>
              <div v-for="column in REPORT_COLUMNS" :key="column.field" class="report-grid__cell" :class="{ 'is-fixed': column.fixed, 'is-edge': column.field === lastFixed, 'is-end': column.kind === 'money' || column.kind === 'number' }" role="cell" :style="cellStyle(column)">
                <CmsTag v-if="column.kind === 'status'" :tone="statusTone[rows[item.index]!.original.status]">{{ t(`report.status.${rows[item.index]!.original.status}`) }}</CmsTag>
                <template v-else>{{ display(rows[item.index]!.original, column) }}</template>
              </div>
            </template>
          </div>
          <p v-if="!rows.length" class="report-grid__empty">{{ t('report.empty') }}</p>
        </div>

        <div class="report-grid__row report-grid__foot" role="row">
          <div class="report-grid__cell is-fixed is-seq" role="cell" :style="{ width: `${SEQ_WIDTH}px`, left: 0 }" />
          <div v-for="column in REPORT_COLUMNS" :key="column.field" class="report-grid__cell" :class="{ 'is-fixed': column.fixed, 'is-edge': column.field === lastFixed, 'is-end': column.kind === 'money' || column.kind === 'number' }" role="cell" :style="cellStyle(column)">
            <template v-if="column.field === 'invoice'">{{ t('report.total') }}</template>
            <template v-else-if="column.field === 'qty' || column.field === 'discount' || column.field === 'vat' || column.field === 'amount'">{{ money.format(totals[column.field]) }}</template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.report-grid {
  --report-head: #edf0f7;
  display: flex;
  // Cao giả 100vh để ListLayout co bảng về đúng phần còn lại của màn hình
  height: 100vh;
  min-height: 16rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  overflow: hidden;
}
:global([data-theme='dark']) .report-grid { --report-head: var(--field); }
.report-grid__scroll {
  flex: 1;
  min-width: 0;
  overflow: auto;
  overscroll-behavior: contain;
  contain: strict;
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
}
.report-grid__row {
  display: flex;
  height: 2.75rem;
  color: var(--ink-2);
  font-size: var(--type-cell-font-size);
  line-height: 1.125rem;
  font-variant-numeric: tabular-nums;
}
.report-grid__body { position: relative; }
.report-grid__body > .report-grid__row { position: absolute; top: 0; left: 0; }
.report-grid__body > .report-grid__row:hover .report-grid__cell { background: var(--subtle); }
.report-grid__cell {
  display: flex;
  flex: none;
  align-items: center;
  padding: 0 var(--space-8);
  overflow: hidden;
  border-bottom: 1px solid var(--line-soft);
  background: var(--surface);
  white-space: nowrap;
  text-overflow: ellipsis;
  &.is-end { justify-content: flex-end; text-align: right; }
  &.is-fixed { position: sticky; z-index: 1; }
  &.is-edge { box-shadow: 6px 0 6px -6px rgba(15, 23, 42, .18); }
  &.is-seq { justify-content: center; color: var(--ink-muted); }
}
.report-grid__head {
  position: sticky;
  top: 0;
  z-index: 3;
  height: 2.375rem;
  .report-grid__cell { background: var(--report-head); border-bottom: 0; color: var(--ink-2); font-size: .75rem; font-weight: 600; }
  .report-grid__cell.is-fixed { z-index: 4; }
}
.report-grid__foot {
  position: sticky;
  bottom: 0;
  z-index: 3;
  .report-grid__cell { border-top: 1px solid var(--line); border-bottom: 0; background: var(--subtle); color: var(--ink); font-weight: 600; }
  .report-grid__cell.is-fixed { z-index: 4; }
}
.report-grid__sort {
  display: inline-flex;
  gap: var(--space-4);
  align-items: center;
  max-width: 100%;
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  cursor: pointer;
  &:hover { color: var(--primary-text); }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 2px; }
}
.report-grid__arrow {
  width: 0;
  height: 0;
  border: 4px solid transparent;
  border-top-color: var(--line-strong);
  margin-top: 4px;
  &[data-order='desc'] { border-top-color: var(--primary); }
  &[data-order='asc'] { border-top-color: transparent; border-bottom-color: var(--primary); margin: 0 0 4px; }
}
.report-grid__empty { position: sticky; left: 0; width: min(100%, 40rem); padding: var(--space-24); color: var(--ink-muted); }
</style>
