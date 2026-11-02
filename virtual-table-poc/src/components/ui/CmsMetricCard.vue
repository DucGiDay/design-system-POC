<script setup lang="ts">
import AppIcon from '../icon/AppIcon.vue'
// Một ô chỉ số: nhãn và biến động ở trên, con số và đơn vị, dòng giải thích.
// `icon` không bắt buộc: dashboard theo taste skill không đặt icon trong ô màu trước nhãn.
// `negative`: biến động theo chiều xấu (chi phí tăng, khách giảm), tô đỏ; chiều tốt tô xanh. Màu nói tốt/xấu, không nói tăng/giảm.
defineProps<{ label: string; value: string; unit: string; hint: string; icon?: string; tone?: 'orange' | 'blue' | 'green' | 'sky'; delta?: string; deltaLabel?: string; negative?: boolean }>()
</script>

<template>
  <article class="cms-card-metric">
    <div class="cms-card-metric__row">
      <span v-if="icon" class="cms-card-metric__icon" :class="`cms-card-metric__icon--${tone ?? 'blue'}`"><AppIcon :name="icon" size="1.125rem" /></span>
      <h2 class="cms-card-metric__name">{{ label }}</h2>
      <span v-if="delta" class="cms-card-metric__delta" :class="{ 'cms-card-metric__delta--negative': negative }" :title="deltaLabel">{{ delta }}<span v-if="deltaLabel" class="cms-card-metric__sr">{{ deltaLabel }}</span></span>
    </div>
    <div class="cms-card-metric__value-row"><strong class="cms-card-metric__value">{{ value }}</strong><span class="cms-card-metric__unit">{{ unit }}</span></div>
    <p class="cms-card-metric__sub">{{ hint }}</p>
  </article>
</template>

<style scoped lang="scss">
.cms-card-metric { min-width: 0; padding: var(--space-16); border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--surface); display: flex; flex-direction: column; gap: var(--space-10); }
.cms-card-metric__row { display: flex; align-items: center; gap: var(--space-10); }
.cms-card-metric__icon { display: grid; place-items: center; flex: none; width: 2rem; height: 2rem; border-radius: var(--radius-md); }
.cms-card-metric__icon--orange { background: var(--accent-soft); color: var(--accent-text); }
.cms-card-metric__icon--blue { background: var(--primary-soft); color: var(--primary-text); }
.cms-card-metric__icon--green { background: var(--success-soft); color: var(--success-text); }
.cms-card-metric__icon--sky { background: var(--info-soft); color: var(--info-text); }
.cms-card-metric__name { flex: 1; font-size: var(--type-cell-font-size); line-height: var(--type-cell-line-height); font-weight: 500; color: var(--ink-2); }
// Biến động theo Soft-Pair: nền -soft, chữ -text cùng họ màu; không lớn hơn nhãn
.cms-card-metric__delta { flex: none; padding: 0 var(--space-6); border-radius: var(--radius-sm); color: var(--success-text); background: var(--success-soft); font-size: var(--type-caption-font-size); line-height: var(--type-caption-line-height); font-weight: 600; font-variant-numeric: tabular-nums; }
.cms-card-metric__delta--negative { color: var(--danger-text); background: var(--danger-soft); }
.cms-card-metric__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.cms-card-metric__value-row { display: flex; align-items: baseline; gap: var(--space-6); }
.cms-card-metric__value { color: var(--ink); font-size: var(--type-metric-font-size); line-height: var(--type-metric-line-height); font-weight: 600; font-variant-numeric: tabular-nums; }
.cms-card-metric__unit { color: var(--ink-muted); font-size: var(--type-cell-font-size); }
.cms-card-metric__sub { color: var(--ink-muted); font-size: var(--type-caption-font-size); line-height: var(--type-caption-line-height); }
</style>
