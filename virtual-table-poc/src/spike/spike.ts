// Bài thử quyết định (TABLE-COMPARISON.md, mục 9). File này GIỐNG HỆT ở cả 2 POC:
// cùng dữ liệu, cùng bộ cột, cùng quy tắc gộp ô. Chỉ SpikeGrid.vue khác thư viện.
import { getSalesRows, type SalesLine } from '@/mock/report-sales'
import type { ReportColumnKind, ReportField } from '@/components/report/report'

export interface SpikeLeaf {
  field: ReportField
  /** khoá i18n `report.col.*` */
  title: string
  width: number
  kind: ReportColumnKind
}
export interface SpikeGroup {
  /** khoá i18n `spike.group.*` */
  id: 'invoice' | 'place' | 'item' | 'pay'
  /** Ghim trái cả nhóm */
  pinned?: boolean
  children: SpikeLeaf[]
}

export const SPIKE_ROWS = 100_000
export const SPIKE_ROW_HEIGHT = 44
export const SPIKE_HEADER_HEIGHT = 38

/** Tiêu đề 2 tầng: nhóm → cột. Nhóm "Hoá đơn" ghim trái (2 cột). Kéo cột chỉ trong cùng nhóm. */
export const SPIKE_GROUPS: SpikeGroup[] = [
  { id: 'invoice', pinned: true, children: [
    { field: 'invoice', title: 'invoice', width: 110, kind: 'text' },
    { field: 'time', title: 'time', width: 140, kind: 'time' },
  ] },
  { id: 'place', children: [
    { field: 'store', title: 'store', width: 190, kind: 'text' },
    { field: 'city', title: 'city', width: 120, kind: 'text' },
    { field: 'channel', title: 'channel', width: 110, kind: 'text' },
    { field: 'staff', title: 'staff', width: 130, kind: 'text' },
  ] },
  { id: 'item', children: [
    { field: 'dish', title: 'dish', width: 190, kind: 'text' },
    { field: 'group', title: 'group', width: 120, kind: 'text' },
    { field: 'qty', title: 'qty', width: 70, kind: 'number' },
    { field: 'price', title: 'price', width: 110, kind: 'money' },
  ] },
  { id: 'pay', children: [
    { field: 'discount', title: 'discount', width: 110, kind: 'money' },
    { field: 'vat', title: 'vat', width: 100, kind: 'money' },
    { field: 'amount', title: 'amount', width: 130, kind: 'money' },
    { field: 'payment', title: 'payment', width: 130, kind: 'text' },
    { field: 'status', title: 'status', width: 120, kind: 'status' },
  ] },
]

/**
 * Cột cấp hoá đơn: các dòng liền nhau cùng mã hoá đơn gộp thành một ô, hiện giá trị của dòng đầu.
 * Gồm 2 cột ghim (invoice, time) và 1 cột không ghim (payment) để thử gộp ô ở cả hai vùng.
 */
export const SPIKE_MERGE_FIELDS: ReadonlySet<string> = new Set<ReportField>(['invoice', 'time', 'payment'])

export interface SpikeData {
  rows: SalesLine[]
  /** Theo vị trí dòng: số dòng của nhóm nếu là dòng đầu nhóm, 0 nếu bị gộp vào dòng phía trên */
  spans: Int32Array
}

export function spikeData(): SpikeData {
  const { rows } = getSalesRows(SPIKE_ROWS)
  const spans = new Int32Array(rows.length)
  for (let start = 0; start < rows.length;) {
    let end = start + 1
    while (end < rows.length && rows[end]!.invoice === rows[start]!.invoice) end++
    spans[start] = end - start
    start = end
  }
  return { rows, spans }
}
