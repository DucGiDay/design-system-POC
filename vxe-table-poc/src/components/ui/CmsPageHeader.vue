<script setup lang="ts">
// Header trang theo components.css (cms-page-header): tiêu đề + mô tả bên trái, cụm hành động bên phải.
// Slot #actions đặt CmsButton / CmsIconButton; cả màn chỉ một nút primary.
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <header class="cms-page-header">
    <div class="cms-page-header__titles">
      <h1 class="cms-page-header__title">{{ title }}</h1>
      <p v-if="description" class="cms-page-header__desc">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="cms-page-header__actions"><slot name="actions" /></div>
  </header>
</template>

<style scoped lang="scss">
.cms-page-header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-12) var(--space-16);
  align-items: center;
  justify-content: space-between;
}

.cms-page-header__titles {
  display: flex;
  flex: 1 1 18rem;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}
.cms-page-header__title {
  margin: 0;
  overflow: hidden;
  color: var(--ink);
  font-size: var(--type-section-font-size);
  font-weight: var(--type-section-font-weight);
  line-height: var(--type-section-line-height);
  letter-spacing: var(--type-section-letter-spacing);
  text-overflow: ellipsis;
  white-space: nowrap;
}
// Figma: mô tả 13/18
.cms-page-header__desc {
  color: var(--ink-muted);
  font-size: var(--type-cell-font-size);
  line-height: 1.125rem;
}

.cms-page-header__actions {
  display: flex;
  flex: none;
  gap: var(--space-10);
  align-items: center;
}
</style>
