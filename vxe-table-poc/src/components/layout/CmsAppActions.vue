<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/icon/AppIcon.vue'
import CmsButton from '@/components/ui/CmsButton.vue'
import CmsDialog from '@/components/ui/CmsDialog.vue'
import CmsIconButton from '@/components/ui/CmsIconButton.vue'
import { currentLocale, setLocale } from '@/i18n'
import { useAppBanner } from '@/components/navigation/app-banner'

// "Hành động chung" của Header/Trang (Figma 186:3362): Gia hạn, Hướng dẫn, Giỏ hàng, Ngôn ngữ, Thông báo, Tài khoản.
// Hướng dẫn / Thông báo / Tài khoản chưa có màn: báo bằng hộp thoại như trang chủ.
const { t } = useI18n()
const router = useRouter()
const { kind: bannerKind } = useAppBanner()
const notice = ref('')
const noticeOpen = computed({ get: () => !!notice.value, set: value => { if (!value) notice.value = '' } })
</script>

<template>
  <div class="cms-app-actions">
    <!-- Banner gói sắp hết hạn đã có nút Gia hạn: ẩn lối tắt này để màn hình chỉ có một chỗ gia hạn -->
    <button v-if="bannerKind !== 'expiry'" type="button" class="cms-app-actions__renew" @click="router.push('/marketplace')"><AppIcon name="goi-pro" size="1rem" />{{ t('dashboard.renew') }}</button>
    <CmsIconButton icon="huong-dan" :label="t('dashboard.help')" outline @click="notice = t('dashboard.help')" />
    <CmsIconButton icon="marketplace" :label="t('dashboard.market')" outline @click="router.push('/marketplace')" />
    <button type="button" class="cms-app-actions__lang" :aria-label="t('shell.language')" @click="setLocale(currentLocale === 'vi' ? 'en' : 'vi')"><AppIcon name="ngon-ngu" size="1rem" />{{ currentLocale.toUpperCase() }}<AppIcon name="mui-ten-xuong" size=".875rem" /></button>
    <span class="cms-app-actions__bell"><CmsIconButton icon="thong-bao" :label="t('dashboard.notifications')" outline @click="notice = t('dashboard.notifications')" /><span aria-hidden="true">9+</span></span>
    <CmsDialog v-model:open="noticeOpen" :title="notice" :description="t('layout.notReady')"><template #footer><CmsButton @click="notice = ''">{{ t('ui.dialog.close') }}</CmsButton></template></CmsDialog>
    <button type="button" class="cms-app-actions__user" @click="notice = t('dashboard.user')"><span class="cms-app-actions__avatar" aria-hidden="true">NA</span><span class="cms-app-actions__who"><strong>{{ t('dashboard.user') }}</strong><small>{{ t('dashboard.role') }}</small></span><AppIcon name="mui-ten-xuong" size="1rem" /></button>
  </div>
</template>

<style scoped lang="scss">
.cms-app-actions {
  display: flex;
  flex: none;
  gap: var(--space-10);
  align-items: center;
}
button { border: 0; font: inherit; cursor: pointer; &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; } }
.cms-app-actions__renew {
  display: inline-flex;
  gap: var(--space-6);
  align-items: center;
  height: 2.25rem;
  padding: 0 var(--space-14) 0 var(--space-12);
  border-radius: var(--radius-md);
  color: var(--accent-text);
  background: var(--accent-soft);
  font-size: .8125rem;
  font-weight: 600;
  line-height: 1.125rem;
  white-space: nowrap;
  &:hover { background: color-mix(in srgb, var(--accent) 18%, var(--accent-soft)); }
}
.cms-app-actions__lang {
  display: inline-flex;
  gap: var(--space-4);
  align-items: center;
  height: 2.25rem;
  padding: 0 var(--space-8) 0 var(--space-10);
  border-radius: var(--radius-md);
  color: var(--ink-2);
  background: var(--surface);
  box-shadow: var(--shadow-inside-stroke);
  font-size: .75rem;
  font-weight: 600;
  line-height: 1rem;
  &:hover { background: var(--subtle); }
}
.cms-app-actions__bell {
  position: relative;
  display: inline-flex;
  > span {
    position: absolute;
    top: -.375rem;
    left: 1.3125rem;
    height: 1rem;
    padding: 0 var(--space-4);
    border-radius: 999px;
    color: #fff;
    background: #db2626;
    font-size: .625rem;
    font-weight: 600;
    line-height: 1rem;
    pointer-events: none;
  }
}
.cms-app-actions__user {
  display: inline-flex;
  gap: var(--space-10);
  align-items: center;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  color: var(--ink-muted);
  background: transparent;
  text-align: left;
  &:hover { background: var(--subtle); }
}
.cms-app-actions__avatar {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--primary);
  border-radius: 50%;
  color: var(--primary-text);
  background: var(--primary-soft);
  font-size: .8125rem;
  font-weight: 600;
}
.cms-app-actions__who {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  strong { color: var(--ink); font-size: .8125rem; font-weight: 600; line-height: 1.125rem; }
  small { color: var(--ink-muted); font-size: .6875rem; line-height: 1rem; }
}
@media (max-width: 1279px) {
  .cms-app-actions__who { display: none; }
}
</style>
