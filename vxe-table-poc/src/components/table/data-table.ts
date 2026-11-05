import type { VxeGridPropTypes } from 'vxe-table'

/**
 * Cột của CmsDataTable bản vxe = cấu hình cột của vxe-grid (field, title, width, align, fixed, titleSuffix,
 * className, formatter, slots.default dạng render function…). Tương ứng meta của bản TanStack:
 *   align 'end' → align: 'right' · pin → fixed · hint → titleSuffix.content · interactive → className: 'is-interactive'
 */
export type DataColumn<T> = VxeGridPropTypes.Column<T>

/** Dòng đang chọn theo id: cùng hình dạng với RowSelectionState của TanStack để trang dùng chung kiểu */
export type RowSelectionState = Record<string, boolean>

const vnd = new Intl.NumberFormat('vi-VN')
export const formatVnd = (value: number) => `${vnd.format(value)} ₫`
