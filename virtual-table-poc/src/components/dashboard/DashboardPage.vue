<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../icon/AppIcon.vue'
import CmsButton from '../ui/CmsButton.vue'
import CmsIconButton from '../ui/CmsIconButton.vue'
import CmsDialog from '../ui/CmsDialog.vue'
import CmsInput from '../ui/CmsInput.vue'
import CmsSegmented from '../ui/CmsSegmented.vue'
import CmsMetricCard from '../ui/CmsMetricCard.vue'
import CmsReportCard from '../ui/CmsReportCard.vue'
import { currentLocale, setLocale } from '../../i18n'
import { products, revenueDays, dayKeys, rankingGroups, payments } from './data'
import { useAppBanner } from '../navigation/app-banner'

type DetailRow = { name: string; value: string }

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { kind: bannerKind } = useAppBanner()
const period = ref('today')
const basis = ref('net')
const sort = ref('net')
const selectedStores = ref(Array.from({ length: 12 }, (_, i) => i + 1))
const draftStores = ref([...selectedStores.value])
const scopeMenu = ref<HTMLDetailsElement>()
const dateMenu = ref<HTMLDetailsElement>()
const start = ref('2026-10-13')
const end = ref('2026-10-13')
const draftStart = ref(start.value)
const draftEnd = ref(end.value)
const dateError = ref('')
const hoveredDay = ref<number | null>(5)
const monthOffset = ref(0)
const query = ref('')
const dialogOpen = ref(false)
const dialogTitle = ref('')
const dialogRows = ref<DetailRow[]>([])
const dialogDescription = ref('')
const connectChannel = ref('')
const scale = computed(() => selectedStores.value.length / 12)
const periodScale = computed(() => period.value === 'week' ? 12.7006 : period.value === 'month' ? 16.4 : period.value === 'custom' ? Math.max(1, (Date.parse(end.value) - Date.parse(start.value)) / 86400000 + 1) : 1)
const revenue = computed(() => (basis.value === 'gross' ? 660400 : 612400) * scale.value * periodScale.value)
const money = (value: number) => new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'vi-VN', { maximumFractionDigits: 0 }).format(Math.round(value)) + ' ₫'
const number = (value: number) => new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'vi-VN', { maximumFractionDigits: 0 }).format(Math.round(value))
const compact = (value: number) => new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'vi-VN', { notation: 'compact', maximumFractionDigits: 2 }).format(value)
const date = (value: string) => new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(value))
const reportEnd = computed(() => { const day = new Date(end.value); day.setUTCDate(day.getUTCDate() - 1); return day.toISOString().slice(0, 10) })
const reportStart = computed(() => { const day = new Date(reportEnd.value); day.setUTCDate(day.getUTCDate() - 6); return day.toISOString().slice(0, 10) })
const range = computed(() => `${date(reportStart.value)} – ${date(reportEnd.value)}`)
const monthDate = computed(() => new Date(Date.UTC(2026, 9 + monthOffset.value, 1)))
const monthLabel = computed(() => t('dashboard.monthLabel', { month: monthDate.value.getUTCMonth() + 1, year: monthDate.value.getUTCFullYear() }))
const periodOptions = computed(() => ['today', 'week', 'month'].map(value => ({ value, label: t(`dashboard.${value}`) })))
// Dải chỉ số có 4 hoặc 5 ô. Ô phí dịch vụ chỉ có khi cửa hàng bật phí dịch vụ; bản demo bật bằng ?metrics=5.
// Theo taste skill: chỉ nhãn và con số, không icon trong ô màu. `negative` = biến động theo chiều xấu cho nhà hàng
// (giảm giá, chi phí tăng; khách giảm), không phải chiều giảm.
const metrics = computed(() => {
  const items: { key: string; label: string; value: string; unit: string; hint: string; delta?: string; negative?: boolean }[] = [
    { key: 'discount', label: t('dashboard.discount'), value: number(48000 * scale.value * periodScale.value), unit: '₫', hint: t('dashboard.discountHint'), delta: '+5%', negative: true },
    { key: 'invoices', label: t('dashboard.invoices'), value: number(18 * scale.value * periodScale.value), unit: t('dashboard.invoiceUnit'), hint: t('dashboard.invoiceHint', { amount: money(34022) }), delta: '+8%' },
    { key: 'customers', label: t('dashboard.customers'), value: number(27 * scale.value * periodScale.value), unit: t('dashboard.customerUnit'), hint: t('dashboard.customerHint', { amount: money(22681) }), delta: '−3%', negative: true },
    { key: 'remaining', label: t('dashboard.remaining'), value: number(31871), unit: t('dashboard.invoiceUnit'), hint: t('dashboard.packageHint') },
  ]
  if (route.query.metrics === '5') items.splice(1, 0, { key: 'serviceFee', label: t('dashboard.serviceFee'), value: number(24000 * scale.value * periodScale.value), unit: '₫', hint: t('dashboard.serviceFeeHint'), delta: '+2%' })
  return items
})
// Kỳ so sánh của biến động, đọc cho trình đọc màn hình và hiện khi rê chuột
const deltaWindow = computed(() => t(`dashboard.deltaWindow.${period.value}`))
const sortedProducts = computed(() => [...products].sort((a, b) => b[sort.value as 'net' | 'gross' | 'quantity'] - a[sort.value as 'net' | 'gross' | 'quantity']))
const shortcuts = computed(() => ['revenue', 'products', 'payments', 'promotions', 'sources', 'stores', 'profit'].filter(key => t(`dashboard.${key}`).toLocaleLowerCase().includes(query.value.trim().toLocaleLowerCase())))
function selectPeriod(value: string) {
  period.value = value
  start.value = value === 'week' ? '2026-10-07' : value === 'month' ? '2026-10-01' : '2026-10-13'
  end.value = '2026-10-13'; draftStart.value = start.value; draftEnd.value = end.value
}
function applyDate() {
  if (!draftStart.value || !draftEnd.value || draftStart.value > draftEnd.value) { dateError.value = t('dashboard.dateError'); return }
  start.value = draftStart.value; end.value = draftEnd.value; period.value = 'custom'; dateError.value = ''; dateMenu.value?.removeAttribute('open')
}
function showDialog(title: string, description: string, rows: DetailRow[] = []) { connectChannel.value = ''; dialogTitle.value = title; dialogDescription.value = description; dialogRows.value = rows; dialogOpen.value = true }
function rowsFor(key: string): DetailRow[] {
  if (key === 'revenue') return dayKeys.map((day, index) => ({ name: t(`dashboard.${day}`), value: money(revenueDays[index]! * scale.value) }))
  if (key === 'products') return sortedProducts.value.map(row => ({ name: t(`dashboard.${row.key}`), value: sort.value === 'quantity' ? number(row.quantity * scale.value) : money(row[sort.value as 'net' | 'gross'] * scale.value) }))
  if (key === 'payments') return payments.map(row => ({ name: t(`dashboard.${row.key}`), value: money(row.value * scale.value) }))
  if (key === 'profit') return monthOffset.value === 0 ? [{ name: t('dashboard.income'), value: money(10043340 * scale.value) }, { name: t('dashboard.cost'), value: money(450043 * scale.value) }, { name: t('dashboard.profitLabel'), value: money(9593297 * scale.value) }] : []
  return rankingGroups.find(group => group.key === key)?.rows.map(row => ({ name: t(`dashboard.${row.key}`), value: money(row.value * scale.value) })) ?? []
}
function detail(key: string) { showDialog(t(`dashboard.${key}`), `${key === 'profit' ? monthLabel.value : range.value} · ${t('dashboard.preview')}`, rowsFor(key)); query.value = '' }
function connect(channel: string) { showDialog(t('dashboard.connect', { channel }), t('dashboard.connectDescription', { channel })); connectChannel.value = channel }
function closeDetails(event: FocusEvent, element?: HTMLDetailsElement) { if (!element?.contains(event.relatedTarget as Node)) element?.removeAttribute('open') }
</script>

<template>
  <div class="cms-dashboard">
    <header class="cms-dashboard__header">
      <div class="cms-dashboard__welcome"><h1>{{ t('dashboard.greeting') }}</h1><p>{{ t('dashboard.welcome') }}</p></div>
      <div class="cms-dashboard__actions">
        <div class="cms-dashboard__quick" @keydown.esc="query = ''">
          <label class="cms-dashboard__search"><AppIcon name="tim-kiem" size="1rem" /><input v-model="query" type="search" :placeholder="t('dashboard.quick')" :aria-label="t('dashboard.searchTitle')" /></label>
          <div v-if="query.trim()" class="cms-dashboard__search-results"><button v-for="key in shortcuts" :key="key" type="button" @click="detail(key)">{{ t(`dashboard.${key}`) }}<AppIcon name="mui-ten-phai" size="1rem" /></button><p v-if="!shortcuts.length">{{ t('dashboard.noResults') }}</p></div>
        </div>
        <!-- Banner gói sắp hết hạn đã có nút Gia hạn: ẩn lối tắt này để màn hình chỉ có một chỗ gia hạn -->
        <button v-if="bannerKind !== 'expiry'" type="button" class="cms-dashboard__renew" @click="showDialog(t('dashboard.renew'), t('dashboard.noticeDescription'))"><AppIcon name="goi-pro" size="1rem" />{{ t('dashboard.renew') }}</button>
        <CmsIconButton icon="huong-dan" :label="t('dashboard.help')" outline @click="showDialog(t('dashboard.help'), t('dashboard.preview'))" />
        <CmsIconButton icon="marketplace" :label="t('dashboard.market')" outline @click="router.push('/marketplace')" />
        <CmsButton size="sm" icon="ngon-ngu" @click="setLocale(currentLocale === 'vi' ? 'en' : 'vi')">{{ currentLocale.toUpperCase() }}<AppIcon name="mui-ten-xuong" size=".875rem" /></CmsButton>
        <div class="cms-dashboard__notification"><CmsIconButton icon="thong-bao" :label="t('dashboard.notifications')" outline @click="showDialog(t('dashboard.notifications'), t('dashboard.noticeDescription'))" /><span>9+</span></div>
        <button type="button" class="cms-dashboard__user" @click="showDialog(t('dashboard.user'), t('dashboard.role'))"><span class="cms-dashboard__avatar">NA</span><span class="cms-dashboard__user-copy"><strong>{{ t('dashboard.user') }}</strong><small>{{ t('dashboard.role') }}</small></span><AppIcon name="mui-ten-xuong" size="1rem" /></button>
      </div>
    </header>

    <div class="cms-dashboard__filters">
      <details ref="scopeMenu" class="cms-dashboard__scope" @toggle="draftStores = [...selectedStores]" @keydown.esc="scopeMenu?.removeAttribute('open')" @focusout="closeDetails($event, scopeMenu)">
        <summary><img src="/dashboard/a4a0f.png" width="28" height="28" alt="" /><strong>{{ selectedStores.length === 12 ? t('dashboard.allStores') : t('dashboard.storesSelected', { count: selectedStores.length }) }}</strong><AppIcon name="mui-ten-xuong" size=".875rem" /></summary>
        <div class="cms-dashboard__scope-popover"><label><input type="checkbox" :checked="draftStores.length === 12" :indeterminate="draftStores.length > 0 && draftStores.length < 12" @change="draftStores = draftStores.length === 12 ? [] : Array.from({ length: 12 }, (_, i) => i + 1)" />{{ t('dashboard.allStores') }}</label><label v-for="id in 12" :key="id"><input v-model="draftStores" type="checkbox" :value="id" />{{ t(`dashboard.store${id}`) }}</label><CmsButton size="sm" :disabled="!draftStores.length" @click="selectedStores = [...draftStores]; scopeMenu?.removeAttribute('open')">{{ t('dashboard.apply') }}</CmsButton></div>
      </details>
      <div class="cms-dashboard__date-filters">
        <!-- TODO(design): chờ Figma — phần mở chọn ngày dùng input date gốc và khung overlay theo quy ước tạm. -->
        <details ref="dateMenu" class="cms-dashboard__dates" @keydown.esc="dateMenu?.removeAttribute('open')" @focusout="closeDetails($event, dateMenu)"><summary><AppIcon name="lich" size="1rem" /><strong>{{ date(start) }} – {{ date(end) }}</strong><AppIcon name="mui-ten-xuong" size=".875rem" /></summary><div class="cms-dashboard__date-popover"><CmsInput v-model="draftStart" type="date" :label="t('dashboard.from')" /><CmsInput v-model="draftEnd" type="date" :label="t('dashboard.to')" :min="draftStart" :error="dateError" /><CmsButton size="sm" @click="applyDate">{{ t('dashboard.apply') }}</CmsButton></div></details>
        <CmsSegmented :model-value="period" :options="periodOptions" :label="t('dashboard.period')" @update:model-value="selectPeriod" />
      </div>
    </div>

    <div class="cms-dashboard__scroll">
    <section class="cms-dashboard__hero" :aria-label="t('dashboard.income')">
      <div class="cms-dashboard__hero-art" aria-hidden="true">
        <img class="cms-dashboard__glow" src="/dashboard/b091b.svg" alt="" />
        <img class="cms-dashboard__orbit" src="/dashboard/d4cc0.svg" alt="" />
        <img class="cms-dashboard__orbit-inner" src="/dashboard/94dee.svg" alt="" />
        <img class="cms-dashboard__cloud-one" src="/dashboard/e7bf9.svg" alt="" />
        <img class="cms-dashboard__cloud-two" src="/dashboard/b0589.svg" alt="" />
        <img class="cms-dashboard__platform" src="/dashboard/2d125.svg" alt="" />
        <img class="cms-dashboard__platform-line" src="/dashboard/e0d2f.svg" alt="" />
        <img class="cms-dashboard__laptop" src="/dashboard/9f7d6.png" alt="" />
        <img class="cms-dashboard__receipt" src="/dashboard/486c5.svg" alt="" />
        <img class="cms-dashboard__spark" src="/dashboard/c3967.svg" alt="" />
        <img class="cms-dashboard__floating-bars" src="/dashboard/a52a3.svg" alt="" />
        <img class="cms-dashboard__floating-line" src="/dashboard/804e1.svg" alt="" />
        <div class="cms-dashboard__floating-message"><img src="/dashboard/827fd.svg" alt="" /><img src="/dashboard/17e08.svg" alt="" /><img src="/dashboard/428eb.svg" alt="" /><img src="/dashboard/452d3.svg" alt="" /></div>
      </div>
      <div class="cms-dashboard__hero-copy"><div class="cms-dashboard__hero-label"><h2>{{ t(`dashboard.${period === 'today' ? 'revenueToday' : period === 'week' ? 'revenueWeek' : period === 'month' ? 'revenueMonth' : 'revenueCustom'}`) }}</h2><CmsSegmented v-model="basis" compact :options="[{ value: 'net', label: 'NET' }, { value: 'gross', label: 'GROSS' }]" :label="t('dashboard.income')" /></div><div class="cms-dashboard__comparison"><span>+13,9%</span><p>{{ t('dashboard.compare', { amount: money(537840 * scale) }) }}</p></div><p class="cms-dashboard__revenue" aria-live="polite">{{ number(revenue) }}<small>₫</small></p><CmsButton variant="primary" @click="detail('revenue')">{{ t('dashboard.revenueReport') }}<AppIcon name="mui-ten-phai" size="1rem" /></CmsButton></div>
    </section>

    <section class="cms-dashboard__metrics" :class="`cms-dashboard__metrics--${metrics.length}`" :aria-label="t('dashboard.income')">
      <CmsMetricCard v-for="metric in metrics" :key="metric.key" :label="metric.label" :value="metric.value" :unit="metric.unit" :hint="metric.hint" :delta="metric.delta" :delta-label="deltaWindow" :negative="metric.negative" />
    </section>

    <section class="cms-dashboard__reports">
      <header class="cms-dashboard__section-head"><h2>{{ t('dashboard.reportHeading') }}</h2><p>{{ t('dashboard.reportSubtitle', { from: date(reportStart), to: date(reportEnd), count: selectedStores.length }) }}</p></header>
      <div class="cms-dashboard__report-grid">
        <CmsReportCard class="cms-dashboard__report-top" :title="t('dashboard.revenue')" :subtitle="range" icon="doanh-thu" @detail="detail('revenue')">
          <div class="cms-dashboard__chart" :aria-label="t('dashboard.chartDescription')">
            <div class="cms-dashboard__chart-tooltip" :style="{ visibility: hoveredDay === null ? 'hidden' : 'visible' }">
              <span>{{ t(`dashboard.${dayKeys[hoveredDay ?? 5]}`) }}</span>
              <strong>{{ money(revenueDays[hoveredDay ?? 5]! * scale) }}</strong>
            </div>
            <div class="cms-dashboard__chart-plot">
              <div class="cms-dashboard__axis"><span v-for="value in [2000000, 1500000, 1000000, 500000, 0]" :key="value">{{ compact(value * scale) }}</span></div>
              <div class="cms-dashboard__bars">
                <div v-for="(value, index) in revenueDays" :key="index" class="cms-dashboard__bar-column">
                  <button type="button" class="cms-dashboard__bar"
                    :class="{ 'cms-dashboard__bar--active': hoveredDay === index }"
                    :style="{ height: `${value / 2000000 * 100}%` }"
                    :aria-label="t('dashboard.chartDay', { day: t(`dashboard.${dayKeys[index]}`), amount: money(value * scale) })"
                    @mouseenter="hoveredDay = index" @focus="hoveredDay = index"
                    @mouseleave="hoveredDay = null" @blur="hoveredDay = null" @click="detail('revenue')" />
                  <span>{{ t(`dashboard.${dayKeys[index]}`) }}</span>
                </div>
              </div>
            </div>
          </div>
          <template #footer><span>{{ t('dashboard.average', { amount: money(1111120 * scale) }) }}</span><strong>{{ money(7777840 * scale) }}</strong></template>
        </CmsReportCard>

        <CmsReportCard class="cms-dashboard__report-top" :title="t('dashboard.products')" :subtitle="range" icon="thuc-don" @detail="detail('products')">
          <CmsSegmented v-model="sort" compact :options="['net', 'quantity', 'gross'].map(value => ({ value, label: t(`dashboard.${value}`) }))" :label="t('dashboard.products')" />
          <ol class="cms-dashboard__products"><li v-for="(product, index) in sortedProducts" :key="product.key"><span class="cms-dashboard__rank">{{ index + 1 }}</span><span>{{ t(`dashboard.${product.key}`) }}</span><strong>{{ sort === 'quantity' ? number(product.quantity * scale) : money(product[sort as 'net' | 'gross'] * scale) }}</strong></li></ol>
          <template #footer><span>{{ t('dashboard.otherProducts') }}</span><strong>{{ sort === 'quantity' ? '—' : money(2449650 * scale) }}</strong></template>
        </CmsReportCard>

        <CmsReportCard class="cms-dashboard__report-top" :title="t('dashboard.payments')" :subtitle="range" icon="thanh-toan" @detail="detail('payments')">
          <div class="cms-dashboard__donut" role="img" :aria-label="payments.map(row => `${t(`dashboard.${row.key}`)} ${row.percent}`).join(', ')"><div><small>{{ t('dashboard.total') }}</small><strong>{{ compact(7777840 * scale) }}</strong></div></div><ul class="cms-dashboard__payments"><li v-for="payment in payments" :key="payment.key"><span class="cms-dashboard__dot" :style="{ background: `var(--${payment.color})` }" /><span>{{ t(`dashboard.${payment.key}`) }}<small>{{ money(payment.value * scale) }}</small></span><strong>{{ payment.percent }}</strong></li></ul>
          <template #footer><span>{{ t('dashboard.paymentCount') }}</span><strong>{{ money(7777840 * scale) }}</strong></template>
        </CmsReportCard>

        <CmsReportCard v-for="group in rankingGroups" :key="group.key" class="cms-dashboard__report-middle" :title="t(`dashboard.${group.key}`)" :subtitle="range" :icon="group.icon" @detail="detail(group.key)"><ul class="cms-dashboard__ranking"><li v-for="(row, index) in group.rows" :key="row.key"><div><span>{{ t(`dashboard.${row.key}`) }}</span><strong>{{ money(row.value * scale) }}</strong></div><meter :value="row.value" :max="group.rows[0]!.value" :class="{ 'cms-dashboard__meter--lead': index === 0 }" :aria-label="t(`dashboard.${row.key}`)" /></li></ul><p v-if="group.key !== 'promotions'" class="cms-dashboard__hint">{{ t(`dashboard.${group.key === 'sources' ? 'sourceHint' : 'storeHint'}`) }}</p></CmsReportCard>

        <CmsReportCard class="cms-dashboard__report-bottom" :title="t('dashboard.profit')" :subtitle="t('dashboard.restaurant')" icon="xu-huong" @detail="detail('profit')"><div class="cms-dashboard__month"><CmsIconButton icon="mui-ten-trai" outline :label="t('dashboard.previousMonth')" @click="monthOffset--" /><span><AppIcon name="lich" size="1rem" />{{ monthLabel }}</span><CmsIconButton icon="mui-ten-phai" outline :label="t('dashboard.nextMonth')" @click="monthOffset++" /></div><div v-if="monthOffset === 0" class="cms-dashboard__profit"><div><span>{{ t('dashboard.profitLabel') }}</span><strong>{{ t('dashboard.profitRatio') }}</strong></div><p>{{ money(9593297 * scale) }}</p><div class="cms-dashboard__profit-line" /><small><span><i />{{ t('dashboard.income') }} {{ money(10043340 * scale) }}</span><span><i />{{ t('dashboard.cost') }} {{ money(450043 * scale) }}</span></small></div><p v-else class="cms-dashboard__month-empty">{{ t('dashboard.noMonthData') }}</p><div class="cms-dashboard__costs"><div v-for="(key, index) in ['material', 'monthlyCost', 'allocation']" :key="key"><p><span>{{ t(`dashboard.${key}`) }}</span><strong>{{ money(index === 0 && monthOffset === 0 ? 450043 * scale : 0) }}</strong><small>{{ index === 0 && monthOffset === 0 ? '4,48%' : '0%' }}</small></p><p :class="{ 'cms-dashboard__warning': index < 2 }"><AppIcon v-if="index < 2" name="canh-bao" size=".875rem" />{{ t(`dashboard.${index === 0 ? 'missingCost' : index === 1 ? 'missingConfig' : 'allocationHint'}`) }}</p></div></div></CmsReportCard>

        <CmsReportCard v-for="(channel, index) in ['ShopeeFood', 'GrabFood']" :key="channel" class="cms-dashboard__report-bottom" :title="t('dashboard.channelOrders', { channel })" :subtitle="range" icon="nguon-don" @detail="connect(channel)"><div class="cms-dashboard__empty"><img :src="`/dashboard/${index === 0 ? '0e007' : '3800d'}.svg`" width="166.4" height="130" alt="" /><p>{{ t('dashboard.noOrders', { channel }) }}</p><small>{{ t('dashboard.connectHint') }}</small><CmsButton size="sm" @click="connect(channel)">{{ t('dashboard.connect', { channel }) }}</CmsButton></div></CmsReportCard>
      </div>
    </section>
    <p class="cms-dashboard__demo">{{ t('dashboard.demo') }}</p>
    </div>
    <CmsDialog v-model:open="dialogOpen" :title="dialogTitle" :description="dialogDescription" width="42rem"><table v-if="dialogRows.length" class="cms-dashboard__detail-table"><thead><tr><th>{{ t('dashboard.name') }}</th><th>{{ t('dashboard.value') }}</th></tr></thead><tbody><tr v-for="row in dialogRows" :key="row.name"><td>{{ row.name }}</td><td>{{ row.value }}</td></tr></tbody></table><template #footer><CmsButton @click="dialogOpen = false">{{ t('dashboard.close') }}</CmsButton><CmsButton v-if="connectChannel" @click="dialogOpen = false; router.push('/channels')">{{ t('dashboard.openChannels') }}</CmsButton></template></CmsDialog>
  </div>
</template>

<style scoped lang="scss" src="./dashboard.scss" />

