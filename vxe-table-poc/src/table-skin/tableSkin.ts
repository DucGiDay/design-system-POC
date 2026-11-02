import { readonly, ref } from 'vue'

// `cms`: CMS-26 overrides on top of vxe. `vxe`: plain vxe-pc-ui / vxe-table defaults, for comparison.
export type TableSkin = 'cms' | 'vxe'

const STORAGE_KEY = 'vxe-poc:table-skin'
const skins: readonly TableSkin[] = ['cms', 'vxe']
const isSkin = (value: unknown): value is TableSkin => skins.includes(value as TableSkin)

const current = ref<TableSkin>('cms')
export const tableSkin = readonly(current)

function apply(skin: TableSkin) {
  current.value = skin
  // Every override in _vxe-theme.scss and _components.scss keys off this attribute.
  document.documentElement.dataset.tableSkin = skin
}

function readStored(): TableSkin | undefined {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return isSkin(value) ? value : undefined
  } catch {
    return undefined
  }
}

// Call before mount so the first paint already uses the right skin.
// `?skin=vxe` opens straight into a skin without changing the saved choice.
export function initTableSkin() {
  const fromQuery = new URLSearchParams(location.search).get('skin')
  apply(isSkin(fromQuery) ? fromQuery : readStored() ?? 'cms')
}

export function setTableSkin(skin: TableSkin) {
  apply(skin)
  try {
    localStorage.setItem(STORAGE_KEY, skin)
  } catch {
    // Storage blocked (private mode, policy): the switch still works for this tab.
  }
}
