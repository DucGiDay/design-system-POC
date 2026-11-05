<script setup lang="ts">
import AppIcon from '@/components/icon/AppIcon.vue'

// Khối form trong trang chi tiết (Figma "Section · …" + Form/Đầu khối 210:355): thẻ trắng viền line-soft,
// đầu khối = chip icon + tiêu đề + mô tả. Nội dung là các FormGroup. `id` dùng cho mục lục.
defineProps<{ id: string; title: string; description?: string; icon: string }>()
</script>

<template>
  <section :id class="cms-detail-section" :aria-labelledby="`${id}-title`" tabindex="-1">
    <header class="cms-detail-section__head">
      <span class="cms-detail-section__chip"><AppIcon :name="icon" size="1.125rem" /></span>
      <div class="cms-detail-section__texts">
        <h2 :id="`${id}-title`">{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
      <slot name="head-actions" />
    </header>
    <div class="cms-detail-section__body"><slot /></div>
  </section>
</template>

<style scoped lang="scss">
.cms-detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-24);
  padding: 1.25rem;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-lg);
  background: var(--surface);
  outline: none;
}
.cms-detail-section__head { display: flex; gap: var(--space-12); align-items: center; }
.cms-detail-section__chip {
  display: grid;
  flex: none;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-md);
  color: var(--primary);
  background: var(--primary-tint);
}
.cms-detail-section__texts {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  h2 { color: var(--ink); font-size: 1rem; font-weight: 600; line-height: 1.25rem; }
  p { color: var(--ink-muted); font-size: .8125rem; line-height: 1.125rem; }
}
.cms-detail-section__body { display: flex; flex-direction: column; gap: var(--space-16); }
</style>
