<script setup lang="ts">
import { computed } from 'vue'

// Icon Lucide của design system (assets/icons ở thư mục gốc), chép vào src/assets/icons khi cần.
// File SVG gốc tô cứng màu #334155 nên vẽ bằng mask: icon ăn theo `color` của chỗ đặt nó.
const urls = import.meta.glob<string>('@/assets/icons/*.svg', { query: '?url', import: 'default', eager: true })

const props = defineProps<{ name: string; size?: string }>()
const url = computed(() => urls[`/src/assets/icons/${props.name}.svg`])
// SVG nhỏ bị Vite inline thành data URI có dấu nháy đơn và ngoặc, nên phải bọc trong nháy kép
const maskUrl = computed(() => url.value ? `url("${url.value}")` : 'none')
</script>

<template>
  <span class="app-icon" :style="{ '--app-icon-url': maskUrl, '--app-icon-size': size ?? '1.25rem' }" aria-hidden="true" />
</template>

<style scoped>
.app-icon {
  display: inline-block;
  flex: none;
  width: var(--app-icon-size);
  height: var(--app-icon-size);
  background: currentColor;
  mask: var(--app-icon-url) center / contain no-repeat;
}
</style>
