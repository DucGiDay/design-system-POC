<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/icon/AppIcon.vue'
import { apiErrorMessage, authApi } from './auth.api'

// Chống gửi dồn: sau khi gửi thành công phải chờ như host cũ mới gửi lại được
const RESEND_SECONDS = 59

const props = defineProps<{ open: boolean; email: string }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const titleId = useId()
const descId = useId()
const dialog = ref<HTMLDialogElement>()
const loading = ref(false)
const sent = ref(false)
const countdown = ref(0)
const error = ref('')
let timer: ReturnType<typeof setInterval> | undefined

function reset() {
  clearInterval(timer)
  loading.value = false
  sent.value = false
  countdown.value = 0
  error.value = ''
}

watch(() => props.open, async (open) => {
  await nextTick()
  if (!dialog.value) return
  if (open && !dialog.value.open) { reset(); dialog.value.showModal() }
  else if (!open && dialog.value.open) dialog.value.close()
})

async function send() {
  if (loading.value || countdown.value > 0) return
  loading.value = true
  error.value = ''
  try {
    await authApi.requestAccess(props.email)
    sent.value = true
    countdown.value = RESEND_SECONDS
    timer = setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) { clearInterval(timer); sent.value = false }
    }, 1000)
  } catch (e) {
    error.value = apiErrorMessage(e) ?? t('auth.access.error')
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <dialog ref="dialog" class="cms-dialog access-dialog" :aria-labelledby="titleId" :aria-describedby="descId" @cancel.prevent="emit('close')" @close="open && emit('close')">
    <div class="cms-dialog__body">
      <span class="access-icon" :class="sent ? 'is-sent' : 'is-warning'"><AppIcon :name="sent ? 'thanh-cong' : 'canh-bao'" size="1.5rem" /></span>
      <div class="access-texts">
        <h2 :id="titleId" class="cms-dialog__title">{{ sent ? t('auth.access.sentTitle') : t('auth.access.title') }}</h2>
        <p :id="descId" class="cms-dialog__desc">{{ t('auth.access.desc') }}</p>
      </div>
      <p v-if="error" class="cms-alert cms-alert--danger" role="alert">{{ error }}</p>
      <button type="button" class="cms-btn cms-btn--primary cms-btn--block" :disabled="loading || countdown > 0" :aria-busy="loading" @click="send">
        <span v-if="loading" class="cms-spinner" aria-hidden="true" />{{ t('auth.access.send') }}<AppIcon v-if="!loading" name="gui" size="1rem" />
      </button>
      <p v-if="countdown > 0" class="access-countdown" role="status">{{ t('auth.access.sendAgainIn', { seconds: countdown }) }}</p>
      <button type="button" class="cms-btn cms-btn--subtle cms-btn--block" @click="emit('close')">
        <AppIcon name="mui-ten-trai" size="1rem" />{{ t('auth.access.back') }}
      </button>
    </div>
  </dialog>
</template>

<style scoped lang="scss">
.access-dialog .cms-dialog__body { align-items: stretch; text-align: center; }
.access-icon {
  display: grid;
  place-items: center;
  align-self: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-full);

  &.is-warning { color: var(--warning); background: var(--warning-soft); }
  &.is-sent { color: var(--success-text); background: var(--success-soft); }
}
.access-texts { display: flex; flex-direction: column; gap: .375rem; }
.access-countdown { margin: -.5rem 0 0; color: var(--ink-muted); font-size: .75rem; line-height: 1.125rem; }
</style>
