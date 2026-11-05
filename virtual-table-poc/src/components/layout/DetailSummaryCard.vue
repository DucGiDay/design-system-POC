<script setup lang="ts">
import AppIcon from '@/components/icon/AppIcon.vue'

// Thẻ tóm tắt đầu cột trái trang chi tiết (Figma "Thẻ món" 520:2007): ảnh 44 + tên + dòng phụ,
// #tags (CmsTag), vạch, rồi các dòng nhãn / giá trị (`items`).
defineProps<{ title: string; subtitle?: string; image?: string; icon?: string; items?: { label: string; value: string }[] }>()
</script>

<template>
  <div class="cms-summary-card">
    <div class="cms-summary-card__identity">
      <span class="cms-summary-card__avatar">
        <img v-if="image" :src="image" alt="" width="44" height="44" />
        <AppIcon v-else :name="icon ?? 'mon-an'" size="1.25rem" />
      </span>
      <div class="cms-summary-card__names">
        <p class="cms-summary-card__title" :title>{{ title }}</p>
        <p v-if="subtitle" class="cms-summary-card__sub">{{ subtitle }}</p>
      </div>
    </div>
    <div v-if="$slots.tags" class="cms-summary-card__tags"><slot name="tags" /></div>
    <template v-if="items?.length">
      <hr />
      <dl>
        <div v-for="item in items" :key="item.label"><dt>{{ item.label }}</dt><dd>{{ item.value }}</dd></div>
      </dl>
    </template>
  </div>
</template>

<style scoped lang="scss">
.cms-summary-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  padding: var(--space-16);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-lg);
  background: var(--surface);
}
.cms-summary-card__identity { display: flex; gap: var(--space-12); align-items: center; min-width: 0; }
.cms-summary-card__avatar {
  display: grid;
  flex: none;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  overflow: hidden;
  border-radius: var(--radius-md);
  color: var(--ink-muted);
  background: var(--subtle);
  img { width: 100%; height: 100%; object-fit: cover; }
}
.cms-summary-card__names { display: flex; flex: 1; flex-direction: column; gap: 2px; min-width: 0; }
.cms-summary-card__title { overflow: hidden; color: var(--ink); font-size: 1rem; font-weight: 600; line-height: 1.25rem; text-overflow: ellipsis; white-space: nowrap; }
.cms-summary-card__sub { color: var(--ink-muted); font-size: .75rem; line-height: 1rem; }
.cms-summary-card__tags { display: flex; flex-wrap: wrap; gap: var(--space-6); }
hr { height: 1px; margin: 0; border: 0; background: var(--line-soft); }
dl { display: flex; flex-direction: column; gap: var(--space-8); }
dl > div { display: flex; gap: var(--space-8); align-items: center; justify-content: space-between; }
dt { color: var(--ink-muted); font-size: .75rem; line-height: 1rem; }
dd { color: var(--ink); font-size: .875rem; font-weight: 600; line-height: 1.375rem; font-variant-numeric: tabular-nums; }
</style>
