# VxeTable PoC

Mode: Operate. Code-led, narrowly specified table experiment in the existing CMS-26 world.

Developers test 10,000 mock records, virtual rendering, built-in row/column dragging and 50-row append batches. Light office desktop use: preserve Be Vietnam Pro, iPOS blue, soft status pairs, 13px cells, flat surfaces and existing radius tokens. The compact header leads directly into a full-width 600px table, its controls and status footer. Recent action logs follow the table. On mobile controls wrap and the data table scrolls horizontally within its container.

The signature interaction is the jump-to-bottom control: it makes a 10,000-row infinite-scroll test immediately reachable. No decorative motion; drag animations disabled for performance. Preserve the parent's PRODUCT.md, DESIGN.md and design metadata. No system redesign or benchmark claims.

Documentation update (2026-10-28): parent folder is the authoritative base design, as explicitly requested by the user. scripts/sync-design.mjs parses parent tokens.css and components.css into src/styles/_base.generated.scss before dev/build. Colors, radii, font import, typography and button/badge mixins are generated rather than maintained as a local copy. Semantic aliases, app reset, component usage, VxeTable mapping and layout are separate SCSS modules. Removed all independent --poc-* color overrides; status styles now inherit the exact parent tag declarations. Muted text on page ground uses the existing ink-2 token. Parent files are unchanged. Build passed; no browser/server was started for this refactor because the user wants to run it themselves. Earlier screenshots and interaction checks predate this SCSS refactor.
