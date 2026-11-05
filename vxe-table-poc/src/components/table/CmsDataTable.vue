<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { VxeGridInstance, VxeGridPropTypes } from 'vxe-table'
import type { DataColumn, RowSelectionState } from './data-table'

/**
 * Bảng danh sách (Figma "Bảng/Ô" 178:273) dựng trên vxe-grid. Cùng props với bản TanStack, trừ `rowKey`
 * (vxe cần TÊN TRƯỜNG khoá dòng, không nhận hàm như getRowId của TanStack).
 * Dữ liệu là MỘT trang đã phân trang ở server. Cột chọn + cột STT do bảng tự thêm.
 */
const props = withDefaults(defineProps<{
  columns: DataColumn<T>[]
  data: T[]
  /** Trường khoá dòng, vd 'id' */
  rowKey: string
  label: string
  selectable?: boolean
  indexOffset?: number
  loading?: boolean
  emptyText?: string
}>(), { selectable: false, loading: false })
const selection = defineModel<RowSelectionState>('selection', { default: () => ({}) })
const { t } = useI18n()
const grid = ref<VxeGridInstance<T>>()

const allColumns = computed<VxeGridPropTypes.Columns<T>>(() => [
  ...(props.selectable ? [{ type: 'checkbox', width: 48, fixed: 'left', align: 'center' } as const] : []),
  ...(props.indexOffset !== undefined ? [{ type: 'seq', title: '#', width: 48, fixed: 'left', align: 'center' } as const] : []),
  ...props.columns,
])

// vxe giữ dòng đã chọn qua các lần đổi trang nhờ checkbox-config.reserve; đồng bộ ra v-model sau mỗi lần chọn
function syncSelection() {
  const table = grid.value
  if (!table) return
  const rows = [...table.getCheckboxRecords(), ...table.getCheckboxReserveRecords()]
  selection.value = Object.fromEntries(rows.map(row => [String(row[props.rowKey]), true]))
}
// v-model đổi từ ngoài (vd bỏ chọn tất cả) → đặt lại trên bảng
watch(selection, async value => {
  const table = grid.value
  if (!table) return
  const keys = Object.keys(value).filter(key => value[key])
  const current = new Set([...table.getCheckboxRecords(), ...table.getCheckboxReserveRecords()].map(row => String(row[props.rowKey])))
  if (keys.length === current.size && keys.every(key => current.has(key))) return
  await table.clearCheckboxRow()
  await table.clearCheckboxReserve()
  if (keys.length) await table.setCheckboxRowKey(keys, true)
})
watch(() => props.data, async () => {
  await nextTick()
  const keys = Object.keys(selection.value).filter(key => selection.value[key])
  if (keys.length) await grid.value?.setCheckboxRowKey(keys, true)
})
</script>

<template>
  <div class="cms-data-table" role="region" :aria-label="label">
    <vxe-grid
      ref="grid"
      max-height="100%"
      :columns="allColumns"
      :data
      :loading
      :border="false"
      show-overflow
      show-header-overflow
      :row-config="{ keyField: rowKey, isHover: true }"
      :cell-config="{ height: 54 }"
      :header-cell-config="{ height: 38 }"
      :checkbox-config="{ reserve: true, highlight: true }"
      :seq-config="{ startIndex: indexOffset ?? 0 }"
      :empty-text="emptyText ?? t('ui.table.empty')"
      @checkbox-change="syncSelection"
      @checkbox-all="syncSelection"
    />
  </div>
</template>

<style scoped lang="scss">
// Cao 100vh rồi để ListLayout co lại: vxe đo chiều cao phần tử cha để tính max-height="100%"
.cms-data-table {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 0;
  // Biến màu của vxe đặt trên khung bọc → chỉ áp cho bảng này (Figma: dòng tiêu đề #edf0f7, vạch line-soft)
  --vxe-ui-table-header-background-color: #edf0f7;
  --vxe-ui-table-border-color: var(--line-soft);
  --vxe-ui-table-row-hover-background-color: var(--subtle);
  --vxe-ui-table-row-checkbox-checked-background-color: var(--primary-tint);
  --vxe-ui-table-cell-padding-left: var(--space-8);
  --vxe-ui-table-cell-padding-right: var(--space-8);
  --vxe-ui-font-primary-color: var(--primary);

  :deep(.vxe-grid) { border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; }
  :deep(.vxe-header--column) { color: var(--ink-2); font-size: .75rem; font-weight: 600; }
  :deep(.vxe-body--column) { color: var(--ink-2); }
  :deep(.vxe-body--column.is-interactive .vxe-cell) { padding: 0 var(--space-4); }
}
:global([data-theme='dark']) .cms-data-table { --vxe-ui-table-header-background-color: var(--field); }
</style>
