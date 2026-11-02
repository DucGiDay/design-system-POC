<script setup lang="ts">
// Tag trong bảng theo components.css (cms-tag). Soft-Pair: nền -soft + chữ đậm cùng họ màu.
withDefaults(defineProps<{
  tone?: 'success' | 'warning' | 'info' | 'neutral' | 'danger'
}>(), { tone: 'neutral' })
</script>

<template>
  <span class="cms-tag" :class="`cms-tag--${tone}`"><slot /></span>
</template>

<style scoped lang="scss">
.cms-tag {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-8);
  border-radius: var(--radius-sm);
  font-size: var(--type-caption-font-size);
  font-weight: 500;
  line-height: var(--type-caption-line-height);
  white-space: nowrap;
}
.cms-tag--success { color: var(--success-text); background: var(--success-soft); }
.cms-tag--warning { color: var(--warning-text); background: var(--warning-soft); }
.cms-tag--info { color: var(--info-text); background: var(--info-soft); }
.cms-tag--neutral { color: var(--ink-muted); background: var(--ground); }
.cms-tag--danger { color: var(--danger-text); background: var(--danger-soft); }
</style>
