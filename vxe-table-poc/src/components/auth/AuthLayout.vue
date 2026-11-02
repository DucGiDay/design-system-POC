<script setup lang="ts">
import banner from './assets/banner.jpg'
import logoIpos from './assets/logo-ipos.svg'
import logoIposLight from './assets/logo-ipos-light.svg'
import './auth.scss'

// Khung chung của các màn trước đăng nhập: form bên trái, banner thương hiệu bên phải (ẩn trên mobile).
// Option 2 chưa có vue-i18n (xem AGENTS.md ở thư mục gốc) nên chữ viết thẳng tiếng Việt.
defineProps<{ wide?: boolean }>()
const year = new Date().getFullYear()
</script>

<template>
  <div class="cms-auth auth-layout">
    <div class="auth-panel">
      <header class="auth-top">
        <a href="https://ipos.vn" target="_blank" rel="noopener" class="auth-logo-link">
          <img :src="logoIpos" width="120" height="40" alt="iPOS.vn (mở tab mới)" />
        </a>
      </header>
      <main class="auth-content" :class="{ 'is-wide': wide }">
        <slot />
      </main>
      <footer class="auth-copyright">© IPOS.VN {{ year }}</footer>
    </div>

    <aside class="auth-banner">
      <img class="auth-banner-image" :src="banner" alt="" />
      <div class="auth-banner-content">
        <img :src="logoIposLight" width="96" height="32" alt="" />
        <p class="auth-banner-title">FABI Giải pháp<span>Phần mềm quản lý bán hàng ngành dịch vụ ẩm thực</span></p>
        <slot name="banner">
          <p class="auth-banner-desc">Với kinh nghiệm chuyên sâu trong ngành F&amp;B, IPOS.vn mang đến hệ sinh thái giải pháp phù hợp cho mọi mô hình kinh doanh, giúp chuẩn hóa quy trình, tiết kiệm chi phí và tăng trưởng bền vững</p>
        </slot>
      </div>
    </aside>
  </div>
</template>

<style scoped lang="scss">
.auth-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  min-height: 100dvh;
  color: var(--ink);
  background: var(--surface);
}

.auth-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 1.5rem clamp(1rem, 5vw, 4rem);
}
.auth-top { display: flex; gap: 1rem; align-items: center; justify-content: space-between; min-height: 2.25rem; }
.auth-logo-link {
  display: inline-flex;
  border-radius: var(--radius-sm);
  img { width: 7.5rem; height: auto; }
  &:focus-visible { outline: 2px solid var(--primary); outline-offset: 4px; }
}
.auth-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 25rem;
  margin: 0 auto;
  padding: 2.5rem 0;

  &.is-wide { max-width: 40rem; }
}
.auth-copyright { color: var(--ink-faint); font-size: .75rem; line-height: 1.125rem; text-align: center; }

// Ảnh nền cố định tông tối, nên chữ dùng thang màu primary cố định (không đổi theo dark theme)
.auth-banner {
  position: relative;
  overflow: hidden;
  background: var(--primary-950);
}
.auth-banner-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.auth-banner::after {
  content: '';
  position: absolute;
  inset: 0;
  // Tối dần từ giữa ảnh: màn đăng ký có đoạn giới thiệu dài, chữ lên tới giữa banner vẫn phải đọc được
  background: linear-gradient(180deg,
    transparent 10%,
    color-mix(in srgb, var(--primary-950) 60%, transparent) 40%,
    color-mix(in srgb, var(--primary-950) 92%, transparent) 75%);
}
.auth-banner-content {
  position: absolute;
  z-index: 1;
  right: clamp(1.5rem, 5vw, 4rem);
  bottom: clamp(1.5rem, 6vh, 4rem);
  left: clamp(1.5rem, 5vw, 4rem);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: var(--primary-50);

  img { width: 6rem; height: auto; }
}
.auth-banner-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 2.25rem;
  letter-spacing: -.03125rem;

  span { display: block; }
}
.auth-banner-desc { max-width: 36rem; margin: 0; color: var(--primary-100); font-size: .875rem; line-height: 1.375rem; }

@media (max-width: 959px) {
  .auth-layout { grid-template-columns: minmax(0, 1fr); }
  .auth-banner { display: none; }
}
</style>
