<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppIcon from '../icon/AppIcon.vue'
defineProps<{ title: string; subtitle: string; icon: string }>()
const emit = defineEmits<{ detail: [] }>()
const { t } = useI18n()
</script>

<template>
  <article class="cms-report-card">
    <header class="cms-report-card__head">
      <AppIcon class="cms-report-card__icon" :name="icon" size="1.125rem" />
      <div class="cms-report-card__texts"><h3 :title="title">{{ title }}</h3><p>{{ subtitle }}</p></div>
      <button type="button" class="cms-report-card__detail" :aria-label="t('dashboard.detailOf', { title })" @click="emit('detail')"><span>{{ t('dashboard.detail') }}</span><AppIcon name="mui-ten-phai" size=".875rem" /></button>
    </header>
    <div class="cms-report-card__body"><slot /></div>
    <footer v-if="$slots.footer" class="cms-report-card__footer"><slot name="footer" /></footer>
  </article>
</template>

<style scoped lang="scss">
.cms-report-card { min-width: 0; padding: var(--space-16); border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--surface); display: flex; flex-direction: column; gap: var(--space-16); }
.cms-report-card__head { display: flex; align-items: center; gap: var(--space-10); }
// Một icon xám trơn trước tiêu đề, không đặt trong ô màu (taste skill: không lặp icon trong ô trên mọi card)
.cms-report-card__icon { color: var(--ink-muted); }
.cms-report-card__texts { flex: 1; min-width: 0; }
.cms-report-card__texts h3 { margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: var(--type-report-title-font-size); line-height: var(--type-report-title-line-height); font-weight: 600; }
.cms-report-card__texts p { margin: var(--space-2) 0 0; overflow: hidden; text-overflow: ellipsis; color: var(--ink-muted); font-size: var(--type-caption-font-size); line-height: var(--type-caption-line-height); white-space: nowrap; }
// "Chi tiết" luôn hiện chữ ở mọi bề rộng; đây là hành động duy nhất của card
.cms-report-card__detail {
  display: flex; flex: none; gap: var(--space-2); align-items: center; padding: 0; border-radius: var(--radius-sm);
  color: var(--primary-text) !important; background: transparent; font-size: var(--type-cell-font-size) !important; font-weight: 500; white-space: nowrap;
  &:hover span { text-decoration: underline; text-underline-offset: .2em; }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
}
.cms-report-card__body { flex: 1; min-height: 0; }
.cms-report-card__footer { display: flex; align-items: center; justify-content: space-between; gap: var(--space-8); min-height: 2.375rem; padding: var(--space-10) var(--space-12); border-radius: var(--radius-md); background: var(--field); color: var(--ink-muted); font-size: var(--type-caption-font-size); line-height: var(--type-caption-line-height); }
.cms-report-card__footer :deep(strong) { color: var(--ink-2); white-space: nowrap; font-weight: 600; }
@container dashboard (max-width: 68rem) { .cms-report-card__head { gap: var(--space-8); } }
</style>
