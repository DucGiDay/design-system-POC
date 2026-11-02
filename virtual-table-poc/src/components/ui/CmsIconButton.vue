<script setup lang="ts">
import AppIcon from '@/components/icon/AppIcon.vue'

// Nút chỉ có icon theo components.css (cms-icon-btn). `label` bắt buộc vì nút không có chữ.
withDefaults(defineProps<{
  icon: string
  label: string
  outline?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(), { type: 'button' })
</script>

<template>
  <button
    :type="type"
    class="cms-icon-btn"
    :class="{ 'cms-icon-btn--outline': outline }"
    :disabled="disabled"
    :aria-label="label"
    :title="label"
  >
    <AppIcon :name="icon" size="1.125rem" />
  </button>
</template>

<style scoped lang="scss">
.cms-icon-btn {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  // Figma: đệm 9px quanh icon 18px
  padding: .5625rem;
  border: 0;
  border-radius: var(--radius-md);
  color: var(--ink-2);
  background: transparent;
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease;

  &:hover:not(:disabled) { color: var(--ink); background: var(--field); }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
  // TODO(design): chờ Figma — disabled theo quy ước tạm
  &:disabled { cursor: not-allowed; opacity: .5; }
}
.cms-icon-btn--outline {
  background: var(--surface);
  box-shadow: var(--shadow-inside-stroke);

  &:hover:not(:disabled) { background: var(--subtle); }
}
</style>
