<script setup lang="ts">
import { ref } from 'vue'
import TableSkinToggle from '../table-skin/TableSkinToggle.vue'
import VxeProductTable from './table/VxeProductTable.vue'

const logs = ref<string[]>([])

function log(message: string) {
  logs.value = [message, ...logs.value].slice(0, 5)
}
</script>

<template>
  <main class="workspace">
    <header class="page-header">
      <div>
        <h1>Bảng dữ liệu lớn <span class="poc-label">PoC</span></h1>
        <p>Thử nghiệm VxeTable v4 · Vue 3 + TypeScript · Dữ liệu giả lập</p>
      </div>
      <div class="page-header__aside">
        <TableSkinToggle />
        <a class="docs-link" href="https://github.com/x-extends/vxe-table" target="_blank" rel="noreferrer">Tài liệu VxeTable</a>
      </div>
    </header>

    <VxeProductTable @log="log" />

    <section class="activity" aria-labelledby="activity-title">
      <div class="activity-heading"><h2 id="activity-title">Nhật ký thao tác</h2><span>5 sự kiện gần nhất · Có log trong Console</span></div>
      <ol v-if="logs.length"><li v-for="(entry, index) in logs" :key="`${index}-${entry}`">{{ entry }}</li></ol>
      <p v-else class="empty-log">Chưa có thao tác. Kéo một hàng, một cột hoặc đến cuối bảng để bắt đầu.</p>
    </section>
  </main>
</template>
