<script setup lang="ts">
import { nextTick, ref, useId, watch } from 'vue'
import { apiErrorMessage, authApi, type CompanyChoice, type CompanyOption } from './auth.api'
import { saveSession } from './session'

const VISIBLE_BRANDS = 2

const props = defineProps<{ open: boolean; choice: CompanyChoice | null }>()
const emit = defineEmits<{ close: []; done: [] }>()
const titleId = useId()
const dialog = ref<HTMLDialogElement>()
const selected = ref('')
const expanded = ref<string | null>(null)
const loading = ref(false)
const error = ref('')

watch(() => props.open, async (open) => {
  await nextTick()
  if (!dialog.value) return
  if (open && !dialog.value.open) {
    selected.value = props.choice?.companies[0]?.id ?? ''
    expanded.value = null
    error.value = ''
    dialog.value.showModal()
  } else if (!open && dialog.value.open) {
    dialog.value.close()
  }
})

const visibleBrands = (company: CompanyOption) =>
  expanded.value === company.id ? company.brands : company.brands.slice(0, VISIBLE_BRANDS)

async function submit() {
  if (!selected.value || loading.value) return
  loading.value = true
  error.value = ''
  try {
    saveSession(await authApi.selectCompany({ company_uid: selected.value, temp_token: props.choice?.temp_token }))
    emit('done')
  } catch (e) {
    error.value = apiErrorMessage(e) ?? 'Có lỗi xảy ra, mời bạn thử lại!'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <dialog ref="dialog" class="cms-dialog company-dialog" :aria-labelledby="titleId" @cancel.prevent="emit('close')" @close="open && emit('close')">
    <form class="cms-dialog__body" method="dialog" @submit.prevent="submit">
      <h2 :id="titleId" class="cms-dialog__title">Chọn công ty bạn muốn vào</h2>
      <p v-if="error" class="cms-alert cms-alert--danger" role="alert">{{ error }}</p>

      <fieldset class="company-list">
        <legend class="company-legend">Chọn công ty bạn muốn vào</legend>
        <label v-for="company in choice?.companies ?? []" :key="company.id" class="company-card" :class="{ 'is-selected': selected === company.id }">
          <span class="company-card-head">
            <span class="company-code">Mã công ty: {{ company.company_id ?? '' }}</span>
            <input v-model="selected" type="radio" name="company" :value="company.id" />
          </span>
          <span class="company-brands-label">Thương hiệu</span>
          <span v-for="brand in visibleBrands(company)" :key="brand.id" class="company-brand">{{ brand.brand_name }}</span>
          <button v-if="company.brands.length > VISIBLE_BRANDS" type="button" class="company-more" :aria-expanded="expanded === company.id" @click.prevent="expanded = expanded === company.id ? null : company.id">
            {{ expanded === company.id ? 'Thu gọn' : `Xem thêm ${company.brands.length - VISIBLE_BRANDS} thương hiệu` }}
          </button>
        </label>
      </fieldset>

      <div class="cms-dialog__foot">
        <button type="button" class="cms-btn cms-btn--secondary" @click="emit('close')">Trở lại đăng nhập</button>
        <button type="submit" class="cms-btn cms-btn--primary" :disabled="!selected || loading" :aria-busy="loading">
          <span v-if="loading" class="cms-spinner" aria-hidden="true" />Tiếp tục
        </button>
      </div>
    </form>
  </dialog>
</template>

<style scoped lang="scss">
.company-dialog { width: min(32rem, calc(100vw - 2rem)); }
.company-list {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  max-height: min(24rem, 55dvh);
  margin: 0;
  padding: 0 .25rem .25rem 0;
  overflow-y: auto;
  border: 0;
}
.company-legend { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.company-card {
  display: flex;
  flex-direction: column;
  gap: .25rem;
  padding: .75rem .875rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 120ms ease, background-color 120ms ease;

  &:hover { border-color: var(--line-strong); }
  &.is-selected { border-color: var(--primary); background: var(--primary-tint); }
  &:has(input:focus-visible) { outline: 2px solid var(--primary); outline-offset: 2px; }
}
.company-card-head { display: flex; gap: .75rem; align-items: center; justify-content: space-between; }
.company-code { color: var(--ink); font-size: .875rem; font-weight: 600; line-height: 1.375rem; }
.company-card input { width: 1.125rem; height: 1.125rem; margin: 0; accent-color: var(--primary); }
.company-card input:focus-visible { outline: none; }
.company-brands-label { color: var(--ink-muted); font-size: .75rem; line-height: 1.125rem; }
.company-brand { color: var(--ink-2); font-size: .8125rem; line-height: 1.25rem; }
.company-more {
  align-self: flex-start;
  padding: 0;
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--primary-text);
  background: none;
  font: inherit;
  font-size: .8125rem;
  font-weight: 500;
  cursor: pointer;

  &:hover { text-decoration: underline; }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
}
@media (prefers-reduced-motion: reduce) { .company-card { transition: none; } }
</style>
