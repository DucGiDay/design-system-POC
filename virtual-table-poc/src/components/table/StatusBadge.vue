<script setup lang="ts">
import type { OrderStatus } from '@/mock/orders'

defineProps<{ status: OrderStatus }>()

// Soft-Pair Rule (DESIGN.md): nền nhạt + chữ đậm cùng họ màu, bo 6px.
const STATUS_META: Record<OrderStatus, { label: string; class: string }> = {
  pending: { label: 'Chờ xử lý', class: 'fb-status-badge--pending' },
  processing: { label: 'Đang làm', class: 'fb-status-badge--processing' },
  completed: { label: 'Hoàn tất', class: 'fb-status-badge--completed' },
  cancelled: { label: 'Đã huỷ', class: 'fb-status-badge--cancelled' },
  paused: { label: 'Tạm ngưng', class: 'fb-status-badge--paused' },
}
</script>

<template>
  <span
    class="fb-status-badge"
    :class="STATUS_META[status].class"
  >
    {{ STATUS_META[status].label }}
  </span>
</template>
