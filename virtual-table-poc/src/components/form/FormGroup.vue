<script setup lang="ts">
// Nhóm trong khối form (Figma "Nhóm · …"): nền subtle bo 16, đệm 16; đầu nhóm = tiêu đề primary-text + #action (nút SM).
// Lưới 2 cột: bọc trường trong FormGrid. Danh sách công tắc: SettingList.
defineProps<{ title?: string }>()
</script>

<template>
  <div class="cms-form-group" role="group" :aria-label="title">
    <div v-if="title || $slots.action" class="cms-form-group__head">
      <h3 v-if="title">{{ title }}</h3>
      <slot name="action" />
    </div>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.cms-form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  padding: var(--space-16);
  border-radius: 1rem;
  background: var(--subtle);
}
.cms-form-group__head {
  display: flex;
  gap: var(--space-8);
  align-items: center;
  min-height: 1.125rem;
  h3 { flex: 1; min-width: 0; color: var(--primary-text); font-size: .875rem; font-weight: 600; line-height: 1.125rem; }
}
</style>
