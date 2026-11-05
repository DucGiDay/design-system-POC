<script setup lang="ts">
// Trang bài thử: GIỐNG HỆT ở 2 POC, chỉ SpikeGrid.vue khác thư viện.
import { useI18n } from 'vue-i18n'
import SpikeGrid from './SpikeGrid.vue'

const { t } = useI18n()
</script>

<template>
  <main class="spike">
    <header>
      <h1 class="spike__title">{{ t('spike.title') }}</h1>
      <p class="spike__desc">{{ t('spike.description') }}</p>
    </header>
    <SpikeGrid class="spike__grid" />
  </main>
</template>

<style scoped lang="scss">
.spike {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  box-sizing: border-box;
  height: 100vh;
  padding: var(--space-16);
  background: var(--subtle);
}
.spike__title { margin: 0; color: var(--ink); font-size: 1.25rem; font-weight: 600; }
.spike__desc { margin: var(--space-4) 0 0; color: var(--ink-muted); font-size: .8125rem; }
.spike__grid { flex: 1; min-height: 0; }
</style>
