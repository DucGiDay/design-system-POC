<script setup lang="ts" generic="T extends string | number">
import AppIcon from '@/components/icon/AppIcon.vue'

// Select gọn trên thanh công cụ (Figma 36:112): cao 36, chữ Medium 12, mũi tên 14. Không có nhãn hiển thị → `label` bắt buộc.
// Giá trị `undefined` là "Tất cả …" (`allLabel`).
defineProps<{ label: string; allLabel: string; options: { value: T; label: string }[] }>()
const model = defineModel<T | undefined>()
</script>

<template>
  <span class="cms-filter-select">
    <select v-model="model" :aria-label="label">
      <option :value="undefined">{{ allLabel }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <AppIcon name="mui-ten-xuong" size=".875rem" />
  </span>
</template>

<style scoped lang="scss">
.cms-filter-select {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  color: var(--ink-2);

  select {
    height: 2.25rem;
    max-width: 14rem;
    padding: 0 calc(var(--space-10) + 1.375rem) 0 var(--space-10);
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    color: inherit;
    background: var(--surface);
    font: inherit;
    font-size: .75rem;
    font-weight: 500;
    line-height: 1.125rem;
    text-overflow: ellipsis;
    appearance: none;
    cursor: pointer;

    &:hover { border-color: var(--line-strong); }
    &:focus-visible { border-color: var(--primary); outline: 0; box-shadow: var(--focus-ring); }
  }
  .app-icon {
    position: absolute;
    right: var(--space-10);
    color: var(--ink-muted);
    pointer-events: none;
  }
}
</style>
