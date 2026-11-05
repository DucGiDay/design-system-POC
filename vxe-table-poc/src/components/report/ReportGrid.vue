<script setup lang="ts">
import { computed, h, nextTick, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { VxeGridInstance, VxeGridPropTypes, VxeTableEvents, VxeTablePropTypes } from 'vxe-table'
import CmsTag from '@/components/ui/CmsTag.vue'
import { filterSalesRows, formatTime, sumSales, type SalesLine, type SalesTotals } from '@/mock/report-sales'
import { REPORT_COLUMNS, REPORT_HEADER_HEIGHT, REPORT_ROW_HEIGHT, settle, type ReportGridApi, type ReportGridStats, type SortOrder } from './report'

// ReportGrid · vxe-grid. Sắp xếp, cuộn ảo dọc + ngang, cột ghim, dòng tổng là tính năng dựng sẵn của vxe.
// vxe-table không có ô tìm kiếm toàn cục → lọc bằng filterSalesRows (JS thuần, cùng hàm so khớp với POC TanStack) rồi loadData.
const emit = defineEmits<{ stats: [stats: ReportGridStats]; timing: [label: string, ms: number] }>()
const { t } = useI18n()
const grid = ref<VxeGridInstance<SalesLine>>()

let all: SalesLine[] = []
let query = ''
const totals = shallowRef<SalesTotals>({ qty: 0, discount: 0, vat: 0, amount: 0 })

const money = new Intl.NumberFormat('vi-VN')
const statusTone = { completed: 'success', cancelled: 'danger', refunded: 'warning' } as const
const columns = computed<VxeGridPropTypes.Columns<SalesLine>>(() => [
  { type: 'seq', title: '#', width: 72, fixed: 'left', align: 'center' },
  ...REPORT_COLUMNS.map((column): VxeGridPropTypes.Column<SalesLine> => ({
    field: column.field,
    title: t(`report.col.${column.title}`),
    width: column.width,
    fixed: column.fixed ? 'left' : undefined,
    align: column.kind === 'money' || column.kind === 'number' ? 'right' : undefined,
    sortable: true,
    formatter: column.kind === 'money' || column.kind === 'number'
      ? ({ cellValue }) => money.format(cellValue)
      : column.kind === 'time' ? ({ cellValue }) => formatTime(cellValue) : undefined,
    slots: column.kind === 'status'
      ? { default: ({ row }) => h(CmsTag, { tone: statusTone[row.status] }, () => t(`report.status.${row.status}`)) }
      : undefined,
  })),
])
// Số / tiền: giảm trước; chữ: tăng trước
const sortConfig = computed<VxeTablePropTypes.SortConfig<SalesLine>>(() => ({ trigger: 'cell', allowClear: true, orders: ['desc', 'asc', null] }))
const footerMethod: VxeTablePropTypes.FooterMethod<SalesLine> = ({ columns: cols }) => [cols.map(column => {
  if (column.field === 'invoice') return t('report.total')
  if (column.field === 'qty' || column.field === 'discount' || column.field === 'vat' || column.field === 'amount') return money.format(totals.value[column.field])
  return ''
})]

async function apply() {
  const rows = filterSalesRows(all, query)
  totals.value = sumSales(rows)
  emit('stats', { visible: rows.length, totals: totals.value })
  await grid.value?.loadData(rows)
}
async function measure(action: () => Promise<unknown> | void) {
  const start = performance.now()
  await action()
  await nextTick()
  await settle()
  return performance.now() - start
}
const api: ReportGridApi = {
  load: rows => measure(() => { all = rows; return apply() }),
  search: value => measure(() => { query = value; return apply() }),
  sort: (field, order: SortOrder) => measure(() => order ? grid.value?.sort(field, order) : grid.value?.clearSort()),
  scrollToEnd: () => measure(() => grid.value?.scrollTo(0, Number.MAX_SAFE_INTEGER)),
  scrollToTop: () => measure(() => grid.value?.scrollTo(0, 0)),
}
defineExpose(api)

// Bấm tiêu đề: vxe tự sắp xếp rồi mới phát sort-change → lấy mốc thời gian từ lúc nhấn chuột
let pressedAt = 0
const markPress = () => { pressedAt = performance.now() }
const onSortChange: VxeTableEvents.SortChange<SalesLine> = async () => {
  const start = pressedAt || performance.now()
  await nextTick()
  await settle()
  emit('timing', t('report.timing.sort'), performance.now() - start)
  pressedAt = 0
}
</script>

<template>
  <div class="report-grid" role="region" :aria-label="t('report.gridLabel')" @pointerdown.capture="markPress">
    <vxe-grid
      ref="grid"
      height="100%"
      :columns
      :border="false"
      show-overflow
      show-header-overflow
      show-footer-overflow
      show-footer
      :footer-method="footerMethod"
      :sort-config="sortConfig"
      :row-config="{ keyField: 'id', isHover: true }"
      :cell-config="{ height: REPORT_ROW_HEIGHT }"
      :header-cell-config="{ height: REPORT_HEADER_HEIGHT }"
      :footer-cell-config="{ height: REPORT_ROW_HEIGHT }"
      :virtual-y-config="{ enabled: true, gt: 0 }"
      :virtual-x-config="{ enabled: true, gt: 0 }"
      :empty-text="t('report.empty')"
      @sort-change="onSortChange"
    />
  </div>
</template>

<style scoped lang="scss">
.report-grid {
  // Cao giả 100vh để ListLayout co bảng về đúng phần còn lại của màn hình (vxe đo chiều cao phần tử cha)
  height: 100vh;
  min-height: 16rem;
  --vxe-ui-table-header-background-color: #edf0f7;
  --vxe-ui-table-footer-background-color: var(--subtle);
  --vxe-ui-table-border-color: var(--line-soft);
  --vxe-ui-table-row-hover-background-color: var(--subtle);
  --vxe-ui-table-cell-padding-left: var(--space-8);
  --vxe-ui-table-cell-padding-right: var(--space-8);
  --vxe-ui-font-primary-color: var(--primary);
  :deep(.vxe-grid) { height: 100%; border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; }
  :deep(.vxe-header--column) { color: var(--ink-2); font-size: .75rem; font-weight: 600; }
  :deep(.vxe-body--column) { color: var(--ink-2); font-variant-numeric: tabular-nums; }
  :deep(.vxe-footer--column) { color: var(--ink); font-weight: 600; font-variant-numeric: tabular-nums; }
}
:global([data-theme='dark']) .report-grid { --vxe-ui-table-header-background-color: var(--field); }
</style>
