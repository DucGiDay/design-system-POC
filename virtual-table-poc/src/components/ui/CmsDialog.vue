<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/icon/AppIcon.vue'
import { lockPageScroll, unlockPageScroll } from './scroll-lock'

// Hộp thoại theo components.css (cms-dialog), dựng trên <dialog> gốc: khoá focus, Esc để đóng, nền mờ.
// Nút trong slot #footer: tối đa một nút primary, nút huỷ dùng secondary.
const props = withDefaults(defineProps<{
  title: string
  description?: string
  /** Rộng tối đa, mặc định 440px như Figma */
  width?: string
  /** false: không cho đóng bằng Esc, nút X hay bấm ra ngoài (ví dụ khi đang lưu) */
  closable?: boolean
}>(), { width: '27.5rem', closable: true })
const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const dialog = ref<HTMLDialogElement>()
const titleId = useId()
const descriptionId = useId()

function sync(value: boolean) {
  const element = dialog.value
  if (!element) return
  if (value && !element.open) element.showModal()
  else if (!value && element.open) element.close()
  setScrollLocked(value)
}
// Khoá cuộn theo cờ của từng hộp thoại để gọi lặp không khoá / mở khoá hai lần.
// Không chỉ dựa vào sự kiện close: có trình duyệt nhúng không phát sự kiện này.
let scrollLocked = false
function setScrollLocked(value: boolean) {
  if (value === scrollLocked) return
  scrollLocked = value
  if (value) lockPageScroll()
  else unlockPageScroll()
}
// Đóng theo cách khác v-model (form method="dialog"…) thì đồng bộ ngược lại
function onClose() {
  setScrollLocked(false)
  open.value = false
}
watch(open, sync, { flush: 'post' })
onMounted(() => sync(open.value))
// Rời trang khi hộp thoại còn mở thì vẫn phải trả lại cuộn trang
onBeforeUnmount(() => setScrollLocked(false))

function close() {
  if (props.closable) open.value = false
}
// Esc: trình duyệt tự đóng <dialog>, chặn lại để trạng thái đi qua v-model
function onCancel(event: Event) {
  event.preventDefault()
  close()
}
// Nội dung nằm trong .cms-dialog__panel nên bấm trúng chính <dialog> nghĩa là bấm vào nền mờ
function onBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) close()
}
</script>

<template>
  <dialog
    ref="dialog"
    class="cms-dialog"
    :style="{ '--cms-dialog-width': width }"
    :aria-labelledby="titleId"
    :aria-describedby="description ? descriptionId : undefined"
    @cancel="onCancel"
    @close="onClose"
    @click="onBackdropClick"
  >
    <div class="cms-dialog__panel">
      <header class="cms-dialog__head">
        <div class="cms-dialog__texts">
          <h2 :id="titleId" class="cms-dialog__title">{{ title }}</h2>
          <p v-if="description" :id="descriptionId" class="cms-dialog__desc">{{ description }}</p>
        </div>
        <button v-if="closable" type="button" class="cms-dialog__close" :aria-label="t('ui.dialog.close')" @click="close">
          <AppIcon name="dong" size="1.125rem" />
        </button>
      </header>
      <div v-if="$slots.default" class="cms-dialog__body"><slot /></div>
      <footer v-if="$slots.footer" class="cms-dialog__foot"><slot name="footer" /></footer>
    </div>
  </dialog>
</template>

<style scoped lang="scss">
.cms-dialog {
  width: min(var(--cms-dialog-width), calc(100vw - 2rem));
  max-height: calc(100dvh - 2rem);
  // Reset margin toàn cục đè mất margin:auto mặc định của <dialog> -> đặt lại để căn giữa
  margin: auto;
  padding: 0;
  border: 0;
  border-radius: var(--radius-lg);
  color: var(--ink);
  background: var(--surface);
  box-shadow: var(--shadow-dialog);

  &::backdrop { background: var(--backdrop); }
}

.cms-dialog__panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  padding: var(--space-24);
}

.cms-dialog__head {
  display: flex;
  gap: var(--space-12);
  align-items: flex-start;
}
.cms-dialog__texts {
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: var(--space-6);
  min-width: 0;
}
// Figma: tiêu đề hộp thoại 18/26, chưa có text style riêng
.cms-dialog__title {
  margin: 0;
  color: var(--ink);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.625rem;
}
.cms-dialog__desc {
  color: var(--ink-muted);
  font-size: var(--type-body-font-size);
  line-height: var(--type-body-line-height);
}

.cms-dialog__close {
  display: grid;
  flex: none;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  color: var(--ink-muted);
  background: transparent;
  cursor: pointer;

  &:hover { color: var(--ink-2); background: var(--field); }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
}

.cms-dialog__body {
  color: var(--ink-2);
  font-size: var(--type-body-font-size);
  line-height: var(--type-body-line-height);
}

.cms-dialog__foot {
  display: flex;
  gap: var(--space-8);
  justify-content: flex-end;
  padding-top: var(--space-8);
}
</style>
