<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import VxeUI from 'vxe-pc-ui'
import TableSkinToggle from '../../table-skin/TableSkinToggle.vue'
import MainNavigation from './MainNavigation.vue'
import MobileSubNavigation from './MobileSubNavigation.vue'
import NavTree from './NavTree.vue'
import CmsBanner from '../ui/CmsBanner.vue'
import CmsButton from '../ui/CmsButton.vue'
import { allModules, filterNav, leafCount, moduleHref, navNodes, navPath, nodeName, subNavs } from './navigation'
import { BANNERS, useAppBanner } from './app-banner'
import { shellChromeKey } from '../layout/shell'
import { pages } from '@/pages'
import './navigation.scss'

defineProps<{ stackLabel: string }>()

const DashboardPage = defineAsyncComponent(() => import('../dashboard/DashboardPage.vue'))

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const activeModule = ref('home')
const selectedIds = ref<string[]>([])
// Đoạn URL sau mục lá của sidebar con: có = trang chi tiết (vd /menu/dishes/dishes-city/ITEM_HP2E)
const itemId = ref<string>()
const homeCollapsed = ref(false)
const subNavCollapsed = ref(false)
const subNavToggle = ref<HTMLButtonElement>()
const query = ref('')
const dark = ref(false)
// Nhánh đang mở, giữ riêng theo từng module để quay lại module vẫn đúng trạng thái.
const expandedByModule = ref<Record<string, Set<string>>>({})
const dialog = ref<HTMLDialogElement>()
const content = ref<HTMLElement>()
const drawerOpen = ref(false)
const drawerClosing = ref(false)
const drawerMode = ref<'main' | 'sub'>('main')
const subNavOpenVersion = ref(0)
const mobileMedia = window.matchMedia('(max-width: 959px)')
const isMobile = ref(mobileMedia.matches)
let closeTimer: ReturnType<typeof setTimeout> | undefined
let closeResolvers: (() => void)[] = []
const currentModule = computed(() => allModules.find(item => item.id === activeModule.value) ?? allModules[0]!)
const moduleName = computed(() => t(currentModule.value.label))
const subNav = computed(() => subNavs[activeModule.value])
const expanded = computed(() => expandedByModule.value[activeModule.value] ?? new Set<string>())
const path = computed(() => subNav.value ? navPath(navNodes(subNav.value), selectedIds.value) : [])
const selected = computed(() => path.value.at(-1))
const pageTitle = computed(() => selected.value ? `${selected.value.code ? selected.value.code + ' · ' : ''}${selected.value.label}` : moduleName.value)
const searching = computed(() => !!subNav.value?.search && !!query.value.trim())
const sections = computed(() => (subNav.value?.sections ?? [])
  .map(section => ({ ...section, nodes: searching.value ? filterNav(section.nodes, query.value) : section.nodes }))
  .filter(section => section.nodes.length))
const total = computed(() => subNav.value ? leafCount(navNodes(subNav.value)) : 0)
// Mục đang chọn có trang thật (ListLayout / DetailLayout) → trang tự vẽ header, shell ẩn thanh breadcrumb trên desktop
// Mục lá, hoặc mục có mã (vd báo cáo A01 có mục con A01.1) đều là một trang
const page = computed(() => selected.value && (!selected.value.children || selected.value.code) ? (pages[`${activeModule.value}/${selected.value.id}`] ?? pages[`${activeModule.value}/*`]) : undefined)
const pageComponent = computed(() => page.value && (itemId.value && page.value.detail ? page.value.detail : page.value.list))
const compact = computed(() => activeModule.value !== 'home' || homeCollapsed.value)
const mobileParent = computed(() => path.value.length > 1 ? path.value[path.value.length - 2] : undefined)
const { kind: bannerKind, dismiss: dismissBanner } = useAppBanner()

function readRoute() {
  const parts = route.path.split('/').filter(Boolean)
  const module = allModules.find(item => item.id === parts[0])?.id ?? 'home'
  if (module !== activeModule.value) query.value = ''
  activeModule.value = module
  const nav = subNavs[module]
  const resolved = nav ? navPath(navNodes(nav), parts.slice(1)) : []
  selectedIds.value = resolved.map(item => item.id)
  itemId.value = parts[1 + resolved.length]
  if (!nav) return
  const next = new Set(expandedByModule.value[module] ?? nav.expanded)
  resolved.forEach(item => { if (item.children) next.add(item.id) })
  expandedByModule.value = { ...expandedByModule.value, [module]: next }
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
  void router.push(moduleHref(module, ids))
  void closeMenu().then(() => nextTick(() => content.value?.focus({ preventScroll: true })))
}
async function openMenu(mode: 'main' | 'sub' = 'main') {
  clearTimeout(closeTimer)
  drawerClosing.value = false
  drawerMode.value = mode
  if (mode === 'sub') subNavOpenVersion.value += 1
  await nextTick()
  if (!dialog.value?.open) dialog.value?.showModal()
  drawerOpen.value = true
}
function toggleMenu() {
  if (isMobile.value) openMenu()
  else if (activeModule.value === 'home') homeCollapsed.value = !homeCollapsed.value
  else openMenu()
}
async function toggleSubNav() {
  subNavCollapsed.value = !subNavCollapsed.value
  await nextTick()
  subNavToggle.value?.focus({ preventScroll: true })
}
function toggleBranch(id: string) {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedByModule.value = { ...expandedByModule.value, [activeModule.value]: next }
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

provide(shellChromeKey, { isMobile, subNavCollapsed, moduleName, toggleSubNav })

// Theme lives on <html> so parent tokens and composed tokens switch together.
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
  <div class="cms-app">
  <a class="cms-skip" href="#cms-content" @click.prevent="content?.focus()">{{ t('shell.skipToContent') }}</a>
  <CmsBanner v-if="bannerKind" :tone="BANNERS[bannerKind].tone" :icon="BANNERS[bannerKind].icon" :dismiss-label="BANNERS[bannerKind].dismissible ? t('shell.banner.dismiss') : undefined" @dismiss="dismissBanner(bannerKind)">
    {{ t(`shell.banner.${bannerKind}`, BANNERS[bannerKind].params) }}
    <template v-if="bannerKind === 'expiry'" #action><CmsButton size="sm" @click="go('marketplace')">{{ t('shell.banner.renew') }}</CmsButton></template>
  </CmsBanner>
  <div class="cms-shell" :class="{ 'is-dark': dark, 'has-drawer': drawerOpen, 'is-rail-layout': compact, 'has-context': subNav && !subNavCollapsed }">
    <aside v-if="!isMobile" class="cms-global-sidebar" :class="{ 'is-compact': compact }" :aria-label="t('shell.appNavigation')">
      <MainNavigation :compact="compact" :active-module="activeModule" :dark="dark" @navigate="go" @toggle="toggleMenu" @theme="dark = !dark" />
    </aside>

    <aside v-if="!isMobile && subNav" v-show="!subNavCollapsed" id="cms-subnav" class="cms-context-sidebar" :aria-label="t('subnav.menu', { name: moduleName })">
      <div class="cms-context-heading">
        <h2>{{ moduleName }}</h2>
        <span v-if="subNav.totalCount" class="cms-context-count">{{ total }}</span>
        <button v-if="!subNavCollapsed" ref="subNavToggle" type="button" class="cms-icon-button" :aria-label="t('subnav.closeMenu', { name: moduleName })" aria-controls="cms-subnav" aria-expanded="true" :title="t('subnav.closeMenu', { name: moduleName })" @click="toggleSubNav">
          <img src="/navigation/c9074.svg" width="16" height="16" alt="" />
        </button>
      </div>
      <div v-if="subNav.search" class="cms-search">
        <img src="/navigation/a2c6c.svg" width="16" height="16" alt="" />
        <input v-model="query" type="search" :aria-label="t(subNav.search.label)" :placeholder="t(subNav.search.placeholder)" />
      </div>
      <div class="cms-subnav-scroll">
        <nav :aria-label="t('subnav.list', { name: moduleName })">
          <template v-for="(section, index) in sections" :key="section.label ?? index">
            <p v-if="section.label" class="cms-context-section">{{ section.label }}</p>
            <NavTree :module="activeModule" :nodes="section.nodes" :path="[]" :expanded="expanded" :selected="selected?.id ?? ''" :searching="searching" :branch-count="subNav.branchCount" @toggle="toggleBranch" @navigate="go(activeModule, $event)" />
          </template>
        </nav>
        <div v-if="subNav.search && !sections.length" class="cms-search-empty" role="status"><p>{{ t(subNav.search.notFound) }}</p><button type="button" @click="query = ''">{{ t('subnav.clearSearch') }}</button></div>
      </div>
    </aside>

    <div class="cms-workspace">
      <header v-if="(activeModule !== 'home' && !page) || isMobile" class="cms-workspace-header">
        <div v-if="isMobile" class="cms-mobile-controls">
          <button class="cms-icon-button" type="button" :aria-label="t('shell.openMainMenu')" aria-haspopup="dialog" :aria-expanded="drawerOpen && drawerMode === 'main'" @click="openMenu('main')"><img src="/navigation/menu.svg" width="20" height="20" alt="" /></button>
          <button v-if="subNav" class="cms-mobile-module" type="button" :aria-label="t('subnav.openMenu', { name: moduleName })" aria-haspopup="dialog" :aria-expanded="drawerOpen && drawerMode === 'sub'" @click="openMenu('sub')">{{ moduleName }}<img src="/navigation/05f6c.svg" width="14" height="14" alt="" /></button>
          <span v-else class="cms-mobile-module">{{ moduleName }}</span>
        </div>
        <nav v-if="!isMobile" class="cms-breadcrumb" :aria-label="t('shell.breadcrumb')">
          <button v-if="subNav && subNavCollapsed" ref="subNavToggle" type="button" class="cms-icon-button" :aria-label="t('subnav.openMenu', { name: moduleName })" aria-controls="cms-subnav" aria-expanded="false" :title="t('subnav.openMenu', { name: moduleName })" @click="toggleSubNav">
            <img src="/navigation/c9074.svg" width="16" height="16" alt="" />
          </button>
          <a :href="moduleHref('home')" @click.prevent="go('home')"><img src="/navigation/19c02.svg" width="18" height="18" :alt="t('modules.home')" /></a>
          <template v-if="activeModule !== 'home'">
            <span class="cms-breadcrumb-divider">/</span>
            <a v-if="path.length" :href="moduleHref(activeModule)" @click.prevent="go(activeModule)">{{ moduleName }}</a><span v-else aria-current="page">{{ moduleName }}</span>
          </template>
          <template v-for="(node, index) in path" :key="node.id">
            <span class="cms-breadcrumb-divider">/</span>
            <a v-if="index < path.length - 1" :href="moduleHref(activeModule, selectedIds.slice(0, index + 1))" @click.prevent="go(activeModule, selectedIds.slice(0, index + 1))">{{ nodeName(node) }}</a><span v-else aria-current="page">{{ nodeName(node) }}</span>
          </template>
          <span v-if="activeModule === 'home'" aria-current="page">{{ t('modules.home') }}</span>
        </nav>
        <div class="cms-workspace-meta">
          <RouterLink class="cms-stack-label" to="/table" :title="t('shell.openPocTableWith', { stack: stackLabel })" :aria-label="t('shell.openPocTable')"><span>Vue 3</span><strong>{{ stackLabel }}</strong></RouterLink>
          <TableSkinToggle />
          <RouterLink class="cms-stack-label" to="/ui">Component</RouterLink>
          <span class="cms-workspace-brand">Chanh Dev</span>
        </div>
        <nav v-if="isMobile && path.length" class="cms-breadcrumb cms-mobile-breadcrumb" :aria-label="t('shell.breadcrumb')">
          <a :href="moduleHref(activeModule, selectedIds.slice(0, -1))" @click.prevent="go(activeModule, selectedIds.slice(0, -1))">{{ mobileParent ? nodeName(mobileParent) : moduleName }}</a>
          <span class="cms-breadcrumb-divider">/</span><span aria-current="page">{{ selected && nodeName(selected) }}</span>
        </nav>
      </header>
      <main id="cms-content" ref="content" class="cms-content" :class="{ 'cms-content--dashboard': activeModule === 'home', 'cms-content--page': page }" tabindex="-1">
        <DashboardPage v-if="activeModule === 'home'" />
        <component :is="pageComponent" v-else-if="pageComponent" :key="`${activeModule}/${selected?.id}/${itemId ? 'detail' : 'list'}`" :base-href="moduleHref(activeModule, selectedIds)" :item-id="itemId" :node="selected" />
        <template v-else>
          <h1>{{ pageTitle }}</h1>
          <p class="cms-content-placeholder">{{ t('shell.contentPlaceholder', { name: selected ? nodeName(selected) : moduleName }) }}</p>
        </template>
      </main>
    </div>

    <dialog ref="dialog" class="cms-menu-dialog" :class="{ 'is-closing': drawerClosing, 'is-mobile-drawer': isMobile }" :aria-label="drawerMode === 'sub' ? t('subnav.menu', { name: moduleName }) : t('shell.mainMenu')" @click="backdropClick" @keydown="dialogKeydown" @cancel.prevent="closeMenu()" @close="dialogClosed" @animationend="drawerAnimationEnd">
      <div class="cms-drawer-content">
        <MobileSubNavigation v-if="isMobile && drawerMode === 'sub' && subNav" :key="subNavOpenVersion" :module="activeModule" :name="moduleName" :nav="subNav" :selected-ids="selectedIds" @navigate="go(activeModule, $event)" @main="drawerMode = 'main'" @close="closeMenu" />
        <MainNavigation v-else :active-module="activeModule" :dark="dark" :mobile="isMobile" overlay @navigate="go" @toggle="closeMenu" @theme="dark = !dark" />
      </div>
    </dialog>
  </div>
  </div>
</template>
