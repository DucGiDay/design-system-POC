<script setup lang="ts">
import CmsPageHeader from '@/components/ui/CmsPageHeader.vue'
import CmsAppActions from './CmsAppActions.vue'
import SubNavToggle from './SubNavToggle.vue'

/**
 * Layout trang danh sách (Figma MA01 457:153):
 *   Header/Trang (tiêu đề + mô tả · hành động chung)
 *   Thanh công cụ: #filters (tìm kiếm, select lọc, Nâng cao) ··· #actions (nút tạo, tiện ích)
 *   #default: bảng (CmsDataTable) — co giãn hết chiều cao còn lại, cuộn trong bảng
 *   #footer: phân trang (CmsPagination)
 * Header phải khác hành động chung thì truyền #header-actions.
 */
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <section class="cms-list-layout">
    <CmsPageHeader :title :description>
      <template #leading><SubNavToggle /></template>
      <template #actions><slot name="header-actions"><CmsAppActions /></slot></template>
    </CmsPageHeader>

    <div v-if="$slots.filters || $slots.actions" class="cms-list-layout__toolbar">
      <div class="cms-list-layout__filters"><slot name="filters" /></div>
      <div class="cms-list-layout__actions"><slot name="actions" /></div>
    </div>

    <slot name="summary" />
    <div class="cms-list-layout__body"><slot /></div>
    <div v-if="$slots.footer" class="cms-list-layout__footer"><slot name="footer" /></div>
  </section>
</template>

<style scoped lang="scss">
// Khoảng cách theo Figma: header → công cụ 24, công cụ → bảng 20, bảng → phân trang 10 (đệm của CmsPagination)
.cms-list-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: var(--space-24);
  background: var(--surface);
}
.cms-list-layout__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
  align-items: center;
  margin-top: var(--space-24);
}
.cms-list-layout__filters,
.cms-list-layout__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
  align-items: center;
}
.cms-list-layout__filters { flex: 1 1 auto; min-width: 0; }
.cms-list-layout__filters > :deep(.cms-search-box) { width: 13.75rem; }
// Bảng cao theo số dòng; vượt quá chiều cao còn lại thì co lại và cuộn bên trong (tiêu đề cột dính trên)
.cms-list-layout__body {
  display: flex;
  flex: 0 1 auto;
  flex-direction: column;
  min-height: 0;
  margin-top: 1.25rem;
  > :deep(*) { flex: 0 1 auto; min-height: 0; }
}
.cms-list-layout__footer { margin-top: var(--space-10); }

// Mobile: cả trang cuộn, bảng cao theo nội dung
@media (max-width: 959px) {
  .cms-list-layout { height: auto; padding: var(--space-16); }
  .cms-list-layout__filters > :deep(.cms-search-box) { flex: 1 1 100%; width: auto; }
  .cms-list-layout__actions { width: 100%; }
  // Ngôn ngữ, tài khoản… đã có trong menu chính mobile; giữ header trang gọn
  .cms-page-header :deep(.cms-app-actions) { display: none; }
}
</style>
