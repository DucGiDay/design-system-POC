<script setup lang="ts">
import { nextTick, reactive, ref, useId } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../icon/AppIcon.vue'
import AuthLayout from './AuthLayout.vue'
import { apiErrorMessage, authApi } from './auth.api'
import { isEmail, isStrongPassword } from './validators'

const POLICY_URL = 'https://ipos.vn/policies/'
const INTRO = [
  { title: 'Sử dụng dễ dàng', desc: 'Phần mềm bán hàng iPOS.vn giúp xử lý các nghiệp vụ từ đơn giản tới phức tạp trong kinh doanh nhà hàng với giao diện trực quan, tính năng thông minh, thao tác thân thiện.' },
  { title: 'Áp dụng linh hoạt', desc: 'Sản phẩm của iPOS.vn phù hợp nhiều mô hình đa dạng trong kinh doanh nhà hàng cũng như dễ dàng nâng cấp, thay đổi để đáp ứng việc mở rộng quy mô trong tương lai.' },
  { title: 'Quản trị toàn chuỗi', desc: 'Mọi thông tin kinh doanh tại từng điểm bán cụ thể được thống kê hiệu quả và chính xác, trợ giúp nhà quản trị trong việc ra các quyết định quan trọng cho toàn chuỗi nhà hàng.' },
]
type Field = 'fullName' | 'email' | 'confirmEmail' | 'password' | 'agree'

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
  errors.fullName = form.fullName.trim() ? '' : 'Vui lòng nhập tên tài khoản'
  errors.email = !email ? 'Vui lòng nhập email' : isEmail(email) ? '' : 'Email không hợp lệ'
  errors.confirmEmail = !form.confirmEmail.trim() ? 'Vui lòng nhập email'
    : form.confirmEmail.trim().toLowerCase() !== email.toLowerCase() ? 'Email không trùng khớp' : ''
  errors.password = !form.password ? 'Vui lòng tạo mật khẩu' : isStrongPassword(form.password) ? '' : 'Mật khẩu phải chứa ít nhất 6 ký tự bao gồm chữ và số'
  errors.agree = form.agree ? '' : 'Vui lòng đồng ý với quy định và chính sách'
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
    formError.value = apiErrorMessage(e) ?? 'Có lỗi xảy ra, mời bạn thử lại!'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout wide>
    <div class="register">
      <header class="register-head">
        <h1 class="register-title">Hãy tạo tài khoản của bạn</h1>
        <p class="register-subtitle">Đăng ký tài khoản hệ thống iPOS nhanh chóng và miễn phí, không cam kết hay hợp đồng dài hạn.</p>
      </header>

      <form ref="formEl" class="register-form" novalidate @submit.prevent="submit">
        <p v-if="formError" class="cms-alert cms-alert--danger register-span" role="alert">{{ formError }}</p>

        <div class="cms-field" :class="{ 'is-invalid': errors.fullName }">
          <label class="cms-field__label" :for="id('fullName')">Tên tài khoản</label>
          <div class="cms-field__box">
            <input :id="id('fullName')" v-model="form.fullName" name="name" autocomplete="name" placeholder="Nhập tên tài khoản" :aria-invalid="!!errors.fullName" :aria-describedby="describedBy('fullName')" @input="errors.fullName = ''" />
          </div>
          <p v-if="errors.fullName" :id="id('fullName-error')" class="cms-field__error">{{ errors.fullName }}</p>
        </div>

        <div class="cms-field">
          <label class="cms-field__label" :for="id('country')">Quốc gia</label>
          <div class="cms-field__box">
            <select :id="id('country')" v-model="form.countryId" name="country" autocomplete="country">
              <option value="VN">Việt Nam</option>
            </select>
          </div>
        </div>

        <div class="cms-field" :class="{ 'is-invalid': errors.email }">
          <label class="cms-field__label" :for="id('email')">Email</label>
          <div class="cms-field__box">
            <input :id="id('email')" v-model="form.email" type="email" name="email" autocomplete="email" placeholder="Nhập email" :aria-invalid="!!errors.email" :aria-describedby="describedBy('email')" @input="errors.email = ''" />
          </div>
          <p v-if="errors.email" :id="id('email-error')" class="cms-field__error">{{ errors.email }}</p>
        </div>

        <div class="cms-field" :class="{ 'is-invalid': errors.confirmEmail }">
          <label class="cms-field__label" :for="id('confirmEmail')">Xác nhận email</label>
          <div class="cms-field__box">
            <input :id="id('confirmEmail')" v-model="form.confirmEmail" type="email" name="confirm-email" autocomplete="off" placeholder="Nhập lại email" :aria-invalid="!!errors.confirmEmail" :aria-describedby="describedBy('confirmEmail')" @input="errors.confirmEmail = ''" />
          </div>
          <p v-if="errors.confirmEmail" :id="id('confirmEmail-error')" class="cms-field__error">{{ errors.confirmEmail }}</p>
        </div>

        <div class="cms-field" :class="{ 'is-invalid': errors.password }">
          <label class="cms-field__label" :for="id('password')">Tạo mật khẩu</label>
          <div class="cms-field__box">
            <input :id="id('password')" v-model="form.password" :type="showPassword ? 'text' : 'password'" name="new-password" autocomplete="new-password" :aria-invalid="!!errors.password" :aria-describedby="describedBy('password', errors.password ? undefined : id('password-hint'))" @input="errors.password = ''" />
            <button type="button" class="cms-field__action" :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" :aria-pressed="showPassword" :aria-controls="id('password')" @click="showPassword = !showPassword">
              <AppIcon :name="showPassword ? 'mat-an' : 'mat'" size="1.125rem" />
            </button>
          </div>
          <p v-if="errors.password" :id="id('password-error')" class="cms-field__error">{{ errors.password }}</p>
          <p v-else :id="id('password-hint')" class="cms-field__hint">Ít nhất 6 ký tự, gồm cả chữ và số</p>
        </div>

        <div class="register-span">
          <label class="cms-check">
            <input v-model="form.agree" type="checkbox" name="agree" :aria-invalid="!!errors.agree" :aria-describedby="describedBy('agree')" @change="errors.agree = ''" />
            <span>Tôi đồng ý với <a class="cms-link" :href="POLICY_URL" target="_blank" rel="noopener">Quy định chung, Chính sách bảo hành</a> và <a class="cms-link" :href="POLICY_URL" target="_blank" rel="noopener">Chính sách bảo mật</a> với iPOS</span>
          </label>
          <p v-if="errors.agree" :id="id('agree-error')" class="cms-field__error register-check-error">{{ errors.agree }}</p>
        </div>

        <div class="register-actions register-span">
          <button type="submit" class="cms-btn cms-btn--primary cms-btn--block" :disabled="loading" :aria-busy="loading">
            <span v-if="loading" class="cms-spinner" aria-hidden="true" />Đăng ký
          </button>
          <p class="register-login">Bạn đã có tài khoản hệ thống iPOS? <RouterLink class="cms-link" to="/login">Đăng nhập</RouterLink></p>
        </div>
      </form>
    </div>

    <template #banner>
      <ul class="register-intro">
        <li v-for="item in INTRO" :key="item.title">
          <strong>{{ item.title }}</strong>
          <span>{{ item.desc }}</span>
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
