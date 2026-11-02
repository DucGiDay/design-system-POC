# CMS-26 · Lộ trình

Mục tiêu: để người khác (và AI) prompt ra phần lớn màn hình FABI CMS một cách nhất quán.

**Đường găng:** 1 → 2 → 3 → 7 → 10 (chốt quyết định → `AGENTS.md` → token hoá spacing → component đợt 1 → mẫu trang danh sách). Xong chuỗi này (khoảng 2–3 tuần) là đủ dùng.

Ký hiệu: ✅ xong · 🟡 đang làm / làm một phần · ⬜ chưa làm

Cập nhật lần cuối: 2026-11-02

## Tổng quan tiến độ

| Ưu tiên | Nội dung | Trạng thái |
| --- | --- | --- |
| 1 | Chốt quyết định | 🟡 Đã ghi mặc định tạm, chưa chốt mục nào |
| 2 | `AGENTS.md` ở gốc repo | ✅ Đã viết (chưa commit) |
| 3 | Token hoá spacing, chuẩn hoá icon | 🟡 Spacing xong, icon có `AppIcon` nhưng chưa lấy từ bộ gốc |
| 4 | Bộ component Vue cơ bản | 🟡 Đợt 1 xong ở `virtual-table-poc`, đợt 2 và đóng gói bảng chưa làm |
| 5 | Mẫu trang | ⬜ |
| 6 | Bổ sung thiết kế còn thiếu (Figma) | 🟡 Có quy ước tạm, chờ designer |
| 7 | Dọn tài liệu tham chiếu | ⬜ |

**Việc tiếp theo trên đường găng:** chốt 4 quyết định ở Ưu tiên 1, hoàn tất icon (mục 6), rồi làm mẫu trang danh sách (mục 10).

## Ưu tiên 1 · Chốt quyết định (1–2 ngày, cần người quyết)

Nhanh nhưng chặn mọi việc phía sau. Chưa chốt thì AI và từng dev sẽ tự chọn, mỗi người một kiểu.

| # | Quyết định | Trạng thái | Hiện tại |
| --- | --- | --- | --- |
| 1 | Thư viện bảng: TanStack (`virtual-table-poc`) hay vxe-table (`vxe-table-poc`) | ⬜ Chờ chốt | Hai POC chạy song song, cùng layout và navigation |
| 2 | Đơn vị: `px` theo Figma hay `rem`. Ghi rõ ngoại lệ | ⬜ Chờ chốt | Mặc định tạm: trang HTML giữ `px`, code Vue dùng `rem`, `px` cho viền 1px |
| 3 | i18n: có đa ngôn ngữ hay không | ⬜ Chờ chốt | `virtual-table-poc` đã có `vue-i18n` (vi/en), `vxe-table-poc` chưa có. `PRODUCT.md` vẫn ghi "chưa được quyết định" |
| 4 | Phạm vi dark theme và tính năng AI | ⬜ Chờ chốt | Token dark có sẵn, không bắt buộc thiết kế riêng. Tím/nút AI chỉ dùng khi có tính năng AI |

Khi chốt: sửa bảng "Quyết định tạm thời" trong `AGENTS.md`, cập nhật `PRODUCT.md` (mục Ngôn ngữ, AI) và `DESIGN.md` nếu đổi đơn vị.

## Ưu tiên 2 · `AGENTS.md` ở gốc repo (nửa ngày) ✅

Đã có `AGENTS.md` (và `CLAUDE.md` trỏ về nó). Chưa commit vào git.

- [x] Stack đích (Vue 3, hai phương án bảng)
- [x] Thứ tự đọc tài liệu
- [x] Bảng tra "cần X thì dùng Y" theo nhóm component
- [x] Các quyết định (đang ở dạng mặc định tạm, sửa lại sau khi chốt Ưu tiên 1)
- [x] Điều cấm: không chép toạ độ tuyệt đối / `ds-*`, không hardcode hex, quy ước đặt tên `cms-` BEM
- [x] Cách xử lý tạm khi Figma chưa có thiết kế (`TODO(design)`)
- [x] Checklist trước khi bàn giao

## Ưu tiên 3 · Token hoá spacing, chuẩn hoá icon (1–2 ngày)

Phải xong trước khi viết component, để component dùng token ngay từ đầu.

| # | Việc | Trạng thái | Hiện tại |
| --- | --- | --- | --- |
| 5 | Thêm `--space-*` vào `tokens.css` (bước 2/4/6/8/10/12/14/16/24), cập nhật `sync:design` của cả hai POC | ✅ | `--space-2` … `--space-24` (px) trong `tokens.css`. `sync:design` của hai POC đổi sang rem. Tailwind của Option 1 trỏ bậc `0.5`…`6` vào token. Đã ghi vào `DESIGN.md`, `AGENTS.md`. Việc sau: chuyển px trong `components.css` sang token |
| 6 | Component `<Icon name>` dùng bộ `assets/icons`, bỏ dần SVG export riêng từng trang | 🟡 | Cả hai POC đã có `src/components/icon/AppIcon.vue` (vẽ bằng mask, ăn theo `color`). Nhưng icon được chép tay vào `src/assets/icons` (mới 8/92), chưa lấy thẳng từ `assets/icons` gốc. `AGENTS.md` vẫn ghi "Sẽ có component `<Icon name>`" |

Còn lại cho mục 6: cho `sync:design` (hoặc alias Vite) lấy icon từ `assets/icons` gốc, rồi cập nhật dòng Icon trong `AGENTS.md` trỏ tới `AppIcon`.

## Ưu tiên 4 · Bộ component Vue cơ bản (1–2 tuần)

Lõi của tính nhất quán. Mỗi component có props và variant rõ, đủ state default / hover / focus / disabled, có error / loading khi phù hợp.

### 7. Đợt 1 (dùng trên mọi màn hình) ✅

Làm trong `virtual-table-poc/src/components/ui/` (chỉ Option 1, theo quyết định ngày 2026-11-02). Xem mọi trạng thái ở route `/ui`. Bảng tra props nằm trong `AGENTS.md`.

| Component | Trạng thái | Ghi chú |
| --- | --- | --- |
| Button, IconButton | ✅ | `CmsButton` (5 variant, md/sm, icon, loading, disabled), `CmsIconButton` (ghost/outline) |
| Field (input, textarea, select) | ✅ | `CmsField` làm khung, `CmsInput`, `CmsTextarea`, `CmsSelect`. Có hint, error, readonly (icon khoá), disabled |
| Tag/Status | ✅ | `CmsTag` (5 tone), `CmsStatus` (5 trạng thái) |
| Dialog | ✅ | `CmsDialog` dựng trên `<dialog>` gốc: khoá focus, Esc, bấm nền mờ để đóng, `closable` |
| Pagination | ✅ | `CmsPagination`: tổng dòng, số dòng mỗi trang, tối đa 7 nút trang |
| PageHeader | ✅ | `CmsPageHeader`: tiêu đề, mô tả, slot `#actions` |

Còn lại:
- Đã xem `/ui` ở 1440×1000 và 1280×720 (2026-11-02): sửa focus ô chỉ xem, quầng đỏ ô lỗi, mũi tên ô số, khoá cuộn khi mở hộp thoại.
- Token màu còn thiếu vai trò (warning-text, danger-text, backdrop, bóng…): danh sách đề xuất đang chờ duyệt.
- Các màn cũ chưa chuyển sang component mới: auth (`auth.scss`), `StatusBadge.vue` và `.fb-button` trong `_components.scss`.
- `vxe-table-poc` chưa có bộ này. Nếu chọn Option 2 thì chuyển sang (bỏ Tailwind ở trang `/ui`).
- Chưa có component cho các nút trên header (`cms-header-btn`: gia hạn, ngôn ngữ).

### 8. Đợt 2

| Component | Trạng thái | Ghi chú |
| --- | --- | --- |
| Switch, Checkbox, Radio/ChoiceCard | ⬜ | |
| Dropdown/Menu | ⬜ | |
| SearchBox | ⬜ | |
| BrandPicker, ScopeChip | 🟡 | Đã có trong `MainNavigation.vue` của cả hai POC, chưa tách thành component riêng |
| Card/KPI, Card/Khối | ⬜ | |
| Upload | ⬜ | |

### 9. Đóng gói bảng theo thư viện đã chọn

🟡 Phụ thuộc quyết định #1.

- `VirtualTanStackTable.vue`: đã dùng chữ cell (`fb-text-cell`) và vạch `line-soft`, nhưng chưa dùng `cms-cell`, chưa có phân trang (đang cuộn tải thêm).
- `vxe-table-poc`: `_vxe-theme.scss` đã map một phần biến `--vxe-ui-*` sang token.
- Còn thiếu: tag trong ô, chân bảng gắn sẵn phân trang.

## Ưu tiên 5 · Mẫu trang (3–5 ngày) ⬜

Có mẫu trang thì prompt kiểu "tạo trang danh sách món ăn" sẽ ra đúng bố cục.

- [ ] 10. Trang danh sách: header, bộ lọc, bảng, phân trang (loại màn hình chiếm phần lớn CMS)
- [ ] 11. Trang form / chi tiết: mục lục, đầu khối, phân quyền xem/sửa
- [ ] 12. Trang cài đặt: các dòng cài đặt

Đã có sẵn: layout CMS (`DesktopShell`, `MainNavigation`, `ReportTree`) ở cả hai POC.

## Ưu tiên 6 · Bổ sung thiết kế còn thiếu (designer làm Figma trước)

- [ ] 13. Trạng thái: error/validation của field, disabled đầy đủ, loading/skeleton, trạng thái trống của bảng
- [ ] 14. Component mới: Toast, Tabs, DatePicker, Tooltip chung, Breadcrumb

Trong lúc chờ: ✅ đã ghi cách xử lý tạm từng case vào mục "Khi Figma chưa có thiết kế" của `AGENTS.md`. Các chỗ đang dùng cách tạm (`TODO(design)`): `src/components/auth/auth.scss` ở cả hai POC (lỗi validate, disabled, nút đang xử lý, thông báo cấp form); `virtual-table-poc/src/components/ui/` (`CmsButton` disabled và loading, `CmsIconButton` disabled, `CmsField` lỗi validate và disabled).

## Ưu tiên 7 · Dọn tài liệu tham chiếu (làm khi rảnh) ⬜

- [ ] 15. Trang ví dụ cách dùng (layout flex/grid, trạng thái bằng pseudo-class thật) bên cạnh các trang bản sao canvas Figma
- [ ] 16. Trang tài liệu cho từng component Vue: props, ví dụ, Do/Don't

- 2026-11-02: Bổ sung token nhóm A cho màu trạng thái, backdrop, bóng và focus; đồng bộ hai POC.

- 2026-11-02: Bổ sung token nhóm B cho thông báo và thông tin; đồng bộ viền avatar theo thang primary.
