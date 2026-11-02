<script setup lang="ts">
import AppIcon from '../icon/AppIcon.vue'

// Nút theo components.css (cms-btn). Mỗi màn chỉ một nút variant="primary"; "ai" chỉ cho tính năng iOne.
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'subtle' | 'ai' | 'danger'
  size?: 'md' | 'sm'
  /** Tên icon trong src/assets/icons, đặt trước chữ */
  icon?: string
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(), { variant: 'secondary', size: 'md', type: 'button' })
</script>

<template>
  <button
    :type="type"
    class="cms-btn"
    :class="[`cms-btn--${variant}`, `cms-btn--${size}`]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="cms-btn__spinner" aria-hidden="true" />
    <AppIcon v-else-if="icon" :name="icon" size="1rem" />
    <slot />
  </button>
</template>

<style scoped lang="scss">
.cms-btn {
  display: inline-flex;
  flex: none;
  gap: var(--space-6);
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 120ms ease, box-shadow 120ms ease;

  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
  // TODO(design): chờ Figma — disabled theo quy ước tạm (mờ 50%, con trỏ cấm, không đổi màu khi rê)
  &:disabled { cursor: not-allowed; opacity: .5; }
  // TODO(design): chờ Figma — đang xử lý: giữ kích thước, thay icon bằng vòng xoay, không làm mờ
  &[aria-busy='true'] { cursor: progress; opacity: 1; }
}

.cms-btn--md {
  padding: var(--space-8) var(--space-14);
  font-size: var(--type-cell-font-size);
  line-height: var(--type-cell-line-height);
}
// Figma đặt đệm dọc 7px cho nút SM, nằm ngoài thang spacing
.cms-btn--sm {
  padding: .4375rem var(--space-10);
  font-size: var(--type-caption-font-size);
  line-height: var(--type-caption-line-height);
}

.cms-btn--primary {
  color: var(--surface);
  background: var(--primary);
  &:hover:not(:disabled) { background: var(--primary-strong); }
}
.cms-btn--secondary {
  color: var(--ink-2);
  background: var(--surface);
  box-shadow: var(--shadow-inside-stroke);
  &:hover:not(:disabled) { background: var(--subtle); }
}
.cms-btn--subtle {
  color: var(--ink-2);
  background: var(--field);
  &:hover:not(:disabled) { background: var(--line); }
}
.cms-btn--ai {
  color: var(--surface);
  background: var(--violet);
  &:hover:not(:disabled) { background: var(--violet-strong); }
}
// Soft-Pair: hành động nguy hiểm dùng nền danger-soft + chữ danger, không dùng nền đỏ đặc
.cms-btn--danger {
  color: var(--danger-text);
  background: var(--danger-soft);
  &:hover:not(:disabled) { background: var(--danger-soft-hover); }
}

.cms-btn__spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--radius-full);
  animation: cms-btn-spin 700ms linear infinite;
}
@keyframes cms-btn-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .cms-btn__spinner { animation-duration: 2s; }
}
</style>
