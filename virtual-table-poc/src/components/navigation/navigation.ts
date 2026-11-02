export interface ModuleItem {
  id: string
  /** Khoá i18n của host — render bằng t(label) */
  label: string
  icon: string
  activeIcon?: string
  external?: boolean
}

export const home: ModuleItem = { id: 'home', label: 'modules.home', icon: '19c02.svg', activeIcon: 'ce4a6.svg' }
export const moduleGroups = [
  { label: 'groups.storeSales', items: [
    { id: 'restaurants', label: 'modules.restaurants', icon: '3bb26.svg' },
    { id: 'menu', label: 'modules.menu', icon: '7a99f.svg' },
    { id: 'promotions', label: 'modules.promotions', icon: 'ccdb7.svg' },
    { id: 'channels', label: 'modules.channels', icon: '28374.svg' },
    { id: 'orders', label: 'modules.orders', icon: 'd6316.svg' },
    { id: 'canteen', label: 'modules.canteen', icon: 'b470e.svg' },
    { id: 'marketplace', label: 'modules.marketplace', icon: 'e9bed.svg' },
  ] },
  { label: 'groups.operations', items: [
    { id: 'devices', label: 'modules.devices', icon: '1d3ba.svg' },
    { id: 'employees', label: 'modules.employees', icon: '38e0f.svg' },
    { id: 'attendance', label: 'modules.attendance', icon: '4bc3b.svg', external: true },
    { id: 'inventory', label: 'modules.inventory', icon: '89e55.svg', external: true },
  ] },
  { label: 'groups.reportsFinance', items: [
    { id: 'reports', label: 'modules.reports', icon: '06ad4.svg', activeIcon: '3507a.svg' },
    { id: 'accounting', label: 'modules.accounting', icon: '6ed80.svg' },
    { id: 'invoices', label: 'modules.invoices', icon: '37dd9.svg' },
  ] },
] satisfies { /** khoá i18n */ label: string; items: ModuleItem[] }[]
export const extensionModules: ModuleItem[] = [
  { id: 'momo', label: 'modules.momo', icon: 'b18ad.png' },
  { id: 'vnpay', label: 'modules.vnpay', icon: '024d8.png' },
]
export const allModules: ModuleItem[] = [home, ...moduleGroups.flatMap(group => group.items), ...extensionModules,
  { id: 'apps', label: 'modules.apps', icon: '1c7b2.svg' },
  { id: 'support', label: 'modules.support', icon: 'ed25a.svg' },
]

export interface ReportNode {
  id: string
  label: string
  code?: string
  icon?: string
  children?: ReportNode[]
}

// The A branch demonstrates the requested fourth level. Content remains a placeholder.
export const reports: ReportNode[] = [
  { id: 'a', label: 'Báo cáo A', icon: '20441.svg', children: [
    { id: 'a01', code: 'A01', label: 'Doanh thu bán hàng', children: [
      { id: 'a01-1', code: 'A01.1', label: 'Doanh thu theo cửa hàng' },
      { id: 'a01-2', code: 'A01.2', label: 'Doanh thu theo thời gian' },
    ] },
    { id: 'a02', code: 'A02', label: 'Doanh thu theo nhân viên' },
    { id: 'a03', code: 'A03', label: 'Doanh thu theo kênh bán' },
  ] },
  { id: 'trends', label: 'Xu hướng & món', icon: '6121d.svg', children: [
    { id: 'b01', code: 'B01', label: 'Xu hướng bán hàng' },
    { id: 'b02', code: 'B02', label: 'Hiệu quả món ăn' },
  ] },
  { id: 'operations', label: 'Hoá đơn & vận hành', icon: '4a36e.svg', children: [
    { id: 'bills', label: 'Hoá đơn', children: [
      { id: 'c01', code: 'C01', label: 'Danh sách hoá đơn bán hàng' },
      { id: 'c04', code: 'C04', label: 'Nhật ký order theo nhân viên và thiết bị' },
      { id: 'c05', code: 'C05', label: 'Hoá đơn đã sửa, đã huỷ trong ca làm việc' },
      { id: 'c06', code: 'C06', label: 'Món bị bỏ sau khi đã gửi bếp / bar' },
    ] },
    { id: 'shifts', label: 'Ca làm việc', children: [{ id: 'c10', code: 'C10', label: 'Tổng hợp ca làm việc' }] },
    { id: 'online', label: 'Đơn online & đặt cọc', children: [{ id: 'c15', code: 'C15', label: 'Đơn hàng online' }] },
    { id: 'c20', code: 'C20', label: 'Báo cáo tổng hợp cuối ngày' },
  ] },
  { id: 'finance', label: 'Kế toán', icon: '74280.svg', children: [{ id: 'd01', code: 'D01', label: 'Đối soát doanh thu' }] },
  { id: 'custom', label: 'Báo cáo riêng theo khách', icon: '216a0.svg', children: [{ id: 'e01', code: 'E01', label: 'Báo cáo tuỳ chỉnh' }] },
  { id: 'exports', label: 'Xuất báo cáo', icon: 'ff677.svg', children: [{ id: 'f01', code: 'F01', label: 'Lịch sử xuất báo cáo' }] },
]

export const moduleHref = (id: string) => id === home.id ? '/' : '/' + id
export const reportHref = (path: string[]) => ['/reports', ...path].join('/')
export const reportCount = (nodes: ReportNode[]): number => nodes.reduce((count, node) => count + (node.children ? reportCount(node.children) : 1), 0)
export function reportPath(ids: string[]): ReportNode[] {
  const path: ReportNode[] = []
  let nodes = reports
  for (const id of ids) {
    const node = nodes.find(item => item.id === id)
    if (!node) break
    path.push(node)
    nodes = node.children ?? []
  }
  return path
}
const searchable = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
export function filterReports(nodes: ReportNode[], query: string): ReportNode[] {
  const term = searchable(query.trim())
  if (!term) return nodes
  return nodes.flatMap(node => {
    if (searchable(`${node.code ?? ''} ${node.label}`).includes(term)) return [node]
    const children = node.children ? filterReports(node.children, query) : []
    return children.length ? [{ ...node, children }] : []
  })
}
