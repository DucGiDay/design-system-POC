<script setup lang="ts">
import AppIcon from '../icon/AppIcon.vue'

// Banner cấp ứng dụng: một dải trên cùng, trên cả sidebar và topbar, không cuộn theo nội dung.
// Dùng cho tin ảnh hưởng toàn bộ phiên làm việc (gói sắp hết hạn, bảo trì, sự cố); tin của một màn hình không dùng banner.
// TODO(design): chờ Figma — chưa có thiết kế banner; làm theo Soft-Pair: nền -soft, chữ -text cùng họ màu.
withDefaults(defineProps<{
  tone?: 'warning' | 'info' | 'danger'
  icon?: string
  /** Có nội dung thì hiện nút đóng; sự cố đang diễn ra thì để trống để không ẩn được */
  dismissLabel?: string
}>(), { tone: 'info' })
const emit = defineEmits<{ dismiss: [] }>()
</script>

<template>
  <div class="cms-banner" :class="`cms-banner--${tone}`" :role="tone === 'danger' ? 'alert' : 'status'">
    <AppIcon v-if="icon" class="cms-banner__icon" :name="icon" size="1rem" />
    <p class="cms-banner__text"><slot /></p>
    <div v-if="$slots.action" class="cms-banner__action"><slot name="action" /></div>
    <button v-if="dismissLabel" type="button" class="cms-banner__close" :aria-label="dismissLabel" :title="dismissLabel" @click="emit('dismiss')">
      <AppIcon name="dong" size="1rem" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.cms-banner {
  display: flex;
  flex: none;
  gap: var(--space-12);
  align-items: center;
  min-height: 2.5rem;
  padding: var(--space-4) var(--space-12) var(--space-4) var(--space-16);
  // Vạch 1px cùng họ màu tách banner khỏi topbar và sidebar bên dưới
  box-shadow: inset 0 -1px 0 color-mix(in srgb, currentColor 16%, transparent);
  font-size: var(--type-cell-font-size);
  line-height: var(--type-cell-line-height);
}
.cms-banner--warning { color: var(--warning-text); background: var(--warning-soft); }
.cms-banner--info { color: var(--info-text); background: var(--info-soft); }
.cms-banner--danger { color: var(--danger-text); background: var(--danger-soft); }

.cms-banner__icon { flex: none; }
.cms-banner__text {
  flex: 1;
  min-width: 0;
  margin: 0;
  :slotted(strong) { font-weight: 600; }
}
.cms-banner__action { flex: none; }

.cms-banner__close {
  display: grid;
  flex: none;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  color: inherit;
  background: transparent;
  cursor: pointer;

  &:hover { background: color-mix(in srgb, currentColor 10%, transparent); }
  &:focus-visible { outline: 2px solid currentColor; outline-offset: 1px; }
}
</style>
