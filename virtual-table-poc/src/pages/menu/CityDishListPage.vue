<script setup lang="ts">
import { computed, h, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/icon/AppIcon.vue'
import ListLayout from '@/components/layout/ListLayout.vue'
import type { PageProps } from '@/components/layout/shell'
import CmsDataTable from '@/components/table/CmsDataTable.vue'
import CmsConfigCell from '@/components/table/CmsConfigCell.vue'
import CmsEntityCell from '@/components/table/CmsEntityCell.vue'
import { dataColumnHelper, formatVnd, type RowSelectionState } from '@/components/table/data-table'
import CmsButton from '@/components/ui/CmsButton.vue'
import CmsDialog from '@/components/ui/CmsDialog.vue'
import CmsFilterSelect from '@/components/ui/CmsFilterSelect.vue'
import CmsIconButton from '@/components/ui/CmsIconButton.vue'
import CmsPagination from '@/components/ui/CmsPagination.vue'
import CmsSearchBox from '@/components/ui/CmsSearchBox.vue'
import CmsSwitch from '@/components/ui/CmsSwitch.vue'
import { cities, dishGroups, fetchCityDishes, setCityDishActive, type CityDish } from './dishes'

// MA01 · Món ăn tại thành phố (Figma 457:3)
const props = defineProps<PageProps>()
const { t } = useI18n()
const router = useRouter()

// ─── Bộ lọc + phân trang ────────────────────────────────────────────────────
const query = ref('')
const city = ref<string>()
const group = ref<string>()
const page = ref(1)
const pageSize = ref(10)
const rows = shallowRef<CityDish[]>([])
const total = ref(0)
const loading = ref(false)
const selection = ref<RowSelectionState>({})

let request = 0
async function load() {
  const current = ++request
  loading.value = true
  const result = await fetchCityDishes({ page: page.value, pageSize: pageSize.value, query: query.value, city: city.value, group: group.value })
  // Bỏ kết quả cũ về muộn khi người dùng gõ / đổi trang liên tục
  if (current !== request) return
  rows.value = result.items
  total.value = result.total
  loading.value = false
}
let typing: ReturnType<typeof setTimeout> | undefined
watch(query, () => { clearTimeout(typing); typing = setTimeout(() => { page.value = 1; void load() }, 250) })
watch([city, group], () => { page.value = 1; void load() })
watch([page, pageSize], () => void load(), { immediate: true })

const description = computed(() => t('dishes.listDescription', { brand: 'Chanh Dev', total: total.value, cities: cities.length }))
const detailHref = (dish: CityDish, section?: string) => `${props.baseHref}/${encodeURIComponent(dish.id)}${section ? `#${section}` : ''}`

async function toggleActive(dish: CityDish, active: boolean) {
  rows.value = rows.value.map(row => row.id === dish.id ? { ...row, active } : row)
  await setCityDishActive(dish.id, active)
}

// Nút chưa có màn hình: báo bằng hộp thoại như trang chủ
const notice = ref('')
const noticeOpen = computed({ get: () => !!notice.value, set: value => { if (!value) notice.value = '' } })

// ─── Cột (độ rộng theo Figma, tổng 2066) ────────────────────────────────────
const col = dataColumnHelper<CityDish>()
const dash = () => h('span', { class: 'city-dish-muted' }, '–')
const columns = computed(() => [
  col.accessor('name', {
    header: t('dishes.col.dish'),
    size: 300,
    meta: { pin: 'left' },
    cell: ({ row }) => h(CmsEntityCell, { title: row.original.name, subtitle: row.original.code, image: row.original.image, to: detailHref(row.original) }),
  }),
  col.accessor('price', { header: t('dishes.col.price'), size: 110, meta: { align: 'end' }, cell: info => h('span', { class: 'city-dish-num' }, formatVnd(info.getValue())) }),
  col.accessor('vat', { header: t('dishes.col.vat'), size: 80, meta: { align: 'end' }, cell: info => h('span', { class: 'city-dish-num' }, info.getValue()) }),
  col.accessor('group', { header: t('dishes.col.group'), size: 130 }),
  col.accessor('type', { header: t('dishes.col.type'), size: 110, cell: info => info.getValue() ?? dash() }),
  col.accessor('unit', { header: t('dishes.col.unit'), size: 110 }),
  col.accessor('unit2', { header: t('dishes.col.unit2'), size: 150, meta: { hint: t('dishes.unit2Hint') }, cell: info => info.getValue() ?? dash() }),
  col.accessor('sideDish', { header: t('dishes.col.sideDish'), size: 130, cell: info => info.getValue() ? t('dishes.yes') : dash() }),
  col.accessor('city', { header: t('dishes.col.city'), size: 130 }),
  col.accessor('buffetCount', {
    header: t('dishes.col.buffet'),
    size: 180,
    meta: { interactive: true },
    cell: ({ row }) => h(CmsConfigCell, {
      text: row.original.buffetCount ? t('dishes.buffetConfigured', { n: row.original.buffetCount }) : t('dishes.buffetNone'),
      tone: row.original.buffetCount ? 'link' : 'empty',
      emptyHover: t('dishes.buffetAdd'),
      actions: row.original.buffetCount ? [{ icon: 'sua', label: t('dishes.buffetEdit'), onClick: () => router.push(detailHref(row.original, 'virtual')) }] : [],
      onOpen: () => router.push(detailHref(row.original, 'virtual')),
    }),
  }),
  col.accessor('customization', {
    header: t('dishes.col.customization'),
    size: 170,
    meta: { interactive: true },
    cell: ({ row }) => h(CmsConfigCell, {
      text: row.original.customization ?? t('dishes.customizationNone'),
      tone: row.original.customization ? 'plain' : 'empty',
      emptyHover: t('dishes.customizationAssign'),
      actions: row.original.customization ? [
        { icon: 'sua', label: t('dishes.customizationChange'), onClick: () => router.push(detailHref(row.original, 'customization')) },
        { icon: 'mo-ngoai', label: t('dishes.customizationView'), onClick: () => { notice.value = t('dishes.customizationView') } },
      ] : [],
      onOpen: () => router.push(detailHref(row.original, 'customization')),
    }),
  }),
  col.display({
    id: 'copy',
    header: t('dishes.col.copy'),
    size: 170,
    cell: () => h(CmsButton, { size: 'sm', icon: 'sao-chep', onClick: () => { notice.value = t('dishes.copy') } }, () => t('dishes.copy')),
  }),
  col.accessor('active', {
    header: t('dishes.col.status'),
    size: 110,
    cell: ({ row }) => h(CmsSwitch, { modelValue: row.original.active, label: t('dishes.activeOf', { name: row.original.name }), 'onUpdate:modelValue': (value: boolean) => toggleActive(row.original, value) }),
  }),
  col.display({
    id: 'actions',
    header: () => h('span', { class: 'city-dish-sr' }, t('dishes.col.actions')),
    size: 90,
    meta: { align: 'end', pin: 'right' },
    cell: ({ row }) => h(CmsIconButton, { icon: 'them', label: t('dishes.moreOf', { name: row.original.name }), onClick: () => { notice.value = t('dishes.col.actions') } }),
  }),
])
const cityOptions = cities.map(value => ({ value, label: value }))
const groupOptions = dishGroups.map(value => ({ value, label: value }))
</script>

<template>
  <ListLayout :title="t('dishes.cityTitle')" :description="description">
    <template #filters>
      <CmsSearchBox v-model="query" :label="t('dishes.search')" />
      <CmsFilterSelect v-model="city" :label="t('dishes.filterCity')" :all-label="t('dishes.allCities')" :options="cityOptions" />
      <CmsFilterSelect v-model="group" :label="t('dishes.filterGroup')" :all-label="t('dishes.allGroups')" :options="groupOptions" />
      <CmsButton icon="loc" @click="notice = t('dishes.advanced')">{{ t('dishes.advanced') }}</CmsButton>
    </template>
    <template #actions>
      <CmsButton variant="ai" icon="tai-len" @click="notice = t('dishes.quickAdd')">{{ t('dishes.quickAdd') }}</CmsButton>
      <CmsButton @click="notice = t('dishes.utilities')">{{ t('dishes.utilities') }}<AppIcon name="mui-ten-xuong" size="1rem" /></CmsButton>
      <CmsButton variant="primary" icon="cong" @click="notice = t('dishes.create')">{{ t('dishes.create') }}</CmsButton>
    </template>

    <CmsDataTable
      v-model:selection="selection"
      :label="t('dishes.cityTitle')"
      :columns
      :data="rows"
      :get-row-id="dish => dish.id"
      :index-offset="(page - 1) * pageSize"
      :loading
      :empty-text="t('dishes.empty')"
      selectable
    />

    <template #footer>
      <CmsPagination v-model:page="page" v-model:page-size="pageSize" :total :unit="t('dishes.unit')" :page-size-options="[10, 20, 50, 100]" />
    </template>
  </ListLayout>

  <CmsDialog v-model:open="noticeOpen" :title="notice" :description="t('layout.notReady')">
    <template #footer><CmsButton @click="notice = ''">{{ t('ui.dialog.close') }}</CmsButton></template>
  </CmsDialog>
</template>

<style lang="scss">
/* Ô dựng bằng h() trong bảng không mang scope id của trang → style không scoped, tiền tố city-dish- */
.city-dish-num { color: var(--ink); font-variant-numeric: tabular-nums; }
.city-dish-muted { color: var(--ink-faint); }
.city-dish-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
