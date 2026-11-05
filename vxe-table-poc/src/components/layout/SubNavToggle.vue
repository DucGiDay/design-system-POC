<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useShellChrome } from './shell'

// Nút mở lại sidebar con, đặt trước tiêu đề của ListLayout / DetailLayout khi sidebar đang đóng.
const shell = useShellChrome()
const { t } = useI18n()
const visible = computed(() => !!shell && !shell.isMobile.value && shell.subNavCollapsed.value)
const label = computed(() => shell ? t('subnav.openMenu', { name: shell.moduleName.value }) : '')
</script>

<template>
  <button v-if="visible" type="button" class="cms-subnav-toggle" aria-controls="cms-subnav" aria-expanded="false" :aria-label="label" :title="label" @click="shell?.toggleSubNav()">
    <img :src="$pub('navigation/c9074.svg')" width="16" height="16" alt="" />
  </button>
</template>

<style scoped lang="scss">
.cms-subnav-toggle {
  display: grid;
  flex: none;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;

  &:hover { background: var(--field); }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
}
:global([data-theme='dark']) .cms-subnav-toggle img { filter: brightness(1.9); }
</style>
