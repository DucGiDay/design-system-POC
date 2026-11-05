<script setup lang="ts">
import { useId } from 'vue'
import AppIcon from '@/components/icon/AppIcon.vue'

// Form/Dòng cài đặt (Figma 251:330): nhãn (+ mô tả, + gợi ý) bên trái, điều khiển bên phải qua #control.
// Đặt trong SettingList. `divider` = vạch dưới; `indent` = dòng phụ thụt 14 (hiện khi dòng cha bật).
// #control nhận `labelledby` để gắn vào CmsSwitch / ô nhập (aria-labelledby).
withDefaults(defineProps<{ label: string; description?: string; tip?: string; divider?: boolean; indent?: boolean }>(), { divider: true })
const id = useId()
</script>

<template>
  <div class="cms-setting-row" :class="{ 'has-divider': divider, 'is-indent': indent }">
    <div class="cms-setting-row__texts">
      <span :id="`${id}-label`" class="cms-setting-row__label">{{ label }}</span>
      <span v-if="description" class="cms-setting-row__desc">{{ description }}</span>
      <span v-if="tip" class="cms-setting-row__tip" tabindex="0" :aria-label="tip" :title="tip"><AppIcon name="thong-tin" size=".875rem" /></span>
    </div>
    <slot name="control" :labelledby="`${id}-label`" />
  </div>
</template>

<style scoped lang="scss">
.cms-setting-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8) var(--space-16);
  align-items: center;
  min-height: 2.625rem;
  padding: var(--space-4) 0;
  &.has-divider { border-bottom: 1px solid var(--line-soft); }
  &.is-indent { margin-left: .875rem; }
}
.cms-setting-row__texts {
  display: flex;
  // Màn hẹp: ô nhập rộng xuống dòng dưới nhãn thay vì tràn ngang
  flex: 1 1 12rem;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  align-items: center;
  min-width: 0;
}
.cms-setting-row__label { color: var(--ink); font-size: .875rem; line-height: 1.25rem; }
.cms-setting-row__desc { color: var(--ink-muted); font-size: .75rem; line-height: 1rem; }
.cms-setting-row__tip {
  display: inline-flex;
  color: var(--ink-muted);
  cursor: help;
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 50%; }
}
</style>

<style lang="scss">
/* Điều khiển dùng chung trong #control của SettingRow (không scoped vì nằm trong slot) */
.cms-setting-value {
  display: inline-flex;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-4) var(--space-6);
  margin-right: calc(-1 * var(--space-6));
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--ink-2);
  background: transparent;
  font: inherit;
  font-size: .8125rem;
  font-weight: 500;
  cursor: pointer;
  &:hover { background: var(--field); }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
}
.cms-setting-input {
  display: inline-flex;
  flex: none;
  gap: var(--space-6);
  align-items: center;
  width: 7.5rem;
  height: 2rem;
  padding: 0 var(--space-12);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--ink-muted);
  font-size: .8125rem;
  &:hover { border-color: var(--line-strong); }
  &:focus-within { border-color: var(--primary); box-shadow: var(--focus-ring); }
  &.is-wide { width: min(18.75rem, 100%); }
  input {
    flex: 1;
    min-width: 0;
    padding: 0;
    border: 0;
    color: var(--ink);
    background: transparent;
    font: inherit;
    font-size: .875rem;
    line-height: 1.25rem;
    &::placeholder { color: var(--ink-faint); opacity: 1; }
    &:focus-visible { outline: none; }
  }
}
</style>
