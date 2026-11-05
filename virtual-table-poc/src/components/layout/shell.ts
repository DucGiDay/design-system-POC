import { inject, type InjectionKey, type Ref } from 'vue'
import type { NavNode } from '@/components/navigation/navigation'

/**
 * Trang dùng ListLayout / DetailLayout tự vẽ header nên shell ẩn thanh breadcrumb trên desktop.
 * Nút mở lại sidebar con (vốn nằm trên thanh đó) được shell cấp qua đây để layout đặt cạnh tiêu đề.
 */
export interface ShellChrome {
  /** Đang ở màn mobile: shell vẫn giữ header riêng (nút menu), layout không vẽ nút sidebar */
  isMobile: Readonly<Ref<boolean>>
  /** Module có sidebar con và sidebar đang đóng → layout hiện nút mở */
  subNavCollapsed: Readonly<Ref<boolean>>
  /** Tên module, dùng cho nhãn nút "Mở menu {name}" */
  moduleName: Readonly<Ref<string>>
  toggleSubNav: () => void
}

export const shellChromeKey: InjectionKey<ShellChrome> = Symbol('shell-chrome')
export const useShellChrome = () => inject(shellChromeKey, undefined)

/** Props mọi trang đăng ký trong `pages` nhận từ shell */
export interface PageProps {
  /** URL của trang danh sách (không có id), để trang chi tiết quay lại và trang danh sách dựng link chi tiết */
  baseHref: string
  /** Đoạn URL sau trang danh sách: có = trang chi tiết */
  itemId?: string
  /** Mục lá đang mở trong sidebar con (tên, mã) */
  node?: NavNode
}
