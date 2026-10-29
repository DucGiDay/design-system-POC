<script setup lang="ts">
import { reportCount, reportHref, type ReportNode } from './navigation'
defineOptions({ name: 'ReportTree' })
defineProps<{ nodes: ReportNode[]; path: string[]; expanded: Set<string>; selected: string; searching: boolean; level?: number }>()
const emit = defineEmits<{ toggle: [id: string]; navigate: [path: string[]] }>()
</script>

<template>
  <ul class="cms-report-tree" :class="{ 'is-nested': (level ?? 0) > 0 }">
    <li v-for="node in nodes" :key="node.id" :class="{ 'is-open': node.children && (searching || expanded.has(node.id)), 'has-children': node.children }">
      <div class="cms-report-row" :class="{ 'is-active': selected === node.id, 'is-ancestor': selected !== node.id && path.length === 0 && expanded.has(node.id) }">
        <a :href="reportHref([...path, node.id])" :aria-current="selected === node.id ? 'page' : undefined" class="cms-report-link" @click.prevent="emit('navigate', [...path, node.id])">
          <img v-if="node.icon" :src="'/navigation/' + node.icon" width="16" height="16" alt="" />
          <span v-if="node.code" class="cms-report-code">{{ node.code }}</span>
          <span class="cms-report-label">{{ node.label }}</span>
        </a>
        <template v-if="node.children">
          <span class="cms-report-count">{{ reportCount(node.children) }}</span>
          <button type="button" class="cms-tree-toggle" :aria-label="(searching || expanded.has(node.id) ? 'Thu gọn ' : 'Mở rộng ') + (node.code ?? node.label)" :aria-expanded="searching || expanded.has(node.id)" :aria-controls="'branch-' + node.id" :disabled="searching" @click="emit('toggle', node.id)">
            <img src="/navigation/05f6c.svg" width="14" height="14" alt="" />
          </button>
        </template>
      </div>
      <ReportTree v-if="node.children" v-show="searching || expanded.has(node.id)" :id="'branch-' + node.id" :nodes="node.children" :path="[...path, node.id]" :level="(level ?? 0) + 1" :expanded="expanded" :selected="selected" :searching="searching" @toggle="emit('toggle', $event)" @navigate="emit('navigate', $event)" />
    </li>
  </ul>
</template>
