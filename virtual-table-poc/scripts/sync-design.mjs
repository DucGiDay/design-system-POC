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
// Spacing in tokens.css stays px to match Figma; Vue code uses rem (px / 16).
const toRem = ({ prop, value }) => {
  if (!prop.startsWith('--space-')) return { prop, value }
  if (!/^\d+(\.\d+)?px$/.test(value)) throw new Error(`Spacing token must be px: ${prop}: ${value}`)
  return { prop, value: `${parseFloat(value) / 16}rem` }
}
const properties = declarations(ruleFor(base, ':root')).map(toRem).map((d) => `  ${d.prop}: ${d.value};`)
const font = declarations(ruleFor(base, 'body')).find((d) => d.prop === 'font-family')
if (!font) throw new Error('Missing base font-family')
properties.push(`  --font-sans: ${font.value};`)
base.walkRules(/^\.cms-text-/, (rule) => {
  const name = rule.selector.slice('.cms-text-'.length)
  for (const d of declarations(rule)) properties.push(`  --type-${name}-${d.prop}: ${d.value};`)
})
const mixins = {
  button: '.cms-btn', 'button-sm': '.cms-btn.cms-btn--sm', 'button-secondary': '.cms-btn.cms-btn--secondary',
  'button-subtle': '.cms-btn.cms-btn--subtle', badge: '.cms-tag', 'badge-pending': '.cms-tag.cms-tag--warning',
  'badge-processing': '.cms-tag.cms-tag--info', 'badge-completed': '.cms-tag.cms-tag--success',
  'badge-cancelled': '.cms-tag.cms-tag--danger', 'badge-paused': '.cms-tag.cms-tag--neutral',
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
