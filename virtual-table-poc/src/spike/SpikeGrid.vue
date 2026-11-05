<script setup lang="ts">
// Bài thử · TanStack Table v9 (headless) + @tanstack/vue-virtual.
// Thư viện lo: cây cột 2 tầng (header groups), thứ tự cột, độ rộng + kéo đổi rộng, offset cột ghim.
// Tự viết: toàn bộ phần vẽ (div + sticky), gộp ô trên bảng cuộn ảo, kéo thả cột (HTML5 drag & drop).
import { computed, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  columnOrderingFeature, columnPinningFeature, columnResizingFeature, columnSizingFeature, columnVisibilityFeature,
  createColumnHelper, tableFeatures, useTable, type Column, type ColumnDef,
} from '@tanstack/vue-table'
import { defaultRangeExtractor, useVirtualizer, type Range } from '@tanstack/vue-virtual'
import CmsTag from '@/components/ui/CmsTag.vue'
import { formatTime, type SalesLine } from '@/mock/report-sales'
import { SPIKE_GROUPS, SPIKE_HEADER_HEIGHT, SPIKE_MERGE_FIELDS, SPIKE_ROW_HEIGHT, spikeData, type SpikeLeaf } from './spike'

const { t } = useI18n()
const { rows: data, spans } = spikeData()
const money = new Intl.NumberFormat('vi-VN')
const statusTone = { completed: 'success', cancelled: 'danger', refunded: 'warning' } as const

// ─── Cột ────────────────────────────────────────────────────────────────────
const features = tableFeatures({ columnOrderingFeature, columnPinningFeature, columnSizingFeature, columnResizingFeature, columnVisibilityFeature })
type SpikeColumn = Column<typeof features, SalesLine, unknown>
const helper = createColumnHelper<typeof features, SalesLine>()
const leafOf = new Map<string, SpikeLeaf>()
const groupOf = new Map<string, string>()
// Id cột nhóm phải khác id cột lá: TanStack dùng chung một không gian id (nhóm 'invoice' trùng cột 'invoice')
const columns = helper.columns(SPIKE_GROUPS.map(group => helper.group({
  id: `group-${group.id}`,
  columns: group.children.map(leaf => {
    leafOf.set(leaf.field, leaf)
    groupOf.set(leaf.field, group.id)
    return helper.accessor(leaf.field, { id: leaf.field, size: leaf.width, minSize: 60, enableResizing: true })
  }) as ColumnDef<typeof features, SalesLine, unknown>[],
})))
const pinned = SPIKE_GROUPS.filter(group => group.pinned).flatMap(group => group.children.map(leaf => leaf.field as string))

const table = useTable({
  features,
  columns,
  data,
  getRowId: (row: SalesLine) => String(row.id),
  columnResizeMode: 'onChange',
  initialState: { columnPinning: { start: pinned, end: [] } },
})

const headerGroups = computed(() => table.getHeaderGroups())
const leaves = computed(() => table.getVisibleLeafColumns())
const totalWidth = computed(() => table.getTotalSize())
const rowModel = computed(() => table.getRowModel().rows)

function title(id: string) {
  const leaf = leafOf.get(id)
  return leaf ? t(`report.col.${leaf.title}`) : t(`spike.group.${id.replace('group-', '')}`)
}
function display(row: SalesLine, leaf: SpikeLeaf) {
  const value = row[leaf.field]
  if (leaf.kind === 'money' || leaf.kind === 'number') return money.format(value as number)
  if (leaf.kind === 'time') return formatTime(value as number)
  return value as string
}
const isPinned = (column: SpikeColumn) => column.getIsPinned() === 'start'
const lastPinned = computed(() => leaves.value.filter(isPinned).at(-1)?.id)
function cellStyle(column: SpikeColumn, width = column.getSize()) {
  return { width: `${width}px`, left: isPinned(column) ? `${column.getStart('start')}px` : undefined }
}

// ─── Cuộn ảo + gộp ô ────────────────────────────────────────────────────────
// Ô gộp nằm ở dòng đầu nhóm, cao span × ROW_HEIGHT, đè lên các dòng bên dưới.
// Khi dòng đầu nhóm đã trôi khỏi vùng nhìn thấy nhưng dòng sau còn, vẫn phải vẽ dòng đầu → mở rộng range.
const scroller = useTemplateRef<HTMLDivElement>('scroller')
const virtualizer = useVirtualizer(computed(() => ({
  count: rowModel.value.length,
  getScrollElement: () => scroller.value ?? null,
  estimateSize: () => SPIKE_ROW_HEIGHT,
  overscan: 6,
  rangeExtractor: (range: Range) => {
    const indexes = defaultRangeExtractor(range)
    const first = indexes[0] ?? 0
    let anchor = first
    while (anchor > 0 && spans[anchor] === 0) anchor--
    for (let index = first - 1; index >= anchor; index--) indexes.unshift(index)
    return indexes
  },
})))
const virtualRows = computed(() => virtualizer.value.getVirtualItems())
const mergedLeaves = computed(() => new Set(leaves.value.filter(column => SPIKE_MERGE_FIELDS.has(column.id)).map(column => column.id)))

// ─── Kéo thả cột (chỉ trong cùng nhóm, không kéo cột ghim) ──────────────────
const dragging = ref<string | null>(null)
const dropTarget = ref<string | null>(null)
const canDrag = (id: string) => leafOf.has(id) && !pinned.includes(id)
const canDrop = (id: string) => !!dragging.value && dragging.value !== id && canDrag(id) && groupOf.get(dragging.value) === groupOf.get(id)
function onDragStart(event: DragEvent, id: string) {
  dragging.value = id
  event.dataTransfer?.setData('text/plain', id)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}
function onDragOver(event: DragEvent, id: string) {
  if (!canDrop(id)) return
  event.preventDefault()
  dropTarget.value = id
}
function onDrop(id: string) {
  const from = dragging.value
  if (from && canDrop(id)) {
    const order = leaves.value.map(column => column.id).filter(columnId => columnId !== from)
    const fromIndex = leaves.value.findIndex(column => column.id === from)
    const toIndex = leaves.value.findIndex(column => column.id === id)
    // Kéo sang phải: đặt sau cột đích; sang trái: đặt trước
    order.splice(order.indexOf(id) + (fromIndex < toIndex ? 1 : 0), 0, from)
    table.setColumnOrder(order)
  }
  onDragEnd()
}
function onDragEnd() {
  dragging.value = null
  dropTarget.value = null
}
</script>

<template>
  <div class="spike-grid" role="region" :aria-label="t('spike.label')">
    <div ref="scroller" class="spike-grid__scroll" tabindex="0">
      <div role="table" :aria-rowcount="rowModel.length + 2" :style="{ width: `${totalWidth}px` }">
        <div class="spike-grid__head" role="rowgroup">
          <div v-for="group in headerGroups" :key="group.id" class="spike-grid__row" role="row">
            <div
              v-for="header in group.headers"
              :key="header.id"
              class="spike-grid__cell spike-grid__th"
              :class="{
                'is-pinned': isPinned(header.column),
                'is-edge': header.column.columns.length ? header.column.columns.at(-1)?.id === lastPinned : header.column.id === lastPinned,
                'is-end': ['money', 'number'].includes(leafOf.get(header.column.id)?.kind ?? ''),
                'is-drop': dropTarget === header.column.id,
              }"
              role="columnheader"
              :aria-colspan="header.colSpan > 1 ? header.colSpan : undefined"
              :style="{ width: `${header.getSize()}px`, left: isPinned(header.column) ? `${header.getStart('start')}px` : undefined }"
              @dragover="onDragOver($event, header.column.id)"
              @drop="onDrop(header.column.id)"
            >
              <span
                class="spike-grid__label"
                :draggable="canDrag(header.column.id)"
                :title="canDrag(header.column.id) ? t('spike.dragHint') : undefined"
                @dragstart="onDragStart($event, header.column.id)"
                @dragend="onDragEnd"
              >
                <span v-if="canDrag(header.column.id)" class="spike-grid__grip" aria-hidden="true">⠿</span>{{ title(header.column.id) }}
              </span>
              <span
                v-if="!header.isPlaceholder && header.column.getCanResize() && leafOf.has(header.column.id)"
                class="spike-grid__resize"
                :class="{ 'is-active': header.column.getIsResizing() }"
                role="separator"
                :aria-label="t('spike.resize')"
                @mousedown="header.getResizeHandler()($event)"
                @touchstart="header.getResizeHandler()($event)"
              />
            </div>
          </div>
        </div>
        <div class="spike-grid__body" role="rowgroup" :style="{ height: `${virtualizer.getTotalSize()}px` }">
          <div
            v-for="item in virtualRows"
            :key="item.index"
            class="spike-grid__row"
            :class="{ 'is-anchor': (spans[item.index] ?? 1) > 1 }"
            role="row"
            :aria-rowindex="item.index + 3"
            :style="{ transform: `translateY(${item.start}px)` }"
          >
            <template v-for="column in leaves" :key="column.id">
              <div
                v-if="mergedLeaves.has(column.id)"
                class="spike-grid__cell is-merged"
                :class="{ 'is-pinned': isPinned(column), 'is-edge': column.id === lastPinned, 'is-covered': spans[item.index] === 0 }"
                role="cell"
                :aria-rowspan="(spans[item.index] ?? 1) > 1 ? spans[item.index] : undefined"
                :style="[cellStyle(column), (spans[item.index] ?? 1) > 1 ? { height: `${spans[item.index]! * SPIKE_ROW_HEIGHT}px` } : {}]"
              >
                <template v-if="spans[item.index] !== 0">{{ display(rowModel[item.index]!.original, leafOf.get(column.id)!) }}</template>
              </div>
              <div
                v-else
                class="spike-grid__cell"
                :class="{ 'is-pinned': isPinned(column), 'is-edge': column.id === lastPinned, 'is-end': ['money', 'number'].includes(leafOf.get(column.id)!.kind) }"
                role="cell"
                :style="cellStyle(column)"
              >
                <CmsTag v-if="leafOf.get(column.id)!.kind === 'status'" :tone="statusTone[rowModel[item.index]!.original.status]">
                  {{ t(`report.status.${rowModel[item.index]!.original.status}`) }}
                </CmsTag>
                <template v-else>{{ display(rowModel[item.index]!.original, leafOf.get(column.id)!) }}</template>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.spike-grid {
  --spike-head: #edf0f7;
  display: flex;
  min-height: 16rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  overflow: hidden;
}
:global([data-theme='dark']) .spike-grid { --spike-head: var(--field); }

.spike-grid__scroll {
  flex: 1;
  min-width: 0;
  overflow: auto;
  overscroll-behavior: contain;
  contain: strict;
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
}
.spike-grid__head { position: sticky; top: 0; z-index: 3; }
.spike-grid__row {
  display: flex;
  height: v-bind('`${SPIKE_ROW_HEIGHT}px`');
  color: var(--ink-2);
  font-size: var(--type-cell-font-size);
  line-height: 1.125rem;
  font-variant-numeric: tabular-nums;
}
.spike-grid__head .spike-grid__row { height: v-bind('`${SPIKE_HEADER_HEIGHT}px`'); }
.spike-grid__body { position: relative; }
// Dòng đầu nhóm nằm trên các dòng bị gộp để ô gộp (cao nhiều dòng) không bị dòng sau che
.spike-grid__body > .spike-grid__row { position: absolute; top: 0; left: 0; z-index: 1; }
.spike-grid__body > .spike-grid__row.is-anchor { z-index: 2; }
.spike-grid__body > .spike-grid__row:hover .spike-grid__cell:not(.is-merged) { background: var(--subtle); }

.spike-grid__cell {
  position: relative;
  display: flex;
  flex: none;
  box-sizing: border-box;
  align-items: center;
  height: 100%;
  padding: 0 var(--space-8);
  overflow: hidden;
  border-bottom: 1px solid var(--line-soft);
  background: var(--surface);
  white-space: nowrap;
  text-overflow: ellipsis;
  &.is-end { justify-content: flex-end; }
  &.is-pinned { position: sticky; z-index: 1; }
  &.is-edge { box-shadow: 1px 0 0 var(--line), 4px 0 8px -4px rgba(15, 23, 42, .12); }
  // Ô bị gộp: chỉ giữ chỗ trong hàng, ô gộp của dòng đầu nhóm vẽ đè lên
  &.is-covered { border-bottom-color: transparent; }
}
.spike-grid__th {
  overflow: visible;
  border-bottom-color: var(--surface);
  background: var(--spike-head);
  color: var(--ink-2);
  font-size: .75rem;
  font-weight: 600;
  &.is-pinned { z-index: 2; }
  &.is-drop { box-shadow: inset 2px 0 0 var(--primary); }
}
.spike-grid__label {
  display: inline-flex;
  gap: var(--space-4);
  align-items: center;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  &[draggable='true'] { cursor: grab; }
}
.spike-grid__grip { color: var(--ink-faint, var(--ink-muted)); }
.spike-grid__resize {
  position: absolute;
  top: 0;
  right: -3px;
  bottom: 0;
  z-index: 1;
  width: 6px;
  cursor: col-resize;
  touch-action: none;
  &:hover, &.is-active { background: var(--primary); }
}
</style>
