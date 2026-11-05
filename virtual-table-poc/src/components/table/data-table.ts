import { columnSizingFeature, createColumnHelper, rowSelectionFeature, tableFeatures, type ColumnDef, type RowData, type RowSelectionState } from '@tanstack/vue-table'

/** `meta` của cột trong CmsDataTable */
export interface DataColumnMeta {
  align?: 'start' | 'end' | 'center'
  /** Icon (i) cạnh tiêu đề cột, nội dung hiện khi rê / focus */
  hint?: string
  /** Ghim cột khi cuộn ngang. Cột ghim trái phải đứng liền nhau ở đầu bảng. */
  pin?: 'left' | 'right'
  /** Ô "cấu hình" (Figma 477:1122): đệm 6/4 để vùng bấm bên trong phủ gần hết ô */
  interactive?: boolean
}

export const dataTableFeatures = tableFeatures({
  rowSelectionFeature,
  columnSizingFeature,
  columnMeta: {} as DataColumnMeta,
})
export type DataTableFeatures = typeof dataTableFeatures
// Cột có kiểu giá trị khác nhau trong cùng một mảng → để `any` cho giá trị ô, không phải cho dòng.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataColumn<T extends RowData> = ColumnDef<DataTableFeatures, T, any>
export type { RowSelectionState }

/** Helper khai báo cột có đủ kiểu cho dòng `T`: `const col = dataColumnHelper<Dish>()` */
export const dataColumnHelper = <T extends RowData>() => createColumnHelper<DataTableFeatures, T>()

const vnd = new Intl.NumberFormat('vi-VN')
export const formatVnd = (value: number) => `${vnd.format(value)} ₫`
