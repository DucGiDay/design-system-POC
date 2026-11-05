<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/icon/AppIcon.vue'
import CmsSearchBox from '@/components/ui/CmsSearchBox.vue'
import SubNavToggle from './SubNavToggle.vue'
import type { TocGroup } from './detail'

/**
 * Layout trang chi tiết (Figma MA05 520:1721):
 *   Header dính: nút quay lại + tiêu đề · #actions (Ngừng hoạt động, Lưu và đồng bộ, Lưu)
 *   Cột trái 260 dính: #summary (thẻ tóm tắt) + Mục lục (tìm, nhóm, mục — tự sáng theo vị trí cuộn)
 *   Cột phải: #default — các DetailSection, `id` mỗi khối trùng `id` trong `toc`
 */
const props = withDefaults(defineProps<{
  title: string
  backTo: string
  toc: TocGroup[]
  /** false khi đang tải dữ liệu: các khối chưa có trong DOM nên chưa theo dõi cuộn / nhảy theo #hash */
  ready?: boolean
}>(), { ready: true })
const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const query = ref('')
const searchable = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()
const groups = computed(() => {
  const term = searchable(query.value.trim())
  if (!term) return props.toc
  return props.toc.map(group => ({ ...group, items: group.items.filter(item => searchable(item.label).includes(term)) })).filter(group => group.items.length)
})
const ids = computed(() => props.toc.flatMap(group => group.items.map(item => item.id)))
const active = ref(ids.value[0] ?? '')

// ─── Scroll-spy ──────────────────────────────────────────────────────────────
// Khối đang đọc = khối cuối cùng có mép trên đã qua đáy header dính. Cuộn chạm đáy thì các khối cuối
// không bao giờ lên tới mép đó → giữ mục vừa bấm nếu khối của nó đang thấy, không thì sáng khối cuối.
const body = useTemplateRef<HTMLElement>('body')
let scroller: HTMLElement | Window | undefined
let lockUntil = 0
const sectionEl = (id: string) => body.value?.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
function findScroller(element: HTMLElement | null): HTMLElement | Window {
  for (let node = element?.parentElement; node; node = node.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight) return node
  }
  return window
}
function spy() {
  // Đang cuộn mượt do bấm mục lục: giữ mục vừa bấm, không nhảy qua các khối đi ngang
  if (performance.now() < lockUntil || !scroller) return
  const view = scroller instanceof Window ? { top: 0, bottom: innerHeight } : scroller.getBoundingClientRect()
  const atBottom = scroller instanceof Window
    ? innerHeight + scrollY >= document.documentElement.scrollHeight - 2
    : scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
  // Header dính cao 86 → khối được tính là "đang đọc" khi mép trên lên quá 120px tính từ đỉnh vùng cuộn
  const line = view.top + 120
  if (atBottom) {
    const current = sectionEl(active.value)?.getBoundingClientRect()
    if (current && current.top < view.bottom && current.bottom > view.top) return
    active.value = ids.value.at(-1) ?? active.value
    return
  }
  const passed = ids.value.filter(id => (sectionEl(id)?.getBoundingClientRect().top ?? Infinity) <= line)
  active.value = passed.at(-1) ?? ids.value[0] ?? ''
}
// Sự kiện scroll đã tối đa một lần mỗi khung hình, mỗi lần chỉ đo vài khối → gọi thẳng, không cần rAF
const onScroll = () => spy()
function listen() {
  scroller?.removeEventListener('scroll', onScroll)
  scroller = findScroller(body.value ?? null)
  scroller.addEventListener('scroll', onScroll, { passive: true })
  spy()
}
// Mở trang với #khối (vd từ ô cấu hình trong bảng) thì cuộn tới khối đó khi dữ liệu đã có
async function start() {
  if (!props.ready) return
  await nextTick()
  listen()
  const hash = decodeURIComponent(route.hash.slice(1))
  if (hash && ids.value.includes(hash)) jump(hash, true)
}
onMounted(start)
watch(() => props.ready, start)
onBeforeUnmount(() => scroller?.removeEventListener('scroll', onScroll))

function jump(id: string, instant = false) {
  const element = sectionEl(id)
  if (!element) return
  const reduce = instant || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // Giữ #khối trên URL để chia sẻ link / tải lại vẫn về đúng chỗ
  void router.replace({ hash: `#${id}` })
  active.value = id
  lockUntil = performance.now() + (reduce ? 50 : 900)
  element.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  // Đưa focus vào khối để bàn phím / trình đọc màn hình đi tiếp từ đó
  element.focus({ preventScroll: true })
}
function back() {
  // Có lịch sử trong app thì lùi để giữ trang / bộ lọc của danh sách
  if (window.history.state?.back) router.back()
  else void router.push(props.backTo)
}
</script>

<template>
  <section class="cms-detail-layout">
    <header class="cms-detail-layout__header">
      <div class="cms-detail-layout__title">
        <SubNavToggle />
        <a class="cms-detail-layout__back" :href="backTo" :aria-label="t('layout.back')" :title="t('layout.back')" @click.prevent="back"><AppIcon name="mui-ten-trai" size="1.125rem" /></a>
        <h1>{{ title }}</h1>
      </div>
      <div v-if="$slots.actions" class="cms-detail-layout__actions"><slot name="actions" /></div>
    </header>

    <div ref="body" class="cms-detail-layout__body">
      <aside class="cms-detail-layout__aside">
        <slot name="summary" />
        <nav class="cms-detail-toc" :aria-label="t('layout.toc')">
          <CmsSearchBox v-model="query" :label="t('layout.tocSearch')" :placeholder="t('layout.tocSearchPlaceholder')" />
          <template v-for="group in groups" :key="group.label">
            <p class="cms-detail-toc__group">{{ group.label }}</p>
            <a v-for="item in group.items" :key="item.id" :href="`#${item.id}`" class="cms-detail-toc__item" :class="{ 'is-active': active === item.id }" :aria-current="active === item.id ? 'location' : undefined" @click.prevent="jump(item.id)">
              <span class="cms-detail-toc__chip"><AppIcon :name="item.icon" size="1rem" /></span>
              <span class="cms-detail-toc__label">{{ item.label }}</span>
            </a>
          </template>
          <p v-if="!groups.length" class="cms-detail-toc__empty" role="status">{{ t('layout.tocEmpty') }}</p>
        </nav>
      </aside>
      <div class="cms-detail-layout__main"><slot /></div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cms-detail-layout {
  --cms-detail-header: 5.375rem; // 24 + 38 + 24: phần header dính tính cả khoảng thở
  min-height: 100%;
  padding: 0 var(--space-24) var(--space-24);
  background: var(--subtle);
}

.cms-detail-layout__header {
  position: sticky;
  top: 0;
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-12);
  align-items: center;
  justify-content: space-between;
  margin: 0 calc(-1 * var(--space-24));
  padding: var(--space-24) var(--space-24) var(--space-24);
  background: var(--subtle);
}
.cms-detail-layout__title {
  display: flex;
  gap: var(--space-12);
  align-items: center;
  min-width: 0;
  h1 {
    overflow: hidden;
    color: var(--ink);
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.75rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.cms-detail-layout__back {
  display: grid;
  flex: none;
  place-items: center;
  width: 2.375rem;
  height: 2.375rem;
  border-radius: var(--radius-md);
  color: var(--ink-2);
  background: var(--surface);
  box-shadow: var(--shadow-inside-stroke);
  &:hover { background: var(--field); }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
}
.cms-detail-layout__actions { display: flex; flex-wrap: wrap; gap: var(--space-8); align-items: center; }

.cms-detail-layout__body {
  display: grid;
  grid-template-columns: 16.25rem minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}
.cms-detail-layout__aside {
  position: sticky;
  top: var(--cms-detail-header);
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  max-height: calc(100dvh - var(--cms-detail-header) - var(--space-24));
  overflow-y: auto;
}
.cms-detail-layout__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  min-width: 0;
  // Khối nhảy tới từ mục lục không bị header dính che
  > :deep([id]) { scroll-margin-top: var(--cms-detail-header); }
}

// Mục lục (Figma 520:2020 · Mục lục/Mục 210:390)
.cms-detail-toc {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-12) var(--space-8) var(--space-8);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-lg);
  background: var(--surface);
}
.cms-detail-toc__group {
  padding: var(--space-12) 0 var(--space-4) var(--space-10);
  color: var(--ink-faint);
  font-size: .6875rem;
  font-weight: 600;
  letter-spacing: .44px;
  line-height: .875rem;
  text-transform: uppercase;
}
.cms-search-box + .cms-detail-toc__group { padding-top: var(--space-6); }
.cms-detail-toc__item {
  position: relative;
  display: flex;
  gap: var(--space-10);
  align-items: center;
  height: 2.5rem;
  padding: 0 var(--space-10) 0 var(--space-8);
  border-radius: var(--radius-md);
  color: var(--ink-2);
  &:hover { background: var(--subtle); }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
}
.cms-detail-toc__chip {
  display: grid;
  flex: none;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-sm);
  color: var(--ink-muted);
  background: var(--subtle);
}
.cms-detail-toc__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: .8125rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cms-detail-toc__item.is-active {
  color: var(--primary-text);
  background: var(--primary-tint);
  .cms-detail-toc__chip { color: #fff; background: var(--primary); }
  .cms-detail-toc__label { font-weight: 600; }
  &::before {
    content: '';
    position: absolute;
    top: .625rem;
    left: 0;
    width: 3px;
    height: 1.25rem;
    border-radius: 0 2px 2px 0;
    background: var(--primary);
  }
}
.cms-detail-toc__empty { padding: var(--space-16) var(--space-10); color: var(--ink-muted); font-size: .8125rem; }

// Hẹp: bỏ cột trái dính, mục lục nằm trên form
@media (max-width: 1099px) {
  .cms-detail-layout__body { grid-template-columns: minmax(0, 1fr); }
  .cms-detail-layout__aside { position: static; max-height: none; overflow: visible; }
}
@media (max-width: 959px) {
  .cms-detail-layout { padding: 0 var(--space-16) var(--space-16); }
  .cms-detail-layout__header { position: static; margin: 0 calc(-1 * var(--space-16)); padding: var(--space-16); }
  .cms-detail-layout__main > :deep([id]) { scroll-margin-top: var(--space-16); }
}
</style>
