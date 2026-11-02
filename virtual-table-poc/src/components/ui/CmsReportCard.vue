<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '../icon/AppIcon.vue'
defineProps<{ title: string; subtitle: string; icon: string }>()
const emit = defineEmits<{ detail: []; export: [format: 'csv' | 'svg' | 'png'] }>()
const { t } = useI18n()
const menu = ref<HTMLDetailsElement>()
function download(format: 'csv' | 'svg' | 'png') { emit('export', format); menu.value?.removeAttribute('open') }
</script>

<template>
  <article class="cms-report-card">
    <header class="cms-report-card__head">
      <span class="cms-report-card__icon"><AppIcon :name="icon" size="1.125rem" /></span>
      <div class="cms-report-card__texts"><h3 :title="title">{{ title }}</h3><p>{{ subtitle }}</p></div>
      <button type="button" class="cms-report-card__detail" :aria-label="t('dashboard.detailOf', { title })" @click="emit('detail')"><span>{{ t('dashboard.detail') }}</span><AppIcon name="mui-ten-phai" size=".875rem" /></button>
      <details ref="menu" class="cms-report-card__menu" @keydown.esc="menu?.removeAttribute('open')" @focusout="(event: FocusEvent) => { if (!menu?.contains(event.relatedTarget as Node)) menu?.removeAttribute('open') }">
        <summary :aria-label="t('dashboard.exportOf', { title })"><AppIcon name="them" size="1rem" /></summary>
        <div class="cms-report-card__popover"><button v-for="format in (['csv', 'svg', 'png'] as const)" :key="format" type="button" @click="download(format)">{{ t('dashboard.download', { format: format.toUpperCase() }) }}</button></div>
      </details>
    </header>
    <div class="cms-report-card__body"><slot /></div>
    <footer v-if="$slots.footer" class="cms-report-card__footer"><slot name="footer" /></footer>
  </article>
</template>

<style scoped lang="scss">
.cms-report-card { min-width: 0; padding: var(--space-16); border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--subtle); display: flex; flex-direction: column; gap: var(--space-16); }
.cms-report-card__head { display: flex; align-items: center; gap: var(--space-10); }
.cms-report-card__icon { display: grid; place-items: center; width: 2rem; height: 2rem; flex: none; color: var(--ink-2); background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); }
.cms-report-card__texts { flex: 1; min-width: 0; }
.cms-report-card__texts h3 { margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: var(--type-report-title-font-size); line-height: var(--type-report-title-line-height); font-weight: 600; }
.cms-report-card__texts p { margin: var(--space-2) 0 0; color: var(--ink-muted); font-size: var(--type-caption-font-size); line-height: var(--type-caption-line-height); white-space: nowrap; }
.cms-report-card__detail { display: flex; gap: var(--space-2); align-items: center; padding: 0; color: var(--primary-text) !important; background: transparent; font-size: var(--type-cell-font-size) !important; white-space: nowrap; }
.cms-report-card__body { flex: 1; min-height: 0; }
.cms-report-card__footer { display: flex; align-items: center; justify-content: space-between; gap: var(--space-8); min-height: 2.375rem; padding: var(--space-10) var(--space-12); border-radius: var(--radius-md); background: var(--surface); color: var(--ink-muted); font-size: var(--type-caption-font-size); line-height: var(--type-caption-line-height); }
.cms-report-card__footer :deep(strong) { color: var(--ink-2); white-space: nowrap; font-weight: 600; }
.cms-report-card__menu { position: relative; flex: none; }
.cms-report-card__menu summary { list-style: none; cursor: pointer; width: 2rem; height: 2rem; display: grid; place-items: center; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface); }
.cms-report-card__menu summary::-webkit-details-marker { display: none; }
.cms-report-card__menu summary:hover { background: var(--primary-soft); }
.cms-report-card__menu summary:focus-visible { outline: 2px solid var(--primary); }
.cms-report-card__popover { position: absolute; inset-inline-end: 0; inset-block-start: calc(100% + var(--space-6)); z-index: 5; padding: var(--space-6); width: 10rem; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow-overlay); }
.cms-report-card__popover button { display: block; width: 100%; padding: var(--space-8); text-align: start; border-radius: var(--radius-sm); background: transparent; }
.cms-report-card__popover button:hover { background: var(--primary-soft); }
@container dashboard (max-width: 68rem) { .cms-report-card__head { gap: var(--space-8); } .cms-report-card__detail span { display: none; } }
</style>
