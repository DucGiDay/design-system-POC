---
target: "vxe-table-poc Dashboard (AI slop vs Figma 136:3962)"
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\duc.hoang01\\Documents\\duc\\ipos\\projects\\design-system\\vxe-table-poc\\src\\components\\dashboard\\DashboardPage.vue"
target_fingerprint: "sha256:d40ea948418bfe956a823e55fe8268a89fd324802882c14451c039fab2255550"
target_path: "C:\\Users\\duc.hoang01\\Documents\\duc\\ipos\\projects\\design-system\\vxe-table-poc\\src\\components\\dashboard\\DashboardPage.vue"
timestamp: 2026-11-05T09-21-26Z
slug: rc-components-dashboard-dashboardpage-vue-c6491dc5
---
Method: dual-agent (A: design review · B: detector + browser overlay)

# AI slop — Dashboard vxe-table-poc vs Figma CMS-26 136:3962

Slop: code 4/10, Figma ~6/10. Code removed more slop than it added; most remaining slop is Figma-owned. Worst code-introduced issue: period logic.

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | No freshness stamp; hero says "so với hôm qua" for 7-day/month |
| 2 | Match System / Real World | 3 | Good F&B terms; store names differ between filter and reports |
| 3 | User Control and Freedom | 3 | Esc/Apply ok; period vs date range relation unclear |
| 4 | Consistency and Standards | 2 | Two "7 ngày" windows 1 day apart; language switch twice |
| 5 | Error Prevention | 3 | Date validation; Apply disabled with 0 stores |
| 6 | Recognition Rather Than Recall | 3 | Report section fixed to 7 days regardless of filter |
| 7 | Flexibility and Efficiency | 2 | No shortcuts; "Chi tiết" only repeats card rows; no export |
| 8 | Aesthetic and Minimalist Design | 2 | Hero art + greeting ~40% of first screen at 1280x720 |
| 9 | Error Recovery | 2 | Missing-cost warnings without fix link |
| 10 | Help and Documentation | 2 | Help icon opens placeholder |
| Total | | 24/40 | Acceptable |

## Design Specificity
- Figma-owned: greeting hero, 3D illustration, delta chips without window, uppercase tracked label, uniform 3x3 cards, fat donut, empty-state art, crowded topbar.
- Removed by code: KPI icon chips, 4 shadowed KPI cards, hatched orange bars, kebab menus, AI gradient pill.
- Added by code: navy dark theme, hard-coded "+13,9% so với hôm qua" and KPI deltas (DashboardPage.vue:143, :61-63, vi.json:28), magic periodScale 12.7006.
- Detector: CLI 0 (regex-only on .vue, undercount). Overlay 7 @1540, 8 @1280: low-contrast accent-text/accent-soft 4.2:1 (dashboard.scss:35,117), CmsSegmented inactive 4.4:1, 11px body text (dashboard.scss:144,161), straggler @1280 (dashboard.scss:136). False positives: repeating-gradient (chart gridlines), "T2" contrast (sampled wrong bg).

## Priority Issues
- [P0] Period logic lies: hard-coded comparisons/deltas/hints; hero 7-day 07–13/10 vs card 06–12/10. Fix: derive from period + same dataset; scope filter visibly. /impeccable harden
- [P1] Fixed chrome + decorative hero eat laptop viewport (≈450px before any report at 1280x720). Fix: one-row header, hero ~140px without art (needs Figma sign-off). /impeccable layout
- [P1] "Chi tiết" dead end (dialog repeats rows). Fix: deep-link to report module with filters. /impeccable clarify
- [P2] Token contrast + 11px body text. Fix: darker accent-text (~#9a4f05), segmented inactive ink-2, body ≥12px. /impeccable audit
- [P2] Ragged/stretched cards, page ends on two empty channel cards, navy dark theme with light-only art. Fix: align-items start, merge empty states, surface warnings higher, neutral dark. /impeccable layout

## Persona Red Flags
- Alex: no shortcuts, search only 7 report names, no export, 7 extra tab stops on bars, no deep-link.
- Sam: aria-label on role-less div (DashboardPage.vue:154), KPI labels as h2, delta window only in title, meters without value text.
- Kế toán/vận hành: numbers don't reconcile across periods, "128 hoá đơn" vs 18, no freshness stamp, warnings without fix link.

## Minor
Tooltip pinned on T7 disappears after first mouseleave; orange rank-1 chip; person photo as store avatar; 13-layer % positioned hero art; duplicate language switch.

## Questions
- What does an owner need at 9am — why is the biggest block a laptop illustration?
- Should README deviations be pushed back into CMS-26?
- Should the home own the period filter when the report grid ignores it?
