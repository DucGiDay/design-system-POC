<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { leafCount, moduleHref, nodeName, type NavNode } from './navigation'
defineOptions({ name: 'NavTree' })
defineProps<{ module: string; nodes: NavNode[]; path: string[]; expanded: Set<string>; selected: string; searching: boolean; branchCount?: boolean; level?: number }>()
const emit = defineEmits<{ toggle: [id: string]; navigate: [path: string[]] }>()
const { t } = useI18n()
</script>

<template>
  <ul class="cms-subnav-tree" :class="{ 'is-nested': (level ?? 0) > 0 }">
    <li v-for="node in nodes" :key="node.id" :class="{ 'is-open': node.children && (searching || expanded.has(node.id)), 'has-children': node.children }">
      <div class="cms-subnav-row" :class="{ 'is-active': selected === node.id }">
        <a :href="moduleHref(module, [...path, node.id])" :aria-current="selected === node.id ? 'page' : undefined" class="cms-subnav-link" @click.prevent="emit('navigate', [...path, node.id])">
          <img v-if="node.icon" :src="'/navigation/' + node.icon" width="16" height="16" alt="" />
          <span v-if="node.code" class="cms-subnav-code">{{ node.code }}</span>
          <span class="cms-subnav-label">{{ node.label }}</span>
        </a>
        <template v-if="node.children">
          <span v-if="branchCount" class="cms-subnav-count">{{ leafCount(node.children) }}</span>
          <button type="button" class="cms-tree-toggle" :aria-label="t(searching || expanded.has(node.id) ? 'subnav.collapse' : 'subnav.expand', { name: nodeName(node) })" :aria-expanded="searching || expanded.has(node.id)" :aria-controls="'branch-' + node.id" :disabled="searching" @click="emit('toggle', node.id)">
            <img src="/navigation/05f6c.svg" width="14" height="14" alt="" />
          </button>
        </template>
      </div>
      <NavTree v-if="node.children" v-show="searching || expanded.has(node.id)" :id="'branch-' + node.id" :module="module" :nodes="node.children" :path="[...path, node.id]" :level="(level ?? 0) + 1" :expanded="expanded" :selected="selected" :searching="searching" :branch-count="branchCount" @toggle="emit('toggle', $event)" @navigate="emit('navigate', $event)" />
    </li>
  </ul>
</template>
