<script setup lang="ts">
defineProps<{ direction: 'up' | 'down'; controls: string }>()
const emit = defineEmits<{ scroll: [] }>()
</script>

<template>
  <button class="cms-rail-scroll" :class="'cms-scroll-' + direction" type="button" :aria-label="direction === 'up' ? 'Cuộn menu lên' : 'Cuộn menu xuống'" :aria-controls="controls" @click="emit('scroll')">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path :d="direction === 'up' ? 'M6 15L12 9L18 15' : 'M6 9L12 15L18 9'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
  </button>
</template>

<style scoped lang="scss">
.cms-rail-scroll {
  display: grid;
  place-items: center;
  align-self: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 1.375rem;
  padding: 0;
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--ink-muted);
  background: transparent;
  transition: background-color 120ms ease, color 120ms ease;

  svg { width: .75rem; height: .75rem; }
  &:is(:hover, :focus-visible) { background: var(--primary-soft); }
}
@media (prefers-reduced-motion: reduce) {
  .cms-rail-scroll { transition: none; }
}
</style>
