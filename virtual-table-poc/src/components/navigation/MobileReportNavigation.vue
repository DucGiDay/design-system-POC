<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { filterReports, reportHref, reportPath, reports, type ReportNode } from './navigation'
const props = defineProps<{ selectedIds: string[] }>()
const emit = defineEmits<{ navigate: [path: string[]]; main: []; close: [] }>()
const browseIds = ref(props.selectedIds.slice(0, -1))
const query = ref('')
const heading = ref<HTMLElement>()
const reverse = ref(false)
const browsePath = computed(() => reportPath(browseIds.value))
const parent = computed(() => browsePath.value.at(-1))
const nodes = computed(() => parent.value?.children ?? reports)
const title = computed(() => parent.value ? `${parent.value.code ? parent.value.code + ' · ' : ''}${parent.value.label}` : 'Báo cáo')
function flatten(nodes: ReportNode[], path: ReportNode[] = []): { node: ReportNode; path: ReportNode[] }[] {
  return nodes.flatMap(node => [{ node, path }, ...flatten(node.children ?? [], [...path, node])])
}
const matches = computed(() => {
  return flatten(reports).filter(item => filterReports([{ ...item.node, children: undefined }], query.value).length > 0)
})
function back() {
  if (!browseIds.value.length) { emit('main'); return }
  reverse.value = true
  browseIds.value = browseIds.value.slice(0, -1)
  query.value = ''
  void nextTick(() => heading.value?.focus())
}
function drill(node: ReportNode) {
  reverse.value = false
  browseIds.value = [...browseIds.value, node.id]
  void nextTick(() => heading.value?.focus())
}
</script>

<template>
  <section class="cms-mobile-reports" aria-label="Menu Báo cáo mobile">
    <header class="cms-mobile-report-header">
      <button class="cms-icon-button cms-back-button" type="button" :aria-label="browseIds.length ? 'Quay lại cấp trước' : 'Về menu chính'" @click="back"><img src="/navigation/05f6c.svg" width="14" height="14" alt="" /></button>
      <h2 ref="heading" tabindex="-1">{{ title }}</h2>
      <button class="cms-icon-button" type="button" aria-label="Đóng menu Báo cáo" @click="emit('close')"><img src="/navigation/close.svg" width="24" height="24" alt="" /></button>
    </header>
    <button class="cms-switch-to-main" type="button" @click="emit('main')"><img src="/navigation/1c7b2.svg" width="18" height="18" alt="" />Menu chính</button>
    <div class="cms-search"><img src="/navigation/a2c6c.svg" width="16" height="16" alt="" /><input v-model="query" type="search" aria-label="Tìm báo cáo" placeholder="Tìm tên hoặc mã báo cáo" /></div>
    <div class="cms-mobile-report-scroll">
      <template v-if="query.trim()">
        <p class="cms-mobile-search-count" role="status">{{ matches.length ? matches.length + ' kết quả' : 'Không tìm thấy báo cáo' }}</p>
        <ul class="cms-mobile-results">
          <li v-for="item in matches" :key="item.node.id"><a :href="reportHref([...item.path.map(node => node.id), item.node.id])" @click.prevent="emit('navigate', [...item.path.map(node => node.id), item.node.id])"><span class="cms-mobile-result-title"><span class="cms-report-code">{{ item.node.code }}</span>{{ item.node.label }}</span><small>{{ ['Báo cáo', ...item.path.map(node => node.code ?? node.label)].join(' / ') }}</small></a></li>
        </ul>
        <button v-if="!matches.length" class="cms-clear-search" type="button" @click="query = ''">Xoá tìm kiếm</button>
      </template>
      <Transition v-else :name="reverse ? 'cms-drill-back' : 'cms-drill'" mode="out-in">
        <nav :key="browseIds.join('/')" aria-label="Danh sách báo cáo mobile">
          <ul class="cms-mobile-report-list">
            <li v-for="node in nodes" :key="node.id" :class="{ 'is-active': selectedIds.at(-1) === node.id }">
              <a :href="reportHref([...browseIds, node.id])" :aria-current="selectedIds.at(-1) === node.id ? 'page' : undefined" @click.prevent="emit('navigate', [...browseIds, node.id])"><img v-if="node.icon" :src="'/navigation/' + node.icon" width="16" height="16" alt="" /><span v-if="node.code" class="cms-report-code">{{ node.code }}</span><span>{{ node.label }}</span></a>
              <button v-if="node.children" type="button" class="cms-mobile-drill-button" :aria-label="'Xem mục con của ' + (node.code ?? node.label)" @click="drill(node)"><img src="/navigation/05f6c.svg" width="14" height="14" alt="" /></button>
            </li>
          </ul>
        </nav>
      </Transition>
    </div>
  </section>
</template>
