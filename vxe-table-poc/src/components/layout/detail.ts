/** Mục trong mục lục trang chi tiết: `id` trùng `id` của DetailSection tương ứng */
export interface TocItem { id: string; label: string; icon: string }
export interface TocGroup { label: string; items: TocItem[] }
