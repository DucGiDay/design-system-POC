<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, shallowRef } from 'vue'
import type { VxeTableInstance, VxeTableEvents } from 'vxe-table'
import { createRecords, type ProductRecord } from '../../data/records'
import { tableSkin } from '../../table-skin/tableSkin'

const emit = defineEmits<{ log: [message: string] }>()

const INITIAL_COUNT = 10_000
const BATCH_SIZE = 50
const LOAD_THRESHOLD = 200
const tableRef = ref<VxeTableInstance<ProductRecord>>()
// Avoid deep proxies for 10,000+ records. Replace the array when data changes.
const tableData = shallowRef<ProductRecord[]>(createRecords(1, INITIAL_COUNT))
const loading = ref(false)
const autoLoad = ref(true)
const error = ref('')
const batches = ref(0)
let nextId = INITIAL_COUNT + 1
let disposed = false
let timer: ReturnType<typeof setTimeout> | undefined
let cancelDelay: (() => void) | undefined
const number = new Intl.NumberFormat('vi-VN')
const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

function log(message: string) {
  emit('log', message)
  console.info(`[VxeTable PoC] ${message}`)
}

async function loadMore() {
  if (loading.value || disposed) return
  loading.value = true
  error.value = ''
  try {
    // Simulate network latency without blocking the UI thread.
    await new Promise<void>((resolve) => {
      cancelDelay = resolve
      timer = setTimeout(resolve, 350)
    })
    if (disposed) return
    const newRows = createRecords(nextId, BATCH_SIZE)
    // Read the latest order AFTER the delay: a drag can finish during loading.
    const currentRows = tableRef.value?.getTableData().fullData ?? tableData.value
    tableData.value = [...currentRows, ...newRows]
    nextId += BATCH_SIZE
    batches.value++
    await nextTick()
    log(`Đã tải thêm ${BATCH_SIZE} dòng · Tổng ${number.format(tableData.value.length)} dòng`)
  } catch (cause) {
    error.value = 'Không tải được dữ liệu. Chọn “Thử lại” để tiếp tục.'
    console.error(cause)
  } finally {
    loading.value = false
    cancelDelay = undefined
  }
}

const onScroll: VxeTableEvents.Scroll<ProductRecord> = ({ isY, scrollTop, scrollHeight, bodyHeight }) => {
  if (isY && autoLoad.value && !error.value && scrollHeight - scrollTop - bodyHeight <= LOAD_THRESHOLD) {
    void loadMore()
  }
}

const onRowDragend: VxeTableEvents.RowDragend<ProductRecord> = (event) => {
  // VxeTable already moved the row. Synchronize its order, never move it twice.
  const rows = tableRef.value?.getTableData().fullData
  if (rows) tableData.value = [...rows]
  log(`Hàng ${event.dragRow.code}: vị trí ${event._index.oldIndex + 1} → ${event._index.newIndex + 1}`)
  console.info('row-dragend', event)
}

const onColumnDragend: VxeTableEvents.ColumnDragend<ProductRecord> = (event) => {
  log(`Cột ${event.dragColumn.title}: vị trí ${event._index.oldIndex + 1} → ${event._index.newIndex + 1}`)
  console.info('column-dragend', event)
}

async function jumpToBottom() {
  const table = tableRef.value
  if (!table) return
  await table.scrollTo({ top: table.getScrollData().scrollHeight })
}

onBeforeUnmount(() => {
  disposed = true
  clearTimeout(timer)
  cancelDelay?.()
})
</script>

<template>
  <section class="table-panel" aria-label="Bảng sản phẩm giả lập">
    <div class="toolbar">
      <div class="table-summary"><h2>Sản phẩm</h2><span data-testid="record-count">{{ number.format(tableData.length) }} dòng</span></div>
      <div class="actions">
        <label v-if="tableSkin === 'cms'" class="auto-load"><input v-model="autoLoad" type="checkbox" /> Tự tải khi chạm đáy</label>
        <vxe-checkbox v-else v-model="autoLoad" content="Tự tải khi chạm đáy" />
        <button v-if="tableSkin === 'cms'" class="secondary" type="button" @click="tableRef?.scrollTo({ top: 0 })">Về đầu bảng</button>
        <vxe-button v-else content="Về đầu bảng" @click="tableRef?.scrollTo({ top: 0 })" />
        <button v-if="tableSkin === 'cms'" class="primary" type="button" :disabled="loading" @click="jumpToBottom">Đến cuối bảng</button>
        <vxe-button v-else status="primary" :disabled="loading" content="Đến cuối bảng" @click="jumpToBottom" />
      </div>
    </div>
    <div class="table-help" id="table-help">
      Kéo tay nắm ở đầu dòng để đổi vị trí hàng; kéo tay nắm trên tiêu đề để đổi thứ tự cột.
    </div>

    <vxe-table
      ref="tableRef"
      :data="tableData"
      height="600"
      show-overflow
      :border="false"
      :row-config="{ keyField: 'id', drag: true, isHover: true }"
      :column-config="{ drag: true, resizable: true }"
      :row-drag-config="{ animation: false }"
      :column-drag-config="{ animation: false }"
      :scroll-y="{ enabled: true, gt: 20 }"
      aria-describedby="table-help"
      @scroll="onScroll"
      @row-dragend="onRowDragend"
      @column-dragend="onColumnDragend"
    >
      <!-- v4.23 uses drag-sort; type="drag" is not a supported column type. -->
      <vxe-column type="seq" title="STT" width="90" drag-sort />
      <vxe-column field="id" title="ID" width="90" />
      <vxe-column field="code" title="Mã sản phẩm" width="150" />
      <vxe-column field="name" title="Tên sản phẩm" min-width="220" />
      <vxe-column field="category" title="Danh mục" width="160" />
      <vxe-column field="price" title="Giá bán" width="140" align="right">
        <template #default="{ row }">{{ money.format(row.price) }}</template>
      </vxe-column>
      <vxe-column field="status" title="Trạng thái" width="150">
        <!-- Skin vxe: dùng tag gốc của vxe-pc-ui để trong bảng không còn màu CMS. -->
        <template #default="{ row }">
          <span v-if="tableSkin === 'cms'" class="status-badge" :class="row.status.toLowerCase()">{{ row.status }}</span>
          <vxe-tag v-else :status="row.status.toLowerCase()" :content="row.status" />
        </template>
      </vxe-column>
      <vxe-column field="createdAt" title="Ngày tạo" width="140" />
    </vxe-table>

    <footer class="table-footer">
      <span>Virtual scroll <strong>đang bật</strong> · Khung bảng 600px</span>
      <div class="load-state" role="status" aria-live="polite">
        <template v-if="error"><span class="error-text">{{ error }}</span><button v-if="tableSkin === 'cms'" type="button" class="secondary" @click="loadMore">Thử lại</button><vxe-button v-else content="Thử lại" @click="loadMore" /></template>
        <span v-else-if="loading">Đang tải thêm 50 dòng…</span>
        <span v-else>{{ batches }} lượt tải thêm · 50 dòng / lượt</span>
      </div>
    </footer>
  </section>
</template>
