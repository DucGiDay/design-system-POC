<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/icon/AppIcon.vue'
import CmsChipGroup from '@/components/form/CmsChipGroup.vue'
import CmsUpload from '@/components/form/CmsUpload.vue'
import DetailSection from '@/components/form/DetailSection.vue'
import FormGrid from '@/components/form/FormGrid.vue'
import FormGroup from '@/components/form/FormGroup.vue'
import SettingList from '@/components/form/SettingList.vue'
import SettingRow from '@/components/form/SettingRow.vue'
import DetailLayout from '@/components/layout/DetailLayout.vue'
import DetailSummaryCard from '@/components/layout/DetailSummaryCard.vue'
import type { TocGroup } from '@/components/layout/detail'
import type { PageProps } from '@/components/layout/shell'
import { formatVnd } from '@/components/table/data-table'
import CmsButton from '@/components/ui/CmsButton.vue'
import CmsCheckbox from '@/components/ui/CmsCheckbox.vue'
import CmsDialog from '@/components/ui/CmsDialog.vue'
import CmsIconButton from '@/components/ui/CmsIconButton.vue'
import CmsInput from '@/components/ui/CmsInput.vue'
import CmsSelect from '@/components/ui/CmsSelect.vue'
import CmsSwitch from '@/components/ui/CmsSwitch.vue'
import CmsTag from '@/components/ui/CmsTag.vue'
import CmsTextarea from '@/components/ui/CmsTextarea.vue'
import { cities, dishGroups, dishTypes, getCityDish, units, type CityDishDetail } from './dishes'

// MA05 · Chi tiết món (Figma 520:1594)
const props = defineProps<PageProps>()
const { t } = useI18n()

const dish = ref<CityDishDetail>()
const missing = ref(false)
// Ô nhập giữ chuỗi; chuyển số khi lưu
const price = ref('')
const vat = ref('')
const prepMinutes = ref('')
const sortOrder = ref('')
const image = ref<string>()
const customizationOpen = ref(true)

watch(() => props.itemId, async id => {
  dish.value = undefined
  missing.value = false
  const data = id ? await getCityDish(decodeURIComponent(id)) : undefined
  if (!data) { missing.value = true; return }
  dish.value = data
  price.value = String(data.price)
  vat.value = String(data.vat)
  prepMinutes.value = String(data.prepMinutes)
  sortOrder.value = data.sortOrder === undefined ? '' : String(data.sortOrder)
  image.value = data.image
}, { immediate: true })

const toc = computed<TocGroup[]>(() => [
  { label: t('dishes.toc.basic'), items: [{ id: 'info', label: t('dishes.toc.info'), icon: 'mon-an' }] },
  { label: t('dishes.toc.selling'), items: [
    { id: 'pricing', label: t('dishes.toc.pricing'), icon: 'doanh-thu' },
    { id: 'virtual', label: t('dishes.toc.virtual'), icon: 'thuc-don' },
    { id: 'service', label: t('dishes.toc.service'), icon: 'hoa-don' },
    { id: 'sources', label: t('dishes.toc.sources'), icon: 'nguon-don' },
  ] },
  { label: t('dishes.toc.extended'), items: [
    { id: 'customization', label: t('dishes.toc.customization'), icon: 'customization' },
    { id: 'schedule', label: t('dishes.toc.schedule'), icon: 'dong-ho' },
    { id: 'order', label: t('dishes.toc.order'), icon: 'sap-xep' },
  ] },
])

const options = (values: string[]) => values.map(value => ({ value, label: value }))
const dayOptions = computed(() => [2, 3, 4, 5, 6, 7, 8].map(value => ({ value, label: value === 8 ? t('dishes.sunday') : t('dishes.weekday', { n: value }) })))
const hourOptions = Array.from({ length: 24 }, (_, value) => ({ value, label: `${value}h` }))
const sellingSummary = computed(() => {
  if (!dish.value) return ''
  const days = dayOptions.value.filter(day => dish.value!.days.includes(day.value)).map(day => day.label)
  const hours = [...dish.value.hours].sort((a, b) => a - b).map(hour => `${hour}h`)
  if (!days.length && !hours.length) return t('dishes.sellingAlways')
  return t('dishes.sellingSummary', { days: days.join(', ') || t('dishes.everyDay'), hours: hours.join(', ') || t('dishes.allDay') })
})

const notice = ref('')
const noticeOpen = computed({ get: () => !!notice.value, set: value => { if (!value) notice.value = '' } })
const saving = ref(false)
async function save(sync: boolean) {
  saving.value = true
  await new Promise(resolve => setTimeout(resolve, 400))
  saving.value = false
  notice.value = sync ? t('dishes.savedSynced') : t('dishes.saved')
}
</script>

<template>
  <DetailLayout :title="t('dishes.detailTitle')" :back-to="baseHref" :toc :ready="!!dish">
    <template #actions>
      <CmsButton v-if="dish" :variant="dish.active ? 'danger' : 'secondary'" @click="dish.active = !dish.active">{{ dish.active ? t('dishes.deactivate') : t('dishes.activate') }}</CmsButton>
      <CmsButton :disabled="!dish" :loading="saving" @click="save(true)">{{ t('dishes.saveSync') }}</CmsButton>
      <CmsButton variant="primary" :disabled="!dish" :loading="saving" @click="save(false)">{{ t('dishes.save') }}</CmsButton>
    </template>

    <template #summary>
      <DetailSummaryCard v-if="dish" :title="dish.name" :subtitle="`${dish.code} · ${dish.city}`" :image :items="[{ label: t('dishes.price'), value: formatVnd(Number(price) || 0) }]">
        <template #tags>
          <CmsTag :tone="dish.active ? 'success' : 'neutral'">{{ dish.active ? t('dishes.active') : t('dishes.inactive') }}</CmsTag>
          <CmsTag>{{ dish.group }}</CmsTag>
        </template>
      </DetailSummaryCard>
      <div v-else class="city-dish-skeleton" :aria-busy="!missing" />
    </template>

    <p v-if="missing" class="city-dish-missing" role="status">{{ t('dishes.notFound') }}</p>
    <div v-else-if="!dish" class="city-dish-skeleton city-dish-skeleton--form" aria-busy="true" :aria-label="t('dishes.loading')" />
    <template v-else>
      <DetailSection id="info" icon="mon-an" :title="t('dishes.sec.info')" :description="t('dishes.sec.infoDesc')">
        <FormGroup :title="t('dishes.grp.basic')">
          <template #action><CmsButton variant="subtle" size="sm" icon="sao-chep" @click="notice = t('dishes.copyNew')">{{ t('dishes.copyNew') }}</CmsButton></template>
          <FormGrid>
            <CmsInput v-model="dish.name" class="is-full" :label="t('dishes.f.name')" required />
            <CmsInput v-model="price" :label="t('dishes.f.price')" required inputmode="numeric" />
            <CmsSelect v-model="dish.city" :label="t('dishes.f.city')" required :options="options(cities)" />
            <CmsInput :model-value="dish.code" :label="t('dishes.f.code')" readonly />
            <CmsInput v-model="dish.barcode" :label="t('dishes.f.barcode')" :tip="t('dishes.f.barcodeTip')" :placeholder="t('dishes.f.barcodePlaceholder')" />
          </FormGrid>
        </FormGroup>
        <FormGroup :title="t('dishes.grp.side')">
          <CmsCheckbox v-model="dish.sideDish" :label="t('dishes.f.isSide')" />
          <CmsCheckbox v-model="dish.noSideDishQty" :label="t('dishes.f.noSideQty')" />
        </FormGroup>
        <FormGroup :title="t('dishes.grp.category')">
          <FormGrid>
            <CmsSelect v-model="dish.group" :label="t('dishes.f.group')" :options="options(dishGroups)" />
            <CmsSelect v-model="dish.type" :label="t('dishes.f.type')" :placeholder="t('dishes.f.typePlaceholder')" :options="options(dishTypes)" />
            <CmsInput v-model="dish.sku" :label="t('dishes.f.sku')" :placeholder="t('dishes.f.skuPlaceholder')" />
            <CmsSelect v-model="dish.unit" :label="t('dishes.f.unit')" required :options="options(units)" />
            <CmsSelect v-model="dish.unit2" :label="t('dishes.f.unit2')" :tip="t('dishes.unit2Hint')" :placeholder="t('dishes.f.unit2Placeholder')" :options="options(units)" />
            <CmsInput v-model="vat" :label="t('dishes.f.vat')" inputmode="decimal" />
            <CmsInput v-model="prepMinutes" :label="t('dishes.f.prep')" inputmode="numeric" />
            <CmsTextarea v-model="dish.description" class="is-full" :label="t('dishes.f.description')" :placeholder="t('dishes.f.descriptionPlaceholder')" />
          </FormGrid>
        </FormGroup>
        <FormGroup :title="t('dishes.grp.image')">
          <template #action><CmsButton variant="ai" size="sm" icon="ai" @click="notice = t('dishes.aiImage')">{{ t('dishes.aiImage') }}</CmsButton></template>
          <CmsUpload v-model="image" :label="t('dishes.f.image')" :hint="t('dishes.f.imageHint')" />
        </FormGroup>
      </DetailSection>

      <DetailSection id="pricing" icon="doanh-thu" :title="t('dishes.sec.pricing')">
        <FormGroup :title="t('dishes.grp.whenSelling')">
          <SettingList>
            <SettingRow :label="t('dishes.f.allowEditPrice')"><template #control="{ labelledby }"><CmsSwitch v-model="dish.allowEditPrice" :aria-labelledby="labelledby" /></template></SettingRow>
            <SettingRow :label="t('dishes.f.requireQty')"><template #control="{ labelledby }"><CmsSwitch v-model="dish.requireQty" :aria-labelledby="labelledby" /></template></SettingRow>
            <SettingRow :label="t('dishes.f.removeNoPermission')"><template #control="{ labelledby }"><CmsSwitch v-model="dish.allowRemoveWithoutPermission" :aria-labelledby="labelledby" /></template></SettingRow>
            <SettingRow :label="t('dishes.f.removeBeforeBill')" :divider="false"><template #control="{ labelledby }"><CmsSwitch v-model="dish.allowRemoveBeforeBill" :aria-labelledby="labelledby" /></template></SettingRow>
          </SettingList>
        </FormGroup>
      </DetailSection>

      <DetailSection id="virtual" icon="thuc-don" :title="t('dishes.sec.virtual')" :description="t('dishes.sec.virtualDesc')">
        <FormGroup>
          <SettingList>
            <SettingRow :label="t('dishes.f.isVirtual')"><template #control="{ labelledby }"><CmsSwitch v-model="dish.isVirtual" :aria-labelledby="labelledby" /></template></SettingRow>
            <SettingRow :label="t('dishes.f.isBuffet')" :divider="!dish.isBuffetTicket"><template #control="{ labelledby }"><CmsSwitch v-model="dish.isBuffetTicket" :aria-labelledby="labelledby" /></template></SettingRow>
            <template v-if="dish.isBuffetTicket">
              <SettingRow :label="t('dishes.f.buffetExcluded')" indent>
                <template #control><button type="button" class="cms-setting-value" @click="notice = t('dishes.f.buffetExcluded')">{{ t('dishes.dishCount', { n: dish.excludedFromBuffet }) }}<AppIcon name="mui-ten-phai" size=".875rem" /></button></template>
              </SettingRow>
              <SettingRow :label="t('dishes.f.buffetUpsize')" indent>
                <template #control><button type="button" class="cms-setting-value" @click="notice = t('dishes.f.buffetUpsize')">{{ t('dishes.dishCount', { n: dish.buffetUpsize }) }}<AppIcon name="mui-ten-phai" size=".875rem" /></button></template>
              </SettingRow>
            </template>
            <SettingRow :label="t('dishes.f.inQr')" :divider="false">
              <template #control="{ labelledby }"><label class="cms-setting-input is-wide"><input v-model="dish.inQrFormula" :aria-labelledby="labelledby" :placeholder="t('dishes.f.inQrPlaceholder')" /></label></template>
            </SettingRow>
          </SettingList>
        </FormGroup>
      </DetailSection>

      <DetailSection id="service" icon="hoa-don" :title="t('dishes.sec.service')" :description="t('dishes.sec.serviceDesc')">
        <FormGroup>
          <SettingList>
            <SettingRow :label="t('dishes.f.isService')" :divider="false"><template #control="{ labelledby }"><CmsSwitch v-model="dish.isService" :aria-labelledby="labelledby" /></template></SettingRow>
            <template v-if="dish.isService">
              <div class="city-dish-subhead">
                <strong>{{ t('dishes.f.qtyPrice') }}</strong>
                <span class="city-dish-tip" tabindex="0" :aria-label="t('dishes.f.qtyPriceTip')" :title="t('dishes.f.qtyPriceTip')"><AppIcon name="thong-tin" size=".875rem" /></span>
                <CmsButton variant="subtle" size="sm" icon="xoa" @click="dish.serviceQty = 1; dish.serviceOverPrice = 0">{{ t('dishes.clearConfig') }}</CmsButton>
              </div>
              <SettingRow :label="t('dishes.f.serviceQty')" indent>
                <template #control="{ labelledby }"><label class="cms-setting-input"><input v-model.number="dish.serviceQty" type="number" min="1" :aria-labelledby="labelledby" /></label></template>
              </SettingRow>
              <SettingRow :label="t('dishes.f.serviceOver')" indent :divider="false">
                <template #control="{ labelledby }"><label class="cms-setting-input"><input v-model.number="dish.serviceOverPrice" type="number" min="0" :aria-labelledby="labelledby" />₫</label></template>
              </SettingRow>
            </template>
          </SettingList>
        </FormGroup>
      </DetailSection>

      <DetailSection id="sources" icon="nguon-don" :title="t('dishes.sec.sources')" :description="t('dishes.sec.sourcesDesc')">
        <FormGroup :title="t('dishes.grp.sources')">
          <template #action><CmsButton size="sm" icon="cong" @click="notice = t('dishes.addSource')">{{ t('dishes.addSource') }}</CmsButton></template>
          <ul class="city-dish-sources">
            <li v-for="(item, index) in dish.sourcePrices" :key="item.source">
              <span>{{ item.source }}</span>
              <strong>{{ formatVnd(item.price) }}</strong>
              <CmsIconButton icon="sua" :label="t('dishes.editSource', { name: item.source })" @click="notice = t('dishes.editSource', { name: item.source })" />
              <CmsIconButton icon="xoa" :label="t('dishes.removeSource', { name: item.source })" @click="dish.sourcePrices.splice(index, 1)" />
            </li>
            <li v-if="!dish.sourcePrices.length" class="is-empty">{{ t('dishes.noSources') }}</li>
          </ul>
        </FormGroup>
      </DetailSection>

      <DetailSection id="customization" icon="customization" :title="t('dishes.sec.customization')" :description="t('dishes.sec.customizationDesc')">
        <FormGroup :title="t('dishes.grp.customization')">
          <template #action><CmsButton size="sm" icon="cong" @click="notice = t('dishes.createCustomization')">{{ t('dishes.createCustomization') }}</CmsButton></template>
          <CmsSelect v-model="dish.customization" :label="t('dishes.f.customization')" :options="options(['topping 23', 'custom test', 'size ly'])" />
          <div class="city-dish-subhead city-dish-subhead--toggle">
            <button type="button" :aria-expanded="customizationOpen" aria-controls="city-dish-customization" @click="customizationOpen = !customizationOpen">{{ t('dishes.customizationDetail') }}<AppIcon :name="customizationOpen ? 'mui-ten-len' : 'mui-ten-xuong'" size=".875rem" /></button>
            <CmsButton variant="subtle" size="sm" icon="mo-ngoai" @click="notice = t('dishes.editCustomization')">{{ t('dishes.editCustomization') }}</CmsButton>
          </div>
          <div v-show="customizationOpen" id="city-dish-customization" class="city-dish-options">
            <div class="city-dish-options__head"><strong>{{ t('dishes.extraChoice') }}</strong><CmsTag>{{ t('dishes.chooseRange', { min: 1, max: 1 }) }}</CmsTag></div>
            <ul>
              <li v-for="item in dish.customizationItems" :key="item.code"><span>{{ item.name }}</span><small>{{ item.code }}</small><strong>{{ formatVnd(item.price) }}</strong></li>
            </ul>
          </div>
        </FormGroup>
      </DetailSection>

      <DetailSection id="schedule" icon="dong-ho" :title="t('dishes.sec.schedule')" :description="t('dishes.sec.scheduleDesc')">
        <FormGroup :title="t('dishes.grp.days')">
          <template #action><CmsButton variant="subtle" size="sm" @click="dish.days = dayOptions.map(day => day.value)">{{ t('dishes.selectAll') }}</CmsButton></template>
          <CmsChipGroup v-model="dish.days" :label="t('dishes.grp.days')" :options="dayOptions" width="5.875rem" min-width="5.5rem" />
        </FormGroup>
        <FormGroup :title="t('dishes.grp.hours')">
          <template #action><CmsButton variant="subtle" size="sm" @click="dish.hours = hourOptions.map(hour => hour.value)">{{ t('dishes.selectAll') }}</CmsButton></template>
          <CmsChipGroup v-model="dish.hours" :label="t('dishes.grp.hours')" :options="hourOptions" width="3.1875rem" min-width="3rem" />
        </FormGroup>
        <p class="city-dish-note" aria-live="polite">{{ sellingSummary }}</p>
      </DetailSection>

      <DetailSection id="order" icon="sap-xep" :title="t('dishes.sec.order')" :description="t('dishes.sec.orderDesc')">
        <FormGroup :title="t('dishes.grp.sort')">
          <FormGrid>
            <CmsInput v-model="sortOrder" :label="t('dishes.f.sortOrder')" :placeholder="t('dishes.f.sortOrderPlaceholder')" inputmode="numeric" />
          </FormGrid>
        </FormGroup>
      </DetailSection>
    </template>
  </DetailLayout>

  <CmsDialog v-model:open="noticeOpen" :title="notice" :description="t('layout.notReady')">
    <template #footer><CmsButton @click="notice = ''">{{ t('ui.dialog.close') }}</CmsButton></template>
  </CmsDialog>
</template>

<style scoped lang="scss">
.city-dish-skeleton { height: 9.875rem; border-radius: var(--radius-lg); background: linear-gradient(90deg, var(--surface), var(--field), var(--surface)); background-size: 200% 100%; animation: city-dish-shimmer 1.2s ease-in-out infinite; }
.city-dish-skeleton--form { height: 40rem; }
@keyframes city-dish-shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }
@media (prefers-reduced-motion: reduce) { .city-dish-skeleton { animation: none; } }
.city-dish-missing { padding: var(--space-24); border-radius: var(--radius-lg); color: var(--ink-2); background: var(--surface); }

// Đầu dòng phụ "Cấu hình giá thay đổi theo số lượng" (Figma 529:2267)
.city-dish-subhead {
  display: flex;
  gap: var(--space-6);
  align-items: center;
  margin-left: .875rem;
  padding: var(--space-10) 0 var(--space-4);
  strong { color: var(--ink); font-size: .8125rem; font-weight: 600; line-height: 1rem; }
  > :last-child { margin-left: auto; }
}
.city-dish-tip { display: inline-flex; color: var(--ink-muted); cursor: help; &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 50%; } }
.city-dish-subhead--toggle {
  margin-left: 0;
  padding: 0;
  button:first-child {
    display: inline-flex;
    gap: var(--space-6);
    align-items: center;
    padding: var(--space-4) 0;
    border: 0;
    color: var(--primary-text);
    background: transparent;
    font: inherit;
    font-size: .8125rem;
    font-weight: 500;
    cursor: pointer;
    &:hover { text-decoration: underline; text-underline-offset: 3px; }
    &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 2px; }
  }
}

// Danh sách giá theo nguồn (Figma 530:2270)
.city-dish-sources {
  padding: 0 var(--space-8) 0 var(--space-16);
  border-radius: var(--radius-md);
  background: var(--surface);
  li {
    display: flex;
    gap: var(--space-12);
    align-items: center;
    padding: var(--space-8) 0;
    border-bottom: 1px solid var(--line-soft);
    &:last-child { border-bottom: 0; }
    > span { flex: 1; min-width: 0; color: var(--ink); font-size: .875rem; font-weight: 500; }
    > strong { color: var(--ink); font-size: .875rem; font-weight: 600; font-variant-numeric: tabular-nums; }
    &.is-empty { padding: var(--space-16) 0; color: var(--ink-muted); font-size: .8125rem; }
  }
}

// Nhóm tuỳ chọn customization (Figma 531:2334)
.city-dish-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  padding: .875rem var(--space-16);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-lg);
  background: var(--surface);
  ul { display: flex; flex-wrap: wrap; gap: var(--space-12); }
  li {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 13.5625rem;
    padding: var(--space-12);
    border-radius: var(--radius-md);
    background: var(--subtle);
    span { color: var(--ink); font-size: .875rem; font-weight: 500; }
    small { color: var(--ink-muted); font-size: .75rem; }
    strong { color: var(--primary-text); font-size: .875rem; font-weight: 600; }
  }
}
.city-dish-options__head { display: flex; gap: var(--space-8); align-items: center; strong { color: var(--ink); font-size: .875rem; font-weight: 600; } }
.city-dish-note { color: var(--ink-muted); font-size: .75rem; line-height: 1rem; }
</style>
