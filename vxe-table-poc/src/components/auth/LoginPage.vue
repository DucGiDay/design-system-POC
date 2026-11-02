<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../icon/AppIcon.vue'
import CmsInput from '../ui/CmsInput.vue'
import CmsButton from '../ui/CmsButton.vue'
import AuthLayout from './AuthLayout.vue'
import RequestAccessDialog from './RequestAccessDialog.vue'
import SelectCompanyDialog from './SelectCompanyDialog.vue'
import { apiErrorMessage, authApi, isCompanyChoice, isNoProductAccess, type CompanyChoice } from './auth.api'
import { endPreviousSession, flagWeakPassword, saveSession } from './session'
import { isAccount } from './validators'

const MANUAL_URL = 'https://fabi-docs.ipos.vn/#h-ng-d-n-s-d-ng-cms-fabi'
const GENERIC_ERROR = 'Có lỗi xảy ra, mời bạn thử lại!'

const route = useRoute()
const router = useRouter()
const form = reactive({ account: '', password: '' })
const fieldErrors = reactive({ account: '', password: '' })
const formError = ref('')
const showPassword = ref(false)
const loading = ref(false)
const companyChoice = ref<CompanyChoice | null>(null)
const companyOpen = ref(false)
const accessOpen = ref(false)
const accountInput = ref<InstanceType<typeof CmsInput>>()
const passwordInput = ref<InstanceType<typeof CmsInput>>()
// Màn đăng ký chuyển về đây kèm state để báo đăng ký thành công
const registered = ref(history.state?.notice === 'registered')

onMounted(() => { void endPreviousSession() })

function validate() {
  const account = form.account.trim()
  fieldErrors.account = !account ? 'Vui lòng nhập tài khoản' : isAccount(account) ? '' : 'Thông tin tài khoản không hợp lệ'
  fieldErrors.password = form.password ? '' : 'Vui lòng nhập mật khẩu'
  if (fieldErrors.account) accountInput.value?.focus()
  else if (fieldErrors.password) passwordInput.value?.focus()
  return !fieldErrors.account && !fieldErrors.password
}

function finish() {
  flagWeakPassword(form.password)
  const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/'
  void router.replace(redirect)
}

async function submit() {
  formError.value = ''
  registered.value = false
  if (loading.value || !validate()) return
  loading.value = true
  try {
    const result = await authApi.login({ email: form.account.trim().toLowerCase(), password: form.password })
    if (isCompanyChoice(result)) {
      companyChoice.value = result
      companyOpen.value = true
      return
    }
    saveSession(result)
    finish()
  } catch (e) {
    if (isNoProductAccess(e)) accessOpen.value = true
    else formError.value = apiErrorMessage(e) ?? GENERIC_ERROR
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="login">
      <header class="login-head">
        <h1 class="login-title">Chào mừng trở lại</h1>
        <p class="login-subtitle">Chào mừng trở lại! Vui lòng nhập thông tin của bạn.</p>
      </header>

      <form class="login-form" novalidate @submit.prevent="submit">
        <p v-if="registered" class="cms-alert cms-alert--success" role="status">Đăng ký thành công, vui lòng đăng nhập để truy cập hệ thống!</p>
        <p v-if="formError" class="cms-alert cms-alert--danger" role="alert">{{ formError }}</p>

        <CmsInput ref="accountInput" v-model="form.account" label="Tài khoản" placeholder="Nhập tài khoản" :error="fieldErrors.account" name="username" autocomplete="username" @input="fieldErrors.account = ''" />
        <CmsInput ref="passwordInput" v-model="form.password" label="Mật khẩu" placeholder="Nhập mật khẩu" :error="fieldErrors.password" name="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" @input="fieldErrors.password = ''">
          <template #suffix="{ id }"><button type="button" class="cms-field__action" :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" :aria-pressed="showPassword" :aria-controls="id" @click="showPassword = !showPassword"><AppIcon :name="showPassword ? 'mat-an' : 'mat'" size="1.125rem" /></button></template>
        </CmsInput>

        <RouterLink class="cms-link login-forgot" to="/forgot-password">Quên mật khẩu?</RouterLink>

        <CmsButton class="cms-ui-button cms-btn--block" type="submit" variant="primary" :loading="loading">Đăng nhập</CmsButton>
        <RouterLink class="cms-btn cms-btn--secondary cms-btn--block" to="/login-token">Đăng nhập với mã hỗ trợ</RouterLink>
      </form>

      <footer class="login-foot">
        <p>Bạn chưa có tài khoản hệ thống iPOS? <RouterLink class="cms-link" to="/register">Đăng ký</RouterLink></p>
        <p><a class="cms-link" :href="MANUAL_URL" target="_blank" rel="noopener">Hướng dẫn sử dụng CMS FABI<span class="visually-hidden"> (mở tab mới)</span></a></p>
      </footer>
    </div>

    <SelectCompanyDialog :open="companyOpen" :choice="companyChoice" @close="companyOpen = false" @done="companyOpen = false; finish()" />
    <RequestAccessDialog :open="accessOpen" :email="form.account.trim().toLowerCase()" @close="accessOpen = false" />
  </AuthLayout>
</template>

<style scoped lang="scss">
.login { display: flex; flex-direction: column; gap: 2rem; }
.login-head { display: flex; flex-direction: column; gap: .5rem; }
.login-title { margin: 0; font-size: 1.75rem; font-weight: 600; line-height: 2.25rem; letter-spacing: -.03125rem; }
.login-subtitle { margin: 0; color: var(--ink-muted); font-size: .875rem; line-height: 1.375rem; }
.login-form { display: flex; flex-direction: column; gap: 1rem; }
.login-forgot { align-self: flex-end; margin-top: -.25rem; font-size: .8125rem; line-height: 1.25rem; }
.login-foot {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  color: var(--ink-muted);
  font-size: .875rem;
  line-height: 1.375rem;
  text-align: center;

  p { margin: 0; }
}
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
