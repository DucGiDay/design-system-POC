export type ExportRow = { name: string; value: string }
const escapeXml = (value: string) => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!)
function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = filename; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export async function exportReport(format: 'csv' | 'svg' | 'png', title: string, subtitle: string, rows: ExportRow[]) {
  const filename = `cms-${title.replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase()}`
  if (format === 'csv') {
    // Tránh công thức CSV khi tên dữ liệu đến từ bên ngoài trong tương lai.
    const cell = (value: string) => `"${(/^[=+@-]/.test(value) ? "'" : '') + value.replaceAll('"', '""')}"`
    save(new Blob(['\uFEFF' + [[title, subtitle], ...rows.map(row => [row.name, row.value])].map(row => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), `${filename}.csv`)
    return
  }
  const styles = getComputedStyle(document.documentElement)
  const ink = styles.getPropertyValue('--ink').trim()
  const muted = styles.getPropertyValue('--ink-muted').trim()
  const surface = styles.getPropertyValue('--surface').trim()
  const font = styles.getPropertyValue('--font-sans').trim()
  const bodySize = parseFloat(styles.getPropertyValue('--type-body-font-size'))
  const titleSize = parseFloat(styles.getPropertyValue('--type-section-font-size'))
  const height = 120 + rows.length * 40
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="${height}"><rect width="100%" height="100%" fill="${surface}"/><g font-family="${escapeXml(font)}" fill="${ink}" font-size="${bodySize}"><text x="24" y="38" font-size="${titleSize}" font-weight="600">${escapeXml(title)}</text><text x="24" y="65" fill="${muted}">${escapeXml(subtitle)}</text>${rows.map((row, i) => `<text x="24" y="${108 + i * 40}">${escapeXml(row.name)}</text><text x="696" y="${108 + i * 40}" text-anchor="end">${escapeXml(row.value)}</text>`).join('')}</g></svg>`
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  if (format === 'svg') { save(blob, `${filename}.svg`); return }
  const url = URL.createObjectURL(blob)
  try {
    const image = new Image(); image.src = url
    await image.decode()
    const canvas = document.createElement('canvas'); canvas.width = 1440; canvas.height = height * 2
    canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(result => { if (result) save(result, `${filename}.png`) }, 'image/png')
  } finally { URL.revokeObjectURL(url) }
}
