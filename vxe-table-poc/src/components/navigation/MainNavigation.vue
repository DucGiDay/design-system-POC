<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { hasSession, logout } from '@/components/auth/session'
import { availableLocales, currentLocale, setLocale } from '@/i18n'
import { LOCALE_NAMES } from '@/i18n/locales'
import NavScrollButton from './NavScrollButton.vue'
import { allModules, extensionModules, home, moduleGroups, moduleHref, type ModuleItem } from './navigation'

const props = defineProps<{ compact?: boolean; activeModule: string; overlay?: boolean; mobile?: boolean; dark: boolean }>()
const emit = defineEmits<{ navigate: [id: string]; toggle: []; theme: [] }>()
const { t } = useI18n()
const router = useRouter()
// POC còn chạy khung CMS khi chưa đăng nhập (demo, test), nên chỉ hiện Đăng xuất khi có phiên
const loggedIn = ref(hasSession())
const loggingOut = ref(false)
async function signOut() {
  loggingOut.value = true
  await logout()
  void router.push('/login')
}
// POC có 2 ngôn ngữ nên bấm là xoay vòng; thêm ngôn ngữ thì đổi sang menu chọn
const nextLocale = computed(() => availableLocales[(availableLocales.indexOf(currentLocale.value) + 1) % availableLocales.length]!)
const icon = (item: ModuleItem, active: boolean) => '/navigation/' + (active ? item.activeIcon ?? item.icon : item.icon)
const viewport = ref<HTMLElement>()
const modules = ref<HTMLElement>()
const scrollId = useId()
const overflowing = ref(false)
const atTop = ref(true)
const atBottom = ref(false)
let observer: ResizeObserver | undefined
function positionTooltip(event: Event) {
  if (!props.compact) return
  const root = event.currentTarget as HTMLElement
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-tooltip]')
    ?? root.querySelector<HTMLElement>('[data-tooltip]:hover, [data-tooltip]:focus-visible')
  if (!target || !root.contains(target)) return
  const rect = target.getBoundingClientRect()
  target.style.setProperty('--cms-tooltip-top', `${rect.top + rect.height / 2}px`)
  target.style.setProperty('--cms-tooltip-left', `${rect.right + 8}px`)
}
function measureScroll() {
  const el = modules.value
  if (!el || !viewport.value) return
  overflowing.value = !!props.compact && el.scrollHeight > viewport.value.clientHeight + 4
  atTop.value = el.scrollTop < 2
  atBottom.value = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
}
function stepScroll(direction: number) {
  if (!modules.value) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  modules.value.scrollBy({ top: direction * Math.max(120, Math.min(240, modules.value.clientHeight * .75)), behavior: reduce ? 'instant' : 'smooth' })
}
async function revealActive() {
  await nextTick()
  // Rail and drawer both open with the current module in view.
  if (props.compact || props.overlay) modules.value?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  measureScroll()
}
watch(() => [props.compact, props.activeModule], revealActive)
onMounted(() => {
  observer = new ResizeObserver(() => { void revealActive() })
  if (viewport.value) observer.observe(viewport.value)
  if (modules.value) observer.observe(modules.value)
  void revealActive()
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="cms-main-nav" :class="{ 'is-compact': compact }" @pointerover="positionTooltip" @focusin="positionTooltip" @scroll.capture="positionTooltip">
    <div class="cms-brand-row">
      <button v-if="compact" class="cms-rail-toggle cms-icon-button" type="button" :aria-label="t('shell.openMainMenu')" :aria-haspopup="activeModule === 'home' ? undefined : 'dialog'" :aria-expanded="false" :data-tooltip="t('shell.openMainMenu')" @click="emit('toggle')">
        <img class="cms-rail-wordmark" src="/navigation/73be9.svg" width="39.4561" height="15.8037" alt="" />
        <img class="cms-rail-menu-icon" src="/navigation/menu.svg" width="20" height="20" alt="" />
      </button>
      <a v-else :href="moduleHref(home.id)" class="cms-wordmark" :aria-label="t('shell.homeLink')" @click.prevent="emit('navigate', 'home')">
          <img src="/navigation/866d3.svg" width="93.8816" height="16.5677" alt="FABI CMS" />
          <span class="cms-powered"><img src="/navigation/4a253.svg" width="45.7232" height="8.76167" alt="Powered by" /><img src="/navigation/01feb.svg" width="36.855" height="7.5432" alt="iPOS.vn" /></span>
      </a>
      <button v-if="!compact" type="button" class="cms-icon-button" :aria-label="overlay ? t('shell.closeMainMenu') : t('shell.collapseMainMenu')" @click="emit('toggle')">
        <img v-if="mobile" src="/navigation/close.svg" width="24" height="24" alt="" />
        <img v-else src="/navigation/menu.svg" width="20" height="20" alt="" />
      </button>
    </div>
    <div class="cms-brand-picker" :title="compact ? t('shell.brandTitle', { name: 'Chanh Dev' }) : undefined">
      <span class="cms-brand-avatar">CD</span>
      <span v-if="!compact" class="cms-brand-copy"><small>{{ t('shell.brand') }}</small><strong>Chanh Dev</strong></span>
    </div>

    <div ref="viewport" class="cms-modules-viewport" :class="{ 'is-scrollable-rail': compact && overflowing }">
    <div v-if="compact && overflowing" class="cms-rail-scroll-slot">
      <NavScrollButton v-if="!atTop" direction="up" :controls="scrollId" @scroll="stepScroll(-1)" />
    </div>
    <nav :id="scrollId" ref="modules" class="cms-modules" :aria-label="compact ? t('shell.switchModule') : t('shell.mainMenu')" @scroll.passive="measureScroll">
      <a :href="moduleHref(home.id)" class="cms-module-link cms-home-link" :class="{ 'is-active': activeModule === 'home' }" :aria-current="activeModule === 'home' ? 'page' : undefined" :aria-label="compact ? t(home.label) : undefined" :data-tooltip="compact ? t(home.label) : undefined" @click.prevent="emit('navigate', 'home')">
        <img :src="icon(home, activeModule === 'home')" width="18" height="18" alt="" /><span v-if="!compact">{{ t(home.label) }}</span>
      </a>
      <section v-for="group in moduleGroups" :key="group.label" class="cms-module-group" :aria-label="t(group.label)">
        <h2 v-if="!compact" class="cms-group-label">{{ t(group.label) }}</h2>
        <div v-else class="cms-group-divider" />
        <a v-for="item in group.items" :key="item.id" :href="moduleHref(item.id)" class="cms-module-link" :class="{ 'is-active': activeModule === item.id }" :aria-label="compact ? t(item.label) : undefined" :aria-current="activeModule === item.id ? 'page' : undefined" :data-tooltip="compact ? t(item.label) : undefined" @click.prevent="emit('navigate', item.id)">
          <img :src="icon(item, activeModule === item.id)" width="18" height="18" alt="" />
          <span v-if="!compact">{{ t(item.label) }}</span>
          <img v-if="!compact && !['orders', 'marketplace', 'accounting'].includes(item.id)" class="cms-module-tail" :src="'/navigation/' + ('external' in item ? 'ad697.svg' : '56280.svg')" width="16" height="16" alt="" />
        </a>
      </section>
      <section v-if="!compact" class="cms-module-group" :aria-label="t('groups.extensionsLabel')">
        <h2 class="cms-group-label">{{ t('groups.extensions') }}</h2>
        <a v-for="item in extensionModules" :key="item.id" :href="moduleHref(item.id)" class="cms-module-link" :class="{ 'is-active': activeModule === item.id }" :aria-current="activeModule === item.id ? 'page' : undefined" @click.prevent="emit('navigate', item.id)">
          <img :src="icon(item, false)" width="18" height="18" alt="" /><span>{{ t(item.label) }}</span>
        </a>
      </section>
      <div v-else class="cms-group-divider" />
      <button type="button" class="cms-module-link cms-apps-link" :aria-label="compact ? t('shell.allAppsOpenMenu') : undefined" :data-tooltip="compact ? t('modules.apps') : undefined" @click="compact ? emit('toggle') : emit('navigate', 'apps')">
        <img src="/navigation/1c7b2.svg" width="18" height="18" alt="" /><span v-if="!compact">{{ t('modules.apps') }}</span><span v-if="!compact" class="cms-count">{{ allModules.length - 2 }}</span>
      </button>
    </nav>
    <div v-if="compact && overflowing" class="cms-rail-scroll-slot">
      <NavScrollButton v-if="!atBottom" direction="down" :controls="scrollId" @scroll="stepScroll(1)" />
    </div>
    </div>

    <div class="cms-nav-footer">
      <a :href="moduleHref('support')" class="cms-module-link" :aria-label="compact ? t('modules.support') : undefined" :data-tooltip="compact ? t('modules.support') : undefined" @click.prevent="emit('navigate', 'support')">
        <img src="/navigation/ed25a.svg" width="18" height="18" alt="" /><span v-if="!compact">{{ t('modules.support') }}</span>
      </a>
      <button class="cms-module-link" type="button" role="switch" :aria-checked="dark" :aria-label="t('shell.darkMode')" :data-tooltip="compact ? t('shell.darkMode') : undefined" @click="emit('theme')">
        <img src="/navigation/d631a.svg" width="18" height="18" alt="" /><span v-if="!compact">{{ t('shell.darkMode') }}</span><span v-if="!compact" class="cms-switch" :class="{ 'is-on': dark }"><i /></span>
      </button>
      <button v-if="availableLocales.length > 1" class="cms-module-link" type="button" :aria-label="t('shell.languageSwitch', { current: LOCALE_NAMES[currentLocale], next: LOCALE_NAMES[nextLocale] })" :data-tooltip="compact ? t('shell.language') + ': ' + LOCALE_NAMES[currentLocale] : undefined" @click="setLocale(nextLocale)">
        <span class="cms-locale-code" aria-hidden="true">{{ currentLocale }}</span><span v-if="!compact">{{ t('shell.language') }}</span><span v-if="!compact" class="cms-count">{{ LOCALE_NAMES[currentLocale] }}</span>
      </button>
      <button v-if="loggedIn" class="cms-module-link" type="button" :aria-label="compact ? t('shell.logout') : undefined" :data-tooltip="compact ? t('shell.logout') : undefined" :disabled="loggingOut" :aria-busy="loggingOut" @click="signOut">
        <img src="/navigation/dang-xuat.svg" width="18" height="18" alt="" /><span v-if="!compact">{{ t('shell.logout') }}</span>
      </button>
    </div>
  </div>
</template>
