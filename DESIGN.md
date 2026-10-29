---
name: CMS-26
description: Design system cho FABI CMS — giao diện quản trị chuỗi F&B, dựng từ Figma CMS-26.
colors:
  primary: "#0560a6"
  primary-strong: "#044a80"
  primary-text: "#0b4f86"
  primary-soft: "#e3eef9"
  primary-tint: "#eef4ff"
  primary-50: "#eef4ff"
  primary-100: "#e3eef9"
  primary-200: "#b1d0f0"
  primary-300: "#7eafe3"
  primary-400: "#498cce"
  primary-500: "#0560a6"
  primary-600: "#044a80"
  primary-700: "#013c6b"
  primary-800: "#012f56"
  primary-900: "#002242"
  primary-950: "#00172e"
  violet: "#6039ef"
  violet-text: "#4c2bc4"
  violet-soft: "#eeeafe"
  accent: "#f7941d"
  accent-text: "#b45f06"
  accent-soft: "#fff3e3"
  ink: "#0f172a"
  ink-2: "#334155"
  ink-muted: "#64748b"
  ink-faint: "#94a3b8"
  line-strong: "#cbd5e1"
  line: "#e8ecf2"
  line-soft: "#eef0f3"
  surface: "#ffffff"
  field: "#f3f5f8"
  ground: "#f4f6fa"
  subtle: "#f8fafc"
  success: "#16a34a"
  success-text: "#15803d"
  success-soft: "#e8f7ee"
  warning: "#d97706"
  warning-soft: "#fdf7f0"
  danger: "#d92d20"
  danger-soft: "#fdf2f2"
typography:
  display-number:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "44px"
    fontWeight: 300
    lineHeight: "52px"
    letterSpacing: "-1.5px"
  page-title:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: "36px"
    letterSpacing: "-0.5px"
  section:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
    letterSpacing: "-0.2px"
  number-md:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: "32px"
    letterSpacing: "-0.5px"
  card-title:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "24px"
  body:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22px"
  body-medium:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "22px"
  body-semibold:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "22px"
  cell:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
  caption:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "18px"
  overline:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0.6px"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  full: "999px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-primary-sm:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "7px 10px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-subtle:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-ai:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  input-field-readonly:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "40px"
  input-search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "36px"
  nav-item:
    textColor: "{colors.ink-2}"
    typography: "{typography.body-medium}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
    height: "44px"
  nav-item-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-semibold}"
    rounded: "{rounded.md}"
  card-kpi:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-block:
    backgroundColor: "{colors.subtle}"
    rounded: "{rounded.lg}"
    padding: "16px"
  tag-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success-text}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  tag-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  tag-info:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.primary-text}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  tag-neutral:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  tag-error:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  dialog:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
    width: "440px"
  menu-popover:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "6px"
---

# Design System: CMS-26

## Overview

**Creative North Star: "The Operations Desk" (Phòng điều phối)**

CMS-26 là một bàn điều phối: sáng, gọn, mọi công cụ nằm đúng chỗ, và dữ liệu vận hành của chuỗi là nhân vật chính. Nền là các lớp trắng và xám lạnh rất nhạt. Màu Xanh iPOS chỉ đánh dấu hành động chính và trạng thái đang chọn. Mọi thứ khác lùi lại để số liệu, bảng và form được đọc dễ dàng trong nhiều giờ làm việc.

Hệ thống có hai giọng, chia theo vùng. **Vùng dữ liệu** (bảng, ô bảng, số liệu, KPI) theo tinh thần *tiết chế, chính xác*: bo góc nhỏ, đường kẻ mảnh, nhịp chữ chặt, không trang trí. **Khung layout, card bên ngoài và các giao diện còn lại** theo tinh thần *mềm, thân thiện*: bo góc 10–14px, nền xám nhạt phân lớp, bóng rất nhẹ cho mục đang chọn. Hai giọng này dùng chung một bộ token. Khác biệt nằm ở cách áp dụng bo góc, mật độ và bóng.

Figma CMS-26 là nguồn gốc. Mọi giá trị dưới đây được trích từ `tokens.css` và `components.css`, vốn được dựng để khớp Figma.

**Key Characteristics:**
- Phẳng khi tĩnh. Ranh giới chủ yếu là viền 1px lạnh (`line`), bóng chỉ dành cho lớp nổi.
- Một màu hành động chính (Xanh iPOS). Tím chỉ cho AI, cam chỉ cho nhấn mạnh và cảnh báo.
- Một font duy nhất, Be Vietnam Pro, với thang chữ chi tiết cho bảng và số liệu.
- Desktop là chính. Các component có kích thước cố định theo Figma.

## Colors

Bảng màu xám lạnh, sạch, với một màu xanh dương chủ đạo và hai màu phụ có vai trò rất hẹp.

### Primary
- **Xanh iPOS** (`primary`): nút chính, trạng thái "đang làm", viền focus của trường nhập, mục được chọn. `primary-strong` dùng cho trạng thái nhấn hoặc đậm hơn. `primary-text` dùng cho link và chữ xanh trên nền sáng. `primary-soft` là vòng focus 3px. `primary-tint` là nền tag thông tin.
- **Thang Xanh iPOS** (`primary-50` → `primary-950`): 500 là `primary`, 600 là `primary-strong`, 100 là `primary-soft`, 50 là `primary-tint`. Các bậc còn lại nội suy theo OKLCH cùng hue, không có trong Figma. Component dùng token ngữ nghĩa; thang số chỉ dùng khi cần một bậc chưa có tên (biểu đồ, dark theme). Thang không đổi theo theme.

### Dark theme
Chưa có trong Figma, được dựng trong `tokens.css` dưới `[data-theme="dark"]`. Cùng tên token, chỉ đổi giá trị, nên component không cần biết theme. Ứng dụng đặt `data-theme="dark"` trên `<html>`.
- **Nền:** sáng dần khi nổi lên, `ground` (#0d141e) < `surface` (#141c27) < `subtle` < `field`. Viền `line` vẫn là ranh giới chính.
- **Primary:** lên bậc 300; `primary-strong` và `primary-text` là bậc 200; `primary-soft` là 800, `primary-tint` là 900. Chữ trên nút chính dùng `surface` (tối), tương phản 7.4:1.
- **Tím, cam, trạng thái:** bản sáng hơn cho màu chữ/đặc, bản `-soft` là nền tối cùng hue. Mọi cặp Soft-Pair đạt ≥ 6:1.

### Secondary
- **Tím AI** (`violet`, `violet-text`, `violet-soft`): chỉ dùng cho nút AI và Chip AI. Màu này báo hiệu "đây là tính năng AI" và không dùng vào việc gì khác.

### Tertiary
- **Cam Bếp** (`accent`, `accent-text`, `accent-soft`): điểm nhấn ấm, chấm chú thích, chữ của tag cảnh báo.

### Neutral
- **Mực** (`ink`): tiêu đề và giá trị chính. `ink-2` là chữ thân và nhãn. `ink-muted` là mô tả, placeholder, đơn vị. `ink-faint` là chữ mờ nhất và icon phụ.
- **Viền** (`line`): viền mặc định của card, trường nhập, popover. `line-strong` dùng cho hover và khung nét đứt đậm. `line-soft` là vạch dưới ô bảng.
- **Bề mặt** (`surface`): card, dialog, trường nhập. `ground` là nền section và nền trường chỉ xem. `field` là nền nút nhạt và trạng thái tạm ngưng. `subtle` là nền Card/Khối và hover.

### Status
- **Thành công** (`success`, `success-text`, `success-soft`), **Cảnh báo** (`warning`, `warning-soft`), **Lỗi** (`danger`, `danger-soft`). Luôn dùng theo cặp: nền `-soft` đi với chữ đậm cùng họ màu.

### Named Rules
**The One Action Color Rule.** Xanh iPOS là màu hành động duy nhất. Tím chỉ cho AI, cam chỉ cho nhấn và cảnh báo. Không dùng hai màu này cho nút chính.

**The Soft-Pair Rule.** Mọi tag và trạng thái đều là nền nhạt kèm chữ đậm cùng họ màu, không bao giờ là nền đặc kèm chữ trắng.

## Typography

**Body Font:** Be Vietnam Pro (fallback `sans-serif`), dùng cho mọi vai trò, các weight 300–700.

**Character:** Một font sans hiện đại hỗ trợ dấu tiếng Việt đầy đủ. Thứ bậc được tạo bằng weight và letter-spacing âm ở cỡ lớn, không dùng font thứ hai.

### Hierarchy
- **Display Number** (300, 44/52, -1.5px): con số lớn nhất trên trang chủ báo cáo.
- **Page Title** (600, 28/36, -0.5px): tiêu đề trang.
- **Section** (600, 20/28, -0.2px): tiêu đề nhóm, tiêu đề section.
- **Number MD** (500, 24/32, -0.5px): số liệu cỡ vừa.
- **Card Title** (600, 16/24): tiêu đề card.
- **Body / Medium / Semibold** (400/500/600, 14/22): chữ thân, nhãn menu, giá trị trường nhập.
- **Cell** (400, 13/20): ô bảng và chữ phụ dày đặc.
- **Label** (500, 12/16): nhãn nhỏ, chip, tag.
- **Caption** (400, 12/18): mô tả, chú thích.
- **Overline** (600, 11/16, +0.6px): nhãn nhóm menu.

### Named Rules
**The Tight-Large Rule.** Chữ từ 20px trở lên dùng letter-spacing âm. Chữ dưới 20px giữ spacing 0, riêng Overline dùng +0.6px.

**The Cell Is 13 Rule.** Nội dung bảng dùng 13/20. Không dùng 14px trong ô bảng, để bảng giữ được mật độ.

## Layout

Layout cố định cho desktop. Component có chiều rộng chuẩn theo Figma: nav item 216px, search 240px, trường form 350px, KPI card 272px, Card/Khối 560px, dialog 440px. Khoảng cách bên trong theo bước 2/4/6/8/10/12/14/16/24px. Gap giữa phần tử trong component thường là 6–8px, padding card 16px, padding dialog 24px. Spacing chưa được token hoá mà nằm trực tiếp trong `components.css`. Trang tham chiếu không có breakpoint responsive.

## Elevation & Depth

Hệ thống phẳng khi tĩnh. Độ sâu tạo bằng phân lớp nền (`ground` → `subtle` → `surface`) và viền 1px. Bóng có màu mực lạnh `rgba(15,23,42,…)` và chỉ xuất hiện ở ba trường hợp: mục đang chọn, lớp nổi (popover, dialog, tooltip) và vòng focus.

### Shadow Vocabulary
- **Raised-select** (`0 2px 6px rgba(15,23,42,.04), 0 1px 2px rgba(15,23,42,.06)`): nav item và segment đang chọn, nhấc nhẹ khỏi nền xám.
- **Overlay** (`0 2px 6px rgba(15,23,41,.06), 0 16px 40px rgba(15,23,41,.14)`): menu popover, dropdown.
- **Dialog** (`0 16px 40px -4px rgba(15,23,41,.14), 0 2px 6px rgba(15,23,41,.06)`): hộp thoại.
- **Tooltip** (`0 4px 12px rgba(15,23,41,.16)`): tooltip của menu.
- **Focus ring** (`0 0 0 3px #e3eef9` cho trường nhập, `0 0 0 3px rgba(5,96,166,.14)` cho bộ chọn thương hiệu đang mở).
- **Inside stroke** (`inset 0 0 0 1px var(--line)`): mô phỏng stroke "inside" của Figma, ví dụ cho nút phụ, mà không chiếm layout.

### Named Rules
**The Flat-At-Rest Rule.** Card và bảng không có bóng. Bóng chỉ dành cho trạng thái được chọn hoặc lớp nổi lên trên nội dung.

## Shapes

Có ba bậc bo góc rõ ràng:
- **Nhỏ** (`sm`, 6px): tag, trạng thái, badge. Đây là bậc cho vùng dữ liệu.
- **Vừa** (`md`, 10px): nút, trường nhập, nav item, segmented, khung nét đứt.
- **Lớn** (`lg`, 14px): card, dialog, popover.

`full` dùng cho avatar và chấm tròn. Viền luôn 1px. Khung tải ảnh và vùng đặt nội dung dùng nét đứt 4/4 màu `line` hoặc `line-strong`.

## Components

### Buttons
Mềm, chắc chắn, không viền nổi.
- **Shape:** bo 10px (`md`). Weight 600. Icon và chữ cách nhau 6px.
- **Kích thước:** MD có padding 8×14 và chữ 13/20. SM có padding 7×10 và chữ 12/18.
- **Chính:** nền Xanh iPOS, chữ trắng.
- **Phụ:** nền trắng, chữ `ink-2`, viền trong 1px `line`.
- **Nhạt:** nền `field`, chữ `ink-2`. Dùng cho hành động thứ cấp trong khu dày đặc.
- **AI:** nền tím, chữ trắng. Chỉ dùng cho hành động AI.
- **Nguy hiểm:** nền `danger-soft`, chữ `danger`. Hành động phá huỷ không bao giờ dùng nền đỏ đặc.

### Tags & Status
Tiết chế. Thuộc vùng dữ liệu.
- **Style:** padding 2×8, bo 6px, chữ 12/18 weight 500, theo Soft-Pair Rule.
- **Tag:** thành công / cảnh báo / thông tin / trung tính / lỗi.
- **Trạng thái:** chờ / đang làm / hoàn tất / huỷ / tạm ngưng.

### Cards / Containers
- **Card/KPI:** nền trắng, viền `line`, bo 14px, padding 16. Giá trị chính là 30/36 weight 600, đơn vị dùng `ink-muted`.
- **Card/Khối:** nền `subtle`, viền `line`, bo 14px, padding 16. Phần thân trắng chứa biểu đồ hoặc nội dung.
- **Shadow Strategy:** không có bóng (Flat-At-Rest).

### Inputs / Fields
- **Style:** cao 40px, nền trắng, viền 1px `line`, bo 10px, chữ 14px. Nhãn 13px weight 500 màu `ink-2`. Dấu bắt buộc dùng màu `danger`.
- **Hover:** viền chuyển sang `line-strong`.
- **Focus:** viền `primary` kèm vòng 3px `primary-soft`.
- **Chỉ xem:** nền `ground`, không viền.
- **Search:** cao 36px, rộng 240px, placeholder màu `ink-muted`.

### Navigation
- **Nav item:** cao 44px, rộng 216px, bo 10px, chữ 14px weight 500 màu `ink-2`. Khi đang chọn: nền trắng, chữ weight 600 màu `ink`, bóng Raised-select, nằm trên nền xám.
- **Sidebar V2:** thanh icon kết hợp bảng menu 3 cấp, có nhãn nhóm dạng Overline.
- **Segmented:** padding 4, nền gradient `#eceff4` → `#f8f9fb` có bóng trong. Biến thể tối là kính mờ (blur 8px).

### Bảng (Data Grid)
Tiết chế, chính xác.
- Ô bảng dùng chữ Cell 13/20 và vạch dưới 1px `line-soft`. Không có viền dọc. Tag trong ô theo bậc bo 6px.

### Brand Picker & Scope Chip
Đây là component đặc trưng của hệ thống: bộ chọn thương hiệu (logo + tên) và chip phạm vi cửa hàng (danh sách cửa hàng rút gọn kèm "+N"). Khi bộ chọn mở, nó có vòng focus 3px xanh nhạt.

### Dialog
Rộng 440px, padding 24, bo 14px, bóng Dialog. Tiêu đề 18/26 weight 600, mô tả 14/22 `ink-muted`. Các nút ở chân dialog căn phải, cách nhau 8px.

## Do's and Don'ts

### Do:
- **Do** lấy màu, bo góc và chữ từ token trong `tokens.css`. Khi Figma CMS-26 và code khác nhau thì Figma thắng.
- **Do** dùng bo 6px và chữ Cell 13/20 trong vùng bảng và số liệu, và bo 10–14px cho khung, card, form.
- **Do** để card và bảng phẳng. Chỉ dùng bóng cho mục đang chọn, popover, dialog và tooltip.
- **Do** dùng cặp nền nhạt kèm chữ đậm cho mọi tag và trạng thái.
- **Do** thể hiện focus của trường nhập bằng viền `primary` và vòng 3px `primary-soft`.

### Don't:
- **Don't** dùng tím ngoài các tính năng AI, hoặc dùng cam làm màu cho nút chính.
- **Don't** dùng nền đỏ đặc cho hành động nguy hiểm. Dùng `danger-soft` kèm chữ `danger`.
- **Don't** thêm font thứ hai. Be Vietnam Pro đảm nhận mọi vai trò.
- **Don't** thêm bóng cho card hay bảng khi chúng ở trạng thái tĩnh.
- **Don't** hardcode hex khi đã có token tương ứng.
