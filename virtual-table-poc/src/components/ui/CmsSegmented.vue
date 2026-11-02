<script setup lang="ts">
defineProps<{ options: { value: string; label: string }[]; label: string; compact?: boolean }>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="cms-segmented" :class="{ 'cms-segmented--compact': compact }" role="group" :aria-label="label">
    <button v-for="option in options" :key="option.value" type="button" class="cms-segmented__item" :class="{ 'cms-segmented__item--selected': model === option.value }" :aria-pressed="model === option.value" @click="model = option.value">{{ option.label }}</button>
  </div>
</template>

<style scoped lang="scss">
.cms-segmented { display: inline-flex; padding: var(--space-4); gap: var(--space-2); border-radius: var(--radius-md); background: var(--field); box-shadow: var(--shadow-inside-stroke); }
.cms-segmented__item { flex: 1; white-space: nowrap; padding: var(--space-6) var(--space-12); border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--ink-muted); font: 500 var(--type-cell-font-size)/var(--type-cell-line-height) var(--font-sans); cursor: pointer; }
.cms-segmented__item:hover { color: var(--primary-text); }
.cms-segmented__item--selected { background: var(--surface); color: var(--ink); box-shadow: var(--shadow-raised); font-weight: 600; }
.cms-segmented__item:focus-visible { outline: 2px solid var(--primary); outline-offset: 1px; }
.cms-segmented--compact { background: var(--surface); }
.cms-segmented--compact .cms-segmented__item { padding: var(--space-2) var(--space-10); font-size: var(--type-caption-font-size); line-height: var(--type-caption-line-height); }
.cms-segmented--compact .cms-segmented__item--selected { color: var(--primary-text); background: var(--primary-soft); box-shadow: none; }
</style>
