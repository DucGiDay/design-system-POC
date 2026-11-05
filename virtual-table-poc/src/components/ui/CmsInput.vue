<script setup lang="ts">
import { ref } from 'vue'
import CmsField from './CmsField.vue'
import { useFieldAttrs, type FieldProps } from './field'

// Ô nhập một dòng. Attr khác (name, autocomplete, maxlength…) được chuyển vào <input>.
defineOptions({ inheritAttrs: false })
withDefaults(defineProps<FieldProps & {
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number' | 'date'
  placeholder?: string
}>(), { type: 'text' })
const input = ref<HTMLInputElement>()
defineExpose({ focus: () => input.value?.focus() })
const model = defineModel<string>({ default: '' })
const { rootAttrs, controlAttrs } = useFieldAttrs()
</script>

<template>
  <CmsField v-slot="{ id, describedBy, invalid }" v-bind="rootAttrs" class="cms-ui-field" :label :required :tip :hint :error :readonly :disabled>
    <input
      :id
      ref="input"
      v-model="model"
      v-bind="controlAttrs"
      :type
      :placeholder
      :required
      :readonly
      :disabled
      :aria-invalid="invalid || undefined"
      :aria-describedby="describedBy"
    >
    <slot name="suffix" :id="id" />
  </CmsField>
</template>

<style scoped>
/* Figma không có mũi tên tăng/giảm của ô số: ẩn nút mặc định của trình duyệt */
input[type='number'] { appearance: textfield; }
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button { margin: 0; appearance: none; }
</style>
