import { defineAsyncComponent, type Component } from 'vue'

/**
 * Trang thật của từng mục trong sidebar con, khoá = `module/idMục` (id lá trong `subNavs`).
 * URL: `/menu/dishes/dishes-city` → list · `/menu/dishes/dishes-city/ITEM_HP2E` → detail (itemId = "ITEM_HP2E").
 * Khoá `module/*` = trang dùng cho mọi mục lá còn lại của module đó.
 * Mục chưa có trang vẫn hiện nội dung tạm của shell.
 */
export interface PageEntry {
  /** Trang danh sách (thường dùng ListLayout) */
  list: Component
  /** Trang chi tiết (thường dùng DetailLayout); bỏ trống = URL có id vẫn mở danh sách */
  detail?: Component
}

export const pages: Record<string, PageEntry> = {
  // Mọi báo cáo dùng chung trang báo cáo dữ liệu lớn (bảng khác nhau theo POC)
  'reports/*': { list: defineAsyncComponent(() => import('@/components/report/ReportPage.vue')) },
  'menu/dishes-city': {
    list: defineAsyncComponent(() => import('./menu/CityDishListPage.vue')),
    detail: defineAsyncComponent(() => import('./menu/CityDishDetailPage.vue')),
  },
}
