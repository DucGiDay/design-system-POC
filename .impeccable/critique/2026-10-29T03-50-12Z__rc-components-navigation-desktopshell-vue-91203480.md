---
target: sidebar desktop hiện tại
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
target_identity: "file:C:\\Users\\duc.hoang01\\Documents\\duc\\ipos\\projects\\design-system\\virtual-table-poc\\src\\components\\navigation\\DesktopShell.vue"
target_fingerprint: "sha256:a2d4fe21805f35d759a2ae78b2ac7f35abd7502a266e22f1827fe8b327f8f8e9"
target_path: "C:\\Users\\duc.hoang01\\Documents\\duc\\ipos\\projects\\design-system\\virtual-table-poc\\src\\components\\navigation\\DesktopShell.vue"
timestamp: 2026-10-29T03-50-12Z
slug: rc-components-navigation-desktopshell-vue-91203480
---
Method: dual-agent (A: /root/critique_design_a · B: /root/critique_evidence_b)

# CMS-26 sidebar review

## Design specificity and overall impression

The current C+A desktop structure is sound. It preserves CMS-26's calm operations interface: Be Vietnam Pro, cool pale surfaces, restrained blue selection and domain-specific module groups. No structural replacement is justified. The content is intentionally a placeholder and is outside the critique.

## Design health

| Heuristic | Score /4 | Evidence |
|---|---:|---|
| System status | 3 | Breadcrumb and selection establish location. |
| Match with real world | 3 | Vietnamese business module names are recognisable. |
| Control and freedom | 4 | History, Escape, backdrop and close control work. |
| Consistency | 3 | Main-menu chevrons imply expansion but navigate. |
| Error prevention | 3 | Page selection and branch expansion are distinct. |
| Recognition over recall | 2 | Small codes and icon rail require scanning. |
| Flexibility and efficiency | 2 | Code search works; no accelerator was established. |
| Aesthetic and minimalist design | 3 | Quiet shell; deep report rows are cramped. |
| Error recovery | 3 | Empty search offers clear recovery. |
| Help and documentation | 2 | Basic tooltips and support affordance. |
| Total | 29/40 | Good foundation with navigation refinements. |

## Strengths

- Separate global and contextual navigation keeps four levels manageable.
- Active leaf, breadcrumb and page title reinforce the same location.
- Modal dismissal, keyboard focus wrapping and history work; there is no document horizontal overflow at inspected desktop sizes.

## Priority issues

1. [P2] Deep report rows are cramped. The 260px panel combines nested indentation, 11px codes, labels, counts and disclosure controls. A01.1/A01.2 wrap and the code is hard to scan. Try a 288px panel, stable 12px code column and less indentation. Suggested command: impeccable layout / shape.
2. [P2] Down chevrons on main-module links promise expansion while activating navigation. Remove them from module links; reserve chevrons for real tree disclosure. Suggested command: impeccable clarify.
3. [P2] Expanded main navigation does not reliably reveal the current module. At1280×720 the overlay list ends at y620 while the active Reports row is y684–718. Returning Home may retain a compact-rail scroll position and clip the first modules. Reveal active items on mode changes and reset Home to the top; make overflow discoverable. Suggested command: impeccable harden.

## Minor observations

- The current menu trigger hardcodes aria-expanded=false even when opening its modal. Keep the state accurate.
- Search correctly matches unaccented text but retains total16 and the label All reports; distinguish matched and total counts.
- The compact rail's active Reports icon is visible at1280×720 and explicit scroll controls work. The concern is the expanded menu, not all rail scrolling.

## People and cognitive load

An accountant repeatedly scanning codes is slowed by tiny codes and cramped deep rows. A new manager may mistake main-menu chevrons for disclosure. Keyboard users benefit from skip navigation, focus rings and a closable, trapped modal. Cognitive load is moderate, with a seven-item main group and a narrow deep tree as the pressure points. Screen-reader behavior was not audited.

## Shape direction

Refine the current shell, rather than replacing it: a slightly wider report sidebar, clearer code column, lighter hierarchy guides, a visible Menu label, honest module affordances and active-item visibility. Preserve direct module navigation and backdrop menu. A separate HTML prototype lets the user compare without replacing either Vue app.

## Deterministic evidence

One independent detector invocation on both current navigation source directories exited0 with output[]. No source rules or locations were flagged. This does not establish runtime accessibility. Native browser inspection covered both variants at1440×900 and1280×720. Mutable injection failed because the title property was read-only; there is no user-visible detector overlay. Rendered screenshots, read-only DOM metrics, interaction checks and source supplied fallback evidence. Both assessment tabs were closed and viewport overrides reset. No detector live-server was started. Screenshots and structured observations remain under .impeccable/critique/current/{a,b}/.
