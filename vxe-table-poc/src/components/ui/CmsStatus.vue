<script setup lang="ts">
// Trạng thái đơn hàng / quy trình theo components.css (cms-status). Chữ hiển thị do nơi dùng truyền qua slot (i18n).
defineProps<{
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'paused'
}>()
</script>

<template>
  <span class="cms-status" :class="`cms-status--${status}`"><slot /></span>
</template>

<style scoped lang="scss">
.cms-status {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-8);
  border-radius: var(--radius-sm);
  font-size: var(--type-caption-font-size);
  font-weight: 500;
  line-height: var(--type-caption-line-height);
  white-space: nowrap;
}
.cms-status--pending { color: var(--warning-text); background: var(--warning-soft); }
.cms-status--processing { color: var(--primary); background: var(--primary-tint); }
.cms-status--completed { color: var(--success-text); background: var(--success-soft); }
.cms-status--cancelled { color: var(--danger-text); background: var(--danger-soft); }
.cms-status--paused { color: var(--ink-muted); background: var(--field); }
</style>
