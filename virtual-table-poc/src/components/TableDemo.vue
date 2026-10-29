<script setup lang="ts">
import VirtualTanStackTable from './table/VirtualTanStackTable.vue'
</script>

<template>
  <main class="fb-min-h-screen fb-bg-ground fb-font-sans fb-text-ink">
    <div class="fb-mx-auto fb-max-w-[1200px] fb-px-4 fb-py-8 sm:fb-px-6">
      <header class="fb-mb-6">
        <RouterLink to="/" class="fb-text-label fb-text-primary-text">Vue 3 · TanStack Table — Về trang nháp sidebar</RouterLink>
        <h1 class="fb-mt-1 fb-text-page-title fb-text-ink">Bảng dữ liệu lớn</h1>
        <p class="fb-mt-1 fb-max-w-[720px] fb-text-body fb-text-ink-muted">
          10.000 đơn hàng giả lập, chỉ render các hàng trong vùng nhìn thấy. Cuộn gần đáy để tải thêm 50 dòng, kéo
          thả để sắp xếp hàng và cột.
        </p>
      </header>
      <VirtualTanStackTable />
    </div>
  </main>
</template>
