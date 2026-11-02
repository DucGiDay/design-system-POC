<script setup lang="ts">
import { computed, useId } from 'vue'
import AppIcon from '@/components/icon/AppIcon.vue'
import type { FieldProps } from './field'

// Khung trường nhập theo components.css (cms-field): nhãn, ô, dòng gợi ý / lỗi.
// Thường không dùng trực tiếp: dùng CmsInput, CmsTextarea, CmsSelect. Slot nhận id để gắn vào phần tử nhập.
const props = defineProps<FieldProps & { multiline?: boolean; select?: boolean }>()

const id = useId()
const describedBy = computed(() => {
  if (props.error) return `${id}-error`
  return props.hint ? `${id}-hint` : undefined
})
</script>

<template>
  <div class="cms-field" :class="{ 'cms-field--disabled': disabled }">
    <label v-if="label" class="cms-field__label" :for="id">
      {{ label }}<span v-if="required" class="cms-field__required" aria-hidden="true">*</span>
    </label>
    <div
      class="cms-field__box"
      :class="{
        'cms-field__box--readonly': readonly,
        'cms-field__box--multiline': multiline,
        'cms-field__box--select': select && !readonly,
        'cms-field__box--error': error,
      }"
    >
      <slot :id="id" :described-by="describedBy" :invalid="Boolean(error)" />
      <AppIcon v-if="readonly" class="cms-field__lock" name="khoa" size="1rem" />
    </div>
    <p v-if="error" :id="`${id}-error`" class="cms-field__error">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="cms-field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
.cms-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  min-width: 0;
}

.cms-field__label {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  color: var(--ink-2);
  font-size: var(--type-cell-font-size);
  font-weight: 500;
  line-height: var(--type-cell-line-height);
}
.cms-field__required { color: var(--danger); }

.cms-field__box {
  position: relative;
  display: flex;
  gap: var(--space-8);
  align-items: center;
  height: 2.5rem;
  padding: 0 var(--space-12);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  transition: border-color 120ms ease, box-shadow 120ms ease;

  &:hover { border-color: var(--line-strong); }
  &:focus-within { border-color: var(--primary); box-shadow: var(--focus-ring); }
}

// Phần tử nhập do CmsInput / CmsTextarea / CmsSelect đưa vào slot
.cms-field__box :slotted(input),
.cms-field__box :slotted(textarea),
.cms-field__box :slotted(select),
.cms-field__box :slotted(.cms-field__value) {
  flex: 1 0 0;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: 0;
  color: var(--ink);
  background: transparent;
  font-family: inherit;
  font-size: var(--type-body-font-size);
  line-height: var(--type-body-line-height);
  text-overflow: ellipsis;
}
.cms-field__box :slotted(input::placeholder),
.cms-field__box :slotted(textarea::placeholder) { color: var(--ink-faint); }
.cms-field__box :slotted(.cms-field__value) {
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
}

.cms-field__box--select {
  cursor: pointer;
  :slotted(select) { appearance: none; padding-right: var(--space-24); cursor: pointer; }
}

.cms-field__box--multiline {
  align-items: flex-start;
  height: 6rem;
  padding: var(--space-10) var(--space-12);
  :slotted(textarea) { resize: none; }
}

// Chỉ xem: nền xám, không viền, kèm icon khoá; không phản hồi rê chuột.
// Ô vẫn nhận focus (để chọn, sao chép) nên hiện viền đậm, không dùng viền primary của ô sửa được.
.cms-field__box--readonly {
  border-color: transparent;
  background: var(--ground);

  &:hover { border-color: transparent; }
  &:focus-within { border-color: var(--line-strong); box-shadow: none; }
  :slotted(input), :slotted(textarea), :slotted(.cms-field__value) { color: var(--ink-2); }
}
.cms-field__lock { color: var(--ink-faint); }

// TODO(design): chờ Figma — lỗi validate theo quy ước tạm: viền danger, quầng 3px.
// danger-soft quá nhạt trên nền trắng nên quầng pha 20% danger; thay bằng token khi có.
.cms-field__box--error {
  border-color: var(--danger);
  &:hover { border-color: var(--danger); }
  &:focus-within { border-color: var(--danger); box-shadow: var(--focus-ring-danger); }
}
.cms-field__error,
.cms-field__hint {
  font-size: var(--type-caption-font-size);
  line-height: var(--type-caption-line-height);
}
.cms-field__error { color: var(--danger); }
.cms-field__hint { color: var(--ink-muted); }

// TODO(design): chờ Figma — disabled theo quy ước tạm
.cms-field--disabled {
  opacity: .5;
  .cms-field__box { cursor: not-allowed; }
  .cms-field__box:hover { border-color: var(--line); }
  :slotted(*) { cursor: not-allowed; }
}
</style>
