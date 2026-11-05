<script setup lang="ts">
// Form/Ô chọn (Figma 225:317): hộp 18px bo 5, viền 1.5 line-strong; chọn = nền primary + dấu tích.
// Không có `label` hiển thị thì truyền `ariaLabel` (ô chọn trong bảng).
defineProps<{ label?: string; description?: string; ariaLabel?: string; indeterminate?: boolean; disabled?: boolean }>()
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="cms-checkbox" :class="{ 'cms-checkbox--bare': !label, 'cms-checkbox--disabled': disabled }">
    <input v-model="model" type="checkbox" class="cms-checkbox__input" :indeterminate :disabled :aria-label="ariaLabel" />
    <span class="cms-checkbox__box" aria-hidden="true">
      <svg v-if="indeterminate" viewBox="0 0 12 12" width="12" height="12"><path d="M3 6h6" /></svg>
      <svg v-else viewBox="0 0 12 12" width="12" height="12"><path d="M2.5 6.2 5 8.5l4.5-5" /></svg>
    </span>
    <span v-if="label" class="cms-checkbox__texts">
      <span class="cms-checkbox__label">{{ label }}</span>
      <span v-if="description" class="cms-checkbox__desc">{{ description }}</span>
    </span>
  </label>
</template>

<style scoped lang="scss">
.cms-checkbox {
  position: relative;
  display: inline-flex;
  gap: var(--space-8);
  align-items: flex-start;
  cursor: pointer;
}
.cms-checkbox--bare { align-items: center; }
.cms-checkbox--disabled { cursor: not-allowed; opacity: .5; }
.cms-checkbox__input {
  position: absolute;
  inset: 0;
  width: 1.125rem;
  height: 1.125rem;
  margin: 0;
  opacity: 0;
  cursor: inherit;
}
.cms-checkbox__box {
  display: grid;
  flex: none;
  place-items: center;
  width: 1.125rem;
  height: 1.125rem;
  margin-top: 1px;
  border: 1.5px solid var(--line-strong);
  border-radius: 5px;
  background: var(--surface);
  transition: background-color 120ms ease, border-color 120ms ease;

  svg { fill: none; stroke: #fff; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; opacity: 0; }
}
.cms-checkbox--bare .cms-checkbox__box { margin-top: 0; }
.cms-checkbox:hover .cms-checkbox__input:not(:disabled) + .cms-checkbox__box { border-color: var(--ink-faint); }
.cms-checkbox__input:checked + .cms-checkbox__box,
.cms-checkbox__input:indeterminate + .cms-checkbox__box {
  border-color: var(--primary);
  background: var(--primary);
  svg { opacity: 1; }
}
.cms-checkbox__input:focus-visible + .cms-checkbox__box { box-shadow: var(--focus-ring); border-color: var(--primary); }
.cms-checkbox__texts { display: flex; flex-direction: column; gap: var(--space-2); min-width: 0; }
.cms-checkbox__label { color: var(--ink); font-size: .875rem; font-weight: 500; line-height: 1.25rem; }
.cms-checkbox__desc { color: var(--ink-muted); font-size: .8125rem; line-height: 1.125rem; }
</style>
