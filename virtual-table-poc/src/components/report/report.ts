// Hợp đồng chung giữa ReportPage (giống hệt ở 2 POC) và ReportGrid (mỗi POC tự dựng bằng thư viện bảng của mình).
import type { SalesLine, SalesTotals } from '@/mock/report-sales'

export type ReportField = keyof Omit<SalesLine, 'id'>
export type ReportColumnKind = 'text' | 'money' | 'number' | 'time' | 'status'

export interface ReportColumn {
  field: ReportField
  /** khoá i18n `report.col.*` */
  title: string
  width: number
  kind: ReportColumnKind
  /** Ghim trái khi cuộn ngang */
  fixed?: boolean
}

/** Cùng một bộ cột cho cả hai thư viện: 15 cột + cột STT, rộng tổng ~2.000px để buộc cuộn ngang */
export const REPORT_COLUMNS: ReportColumn[] = [
  { field: 'invoice', title: 'invoice', width: 110, kind: 'text', fixed: true },
  { field: 'time', title: 'time', width: 140, kind: 'time', fixed: true },
  { field: 'store', title: 'store', width: 190, kind: 'text' },
  { field: 'city', title: 'city', width: 120, kind: 'text' },
  { field: 'channel', title: 'channel', width: 110, kind: 'text' },
  { field: 'staff', title: 'staff', width: 130, kind: 'text' },
  { field: 'dish', title: 'dish', width: 190, kind: 'text' },
  { field: 'group', title: 'group', width: 120, kind: 'text' },
  { field: 'qty', title: 'qty', width: 70, kind: 'number' },
  { field: 'price', title: 'price', width: 110, kind: 'money' },
  { field: 'discount', title: 'discount', width: 110, kind: 'money' },
  { field: 'vat', title: 'vat', width: 100, kind: 'money' },
  { field: 'amount', title: 'amount', width: 130, kind: 'money' },
  { field: 'payment', title: 'payment', width: 130, kind: 'text' },
  { field: 'status', title: 'status', width: 120, kind: 'status' },
]
export const REPORT_ROW_HEIGHT = 44
export const REPORT_HEADER_HEIGHT = 38

export type SortOrder = 'asc' | 'desc' | null

/** Trạng thái bảng gửi lên trang: số dòng sau lọc + tổng của các dòng đó */
export interface ReportGridStats { visible: number; totals: SalesTotals }

/**
 * API mà ReportGrid của mỗi POC phải expose. Mọi hàm trả về số ms tính từ lúc gọi tới khi DOM
 * đã cập nhật xong (Vue đã patch + bảng đã dựng lại các dòng đang nhìn thấy).
 */
export interface ReportGridApi {
  load(rows: SalesLine[]): Promise<number>
  search(query: string): Promise<number>
  sort(field: ReportField, order: SortOrder): Promise<number>
  scrollToEnd(): Promise<number>
  scrollToTop(): Promise<number>
}

/** Chờ Vue patch xong rồi thêm một macrotask để layout / đo đạc của bảng chạy hết */
export const settle = () => new Promise<void>(resolve => setTimeout(resolve, 0))
