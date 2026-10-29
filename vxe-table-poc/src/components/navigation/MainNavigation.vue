<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import NavScrollButton from './NavScrollButton.vue'
import { allModules, extensionModules, home, moduleGroups, moduleHref, type ModuleItem } from './navigation'

const props = defineProps<{ compact?: boolean; activeModule: string; overlay?: boolean; mobile?: boolean; dark: boolean }>()
const emit = defineEmits<{ navigate: [id: string]; toggle: []; theme: [] }>()
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
  if (props.compact) modules.value?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
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
      <button v-if="compact" class="cms-rail-toggle cms-icon-button" type="button" aria-label="Mở menu chính" :aria-haspopup="activeModule === 'home' ? undefined : 'dialog'" :aria-expanded="false" data-tooltip="Mở menu chính" @click="emit('toggle')">
        <img class="cms-rail-wordmark" src="/navigation/73be9.svg" width="39.4561" height="15.8037" alt="" />
        <img class="cms-rail-menu-icon" src="/navigation/menu.svg" width="20" height="20" alt="" />
      </button>
      <a v-else :href="moduleHref(home.id)" class="cms-wordmark" aria-label="FABI CMS — Trang chủ" @click.prevent="emit('navigate', 'home')">
          <img src="/navigation/866d3.svg" width="93.8816" height="16.5677" alt="FABI CMS" />
          <span class="cms-powered"><img src="/navigation/4a253.svg" width="45.7232" height="8.76167" alt="Powered by" /><img src="/navigation/01feb.svg" width="36.855" height="7.5432" alt="iPOS.vn" /></span>
      </a>
      <button v-if="!compact" type="button" class="cms-icon-button" :aria-label="overlay ? 'Đóng menu chính' : 'Thu gọn menu chính'" @click="emit('toggle')">
        <img v-if="mobile" src="/navigation/close.svg" width="24" height="24" alt="" />
        <img v-else src="/navigation/menu.svg" width="20" height="20" alt="" />
      </button>
    </div>
    <div class="cms-brand-picker" :title="compact ? 'Thương hiệu: Chanh Dev' : undefined">
      <span class="cms-brand-avatar">CD</span>
      <span v-if="!compact" class="cms-brand-copy"><small>Thương hiệu</small><strong>Chanh Dev</strong></span>
    </div>

    <div ref="viewport" class="cms-modules-viewport" :class="{ 'is-scrollable-rail': compact && overflowing }">
    <div v-if="compact && overflowing" class="cms-rail-scroll-slot">
      <NavScrollButton v-if="!atTop" direction="up" :controls="scrollId" @scroll="stepScroll(-1)" />
    </div>
    <nav :id="scrollId" ref="modules" class="cms-modules" :aria-label="compact ? 'Chuyển module' : 'Menu chính'" @scroll.passive="measureScroll">
      <a :href="moduleHref(home.id)" class="cms-module-link cms-home-link" :class="{ 'is-active': activeModule === 'home' }" :aria-current="activeModule === 'home' ? 'page' : undefined" :aria-label="compact ? home.label : undefined" :data-tooltip="compact ? home.label : undefined" @click.prevent="emit('navigate', 'home')">
        <img :src="icon(home, activeModule === 'home')" width="18" height="18" alt="" /><span v-if="!compact">Trang chủ</span>
      </a>
      <section v-for="group in moduleGroups" :key="group.label" class="cms-module-group" :aria-label="group.label">
        <h2 v-if="!compact" class="cms-group-label">{{ group.label }}</h2>
        <div v-else class="cms-group-divider" />
        <a v-for="item in group.items" :key="item.id" :href="moduleHref(item.id)" class="cms-module-link" :class="{ 'is-active': activeModule === item.id }" :aria-label="compact ? item.label : undefined" :aria-current="activeModule === item.id ? 'page' : undefined" :data-tooltip="compact ? item.label : undefined" @click.prevent="emit('navigate', item.id)">
          <img :src="icon(item, activeModule === item.id)" width="18" height="18" alt="" />
          <span v-if="!compact">{{ item.label }}</span>
          <img v-if="!compact && !['orders', 'marketplace', 'accounting'].includes(item.id)" class="cms-module-tail" :src="'/navigation/' + ('external' in item ? 'ad697.svg' : '56280.svg')" width="16" height="16" alt="" />
        </a>
      </section>
      <section v-if="!compact" class="cms-module-group" aria-label="Mở rộng">
        <h2 class="cms-group-label">MỞ RỘNG</h2>
        <a v-for="item in extensionModules" :key="item.id" :href="moduleHref(item.id)" class="cms-module-link" :class="{ 'is-active': activeModule === item.id }" :aria-current="activeModule === item.id ? 'page' : undefined" @click.prevent="emit('navigate', item.id)">
          <img :src="icon(item, false)" width="18" height="18" alt="" /><span>{{ item.label }}</span>
        </a>
      </section>
      <div v-else class="cms-group-divider" />
      <button type="button" class="cms-module-link cms-apps-link" :aria-label="compact ? 'Tất cả ứng dụng — Mở menu chính' : undefined" :data-tooltip="compact ? 'Tất cả ứng dụng' : undefined" @click="compact ? emit('toggle') : emit('navigate', 'apps')">
        <img src="/navigation/1c7b2.svg" width="18" height="18" alt="" /><span v-if="!compact">Tất cả ứng dụng</span><span v-if="!compact" class="cms-count">{{ allModules.length - 2 }}</span>
      </button>
    </nav>
    <div v-if="compact && overflowing" class="cms-rail-scroll-slot">
      <NavScrollButton v-if="!atBottom" direction="down" :controls="scrollId" @scroll="stepScroll(1)" />
    </div>
    </div>

    <div class="cms-nav-footer">
      <a :href="moduleHref('support')" class="cms-module-link" :aria-label="compact ? 'Góp ý, hỗ trợ' : undefined" :data-tooltip="compact ? 'Góp ý, hỗ trợ' : undefined" @click.prevent="emit('navigate', 'support')">
        <img src="/navigation/ed25a.svg" width="18" height="18" alt="" /><span v-if="!compact">Góp ý, hỗ trợ</span>
      </a>
      <button class="cms-module-link" type="button" role="switch" :aria-checked="dark" aria-label="Chế độ tối" :data-tooltip="compact ? 'Chế độ tối' : undefined" @click="emit('theme')">
        <img src="/navigation/d631a.svg" width="18" height="18" alt="" /><span v-if="!compact">Chế độ tối</span><span v-if="!compact" class="cms-switch" :class="{ 'is-on': dark }"><i /></span>
      </button>
    </div>
  </div>
</template>
