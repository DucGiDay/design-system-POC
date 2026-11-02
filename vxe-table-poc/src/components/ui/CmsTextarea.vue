<script setup lang="ts">
import CmsField from './CmsField.vue'
import { useFieldAttrs, type FieldProps } from './field'

// Ô nhập nhiều dòng (cms-field__box--multiline), cao cố định theo Figma.
defineOptions({ inheritAttrs: false })
defineProps<FieldProps & { placeholder?: string }>()
const model = defineModel<string>({ default: '' })
const { rootAttrs, controlAttrs } = useFieldAttrs()
</script>

<template>
  <CmsField v-slot="{ id, describedBy, invalid }" v-bind="rootAttrs" multiline :label :required :hint :error :readonly :disabled>
    <textarea
      :id
      v-model="model"
      v-bind="controlAttrs"
      :placeholder
      :required
      :readonly
      :disabled
      :aria-invalid="invalid || undefined"
      :aria-describedby="describedBy"
    />
  </CmsField>
</template>
