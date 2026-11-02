<script setup lang="ts">
import { nextTick, reactive, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/icon/AppIcon.vue'
import AuthLayout from './AuthLayout.vue'
import { apiErrorMessage, authApi } from './auth.api'
import { isEmail, isStrongPassword } from './validators'

const POLICY_URL = 'https://ipos.vn/policies/'
const INTRO = ['easy', 'flexible', 'chain'] as const
type Field = 'fullName' | 'email' | 'confirmEmail' | 'password' | 'agree'

const { t } = useI18n()
const router = useRouter()
const uid = useId()
const id = (field: string) => `${uid}-${field}`
const form = reactive({ fullName: '', countryId: 'VN', email: '', confirmEmail: '', password: '', agree: false })
const errors = reactive<Record<Field, string>>({ fullName: '', email: '', confirmEmail: '', password: '', agree: '' })
const formError = ref('')
const showPassword = ref(false)
const loading = ref(false)
const formEl = ref<HTMLFormElement>()

function validate() {
  const email = form.email.trim()
  errors.fullName = form.fullName.trim() ? '' : t('auth.register.errorFullNameRequired')
  errors.email = !email ? t('auth.register.errorEmailRequired') : isEmail(email) ? '' : t('auth.register.errorEmailInvalid')
  errors.confirmEmail = !form.confirmEmail.trim() ? t('auth.register.errorEmailRequired')
    : form.confirmEmail.trim().toLowerCase() !== email.toLowerCase() ? t('auth.register.errorEmailMismatch') : ''
  errors.password = !form.password ? t('auth.register.errorPasswordRequired') : isStrongPassword(form.password) ? '' : t('auth.register.errorPassword')
  errors.agree = form.agree ? '' : t('auth.register.errorAgree')
  const valid = Object.values(errors).every(message => !message)
  if (!valid) void nextTick(() => formEl.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
  return valid
}

const describedBy = (field: Field, hint?: string) => [errors[field] ? id(`${field}-error`) : '', hint ?? ''].filter(Boolean).join(' ') || undefined

async function submit() {
  formError.value = ''
  if (loading.value || !validate()) return
  loading.value = true
  const email = form.email.trim().toLowerCase()
  try {
    await authApi.register({ full_name: form.fullName.trim(), country_id: form.countryId, email, password: form.password })
    // Bản Vue 2 còn gửi tin Telegram khi URL có fbclid, bằng bot token đặt thẳng trong code client.
    // Không chuyển phần đó: token lộ trong bundle. Cần làm lại phía backend nếu marketing còn dùng.
    if (import.meta.env.PROD) {
      // Như host cũ: bản build production bắt xác thực email trước khi đăng nhập
      await authApi.requestVerifyEmail(email)
      await router.push({ path: '/request-verify-email', query: { email } })
    } else {
      await router.push({ path: '/login', state: { notice: 'registered' } })
    }
  } catch (e) {
    formError.value = apiErrorMessage(e) ?? t('auth.register.errorGeneric')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout wide>
    <div class="register">
      <header class="register-head">
        <h1 class="register-title">{{ t('auth.register.title') }}</h1>
        <p class="register-subtitle">{{ t('auth.register.subtitle') }}</p>
      </header>

      <form ref="formEl" class="register-form" novalidate @submit.prevent="submit">
        <p v-if="formError" class="cms-alert cms-alert--danger register-span" role="alert">{{ formError }}</p>

        <div class="cms-field" :class="{ 'is-invalid': errors.fullName }">
          <label class="cms-field__label" :for="id('fullName')">{{ t('auth.register.fullName') }}</label>
          <div class="cms-field__box">
            <input :id="id('fullName')" v-model="form.fullName" name="name" autocomplete="name" :placeholder="t('auth.register.fullNamePlaceholder')" :aria-invalid="!!errors.fullName" :aria-describedby="describedBy('fullName')" @input="errors.fullName = ''" />
          </div>
          <p v-if="errors.fullName" :id="id('fullName-error')" class="cms-field__error">{{ errors.fullName }}</p>
        </div>

        <div class="cms-field">
          <label class="cms-field__label" :for="id('country')">{{ t('auth.register.country') }}</label>
          <div class="cms-field__box">
            <select :id="id('country')" v-model="form.countryId" name="country" autocomplete="country">
              <option value="VN">{{ t('auth.register.countryVN') }}</option>
            </select>
          </div>
        </div>

        <div class="cms-field" :class="{ 'is-invalid': errors.email }">
          <label class="cms-field__label" :for="id('email')">{{ t('auth.register.email') }}</label>
          <div class="cms-field__box">
            <input :id="id('email')" v-model="form.email" type="email" name="email" autocomplete="email" :placeholder="t('auth.register.emailPlaceholder')" :aria-invalid="!!errors.email" :aria-describedby="describedBy('email')" @input="errors.email = ''" />
          </div>
          <p v-if="errors.email" :id="id('email-error')" class="cms-field__error">{{ errors.email }}</p>
        </div>

        <div class="cms-field" :class="{ 'is-invalid': errors.confirmEmail }">
          <label class="cms-field__label" :for="id('confirmEmail')">{{ t('auth.register.confirmEmail') }}</label>
          <div class="cms-field__box">
            <input :id="id('confirmEmail')" v-model="form.confirmEmail" type="email" name="confirm-email" autocomplete="off" :placeholder="t('auth.register.confirmEmailPlaceholder')" :aria-invalid="!!errors.confirmEmail" :aria-describedby="describedBy('confirmEmail')" @input="errors.confirmEmail = ''" />
          </div>
          <p v-if="errors.confirmEmail" :id="id('confirmEmail-error')" class="cms-field__error">{{ errors.confirmEmail }}</p>
        </div>

        <div class="cms-field" :class="{ 'is-invalid': errors.password }">
          <label class="cms-field__label" :for="id('password')">{{ t('auth.register.password') }}</label>
          <div class="cms-field__box">
            <input :id="id('password')" v-model="form.password" :type="showPassword ? 'text' : 'password'" name="new-password" autocomplete="new-password" :aria-invalid="!!errors.password" :aria-describedby="describedBy('password', errors.password ? undefined : id('password-hint'))" @input="errors.password = ''" />
            <button type="button" class="cms-field__action" :aria-label="showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')" :aria-pressed="showPassword" :aria-controls="id('password')" @click="showPassword = !showPassword">
              <AppIcon :name="showPassword ? 'mat-an' : 'mat'" size="1.125rem" />
            </button>
          </div>
          <p v-if="errors.password" :id="id('password-error')" class="cms-field__error">{{ errors.password }}</p>
          <p v-else :id="id('password-hint')" class="cms-field__hint">{{ t('auth.register.passwordHint') }}</p>
        </div>

        <div class="register-span">
          <label class="cms-check">
            <input v-model="form.agree" type="checkbox" name="agree" :aria-invalid="!!errors.agree" :aria-describedby="describedBy('agree')" @change="errors.agree = ''" />
            <i18n-t keypath="auth.register.agree" tag="span" scope="global">
              <template #terms><a class="cms-link" :href="POLICY_URL" target="_blank" rel="noopener">{{ t('auth.register.terms') }}</a></template>
              <template #privacy><a class="cms-link" :href="POLICY_URL" target="_blank" rel="noopener">{{ t('auth.register.privacy') }}</a></template>
            </i18n-t>
          </label>
          <p v-if="errors.agree" :id="id('agree-error')" class="cms-field__error register-check-error">{{ errors.agree }}</p>
        </div>

        <div class="register-actions register-span">
          <button type="submit" class="cms-btn cms-btn--primary cms-btn--block" :disabled="loading" :aria-busy="loading">
            <span v-if="loading" class="cms-spinner" aria-hidden="true" />{{ t('auth.register.submit') }}
          </button>
          <p class="register-login">{{ t('auth.register.hasAccount') }} <RouterLink class="cms-link" to="/login">{{ t('auth.register.login') }}</RouterLink></p>
        </div>
      </form>
    </div>

    <template #banner>
      <ul class="register-intro">
        <li v-for="item in INTRO" :key="item">
          <strong>{{ t(`auth.register.intro.${item}Title`) }}</strong>
          <span>{{ t(`auth.register.intro.${item}Desc`) }}</span>
        </li>
      </ul>
    </template>
  </AuthLayout>
</template>

<style scoped lang="scss">
.register { display: flex; flex-direction: column; gap: 2rem; }
.register-head { display: flex; flex-direction: column; gap: .5rem; }
.register-title { margin: 0; font-size: 1.75rem; font-weight: 600; line-height: 2.25rem; letter-spacing: -.03125rem; }
.register-subtitle { margin: 0; color: var(--ink-muted); font-size: .875rem; line-height: 1.375rem; }
.register-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.5rem;
  align-items: start;
}
.register-span { grid-column: 1 / -1; }
.register-check-error { margin: .25rem 0 0 1.625rem; }
.register-actions { display: flex; flex-direction: column; gap: 1rem; padding-top: .5rem; }
.register-login { margin: 0; color: var(--ink-muted); font-size: .875rem; line-height: 1.375rem; text-align: center; }

.register-intro {
  display: flex;
  flex-direction: column;
  gap: .75rem;
  max-width: 36rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li { display: flex; flex-direction: column; gap: .125rem; }
  strong { color: var(--primary-50); font-size: .875rem; font-weight: 600; line-height: 1.375rem; }
  span { color: var(--primary-100); font-size: .8125rem; line-height: 1.25rem; }
}

@media (max-width: 639px) {
  .register-form { grid-template-columns: minmax(0, 1fr); }
}
</style>
