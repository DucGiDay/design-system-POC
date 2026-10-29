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
const properties = [...declarations(tokens, ':root'), { prop: '--font-sans', value: font.value }]
let output = '// GENERATED from ../../tokens.css and ../../components.css. Do not edit.\n'
tokens.walkAtRules('import', rule => { output += `@import ${rule.params};\n` })
output += `\n@mixin tokens {\n${lines(properties)}\n}\n`
output += `\n@mixin tokens-dark {\n${lines(declarations(tokens, '[data-theme="dark"]'))}\n}\n`
tokens.walkRules(/^\.t-/, rule => {
  const name = rule.selector.slice(3)
  output += `\n@mixin type-${name} {\n${lines(declarations(tokens, rule.selector))}\n}\n`
})
const mixins = {
  button: '.btn', 'button-md': '.btn.md', 'button-primary': '.btn.chinh',
  'button-secondary': '.btn.phu', badge: '.tag',
  'badge-success': '.tag.thanh-cong', 'badge-warning': '.tag.canh-bao', 'badge-danger': '.tag.loi',
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
console.log('Synced parent CMS-26 colors, radii, typography, fonts, buttons and badges.')
