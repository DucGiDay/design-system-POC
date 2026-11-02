<script setup lang="ts">
import { computed, useId, watch } from 'vue'
import { I18nT, useI18n } from 'vue-i18n'
import AppIcon from '@/components/icon/AppIcon.vue'
import { pageItems } from './pagination'

// Chân bảng phân trang theo components.css (cms-pagination): tổng số dòng, số dòng mỗi trang, nút trang.
const props = withDefaults(defineProps<{
  total: number
  pageSizeOptions?: number[]
}>(), { pageSizeOptions: () => [10, 20, 50, 100] })
const page = defineModel<number>('page', { default: 1 })
const pageSize = defineModel<number>('pageSize', { default: 20 })

const { t, locale } = useI18n()
const rowsId = useId()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / pageSize.value)))
const from = computed(() => (props.total === 0 ? 0 : (page.value - 1) * pageSize.value + 1))
const to = computed(() => Math.min(page.value * pageSize.value, props.total))
const items = computed(() => pageItems(page.value, pageCount.value))
const format = (value: number) => new Intl.NumberFormat(locale.value).format(value)

// Đổi số dòng mỗi trang thì về trang 1; dữ liệu ít đi thì kéo trang về trang cuối còn tồn tại
watch(pageSize, () => { page.value = 1 })
watch(pageCount, count => { if (page.value > count) page.value = count })

function go(target: number) {
  page.value = Math.min(Math.max(target, 1), pageCount.value)
}
</script>

<template>
  <nav class="cms-pagination" :aria-label="t('ui.pagination.label')">
    <I18nT keypath="ui.pagination.summary" tag="p" class="cms-pagination__summary" scope="global">
      <template #range><b>{{ format(from) }}–{{ format(to) }}</b></template>
      <template #total><b>{{ format(total) }}</b></template>
    </I18nT>

    <div class="cms-pagination__controls">
      <div class="cms-pagination__rows">
        <label :for="rowsId">{{ t('ui.pagination.rowsPerPage') }}</label>
        <span class="cms-pagination__rows-select">
          <select :id="rowsId" v-model.number="pageSize">
            <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
          </select>
          <AppIcon name="mui-ten-xuong" size="1rem" />
        </span>
      </div>

      <span class="cms-pagination__divider" aria-hidden="true" />

      <div class="cms-pagination__pages">
        <button
          type="button"
          class="cms-pagination-btn cms-pagination-btn--arrow"
          :disabled="page <= 1"
          :aria-label="t('ui.pagination.previous')"
          @click="go(page - 1)"
        >
          <AppIcon name="mui-ten-trai" size="1rem" />
        </button>
        <template v-for="item in items" :key="item">
          <span v-if="typeof item === 'string'" class="cms-pagination-btn cms-pagination-btn--ellipsis" aria-hidden="true">…</span>
          <button
            v-else
            type="button"
            class="cms-pagination-btn"
            :class="{ 'cms-pagination-btn--active': item === page }"
            :aria-current="item === page ? 'page' : undefined"
            :aria-label="t('ui.pagination.page', { page: item })"
            @click="go(item)"
          >
            {{ format(item) }}
          </button>
        </template>
        <button
          type="button"
          class="cms-pagination-btn cms-pagination-btn--arrow"
          :disabled="page >= pageCount"
          :aria-label="t('ui.pagination.next')"
          @click="go(page + 1)"
        >
          <AppIcon name="mui-ten-phai" size="1rem" />
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.cms-pagination {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8) var(--space-16);
  align-items: center;
  justify-content: space-between;
  padding: var(--space-10) var(--space-8);
  background: var(--surface);
  color: var(--ink-muted);
  font-size: var(--type-cell-font-size);
  line-height: var(--type-cell-line-height);
}

.cms-pagination__summary {
  white-space: nowrap;
  b { color: var(--ink); font-weight: 600; }
}

.cms-pagination__controls {
  display: flex;
  gap: var(--space-16);
  align-items: center;
}

.cms-pagination__rows {
  display: flex;
  gap: var(--space-8);
  align-items: center;
  white-space: nowrap;
}
.cms-pagination__rows-select {
  position: relative;
  display: flex;
  align-items: center;
  color: var(--ink-2);

  select {
    height: 2rem;
    padding: 0 var(--space-24) 0 var(--space-10);
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    color: inherit;
    background: var(--surface);
    font: inherit;
    font-weight: 500;
    appearance: none;
    cursor: pointer;

    &:hover { border-color: var(--line-strong); }
    &:focus-visible { border-color: var(--primary); outline: 0; box-shadow: var(--focus-ring); }
  }
  .app-icon {
    position: absolute;
    right: var(--space-6);
    color: var(--ink-muted);
    pointer-events: none;
  }
}

.cms-pagination__divider {
  flex: none;
  width: 1px;
  height: 1.25rem;
  background: var(--line-soft);
}

.cms-pagination__pages {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.cms-pagination-btn {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 var(--space-8);
  border: 0;
  border-radius: var(--radius-md);
  color: var(--ink-2);
  background: transparent;
  font-family: inherit;
  font-size: var(--type-cell-font-size);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  cursor: pointer;

  &:hover { color: var(--ink); background: var(--subtle); }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
}
.cms-pagination-btn--active,
.cms-pagination-btn--active:hover {
  color: var(--surface);
  background: var(--primary);
  font-weight: 600;
}
.cms-pagination-btn--arrow {
  width: 2rem;
  padding: 0;
  background: var(--surface);
  box-shadow: var(--shadow-inside-stroke);

  &:hover { background: var(--subtle); }
  // Figma: hết trang thì mũi tên nhạt viền, không đổi nền khi rê
  &:disabled,
  &:disabled:hover {
    color: var(--ink-faint);
    background: var(--surface);
    box-shadow: inset 0 0 0 1px var(--line-soft);
    cursor: default;
  }
}
.cms-pagination-btn--ellipsis,
.cms-pagination-btn--ellipsis:hover {
  width: 2rem;
  padding: 0;
  color: var(--ink-faint);
  background: transparent;
  cursor: default;
}
</style>
