<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VxeUI from 'vxe-pc-ui'
import MainNavigation from './MainNavigation.vue'
import MobileReportNavigation from './MobileReportNavigation.vue'
import ReportTree from './ReportTree.vue'
import { allModules, filterReports, moduleHref, reportHref, reportPath, reports } from './navigation'
import './navigation.scss'

defineProps<{ stackLabel: string }>()

const route = useRoute()
const router = useRouter()
const activeModule = ref('home')
const selectedIds = ref<string[]>([])
const homeCollapsed = ref(false)
const reportMenuCollapsed = ref(false)
const reportMenuToggle = ref<HTMLButtonElement>()
const query = ref('')
const dark = ref(false)
const expanded = ref(new Set(['a']))
const dialog = ref<HTMLDialogElement>()
const content = ref<HTMLElement>()
const drawerOpen = ref(false)
const drawerClosing = ref(false)
const drawerMode = ref<'main' | 'reports'>('main')
const reportOpenVersion = ref(0)
const mobileMedia = window.matchMedia('(max-width: 959px)')
const isMobile = ref(mobileMedia.matches)
let closeTimer: ReturnType<typeof setTimeout> | undefined
let closeResolvers: (() => void)[] = []
const currentModule = computed(() => allModules.find(item => item.id === activeModule.value) ?? allModules[0]!)
const path = computed(() => reportPath(selectedIds.value))
const selected = computed(() => path.value.at(-1))
const pageTitle = computed(() => selected.value ? `${selected.value.code ? selected.value.code + ' · ' : ''}${selected.value.label}` : currentModule.value.label)
const filtered = computed(() => filterReports(reports, query.value))
const compact = computed(() => activeModule.value !== 'home' || homeCollapsed.value)
const mobileParent = computed(() => path.value.length > 1 ? path.value[path.value.length - 2] : undefined)

function readRoute() {
  const parts = route.path.split('/').filter(Boolean)
  const module = allModules.find(item => item.id === parts[0])
  activeModule.value = module?.id ?? 'home'
  const resolved = activeModule.value === 'reports' ? reportPath(parts.slice(1)) : []
  selectedIds.value = resolved.map(item => item.id)
  const next = new Set(expanded.value)
  resolved.forEach(item => { if (item.children) next.add(item.id) })
  expanded.value = next
}
function finishClose() {
  clearTimeout(closeTimer)
  drawerClosing.value = false
  drawerOpen.value = false
  dialog.value?.close()
  closeResolvers.splice(0).forEach(resolve => resolve())
}
function closeMenu(): Promise<void> {
  if (!dialog.value?.open) return Promise.resolve()
  const completion = new Promise<void>(resolve => closeResolvers.push(resolve))
  if (!drawerClosing.value) {
    drawerClosing.value = true
    // animationend finishes first; timeout also handles interrupted/disabled animations.
    closeTimer = setTimeout(finishClose, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 180 : 280)
  }
  return completion
}
function go(module: string, ids: string[] = []) {
  void router.push(module === 'reports' ? reportHref(ids) : moduleHref(module))
  void closeMenu().then(() => nextTick(() => content.value?.focus({ preventScroll: true })))
}
async function openMenu(mode: 'main' | 'reports' = 'main') {
  clearTimeout(closeTimer)
  drawerClosing.value = false
  drawerMode.value = mode
  if (mode === 'reports') reportOpenVersion.value += 1
  await nextTick()
  if (!dialog.value?.open) dialog.value?.showModal()
  drawerOpen.value = true
}
function toggleMenu() {
  if (isMobile.value) openMenu()
  else if (activeModule.value === 'home') homeCollapsed.value = !homeCollapsed.value
  else openMenu()
}
async function toggleReportMenu() {
  reportMenuCollapsed.value = !reportMenuCollapsed.value
  await nextTick()
  reportMenuToggle.value?.focus({ preventScroll: true })
}
function toggleBranch(id: string) {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}
function backdropClick(event: MouseEvent) { if (event.target === dialog.value) void closeMenu() }
function dialogClosed() { if (!dialog.value?.open) finishClose() }
function drawerAnimationEnd(event: AnimationEvent) {
  if (event.target === dialog.value && drawerClosing.value && event.animationName.startsWith('cms-drawer-out')) finishClose()
}
function viewportChanged(event: MediaQueryListEvent) {
  isMobile.value = event.matches
  if (dialog.value?.open) finishClose()
}
function dialogKeydown(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !dialog.value) return
  const items = Array.from(dialog.value.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled)')).filter(item => item.getClientRects().length)
  const first = items[0]
  const last = items.at(-1)
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

// Theme lives on <html> so parent tokens, aliases and VxeUI all switch together.
function applyTheme(value: boolean) {
  document.documentElement.dataset.theme = value ? 'dark' : 'light'
  VxeUI.setTheme(value ? 'dark' : 'light')
}

// Covers first load, in-app navigation and browser back/forward.
watch(() => route.path, readRoute, { immediate: true })
watch(dark, applyTheme, { immediate: true })
onMounted(() => mobileMedia.addEventListener('change', viewportChanged))
onBeforeUnmount(() => {
  mobileMedia.removeEventListener('change', viewportChanged)
  finishClose()
  delete document.documentElement.dataset.theme
})
</script>

<template>
  <div class="cms-shell" :class="{ 'is-dark': dark, 'has-drawer': drawerOpen, 'is-rail-layout': compact, 'has-context': activeModule === 'reports' && !reportMenuCollapsed }">
    <a class="cms-skip" href="#cms-content" @click.prevent="content?.focus()">Đến nội dung chính</a>
    <aside v-if="!isMobile" class="cms-global-sidebar" :class="{ 'is-compact': compact }" aria-label="Điều hướng ứng dụng">
      <MainNavigation :compact="compact" :active-module="activeModule" :dark="dark" @navigate="go" @toggle="toggleMenu" @theme="dark = !dark" />
    </aside>

    <aside v-if="!isMobile && activeModule === 'reports'" v-show="!reportMenuCollapsed" id="cms-report-navigation" class="cms-context-sidebar" aria-label="Menu Báo cáo">
      <div class="cms-context-heading">
        <h2>Báo cáo</h2>
        <button v-if="!reportMenuCollapsed" ref="reportMenuToggle" type="button" class="cms-icon-button" aria-label="Đóng menu Báo cáo" aria-controls="cms-report-navigation" aria-expanded="true" title="Đóng menu Báo cáo" @click="toggleReportMenu">
          <img src="/navigation/c9074.svg" width="16" height="16" alt="" />
        </button>
      </div>
      <div class="cms-search">
        <img src="/navigation/a2c6c.svg" width="16" height="16" alt="" />
        <input v-model="query" type="search" aria-label="Tìm báo cáo" placeholder="Tìm theo tên hoặc mã (vd A01)" />
      </div>
      <div class="cms-report-scroll">
        <p class="cms-report-section">TẤT CẢ BÁO CÁO</p>
        <nav aria-label="Danh sách báo cáo">
          <ReportTree :nodes="filtered" :path="[]" :expanded="expanded" :selected="selected?.id ?? ''" :searching="!!query.trim()" @toggle="toggleBranch" @navigate="go('reports', $event)" />
        </nav>
        <div v-if="!filtered.length" class="cms-search-empty" role="status"><p>Không tìm thấy báo cáo</p><button type="button" @click="query = ''">Xoá tìm kiếm</button></div>
      </div>
    </aside>

    <div class="cms-workspace">
      <header class="cms-workspace-header">
        <div v-if="isMobile" class="cms-mobile-controls">
          <button class="cms-icon-button" type="button" aria-label="Mở menu chính" aria-haspopup="dialog" :aria-expanded="drawerOpen && drawerMode === 'main'" @click="openMenu('main')"><img src="/navigation/menu.svg" width="20" height="20" alt="" /></button>
          <button v-if="activeModule === 'reports'" class="cms-mobile-module" type="button" aria-label="Mở menu Báo cáo" aria-haspopup="dialog" :aria-expanded="drawerOpen && drawerMode === 'reports'" @click="openMenu('reports')">Báo cáo<img src="/navigation/05f6c.svg" width="14" height="14" alt="" /></button>
          <span v-else class="cms-mobile-module">{{ currentModule.label }}</span>
        </div>
        <nav v-if="!isMobile" class="cms-breadcrumb" aria-label="Đường dẫn">
          <button v-if="activeModule === 'reports' && reportMenuCollapsed" ref="reportMenuToggle" type="button" class="cms-icon-button" aria-label="Mở menu Báo cáo" aria-controls="cms-report-navigation" aria-expanded="false" title="Mở menu Báo cáo" @click="toggleReportMenu">
            <img src="/navigation/c9074.svg" width="16" height="16" alt="" />
          </button>
          <a :href="moduleHref('home')" @click.prevent="go('home')"><img src="/navigation/19c02.svg" width="18" height="18" alt="Trang chủ" /></a>
          <template v-if="activeModule !== 'home'">
            <span class="cms-breadcrumb-divider">/</span>
            <a v-if="path.length" :href="moduleHref(activeModule)" @click.prevent="go(activeModule)">{{ currentModule.label }}</a><span v-else aria-current="page">{{ currentModule.label }}</span>
          </template>
          <template v-for="(node, index) in path" :key="node.id">
            <span class="cms-breadcrumb-divider">/</span>
            <a v-if="index < path.length - 1" :href="reportHref(selectedIds.slice(0, index + 1))" @click.prevent="go('reports', selectedIds.slice(0, index + 1))">{{ node.code ?? node.label }}</a><span v-else aria-current="page">{{ node.code ?? node.label }}</span>
          </template>
          <span v-if="activeModule === 'home'" aria-current="page">Trang chủ</span>
        </nav>
        <div class="cms-workspace-meta">
          <RouterLink class="cms-stack-label" to="/table" :title="'Mở bảng dữ liệu PoC: ' + stackLabel" aria-label="Mở bảng dữ liệu PoC"><span>Vue 3</span><strong>{{ stackLabel }}</strong></RouterLink>
          <span class="cms-workspace-brand">Chanh Dev</span>
        </div>
        <nav v-if="isMobile && path.length" class="cms-breadcrumb cms-mobile-breadcrumb" aria-label="Đường dẫn">
          <a :href="reportHref(selectedIds.slice(0, -1))" @click.prevent="go('reports', selectedIds.slice(0, -1))">{{ mobileParent?.code ?? mobileParent?.label ?? 'Báo cáo' }}</a>
          <span class="cms-breadcrumb-divider">/</span><span aria-current="page">{{ selected?.code ?? selected?.label }}</span>
        </nav>
      </header>
      <main id="cms-content" ref="content" class="cms-content" tabindex="-1">
        <h1>{{ pageTitle }}</h1>
        <p class="cms-content-placeholder">Nội dung {{ selected?.code ?? currentModule.label }}.</p>
      </main>
    </div>

    <dialog ref="dialog" class="cms-menu-dialog" :class="{ 'is-closing': drawerClosing, 'is-mobile-drawer': isMobile }" :aria-label="drawerMode === 'reports' ? 'Menu Báo cáo' : 'Menu chính'" @click="backdropClick" @keydown="dialogKeydown" @cancel.prevent="closeMenu()" @close="dialogClosed" @animationend="drawerAnimationEnd">
      <div class="cms-drawer-content">
        <MobileReportNavigation v-if="isMobile && drawerMode === 'reports'" :key="reportOpenVersion" :selected-ids="selectedIds" @navigate="go('reports', $event)" @main="drawerMode = 'main'" @close="closeMenu" />
        <MainNavigation v-else :active-module="activeModule" :dark="dark" :mobile="isMobile" overlay @navigate="go" @toggle="closeMenu" @theme="dark = !dark" />
      </div>
    </dialog>
  </div>
</template>
