<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CmsButton from './CmsButton.vue'
import CmsDialog from './CmsDialog.vue'
import CmsIconButton from './CmsIconButton.vue'
import CmsInput from './CmsInput.vue'
import CmsPageHeader from './CmsPageHeader.vue'
import CmsPagination from './CmsPagination.vue'
import CmsSelect from './CmsSelect.vue'
import CmsStatus from './CmsStatus.vue'
import CmsTag from './CmsTag.vue'
import CmsTextarea from './CmsTextarea.vue'

// Trang xem nhanh component đợt 1 (route /ui), không phải màn hình sản phẩm.
const { t } = useI18n()

const name = ref('')
const price = ref('0')
const store = ref<string>()
const note = ref('')
const dialogOpen = ref(false)
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)

const stores = computed(() => [
  { value: 'cau-giay', label: t('uiPreview.fields.storeCauGiay') },
  { value: 'hoan-kiem', label: t('uiPreview.fields.storeHoanKiem') },
  { value: 'dong-da', label: t('uiPreview.fields.storeDongDa') },
])
const statuses = ['pending', 'processing', 'completed', 'cancelled', 'paused'] as const

function simulateLoading() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 1500)
}
</script>

<template>
  <main class="fb-min-h-screen fb-bg-ground fb-font-sans fb-text-ink">
    <div class="fb-mx-auto fb-flex fb-max-w-[1100px] fb-flex-col fb-gap-6 fb-px-4 fb-py-8 sm:fb-px-6">
      <CmsPageHeader :title="t('uiPreview.title')" :description="t('uiPreview.description')">
        <template #actions>
          <CmsButton icon="tai-xuong">{{ t('uiPreview.export') }}</CmsButton>
          <CmsButton variant="primary" icon="cong">{{ t('uiPreview.addItem') }}</CmsButton>
        </template>
      </CmsPageHeader>

      <section class="ui-preview__card">
        <h2 class="ui-preview__heading">{{ t('uiPreview.sections.buttons') }}</h2>
        <div class="ui-preview__row">
          <CmsButton>{{ t('uiPreview.buttons.cancel') }}</CmsButton>
          <CmsButton variant="subtle" icon="loc">{{ t('uiPreview.buttons.filter') }}</CmsButton>
          <CmsButton variant="danger" icon="xoa">{{ t('uiPreview.buttons.delete') }}</CmsButton>
          <CmsButton variant="ai">{{ t('uiPreview.buttons.ai') }}</CmsButton>
          <CmsButton disabled>{{ t('uiPreview.buttons.disabled') }}</CmsButton>
          <CmsButton :loading @click="simulateLoading">{{ t('uiPreview.buttons.loading') }}</CmsButton>
        </div>
        <div class="ui-preview__row">
          <CmsButton size="sm">{{ t('uiPreview.buttons.cancel') }}</CmsButton>
          <CmsButton size="sm" variant="subtle">{{ t('uiPreview.buttons.filter') }}</CmsButton>
          <CmsButton size="sm" variant="danger">{{ t('uiPreview.buttons.delete') }}</CmsButton>
          <CmsButton size="sm" disabled>{{ t('uiPreview.buttons.disabled') }}</CmsButton>
        </div>
      </section>

      <section class="ui-preview__card">
        <h2 class="ui-preview__heading">{{ t('uiPreview.sections.iconButtons') }}</h2>
        <div class="ui-preview__row">
          <CmsIconButton icon="sua" :label="t('uiPreview.iconButtons.edit')" />
          <CmsIconButton icon="tai-xuong" outline :label="t('uiPreview.iconButtons.download')" />
          <CmsIconButton icon="xoa" outline disabled :label="t('uiPreview.iconButtons.delete')" />
        </div>
      </section>

      <section class="ui-preview__card">
        <h2 class="ui-preview__heading">{{ t('uiPreview.sections.tags') }}</h2>
        <div class="ui-preview__row">
          <CmsTag tone="success">{{ t('uiPreview.tags.active') }}</CmsTag>
          <CmsTag tone="warning">{{ t('uiPreview.tags.lowStock') }}</CmsTag>
          <CmsTag tone="info">{{ t('uiPreview.tags.new') }}</CmsTag>
          <CmsTag tone="neutral">{{ t('uiPreview.tags.draft') }}</CmsTag>
          <CmsTag tone="danger">{{ t('uiPreview.tags.stopped') }}</CmsTag>
        </div>
        <div class="ui-preview__row">
          <CmsStatus v-for="status in statuses" :key="status" :status>{{ t(`uiPreview.statuses.${status}`) }}</CmsStatus>
        </div>
      </section>

      <section class="ui-preview__card">
        <h2 class="ui-preview__heading">{{ t('uiPreview.sections.fields') }}</h2>
        <div class="ui-preview__fields">
          <CmsInput
            v-model="name"
            :label="t('uiPreview.fields.name')"
            :placeholder="t('uiPreview.fields.namePlaceholder')"
            :hint="t('uiPreview.fields.nameHint')"
            required
            autocomplete="off"
          />
          <CmsInput
            v-model="price"
            type="number"
            :label="t('uiPreview.fields.price')"
            :error="Number(price) > 0 ? undefined : t('uiPreview.fields.priceError')"
            required
          />
          <CmsSelect
            v-model="store"
            :label="t('uiPreview.fields.store')"
            :placeholder="t('uiPreview.fields.storePlaceholder')"
            :options="stores"
          />
          <CmsInput model-value="MON-0001" :label="t('uiPreview.fields.code')" readonly />
          <CmsSelect model-value="chanh-dev" :label="t('uiPreview.fields.brand')" readonly :options="[{ value: 'chanh-dev', label: t('uiPreview.fields.brandValue') }]" />
          <CmsInput :label="t('uiPreview.fields.disabled')" disabled />
          <CmsTextarea
            v-model="note"
            class="ui-preview__wide"
            :label="t('uiPreview.fields.note')"
            :placeholder="t('uiPreview.fields.notePlaceholder')"
          />
        </div>
      </section>

      <section class="ui-preview__card">
        <h2 class="ui-preview__heading">{{ t('uiPreview.sections.dialog') }}</h2>
        <div class="ui-preview__row">
          <CmsButton variant="danger" icon="xoa" @click="dialogOpen = true">{{ t('uiPreview.dialog.open') }}</CmsButton>
        </div>
        <CmsDialog v-model:open="dialogOpen" :title="t('uiPreview.dialog.title')" :description="t('uiPreview.dialog.description')">
          <template #footer>
            <CmsButton @click="dialogOpen = false">{{ t('uiPreview.buttons.cancel') }}</CmsButton>
            <CmsButton variant="danger" @click="dialogOpen = false">{{ t('uiPreview.dialog.confirm') }}</CmsButton>
          </template>
        </CmsDialog>
      </section>

      <section class="ui-preview__card">
        <h2 class="ui-preview__heading">{{ t('uiPreview.sections.pagination') }}</h2>
        <CmsPagination v-model:page="page" v-model:page-size="pageSize" :total="1234" />
      </section>
    </div>
  </main>
</template>

<style scoped lang="scss">
.ui-preview__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  padding: var(--space-16);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
}
.ui-preview__heading {
  margin: 0;
  font-size: var(--type-card-title-font-size);
  font-weight: var(--type-card-title-font-weight);
  line-height: var(--type-card-title-line-height);
}
.ui-preview__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-12);
  align-items: center;
}
.ui-preview__fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: var(--space-16) var(--space-24);
  align-items: start;
}
.ui-preview__wide { grid-column: 1 / -1; }
</style>
