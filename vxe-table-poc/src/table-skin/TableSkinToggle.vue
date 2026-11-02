<script setup lang="ts">
import { setTableSkin, tableSkin, type TableSkin } from './tableSkin'

const options: { value: TableSkin; label: string; title: string }[] = [
  { value: 'cms', label: 'CMS-26', title: 'Component theo design system CMS-26' },
  { value: 'vxe', label: 'vxe gốc', title: 'Component với giao diện mặc định của Vxe' },
]
</script>

<template>
  <div class="table-skin" role="group" aria-label="Giao diện component">
    <span class="table-skin__caption" aria-hidden="true">Giao diện</span>
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="table-skin__option"
      :class="{ 'table-skin__option--selected': tableSkin === option.value }"
      :aria-pressed="tableSkin === option.value"
      :title="option.title"
      @click="setTableSkin(option.value)"
    >{{ option.label }}</button>
  </div>
</template>

<style scoped>
.table-skin { display: inline-flex; align-items: center; gap: 0.125rem; padding: 0.125rem; border: 1px solid var(--line); border-radius: var(--radius-sm); white-space: nowrap; }
.table-skin__caption { padding: 0 0.375rem 0 0.25rem; color: var(--ink-muted); font-size: 0.6875rem; line-height: 1.125rem; }
.table-skin__option { display: inline-flex; padding: 0.125rem 0.5rem; border: 0; border-radius: calc(var(--radius-sm) - 0.125rem); background: transparent; color: var(--ink-2); font-size: 0.75rem; font-weight: 500; line-height: 1.125rem; cursor: pointer; }
.table-skin__option:hover { background: var(--primary-tint); }
.table-skin__option--selected, .table-skin__option--selected:hover { background: var(--primary-soft); color: var(--primary-text); font-weight: 600; }
.table-skin__option:focus-visible { outline: 2px solid var(--primary); outline-offset: 1px; }
@media (max-width: 959px) {
  .table-skin__caption { display: none; }
  .table-skin__option { padding: 0.125rem 0.375rem; font-size: 0.6875rem; }
}
</style>
