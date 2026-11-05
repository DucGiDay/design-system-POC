<script setup lang="ts">
// Khung trắng chứa các SettingRow (Figma "Danh sách"): bo 10, đệm ngang 16, các dòng xếp liền (gap 0).
</script>

<template>
  <div class="cms-setting-list"><slot /></div>
</template>

<style scoped lang="scss">
.cms-setting-list {
  display: flex;
  flex-direction: column;
  padding: 0 var(--space-16);
  border-radius: var(--radius-md);
  background: var(--surface);
}
</style>
