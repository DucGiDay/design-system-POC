<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/icon/AppIcon.vue'
import { availableLocales, currentLocale, setLocale } from '.'
import { LOCALE_NAMES } from './locales'

const { t } = useI18n()
// Host mới có 2 ngôn ngữ nên bấm là xoay vòng, giống nút ở menu chính
const nextLocale = computed(() => availableLocales[(availableLocales.indexOf(currentLocale.value) + 1) % availableLocales.length]!)
</script>

<template>
  <button v-if="availableLocales.length > 1" type="button" class="locale-switch" :aria-label="t('shell.languageSwitch', { current: LOCALE_NAMES[currentLocale], next: LOCALE_NAMES[nextLocale] })" @click="setLocale(nextLocale)">
    <AppIcon name="ngon-ngu" size="1.125rem" />
    <span>{{ LOCALE_NAMES[currentLocale] }}</span>
  </button>
</template>

<style scoped>
.locale-switch {
  display: inline-flex;
  gap: .375rem;
  align-items: center;
  min-height: 2.25rem;
  padding: .375rem .625rem;
  border: 0;
  border-radius: var(--radius-md);
  color: var(--ink-2);
  background: transparent;
  font: inherit;
  font-size: .8125rem;
  font-weight: 500;
  cursor: pointer;
}
.locale-switch:hover { background: var(--subtle); }
.locale-switch:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
</style>
