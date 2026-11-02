<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AuthLayout from './AuthLayout.vue'

// Chỗ giữ route cho các màn auth chưa chuyển (quên mật khẩu, mã hỗ trợ, xác thực email)
// để link từ màn đăng nhập/đăng ký không rơi vào khung CMS.
const { t } = useI18n()
const route = useRoute()
const email = computed(() => typeof route.query.email === 'string' ? route.query.email : '')
</script>

<template>
  <AuthLayout>
    <div class="pending">
      <h1 class="pending-title">{{ t(route.meta.titleKey ?? 'auth.pageTitle.login') }}</h1>
      <p v-if="route.name === 'verify-email' && email" class="cms-alert cms-alert--success" role="status">{{ t('auth.pending.verifyEmailSent', { email }) }}</p>
      <p class="pending-desc">{{ t('auth.pending.desc') }}</p>
      <RouterLink class="cms-btn cms-btn--secondary cms-btn--block" to="/login">{{ t('auth.pending.back') }}</RouterLink>
    </div>
  </AuthLayout>
</template>

<style scoped>
.pending { display: flex; flex-direction: column; gap: 1rem; }
.pending-title { margin: 0; font-size: 1.75rem; font-weight: 600; line-height: 2.25rem; letter-spacing: -.03125rem; }
.pending-desc { margin: 0; color: var(--ink-muted); font-size: .875rem; line-height: 1.375rem; }
</style>
