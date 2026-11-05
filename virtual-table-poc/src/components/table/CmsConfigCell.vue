<script setup lang="ts">
import AppIcon from '@/components/icon/AppIcon.vue'

// Bảng/Ô cấu hình (Figma 477:1122): cả ô là vùng bấm (sự kiện `open`), chữ Regular 13;
// rê chuột: chữ gạch chân + hiện icon hành động (chỗ icon luôn giữ, mờ 0 khi không rê).
// tone: link = đã cấu hình (primary-text) · plain = tên đã gán (ink-2) · empty = chưa có (ink-muted, rê hiện `emptyHover`).
// Dùng trong cột có meta `interactive: true`.
withDefaults(defineProps<{
  text: string
  tone?: 'link' | 'plain' | 'empty'
  /** Chữ thay thế khi rê ô trống, vd "+ Gán customization" */
  emptyHover?: string
  /** Hành động phụ dạng icon (bút = đổi, ↗ = xem chi tiết) */
  actions?: { icon: string; label: string; onClick: () => void }[]
}>(), { tone: 'link', actions: () => [] })
const emit = defineEmits<{ open: [] }>()
</script>

<template>
  <div class="cms-config-cell" :class="`is-${tone}`">
    <button type="button" class="cms-config-cell__hit" @click="emit('open')">
      <span class="cms-config-cell__text">{{ text }}</span>
      <span v-if="tone === 'empty' && emptyHover" class="cms-config-cell__text cms-config-cell__text--hover">{{ emptyHover }}</span>
    </button>
    <span v-if="actions.length" class="cms-config-cell__actions">
      <button v-for="action in actions" :key="action.icon" type="button" :aria-label="action.label" :title="action.label" @click="action.onClick"><AppIcon :name="action.icon" size=".875rem" /></button>
    </span>
  </div>
</template>

<style scoped lang="scss">
.cms-config-cell {
  display: flex;
  gap: var(--space-6);
  align-items: center;
  height: 100%;
  min-height: 2.5rem;
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
}
.cms-config-cell__hit {
  flex: 1;
  min-width: 0;
  align-self: stretch;
  padding: 0;
  border: 0;
  color: var(--ink-2);
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: var(--radius-sm); }
}
.cms-config-cell__text {
  display: block;
  overflow: hidden;
  font-size: .8125rem;
  line-height: 1.125rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-underline-offset: 3px;
}
.is-link .cms-config-cell__hit { color: var(--primary-text); }
.is-empty .cms-config-cell__hit { color: var(--ink-muted); }
.cms-config-cell__text--hover { display: none; color: var(--primary-text); }
.cms-config-cell:hover, .cms-config-cell:focus-within {
  .cms-config-cell__text { text-decoration: underline; }
  .cms-config-cell__actions { opacity: 1; }
}
.is-empty:hover, .is-empty:focus-within {
  .cms-config-cell__text { display: none; }
  .cms-config-cell__text--hover { display: block; }
}
.cms-config-cell__actions {
  display: flex;
  flex: none;
  gap: 2px;
  opacity: 0;
  transition: opacity 120ms ease;
  button {
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: 0;
    border-radius: var(--radius-sm);
    color: var(--ink-muted);
    background: transparent;
    cursor: pointer;
    &:hover { color: var(--ink); background: var(--field); }
    &:focus-visible { outline: 2px solid var(--primary); outline-offset: 1px; }
  }
}
@media (hover: none) { .cms-config-cell__actions { opacity: 1; } }
</style>
