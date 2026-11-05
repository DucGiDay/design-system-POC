<script setup lang="ts">
// Form/Công tắc (Figma 225:304): 36 × 20, bật = primary, tắt = line-strong, núm trắng 16px.
// Luôn cần nhãn: `label` cho trình đọc màn hình khi chữ hiển thị nằm ở chỗ khác (dòng cài đặt, ô bảng).
defineProps<{ label?: string; disabled?: boolean }>()
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <button
    type="button"
    role="switch"
    class="cms-switch"
    :aria-checked="model"
    :aria-label="label"
    :disabled
    @click="model = !model"
  >
    <span class="cms-switch__knob" aria-hidden="true" />
  </button>
</template>

<style scoped lang="scss">
.cms-switch {
  position: relative;
  flex: none;
  width: 2.25rem;
  height: 1.25rem;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--line-strong);
  cursor: pointer;
  transition: background-color 160ms ease;

  &[aria-checked='true'] { background: var(--primary); }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
  // TODO(design): chờ Figma — disabled theo quy ước tạm
  &:disabled { cursor: not-allowed; opacity: .5; }
}
.cms-switch__knob {
  position: absolute;
  top: .125rem;
  left: .125rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .16);
  transition: transform 160ms cubic-bezier(.2, 0, 0, 1);
}
.cms-switch[aria-checked='true'] .cms-switch__knob { transform: translateX(1rem); }
@media (prefers-reduced-motion: reduce) {
  .cms-switch, .cms-switch__knob { transition: none; }
}
</style>
