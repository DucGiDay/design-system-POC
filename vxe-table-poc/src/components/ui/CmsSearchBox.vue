<script setup lang="ts">
import AppIcon from '@/components/icon/AppIcon.vue'

// Ô tìm kiếm (Figma 36:107): cao 36, icon kính lúp 16 + chữ 13. Chỉ có ô, không có nhãn hiển thị → `label` bắt buộc.
defineProps<{ label: string; placeholder?: string }>()
const model = defineModel<string>({ default: '' })
</script>

<template>
  <label class="cms-search-box">
    <AppIcon name="tim-kiem" size="1rem" />
    <input v-model="model" type="search" :aria-label="label" :placeholder="placeholder ?? label" @keydown.esc="model = ''" />
  </label>
</template>

<style scoped lang="scss">
.cms-search-box {
  display: flex;
  gap: var(--space-8);
  align-items: center;
  height: 2.25rem;
  padding: 0 var(--space-12);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  color: var(--ink-muted);
  background: var(--surface);
  cursor: text;
  transition: border-color 120ms ease, box-shadow 120ms ease;

  &:hover { border-color: var(--line-strong); }
  &:focus-within { border-color: var(--primary); box-shadow: var(--focus-ring); }

  input {
    flex: 1;
    min-width: 0;
    padding: 0;
    border: 0;
    color: var(--ink);
    background: transparent;
    font: inherit;
    font-size: .8125rem;
    line-height: 1.25rem;
    caret-color: var(--primary);

    &::placeholder { color: var(--ink-muted); opacity: 1; }
    &:focus-visible { outline: none; }
  }
}
</style>
