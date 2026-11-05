<script setup lang="ts">
import { onBeforeUnmount, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/icon/AppIcon.vue'

// Form/Tải ảnh (Figma 225:324): vùng nét đứt nền ground cao 132. Bấm hoặc kéo thả ảnh vào.
// v-model là URL xem trước (blob: hoặc URL ảnh đã có); file gốc phát qua sự kiện `file`.
const props = withDefaults(defineProps<{ label: string; hint?: string; accept?: string; maxBytes?: number }>(), { accept: 'image/png,image/jpeg', maxBytes: 2 * 1024 * 1024 })
const emit = defineEmits<{ file: [file: File] }>()
const preview = defineModel<string | undefined>()
const { t } = useI18n()
const id = useId()
const dragging = ref(false)
const error = ref('')
let objectUrl: string | undefined

function take(file?: File) {
  if (!file) return
  if (!props.accept.split(',').includes(file.type)) { error.value = t('form.upload.wrongType'); return }
  if (file.size > props.maxBytes) { error.value = t('form.upload.tooLarge'); return }
  error.value = ''
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = URL.createObjectURL(file)
  preview.value = objectUrl
  emit('file', file)
}
function drop(event: DragEvent) {
  dragging.value = false
  take(event.dataTransfer?.files[0])
}
function clear() {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = undefined
  preview.value = undefined
}
onBeforeUnmount(() => { if (objectUrl) URL.revokeObjectURL(objectUrl) })
</script>

<template>
  <div class="cms-upload">
    <label class="cms-upload__label" :for="id">{{ label }}</label>
    <div class="cms-upload__zone" :class="{ 'is-dragging': dragging, 'has-error': error }" @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="drop">
      <template v-if="preview">
        <img class="cms-upload__preview" :src="preview" alt="" />
        <button type="button" class="cms-upload__remove" @click="clear"><AppIcon name="xoa" size=".875rem" />{{ t('form.upload.remove') }}</button>
      </template>
      <template v-else>
        <span class="cms-upload__chip"><AppIcon name="cong" size="1rem" /></span>
        <span class="cms-upload__cta">{{ t('form.upload.cta') }}</span>
        <span v-if="hint" class="cms-upload__hint">{{ hint }}</span>
      </template>
      <input :id class="cms-upload__input" type="file" :accept :aria-describedby="error ? `${id}-error` : undefined" @change="take(($event.target as HTMLInputElement).files?.[0])" />
    </div>
    <p v-if="error" :id="`${id}-error`" class="cms-upload__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped lang="scss">
.cms-upload { display: flex; flex-direction: column; gap: var(--space-6); }
.cms-upload__label { color: var(--ink-2); font-size: .8125rem; font-weight: 500; line-height: 1.125rem; }
.cms-upload__zone {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  align-items: center;
  justify-content: center;
  height: 8.25rem;
  padding: var(--space-12);
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-md);
  background: var(--ground);
  text-align: center;
  transition: border-color 120ms ease, background-color 120ms ease;
  &:hover, &.is-dragging { border-color: var(--primary); background: var(--primary-tint); }
  &:focus-within { border-color: var(--primary); box-shadow: var(--focus-ring); }
  &.has-error { border-color: var(--danger); }
}
.cms-upload__input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.cms-upload__chip { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: var(--radius-md); color: var(--ink-2); background: var(--surface); }
.cms-upload__cta { color: var(--primary); font-size: .8125rem; font-weight: 500; line-height: 1.125rem; }
.cms-upload__hint { max-width: 12.25rem; color: var(--ink-muted); font-size: .75rem; line-height: 1rem; }
.cms-upload__preview { height: 100%; max-width: 100%; border-radius: var(--radius-sm); object-fit: contain; }
.cms-upload__remove {
  position: absolute;
  top: var(--space-8);
  right: var(--space-8);
  z-index: 1;
  display: inline-flex;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-4) var(--space-8);
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--danger-text);
  background: var(--surface);
  box-shadow: var(--shadow-inside-stroke);
  font: inherit;
  font-size: .75rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: var(--danger-soft); }
}
.cms-upload__error { color: var(--danger-text); font-size: .75rem; line-height: 1rem; }
</style>
