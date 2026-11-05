<script setup lang="ts">
// Bài thử · vxe-grid. Tiêu đề 2 tầng, cột ghim, gộp ô, kéo + đổi rộng cột, cuộn ảo 2 chiều đều là cấu hình.
import { computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import type { VxeGridPropTypes, VxeTablePropTypes } from 'vxe-table'
import CmsTag from '@/components/ui/CmsTag.vue'
import { formatTime, type SalesLine } from '@/mock/report-sales'
import { SPIKE_GROUPS, SPIKE_HEADER_HEIGHT, SPIKE_MERGE_FIELDS, SPIKE_ROW_HEIGHT, spikeData } from './spike'

const { t } = useI18n()
const { rows, spans } = spikeData()
const money = new Intl.NumberFormat('vi-VN')
const statusTone = { completed: 'success', cancelled: 'danger', refunded: 'warning' } as const

const columns = computed<VxeGridPropTypes.Columns<SalesLine>>(() => SPIKE_GROUPS.map(group => ({
  title: t(`spike.group.${group.id}`),
  fixed: group.pinned ? 'left' : undefined,
  children: group.children.map((leaf): VxeGridPropTypes.Column<SalesLine> => ({
    field: leaf.field,
    title: t(`report.col.${leaf.title}`),
    width: leaf.width,
    fixed: group.pinned ? 'left' : undefined,
    align: leaf.kind === 'money' || leaf.kind === 'number' ? 'right' : undefined,
    formatter: leaf.kind === 'money' || leaf.kind === 'number'
      ? ({ cellValue }) => money.format(cellValue)
      : leaf.kind === 'time' ? ({ cellValue }) => formatTime(cellValue) : undefined,
    slots: leaf.kind === 'status'
      ? { default: ({ row }) => h(CmsTag, { tone: statusTone[row.status] }, () => t(`report.status.${row.status}`)) }
      : undefined,
  })),
})))

// Gộp ô: rowIndex của spanMethod là vị trí trong toàn bộ dữ liệu, kể cả khi cuộn ảo
const spanMethod: VxeTablePropTypes.SpanMethod<SalesLine> = ({ column, rowIndex }) => {
  if (!column.field || !SPIKE_MERGE_FIELDS.has(column.field)) return
  const span = spans[rowIndex] ?? 1
  return { rowspan: span, colspan: span ? 1 : 0 }
}
</script>

<template>
  <div class="spike-grid" role="region" :aria-label="t('spike.label')">
    <vxe-grid
      height="100%"
      :columns
      :data="rows"
      border="inner"
      show-overflow
      show-header-overflow
      :span-method="spanMethod"
      :row-config="{ keyField: 'id', isHover: true }"
      :column-config="{ drag: true, resizable: true }"
      :column-drag-config="{ animation: false, isPeerDrag: true }"
      :cell-config="{ height: SPIKE_ROW_HEIGHT }"
      :header-cell-config="{ height: SPIKE_HEADER_HEIGHT }"
      :virtual-y-config="{ enabled: true, gt: 0 }"
      :virtual-x-config="{ enabled: true, gt: 0 }"
    />
  </div>
</template>

<style scoped lang="scss">
.spike-grid {
  min-height: 16rem;
  --vxe-ui-table-header-background-color: #edf0f7;
  --vxe-ui-table-border-color: var(--line-soft);
  --vxe-ui-table-row-hover-background-color: var(--subtle);
  --vxe-ui-table-cell-padding-left: var(--space-8);
  --vxe-ui-table-cell-padding-right: var(--space-8);
  --vxe-ui-font-primary-color: var(--primary);
  :deep(.vxe-grid) { height: 100%; border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; background: var(--surface); }
  :deep(.vxe-header--column) { color: var(--ink-2); font-size: .75rem; font-weight: 600; }
  :deep(.vxe-body--column) { color: var(--ink-2); font-variant-numeric: tabular-nums; }
}
:global([data-theme='dark']) .spike-grid { --vxe-ui-table-header-background-color: var(--field); }
</style>
