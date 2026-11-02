// Khoá cuộn trang khi có hộp thoại mở. Đếm số lần khoá để hộp thoại lồng nhau không mở khoá sớm.
let locks = 0
let previous = { overflow: '', paddingRight: '' }

export function lockPageScroll() {
  if (locks++ > 0) return
  const root = document.documentElement
  // Bù độ rộng thanh cuộn vừa mất để nội dung không bị xô ngang
  const scrollbarWidth = window.innerWidth - root.clientWidth
  previous = { overflow: root.style.overflow, paddingRight: root.style.paddingRight }
  root.style.overflow = 'hidden'
  if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`
}

export function unlockPageScroll() {
  if (locks === 0 || --locks > 0) return
  const root = document.documentElement
  root.style.overflow = previous.overflow
  root.style.paddingRight = previous.paddingRight
}
