# Desktop navigation · CMS-26

Mode: Operate. Scope: virtual-table-poc and vxe-table-poc. Mobile is deferred.

## Approved interaction

Home uses the full 248px main menu. Inside a module, the main menu becomes a 68px icon rail; clicking an icon navigates directly. Reports adds its own 260px sidebar. The separate panel button below the FABI logo opens the full main menu as a modal left drawer with a backdrop. Opening it does not reflow content. Escape, clicking the backdrop, or the drawer close button dismisses it; the current route, report expansion and search remain intact. Choosing a module dismisses it and navigates.

The report tree demonstrates Báo cáo → Báo cáo A → A01 → A01.1. Clicking a name opens its page; the separate chevron expands/collapses children. Breadcrumbs and hash links preserve the hierarchy and support browser history and reload. Search matches names or codes without requiring Vietnamese accents, includes matching ancestors, and has a clearable empty state. Content is text only, as requested.

## Visual authority

Parent PRODUCT.md, DESIGN.md, tokens.css and components.css remain authoritative. Figma CMS-26 Home node 248:8820 and Reports node 136:12327 supply the sidebar structure, dimensions and local image assets. Be Vietnam Pro, the existing palette and radius tokens are inherited. The sidebar surface #edf0f7 comes directly from these Figma frames. No new visual identity is introduced.

## Verification

Desktop capture targets: 1440×1000 and 1280×720 in both apps. Evidence is in ../review/{virtual,vxe}-{home,reports,overlay}-*.png. Navigation browser tests live in vxe-table-poc/tests/navigation.spec.ts and exercise both local origins. The original table demos remain accessible at ?demo=table.
