<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, shallowRef } from 'vue'
import type { VxeTableInstance, VxeTableEvents } from 'vxe-table'
import { createRecords, type ProductRecord } from '../data/records'

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
const logs = ref<string[]>([])
let nextId = INITIAL_COUNT + 1
let disposed = false
let timer: ReturnType<typeof setTimeout> | undefined
let cancelDelay: (() => void) | undefined
const number = new Intl.NumberFormat('vi-VN')
const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

function log(message: string) {
  logs.value = [message, ...logs.value].slice(0, 5)
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
  <main class="workspace">
    <header class="page-header">
      <div>
        <h1>Bảng dữ liệu lớn <span class="poc-label">PoC</span></h1>
        <p>Thử nghiệm VxeTable v4 · Vue 3 + TypeScript · Dữ liệu giả lập</p>
      </div>
      <a class="docs-link" href="https://github.com/x-extends/vxe-table" target="_blank" rel="noreferrer">Tài liệu VxeTable</a>
    </header>

    <section class="table-panel" aria-label="Bảng sản phẩm giả lập">
      <div class="toolbar">
        <div class="table-summary"><h2>Sản phẩm</h2><span data-testid="record-count">{{ number.format(tableData.length) }} dòng</span></div>
        <div class="actions">
          <label class="auto-load"><input v-model="autoLoad" type="checkbox" /> Tự tải khi chạm đáy</label>
          <button class="secondary" type="button" @click="tableRef?.scrollTo({ top: 0 })">Về đầu bảng</button>
          <button class="primary" type="button" :disabled="loading" @click="jumpToBottom">Đến cuối bảng</button>
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
          <template #default="{ row }"><span class="status-badge" :class="row.status.toLowerCase()">{{ row.status }}</span></template>
        </vxe-column>
        <vxe-column field="createdAt" title="Ngày tạo" width="140" />
      </vxe-table>

      <footer class="table-footer">
        <span>Virtual scroll <strong>đang bật</strong> · Khung bảng 600px</span>
        <div class="load-state" role="status" aria-live="polite">
          <template v-if="error"><span class="error-text">{{ error }}</span><button type="button" class="secondary" @click="loadMore">Thử lại</button></template>
          <span v-else-if="loading">Đang tải thêm 50 dòng…</span>
          <span v-else>{{ batches }} lượt tải thêm · 50 dòng / lượt</span>
        </div>
      </footer>
    </section>

    <section class="activity" aria-labelledby="activity-title">
      <div class="activity-heading"><h2 id="activity-title">Nhật ký thao tác</h2><span>5 sự kiện gần nhất · Có log trong Console</span></div>
      <ol v-if="logs.length"><li v-for="(entry, index) in logs" :key="`${index}-${entry}`">{{ entry }}</li></ol>
      <p v-else class="empty-log">Chưa có thao tác. Kéo một hàng, một cột hoặc đến cuối bảng để bắt đầu.</p>
    </section>
  </main>
</template>
