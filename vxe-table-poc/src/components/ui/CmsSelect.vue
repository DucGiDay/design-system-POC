<script setup lang="ts" generic="T extends string | number">
import { computed } from 'vue'
import AppIcon from '../icon/AppIcon.vue'
import CmsField from './CmsField.vue'
import { useFieldAttrs, type FieldProps } from './field'

// Ô chọn (cms-field__box--select) dùng <select> gốc để giữ bàn phím và trình đọc màn hình.
// Danh sách dài, có tìm kiếm hoặc chọn nhiều thì dùng Dropdown (đợt 2), không dùng component này.
defineOptions({ inheritAttrs: false })
const props = defineProps<FieldProps & {
  options: { value: T; label: string; disabled?: boolean }[]
  placeholder?: string
}>()
const model = defineModel<T | undefined>()
const { rootAttrs, controlAttrs } = useFieldAttrs()

// <select> không có trạng thái chỉ xem nên khi readonly hiện giá trị dạng chữ
const selectedLabel = computed(() => props.options.find(option => option.value === model.value)?.label ?? '')
</script>

<template>
  <CmsField v-slot="{ id, describedBy, invalid }" v-bind="rootAttrs" select :label :required :hint :error :readonly :disabled>
    <span v-if="readonly" :id class="cms-field__value" :aria-describedby="describedBy">{{ selectedLabel }}</span>
    <template v-else>
      <select
        :id
        v-model="model"
        v-bind="controlAttrs"
        :class="{ 'cms-select__control--placeholder': model === undefined }"
        :required
        :disabled
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedBy"
      >
        <option v-if="placeholder" :value="undefined" disabled hidden>{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">
          {{ option.label }}
        </option>
      </select>
      <AppIcon class="cms-select__chevron" name="mui-ten-xuong" size="1rem" />
    </template>
  </CmsField>
</template>

<style scoped lang="scss">
// Thêm .cms-field__box để thắng màu chữ mặc định CmsField đặt qua :slotted
.cms-field__box .cms-select__control--placeholder { color: var(--ink-faint); }
.cms-select__control--placeholder option { color: var(--ink); }
.cms-select__chevron {
  position: absolute;
  right: var(--space-12);
  color: var(--ink-muted);
  pointer-events: none;
}
</style>
