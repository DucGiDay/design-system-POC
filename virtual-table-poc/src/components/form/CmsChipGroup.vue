<script setup lang="ts" generic="T extends string | number">
// Chip chọn nhiều (Figma "Chip · Thứ 2", "Chip · 0h"): viền line bo 6; đang chọn = nền primary-tint, viền + chữ primary.
// Mỗi chip là nút bật/tắt (aria-pressed). `width` = rộng theo Figma (94 ngày, 51 giờ); chip được co tới `minWidth`
// để số chip mỗi hàng giữ như Figma khi cột hẹp hơn chút (thanh cuộn, màn nhỏ).
defineProps<{ label: string; options: { value: T; label: string }[]; width?: string; minWidth?: string }>()
const model = defineModel<T[]>({ default: () => [] })
function toggle(value: T) {
  model.value = model.value.includes(value) ? model.value.filter(item => item !== value) : [...model.value, value]
}
</script>

<template>
  <div class="cms-chip-group" role="group" :aria-label="label">
    <button v-for="option in options" :key="option.value" type="button" class="cms-chip" :style="width ? { maxWidth: width, minWidth: minWidth ?? width } : undefined" :aria-pressed="model.includes(option.value)" @click="toggle(option.value)">
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.cms-chip-group { display: flex; flex-wrap: wrap; gap: var(--space-8); }
.cms-chip {
  display: inline-flex;
  flex: 1 0 0;
  align-items: center;
  justify-content: center;
  padding: .4375rem var(--space-6);
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--ink-2);
  background: var(--surface);
  font: inherit;
  font-size: .8125rem;
  line-height: 1rem;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease;
  &:hover { border-color: var(--line-strong); }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
  &[aria-pressed='true'] { border-color: var(--primary); color: var(--primary-text); background: var(--primary-tint); font-weight: 500; }
}
</style>
