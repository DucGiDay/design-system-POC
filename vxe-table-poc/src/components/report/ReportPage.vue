<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ListLayout from '@/components/layout/ListLayout.vue'
import type { PageProps } from '@/components/layout/shell'
import CmsButton from '@/components/ui/CmsButton.vue'
import CmsDialog from '@/components/ui/CmsDialog.vue'
import CmsSearchBox from '@/components/ui/CmsSearchBox.vue'
import CmsSegmented from '@/components/ui/CmsSegmented.vue'
import { DEFAULT_SALES_ROWS, getSalesRows, SALES_PRESETS } from '@/mock/report-sales'
import ReportGrid from './ReportGrid.vue'
import type { ReportGridStats } from './report'

// Trang báo cáo dùng chung cho mọi mục lá của Báo cáo. GIỐNG HỆT ở 2 POC; chỉ ReportGrid khác thư viện.
// Thanh dưới bảng hiện thời gian của thao tác gần nhất; "Chạy đo" chạy một bộ đo cố định để so sánh hai POC.
const props = defineProps<PageProps>()
const { t, locale } = useI18n()
const grid = useTemplateRef<InstanceType<typeof ReportGrid>>('grid')

const count = ref(String(DEFAULT_SALES_ROWS))
const query = ref('')
const stats = shallowRef<ReportGridStats>({ visible: 0, totals: { qty: 0, discount: 0, vat: 0, amount: 0 } })
const last = ref<{ label: string; ms: number }[]>([])
const busy = ref(false)
const number = computed(() => new Intl.NumberFormat(locale.value))
const ms = (value: number) => `${number.value.format(Math.round(value))} ms`
const presetOptions = computed(() => SALES_PRESETS.map(value => ({ value: String(value), label: new Intl.NumberFormat(locale.value, { notation: 'compact' }).format(value) })))
const title = computed(() => props.node ? `${props.node.code ? props.node.code + ' · ' : ''}${props.node.label}` : t('modules.reports'))
const description = computed(() => t('report.description', { rows: number.value.format(Number(count.value)), visible: number.value.format(stats.value.visible) }))

function record(label: string, value: number) {
  last.value = [{ label, ms: value }, ...last.value.filter(item => item.label !== label)].slice(0, 4)
}
async function loadRows() {
  if (!grid.value) return
  busy.value = true
  const { rows, generateMs } = getSalesRows(Number(count.value))
  record(t('report.timing.generate'), generateMs)
  record(t('report.timing.load'), await grid.value.load(rows))
  if (query.value) record(t('report.timing.search'), await grid.value.search(query.value))
  busy.value = false
}
onMounted(loadRows)
watch(count, loadRows)
let typing: ReturnType<typeof setTimeout> | undefined
watch(query, value => {
  clearTimeout(typing)
  typing = setTimeout(async () => { if (grid.value) record(t('report.timing.search'), await grid.value.search(value)) }, 250)
})

// ─── Bộ đo cố định ──────────────────────────────────────────────────────────
// Kết quả còn được ghi vào window.__reportBench để đọc tự động khi so sánh hai POC.
interface BenchResult { rows: number; generate: number; load: number; sortAmount: number; sortDish: number; search: number; clearSearch: number; scrollEnd: number; heapMb?: number }
const results = ref<BenchResult[]>([])
const resultsOpen = ref(false)
const heapMb = () => {
  const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
  return memory ? memory.usedJSHeapSize / 1048576 : undefined
}
async function runBench() {
  const api = grid.value
  if (!api || busy.value) return
  busy.value = true
  query.value = ''
  clearTimeout(typing)
  const size = Number(count.value)
  const { rows, generateMs } = getSalesRows(size)
  const result: BenchResult = {
    rows: size,
    generate: generateMs,
    load: await api.load(rows),
    sortAmount: await api.sort('amount', 'desc'),
    sortDish: await api.sort('dish', 'asc'),
    search: await api.search('pho'),
    clearSearch: await api.search(''),
    scrollEnd: await api.scrollToEnd(),
  }
  await api.sort('dish', null)
  await api.scrollToTop()
  result.heapMb = heapMb()
  results.value = [result, ...results.value.filter(item => item.rows !== size)].sort((a, b) => a.rows - b.rows)
  ;(window as Window & { __reportBench?: BenchResult[] }).__reportBench = results.value
  busy.value = false
  resultsOpen.value = true
}
const benchColumns = ['generate', 'load', 'sortAmount', 'sortDish', 'search', 'clearSearch', 'scrollEnd'] as const
</script>

<template>
  <ListLayout :title :description>
    <template #filters>
      <CmsSearchBox v-model="query" :label="t('report.search')" :placeholder="t('report.searchPlaceholder')" />
      <CmsSegmented v-model="count" :options="presetOptions" :label="t('report.rowCount')" />
    </template>
    <template #actions>
      <CmsButton v-if="results.length" @click="resultsOpen = true">{{ t('report.benchResults') }}</CmsButton>
      <CmsButton variant="primary" icon="xu-huong" :loading="busy" @click="runBench">{{ t('report.runBench') }}</CmsButton>
    </template>

    <ReportGrid ref="grid" @stats="stats = $event" @timing="record" />

    <template #footer>
      <div class="report-page__metrics" role="status" aria-live="polite">
        <span>{{ t('report.visible', { visible: number.format(stats.visible), total: number.format(Number(count)) }) }}</span>
        <span v-for="item in last" :key="item.label">{{ item.label }} <b>{{ ms(item.ms) }}</b></span>
      </div>
    </template>
  </ListLayout>

  <CmsDialog v-model:open="resultsOpen" :title="t('report.benchResults')" :description="t('report.benchHint')" width="48rem">
    <div class="report-page__bench">
      <table>
        <thead><tr><th>{{ t('report.bench.rows') }}</th><th v-for="key in benchColumns" :key="key">{{ t(`report.bench.${key}`) }}</th><th>{{ t('report.bench.heap') }}</th></tr></thead>
        <tbody>
          <tr v-for="item in results" :key="item.rows">
            <th scope="row">{{ number.format(item.rows) }}</th>
            <td v-for="key in benchColumns" :key="key">{{ ms(item[key]) }}</td>
            <td>{{ item.heapMb ? `${number.format(Math.round(item.heapMb))} MB` : '–' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <template #footer><CmsButton @click="resultsOpen = false">{{ t('ui.dialog.close') }}</CmsButton></template>
  </CmsDialog>
</template>

<style scoped lang="scss">
.report-page__metrics {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4) var(--space-16);
  padding: var(--space-10) var(--space-8);
  color: var(--ink-muted);
  font-size: var(--type-cell-font-size);
  line-height: var(--type-cell-line-height);
  font-variant-numeric: tabular-nums;
  b { color: var(--ink); font-weight: 600; }
}
.report-page__bench {
  overflow-x: auto;
  table { width: 100%; border-collapse: collapse; font-size: .8125rem; font-variant-numeric: tabular-nums; }
  th, td { padding: var(--space-8); border-bottom: 1px solid var(--line-soft); text-align: right; white-space: nowrap; }
  thead th { color: var(--ink-muted); font-size: .75rem; font-weight: 600; }
  tbody th { color: var(--ink); text-align: left; }
}
</style>
