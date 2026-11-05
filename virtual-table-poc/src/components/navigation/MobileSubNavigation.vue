<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { filterNav, moduleHref, navNodes, navPath, nodeName, type NavNode, type NavSection, type SubNav } from './navigation'
const props = defineProps<{ module: string; name: string; nav: SubNav; selectedIds: string[] }>()
const { t } = useI18n()
const emit = defineEmits<{ navigate: [path: string[]]; main: []; close: [] }>()
const browseIds = ref(props.selectedIds.slice(0, -1))
const query = ref('')
const heading = ref<HTMLElement>()
const reverse = ref(false)
const rootNodes = computed(() => navNodes(props.nav))
const browsePath = computed(() => navPath(rootNodes.value, browseIds.value))
const parent = computed(() => browsePath.value.at(-1))
// Gốc giữ nguyên nhãn nhóm (DANH MỤC, VẬN HÀNH…); cấp con là một danh sách không nhãn.
const sections = computed<NavSection[]>(() => parent.value ? [{ nodes: parent.value.children ?? [] }] : props.nav.sections)
const title = computed(() => parent.value ? `${parent.value.code ? parent.value.code + ' · ' : ''}${parent.value.label}` : props.name)
function flatten(nodes: NavNode[], path: NavNode[] = []): { node: NavNode; path: NavNode[] }[] {
  return nodes.flatMap(node => [{ node, path }, ...flatten(node.children ?? [], [...path, node])])
}
const matches = computed(() => flatten(rootNodes.value).filter(item => filterNav([{ ...item.node, children: undefined }], query.value).length > 0))
function back() {
  if (!browseIds.value.length) { emit('main'); return }
  reverse.value = true
  browseIds.value = browseIds.value.slice(0, -1)
  query.value = ''
  void nextTick(() => heading.value?.focus())
}
function drill(node: NavNode) {
  reverse.value = false
  browseIds.value = [...browseIds.value, node.id]
  void nextTick(() => heading.value?.focus())
}
</script>

<template>
  <section class="cms-mobile-subnav" :aria-label="t('subnav.menuMobile', { name })">
    <header class="cms-mobile-subnav-header">
      <button class="cms-icon-button cms-back-button" type="button" :aria-label="browseIds.length ? t('subnav.back') : t('subnav.toMainMenu')" @click="back"><img src="/navigation/05f6c.svg" width="14" height="14" alt="" /></button>
      <h2 ref="heading" tabindex="-1">{{ title }}</h2>
      <button class="cms-icon-button" type="button" :aria-label="t('subnav.closeMenu', { name })" @click="emit('close')"><img src="/navigation/close.svg" width="24" height="24" alt="" /></button>
    </header>
    <button class="cms-switch-to-main" type="button" @click="emit('main')"><img src="/navigation/1c7b2.svg" width="18" height="18" alt="" />{{ t('shell.mainMenu') }}</button>
    <div v-if="nav.search" class="cms-search"><img src="/navigation/a2c6c.svg" width="16" height="16" alt="" /><input v-model="query" type="search" :aria-label="t(nav.search.label)" :placeholder="t(nav.search.placeholderMobile)" /></div>
    <div class="cms-mobile-subnav-scroll">
      <template v-if="nav.search && query.trim()">
        <p class="cms-mobile-search-count" role="status">{{ matches.length ? t('subnav.resultCount', { n: matches.length }, matches.length) : t(nav.search.notFound) }}</p>
        <ul class="cms-mobile-results">
          <li v-for="item in matches" :key="item.node.id"><a :href="moduleHref(module, [...item.path.map(node => node.id), item.node.id])" @click.prevent="emit('navigate', [...item.path.map(node => node.id), item.node.id])"><span class="cms-mobile-result-title"><span v-if="item.node.code" class="cms-subnav-code">{{ item.node.code }}</span>{{ item.node.label }}</span><small>{{ [name, ...item.path.map(nodeName)].join(' / ') }}</small></a></li>
        </ul>
        <button v-if="!matches.length" class="cms-clear-search" type="button" @click="query = ''">{{ t('subnav.clearSearch') }}</button>
      </template>
      <Transition v-else :name="reverse ? 'cms-drill-back' : 'cms-drill'" mode="out-in">
        <nav :key="browseIds.join('/')" :aria-label="t('subnav.listMobile', { name })">
          <template v-for="(section, index) in sections" :key="section.label ?? index">
            <p v-if="section.label" class="cms-context-section">{{ section.label }}</p>
            <ul class="cms-mobile-subnav-list">
              <li v-for="node in section.nodes" :key="node.id" :class="{ 'is-active': selectedIds.at(-1) === node.id }">
                <a :href="moduleHref(module, [...browseIds, node.id])" :aria-current="selectedIds.at(-1) === node.id ? 'page' : undefined" @click.prevent="emit('navigate', [...browseIds, node.id])"><img v-if="node.icon" :src="'/navigation/' + node.icon" width="16" height="16" alt="" /><span v-if="node.code" class="cms-subnav-code">{{ node.code }}</span><span>{{ node.label }}</span></a>
                <button v-if="node.children" type="button" class="cms-mobile-drill-button" :aria-label="t('subnav.viewChildren', { name: nodeName(node) })" @click="drill(node)"><img src="/navigation/05f6c.svg" width="14" height="14" alt="" /></button>
              </li>
            </ul>
          </template>
        </nav>
      </Transition>
    </div>
  </section>
</template>
