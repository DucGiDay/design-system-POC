// Dữ liệu giả tái hiện CMS-26, không dùng làm số liệu kinh doanh thật.
export const products = [
  { key: 'ticket', net: 1694000, gross: 1850000, quantity: 8 },
  { key: 'combo', net: 1268190, gross: 1370000, quantity: 3 },
  { key: 'sangria', net: 1200000, gross: 1320000, quantity: 24 },
  { key: 'pearl', net: 704000, gross: 774400, quantity: 64 },
  { key: 'tea', net: 462000, gross: 508200, quantity: 11 },
]
export const revenueDays = [920000, 1450000, 690000, 1220000, 1070000, 1920000, 507840]
export const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
export const rankingGroups = [
  { key: 'promotions', icon: 'giam-gia', rows: [{ key: 'member', value: 1350000 }, { key: 'lunch', value: 920000 }, { key: 'happy', value: 610000 }, { key: 'buyTwo', value: 380000 }, { key: 'birthday', value: 150000 }] },
  { key: 'sources', icon: 'nguon-don', rows: [{ key: 'onsite', value: 5962000 }, { key: 'takeaway', value: 1183840 }, { key: 'online', value: 632000 }] },
  { key: 'stores', icon: 'cua-hang', rows: [{ key: 'chanh', value: 7757840 }, { key: 'otherStore', value: 20000 }] },
]
export const payments = [{ key: 'cash', value: 6408840, percent: '82,4%', color: 'primary' }, { key: 'later', value: 1359000, percent: '17,5%', color: 'accent' }, { key: 'qr', value: 10000, percent: '0,1%', color: 'success' }]
