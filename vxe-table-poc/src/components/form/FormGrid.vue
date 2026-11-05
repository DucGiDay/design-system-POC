<script setup lang="ts">
// Lưới trường 2 cột, khe 16 (Figma "Lưới trường"). Trường chiếm cả hàng: thêm class `is-full`.
</script>

<template>
  <div class="cms-form-grid"><slot /></div>
</template>

<style lang="scss">
.cms-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-16);
  > .is-full { grid-column: 1 / -1; }
}
@media (max-width: 639px) {
  .cms-form-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
