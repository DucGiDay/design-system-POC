import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import postcss from 'postcss'

// The parent is the source of truth. Import declarations, not preview-page styles.
const parse = (file) => postcss.parse(readFileSync(new URL(file, import.meta.url), 'utf8'))
const tokens = parse('../../tokens.css')
const components = parse('../../components.css')
const declarations = (root, selector) => {
  const rule = root.nodes.find(node => node.type === 'rule' && node.selector === selector)
  if (!rule) throw new Error(`Missing base design selector: ${selector}`)
  return rule.nodes.filter(node => node.type === 'decl')
}
const lines = (items) => items.map(({ prop, value }) => `  ${prop}: ${value};`).join('\n')
const font = declarations(tokens, 'body').find(node => node.prop === 'font-family')
if (!font) throw new Error('Missing base font-family')
// Spacing in tokens.css stays px to match Figma; Vue code uses rem (px / 16).
const toRem = ({ prop, value }) => {
  if (!prop.startsWith('--space-')) return { prop, value }
  if (!/^\d+(\.\d+)?px$/.test(value)) throw new Error(`Spacing token must be px: ${prop}: ${value}`)
  return { prop, value: `${parseFloat(value) / 16}rem` }
}
const properties = [...declarations(tokens, ':root').map(toRem), { prop: '--font-sans', value: font.value }]
// Typography also as custom properties (--type-<name>-<prop>), same as virtual-table-poc, so shared Vue components work in both POCs.
tokens.walkRules(/^.cms-text-/, rule => {
  const name = rule.selector.slice('.cms-text-'.length)
  for (const decl of declarations(tokens, rule.selector)) properties.push({ prop: `--type-${name}-${decl.prop}`, value: decl.value })
})
let output = '// GENERATED from ../../tokens.css and ../../components.css. Do not edit.\n'
tokens.walkAtRules('import', rule => { output += `@import ${rule.params};\n` })
output += `\n@mixin tokens {\n${lines(properties)}\n}\n`
output += `\n@mixin tokens-dark {\n${lines(declarations(tokens, '[data-theme="dark"]'))}\n}\n`
tokens.walkRules(/^\.cms-text-/, rule => {
  const name = rule.selector.slice('.cms-text-'.length)
  output += `\n@mixin type-${name} {\n${lines(declarations(tokens, rule.selector))}\n}\n`
})
const mixins = {
  button: '.cms-btn', 'button-md': '.cms-btn.cms-btn--md', 'button-primary': '.cms-btn.cms-btn--primary',
  'button-secondary': '.cms-btn.cms-btn--secondary', badge: '.cms-tag',
  'badge-success': '.cms-tag.cms-tag--success', 'badge-warning': '.cms-tag.cms-tag--warning', 'badge-danger': '.cms-tag.cms-tag--danger',
}
for (const [name, selector] of Object.entries(mixins)) {
  output += `\n@mixin ${name} {\n${lines(declarations(components, selector))}\n}\n`
}
const directory = new URL('../src/styles/', import.meta.url)
mkdirSync(directory, { recursive: true })
const destination = new URL('_base.generated.scss', directory)
let previous = ''
try { previous = readFileSync(destination, 'utf8') } catch (error) { if (error.code !== 'ENOENT') throw error }
if (previous !== output) writeFileSync(destination, output)
console.log('Synced parent CMS-26 colors, radii, spacing, typography, fonts, buttons and badges.')
