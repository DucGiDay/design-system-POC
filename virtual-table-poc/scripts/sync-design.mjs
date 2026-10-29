import { readFileSync, writeFileSync } from 'node:fs'
import postcss from 'postcss'

// Parent design system is authoritative; never copy its preview-page layout/reset.
const read = (path) => postcss.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const base = read('../../tokens.css')
const components = read('../../components.css')
const declarations = (rule) => rule.nodes.filter((node) => node.type === 'decl')
const ruleFor = (root, selector) => {
  const rule = root.nodes.find((node) => node.type === 'rule' && node.selector === selector)
  if (!rule) throw new Error(`Missing base design selector: ${selector}`)
  return rule
}
const properties = declarations(ruleFor(base, ':root')).map((d) => `  ${d.prop}: ${d.value};`)
const font = declarations(ruleFor(base, 'body')).find((d) => d.prop === 'font-family')
if (!font) throw new Error('Missing base font-family')
properties.push(`  --font-sans: ${font.value};`)
base.walkRules(/^\.t-/, (rule) => {
  for (const d of declarations(rule)) properties.push(`  --type-${rule.selector.slice(3)}-${d.prop}: ${d.value};`)
})
const mixins = {
  button: '.btn', 'button-sm': '.btn.sm', 'button-secondary': '.btn.phu',
  'button-subtle': '.btn.nhat', badge: '.tag', 'badge-pending': '.tag.canh-bao',
  'badge-processing': '.tag.thong-tin', 'badge-completed': '.tag.thanh-cong',
  'badge-cancelled': '.tag.loi', 'badge-paused': '.tag.trung-tinh',
}
let output = '// Generated from parent tokens.css and components.css. Run npm run sync:design; do not edit.\n'
output += `@mixin tokens {\n${properties.join('\n')}\n}\n`
const dark = declarations(ruleFor(base, '[data-theme="dark"]')).map((d) => `  ${d.prop}: ${d.value};`)
output += `\n@mixin tokens-dark {\n${dark.join('\n')}\n}\n`
for (const [name, selector] of Object.entries(mixins)) {
  output += `\n@mixin ${name} {\n${declarations(ruleFor(components, selector)).map((d) => `  ${d.prop}: ${d.value};`).join('\n')}\n}\n`
}
writeFileSync(new URL('../src/styles/_base.generated.scss', import.meta.url), output)
console.log('Synced CMS-26 tokens, typography and component mixins from parent design.')
