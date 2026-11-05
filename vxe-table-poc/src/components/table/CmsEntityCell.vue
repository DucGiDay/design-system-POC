<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/icon/AppIcon.vue'

// Ô tên trong bảng (Figma "Cột · Tên món"): ảnh 32 bo sm (không có ảnh → nền subtle + icon 16),
// tên SemiBold 13 (link sang chi tiết) và dòng phụ 12 muted. Chữ dài cắt bằng dấu …
defineProps<{ title: string; subtitle?: string; to?: string; image?: string; icon?: string }>()
</script>

<template>
  <div class="cms-entity-cell">
    <span class="cms-entity-cell__thumb">
      <img v-if="image" :src="image" alt="" loading="lazy" width="32" height="32" />
      <AppIcon v-else :name="icon ?? 'mon-an'" size="1rem" />
    </span>
    <span class="cms-entity-cell__texts">
      <RouterLink v-if="to" :to class="cms-entity-cell__title" :title>{{ title }}</RouterLink>
      <span v-else class="cms-entity-cell__title" :title>{{ title }}</span>
      <span v-if="subtitle" class="cms-entity-cell__sub">{{ subtitle }}</span>
    </span>
  </div>
</template>

<style scoped lang="scss">
.cms-entity-cell { display: flex; gap: var(--space-10); align-items: center; min-width: 0; }
.cms-entity-cell__thumb {
  display: grid;
  flex: none;
  place-items: center;
  width: 2rem;
  height: 2rem;
  overflow: hidden;
  border-radius: var(--radius-sm);
  color: var(--ink-muted);
  background: var(--subtle);
  img { width: 100%; height: 100%; object-fit: cover; }
}
.cms-entity-cell__texts { display: flex; flex: 1; flex-direction: column; gap: 2px; min-width: 0; }
.cms-entity-cell__title, .cms-entity-cell__sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cms-entity-cell__title {
  color: var(--ink);
  font-size: .8125rem;
  font-weight: 600;
  line-height: 1.125rem;
  text-underline-offset: 3px;
}
a.cms-entity-cell__title {
  &:hover { color: var(--primary-text); text-decoration: underline; }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 2px; }
}
.cms-entity-cell__sub { color: var(--ink-muted); font-size: .75rem; line-height: 1rem; }
</style>
