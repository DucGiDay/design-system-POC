# CMS-26 · Hướng dẫn cho AI và dev

Repo này là design system cho bản redesign FABI CMS (iPOS), dựng từ Figma [CMS-26](https://www.figma.com/design/lksyF9cMWxH8sl4SPSuw17/CMS-26). Sản phẩm đích viết bằng Vue 3. Đọc file này trước khi sinh bất kỳ giao diện nào.

## Repo gồm gì

| Đường dẫn | Vai trò | Dùng thế nào |
| --- | --- | --- |
| `tokens.css` | Token màu, bo góc, font, text style, dark theme | Nguồn giá trị duy nhất. Luôn dùng `var(--…)` |
| `components.css` | Style component dùng chung | Tra tên class và giá trị chuẩn của từng component |
| `DESIGN.md` | Quy tắc thiết kế (màu, chữ, bóng, bo góc, Do/Don't) | Bắt buộc tuân theo |
| `PRODUCT.md` | Người dùng, mục tiêu, nguyên tắc sản phẩm | Đọc để hiểu ngữ cảnh |
| `ROADMAP.md` | Lộ trình 7 ưu tiên và tiến độ từng mục | Cập nhật trạng thái khi làm xong một mục |
| `01-…15-*.html` | Bản sao canvas Figma của từng nhóm component | Chỉ để xem markup và các biến thể. **Không chép layout** (xem mục dưới) |
| `assets/icons/` | 92 icon Lucide 24px, nét 1.8 | Bộ icon chuẩn cho UI mới |
| `virtual-table-poc/` | POC Vue 3 cho **Option 1** (Headless + Tailwind), có navigation và layout CMS | Mẫu code Vue khi làm theo Option 1. Có `AGENTS.md` riêng |
| `vxe-table-poc/` | POC Vue 3 cho **Option 2** (VxeTable v4), có navigation và layout CMS giống hệt | Mẫu code Vue khi làm theo Option 2. Có `AGENTS.md` riêng |

Thứ tự đọc khi bắt đầu một việc: file này → `DESIGN.md` → `tokens.css` → phần liên quan trong `components.css` → trang HTML tương ứng → `virtual-table-poc/AGENTS.md` nếu viết Vue.

## Quyết định tạm thời

Các mục dưới đây chưa được chốt chính thức. Cứ làm theo mặc định đang ghi, khi nào chốt sẽ sửa ở đây. Không tự chọn hướng khác.

| Chủ đề | Mặc định tạm | Trạng thái |
| --- | --- | --- |
| Thư viện bảng | Đang so sánh hai phương án, mỗi POC một phương án (xem mục "Hai phương án thư viện bảng"). Làm trong POC nào thì dùng stack của POC đó | Chờ chốt |
| Đơn vị CSS | Trang tham chiếu HTML giữ `px` để khớp Figma. Code Vue mới theo `virtual-table-poc/AGENTS.md`: dùng `rem` (lấy px trong `DESIGN.md` chia 16), `px` chỉ cho viền 1px và các phép đo cần khớp pixel | Chờ chốt |
| Ngôn ngữ / i18n | Copy viết tiếng Việt. Option 1: mọi chuỗi hiển thị đi qua `vue-i18n` (`virtual-table-poc/src/i18n/locales/vi.json`), không hardcode trong template. Option 2: chưa có `vue-i18n`; phần chữ có sẵn của bảng (nút, thông báo) dùng gói tiếng Việt `vi-VN` của `vxe-pc-ui` | Chờ chốt |
| Dark theme | Token có sẵn dưới `[data-theme="dark"]`. Không bắt buộc thiết kế riêng cho dark, nhưng không hardcode màu để dark không bị vỡ | Chờ chốt |
| Tính năng AI | Màu tím, nút AI và Chip AI chỉ dùng khi màn hình thật sự có tính năng AI (iOne) | Chờ chốt phạm vi |
| Spacing | Chưa có token. Chỉ dùng các bước 2/4/6/8/10/12/14/16/24px (đổi sang rem trong Vue) | Sẽ token hoá thành `--space-*` |
| Icon | Dùng `assets/icons/*.svg`. Các SVG trong `assets/<số-trang>/` là bản export riêng cho trang tham chiếu, không dùng cho UI mới | Sẽ có component `<Icon name>` |

## Hai phương án thư viện bảng

Đang làm hai POC song song để chọn một. Hai POC có cùng layout, navigation và bảng demo, chỉ khác thư viện bảng.

### Option 1 · Headless + Tailwind (`virtual-table-poc/`)

Ghép nhiều thư viện chuyên biệt. Thư viện chỉ lo phần logic, còn HTML và style của bảng do mình tự viết.

| Việc | Thư viện | Ghi chú |
| --- | --- | --- |
| Lõi bảng | `@tanstack/vue-table` | Headless: chỉ tính phân trang, sắp xếp, thứ tự cột. Không vẽ sẵn HTML |
| Cuộn ảo | `@tanstack/vue-virtual` | Chỉ render khoảng 15–20 dòng trên DOM, kể cả khi dữ liệu có 10.000 dòng |
| Kéo thả | `@formkit/drag-and-drop` (có thể thêm `sortablejs`) | Kéo dòng để đổi thứ tự dòng, kéo tiêu đề để đổi thứ tự cột |

Khi code: vì tự viết HTML nên phải tự áp style ô bảng của design system (class `cms-cell`, chữ 13/20, vạch dưới `--line-soft`). Style viết bằng Tailwind prefix `fb-`.

### Option 2 · VxeTable v4 (`vxe-table-poc/`)

Bộ all-in-one của họ Vxe, gần như mọi thứ đã có sẵn.

| Việc | Thư viện | Ghi chú |
| --- | --- | --- |
| UI phụ trợ | `vxe-pc-ui` | Bắt buộc đi kèm ở v4. Chứa modal, button, icon… mà bảng cần để chạy |
| Lõi bảng | `vxe-table` v4 (cho Vue 3) | Vẽ sẵn giao diện bảng, có sẵn cuộn ảo `scroll-y` |
| Kéo thả | Có sẵn, không cài thêm | Cột: `:column-config="{ drag: true }"`. Dòng: `:row-config="{ drag: true }"` |

Khi code: giao diện bảng do vxe vẽ, nên muốn giống CMS-26 thì gán các biến `--vxe-ui-*` sang token trong `vxe-table-poc/src/styles/_vxe-theme.scss`, không ghi đè bằng mã hex. Button, modal của `vxe-pc-ui` chưa khớp CMS-26, nên nút và hộp thoại trên màn hình vẫn dùng component của design system.

### Quy tắc chung cho cả hai

- Không trộn: không cài thư viện của option này vào POC của option kia.
- Màn hình mới nằm ngoài hai POC: hỏi người yêu cầu dùng option nào trước khi viết phần bảng.
- Mọi thứ không phải bảng (nút, form, header, hộp thoại, menu) giống nhau ở cả hai option và theo design system.

## Quy tắc bắt buộc

Rút gọn từ `DESIGN.md`. Khi có mâu thuẫn, `DESIGN.md` và Figma thắng.

1. **Không hardcode giá trị đã có token.** Màu, bo góc, font, text style đều lấy từ `tokens.css`.
2. **Một màu hành động.** Xanh iPOS (`--primary`) là màu duy nhất cho nút chính, mục đang chọn và focus. Mỗi màn hình chỉ có một nút Chính. Tím chỉ cho AI. Cam chỉ để nhấn mạnh và cảnh báo, không bao giờ làm nút chính.
3. **Soft-Pair.** Tag và trạng thái luôn dùng nền `-soft` kèm chữ đậm cùng họ màu. Không dùng nền đặc kèm chữ trắng. Hành động nguy hiểm dùng `danger-soft` + chữ `danger`, không dùng nền đỏ đặc.
4. **Một font.** Chỉ dùng Be Vietnam Pro (`tokens.css` đặt sẵn trên `body`; code Vue dùng `var(--font-sans)` do `sync:design` sinh ra) và text style có sẵn (`cms-text-page-title`, `cms-text-body`, `cms-text-cell`…). Không tự đặt cỡ chữ ngoài thang.
5. **Bảng dùng chữ 13/20** (`cms-text-cell`), không dùng 14px trong ô bảng. Ô bảng chỉ có vạch dưới `--line-soft`, không có viền dọc.
6. **Hai bậc bo góc theo vùng.** Vùng dữ liệu (tag, badge, ô bảng) bo `--radius-sm` 6px. Nút, trường nhập, nav item bo `--radius-md` 10px. Card, dialog, popover bo `--radius-lg` 14px.
7. **Phẳng khi tĩnh.** Card và bảng không có bóng. Bóng chỉ dùng cho mục đang chọn, popover/dropdown, dialog, tooltip, theo đúng bộ bóng trong `DESIGN.md`.
8. **Focus của trường nhập:** viền `--primary` kèm vòng 3px `--primary-soft`. Phần tử bấm được phải có `:focus-visible` rõ ràng.
9. **Desktop là chính.** Layout thiết kế cho laptop/desktop (kiểm tra ở 1440×1000 và 1280×720). Mobile chỉ cần không vỡ.
10. **Ngữ cảnh luôn rõ.** Màn hình có dữ liệu theo thương hiệu/cửa hàng phải hiển thị bộ chọn thương hiệu và chip phạm vi cửa hàng.
11. **Ghép từ component có sẵn.** Thiếu component thì báo lại hoặc bổ sung vào hệ thống. Không vá cục bộ trong một màn hình.

## Quy ước đặt tên class

Mọi class của design system viết bằng tiếng Anh theo kiểu BEM, có prefix `cms-`:

| Phần | Cách viết | Ví dụ |
| --- | --- | --- |
| Khối (component) | `cms-<tên>` | `cms-btn`, `cms-field`, `cms-dialog` |
| Phần tử con | `cms-<khối>__<phần tử>` | `cms-field__label`, `cms-dialog__foot` |
| Biến thể / trạng thái | `cms-<khối hoặc phần tử>--<biến thể>` | `cms-btn--primary`, `cms-field__box--readonly` |
| Text style | `cms-text-<tên>` | `cms-text-body`, `cms-text-cell` |

- Class biến thể luôn đi kèm class gốc: viết `cms-btn cms-btn--primary`, không viết mỗi `cms-btn--primary`.
- Prefix `fb-` dành riêng cho Tailwind và component trong app FABI. Không dùng `fb-` cho class của design system, và ngược lại.
- Class `ds-*` (`ds-page`, `ds-section`, `ds-set`, `ds-abs`…) chỉ dùng để trình bày trang tham chiếu, không đưa vào sản phẩm.
- Chữ hiển thị, comment và tài liệu vẫn viết tiếng Việt. Chỉ tên class và tên trong code là tiếng Anh.

## Cách đọc trang tham chiếu HTML

Các trang `01-…15-*.html` tái hiện canvas Figma, nên có những thứ **không được chép vào code thật**:

- Class `ds-abs`, `ds-set`, `ds-section` cùng `style="left:…; top:…; width:…; height:…"`: đây là toạ độ đặt trên canvas. Code thật dùng flex/grid.
- `data-node-id`: dùng để đối chiếu với Figma, không đưa vào sản phẩm.
- Các biến thể `--hover` và `--focus` (ví dụ `cms-menu-item--hover`, `cms-field__box--focus`): chỉ là ảnh chụp trạng thái để trình bày. Code thật dùng `:hover`, `:focus-visible`, `:focus-within`. Các biến thể như `--active`, `--selected`, `--open`, `--collapsed`, `--partial`, `--off`, `--readonly` là trạng thái dữ liệu thật, code gắn class theo dữ liệu.

Những thứ **nên lấy**: cấu trúc markup bên trong một component, tên class, các biến thể và giá trị trong `components.css`.

## Dùng component có sẵn

`components.css` đã viết sẵn style cho khoảng 35 component. Ví dụ với nút:

```html
<button class="cms-btn cms-btn--md cms-btn--primary">Lưu</button>     <!-- nút chính, cỡ vừa -->
<button class="cms-btn cms-btn--sm cms-btn--secondary">Huỷ</button>   <!-- nút phụ, cỡ nhỏ -->
<button class="cms-btn cms-btn--md cms-btn--danger">Xoá</button>      <!-- nút xoá -->
```

Ví dụ với trường nhập có phần tử con:

```html
<div class="cms-field">
  <p class="cms-field__label">Tên món <span class="cms-field__required">*</span></p>
  <label class="cms-field__box"><input type="text" /></label>
</div>
```

Các bảng dưới chia theo nhóm. Cột **Class gốc** là class bắt buộc phải có. Cột **Biến thể** liệt kê phần đuôi `--…` có thể thêm vào. Cột **Xem mẫu** là trang HTML có hình minh hoạ và markup đầy đủ.

### Nút và nhãn nhỏ

| Muốn hiển thị | Class gốc | Biến thể | Xem mẫu |
| --- | --- | --- | --- |
| Nút bấm | `cms-btn` | Cỡ: `--md`, `--sm`. Kiểu: `--primary` chính, `--secondary` phụ, `--subtle` nhạt, `--ai` tính năng AI, `--danger` xoá/huỷ | `04-dieu-khien.html` |
| Nút chỉ có icon | `cms-icon-btn` | `--outline` có viền | `04-dieu-khien.html` |
| Số đếm, nhãn "Mới", "Pro" | `cms-badge` | `--notification`, `--count`, `--new`, `--pro` | `04-dieu-khien.html` |
| Tăng/giảm phần trăm | `cms-delta` | `--up`, `--down` | `04-dieu-khien.html` |
| Trạng thái đơn hàng, quy trình | `cms-status` | `--pending` chờ, `--processing` đang làm, `--completed` hoàn tất, `--cancelled` huỷ, `--paused` tạm ngưng | `04-dieu-khien.html` |
| Ô chọn nhỏ (select) | `cms-select` | `--default` thường, `--brand` chọn thương hiệu | `04-dieu-khien.html` |
| Ô tìm kiếm | `cms-search` | | `04-dieu-khien.html` |
| Chip gợi ý AI | `cms-chip-ai` | Chỉ dùng khi có tính năng AI | `04-dieu-khien.html` |
| Chú thích màu của biểu đồ | `cms-legend` | | `04-dieu-khien.html` |
| Người dùng ở góc phải header | `cms-user` (con: `__info`, `__name`, `__role`), ảnh đại diện `cms-avatar` | | `04-dieu-khien.html` |

### Form

| Muốn hiển thị | Class gốc | Biến thể | Xem mẫu |
| --- | --- | --- | --- |
| Trường nhập | `cms-field`, con: `__label`, `__required`, `__box`, `__value` | Ô nhập `cms-field__box` thêm `--select` ô chọn, `--readonly` chỉ xem, `--multiline` nhiều dòng | `14-form.html` |
| Tiêu đề một khối trong form | `cms-form-head` | `--readonly` khi khối chỉ xem | `14-form.html` |
| Mục lục bên cạnh form dài | `cms-toc-item` | `--active` mục đang xem | `14-form.html` |
| Lựa chọn có mô tả dài (radio) | `cms-choice-card` | `--selected` đang chọn | `14-form.html` |
| Công tắc bật/tắt | `cms-switch` | | `14-form.html` |
| Ô tick | `cms-check` | `--off` chưa tick | `14-form.html` |
| Khung tải ảnh | `cms-upload` | | `14-form.html` |
| Một dòng cài đặt (tên + công tắc hoặc mũi tên) | `cms-setting-row` | `--input` khi dòng có ô nhập | `14-form.html` |

### Dropdown và menu

| Muốn hiển thị | Class gốc | Biến thể | Xem mẫu |
| --- | --- | --- | --- |
| Một dòng trong danh sách thả xuống | `cms-dropdown-row` | | `15-dropdown.html` |
| Nhóm dòng | `cms-dropdown-group` | | `15-dropdown.html` |
| Dropdown chọn nhiều | `cms-dropdown-multi`, ô tick bên trong `cms-dropdown-checkbox` | Ô tick: `--on` đã tick | `15-dropdown.html` |
| Menu khi bấm "⋯" | `cms-menu-popover` chứa các `cms-menu-row` | | `15-dropdown.html` |

### Bảng

Áp dụng trực tiếp cho Option 1 (tự viết HTML). Với Option 2, vxe tự vẽ ô bảng; chỉ dùng `cms-tag`, `cms-status`, `cms-biz-type` bên trong slot của cột.

| Muốn hiển thị | Class gốc | Biến thể | Xem mẫu |
| --- | --- | --- | --- |
| Ô trong thân bảng | `cms-cell cms-cell--body` | `--compact` dòng thấp 44px (mặc định 54px), `--right` căn phải (dùng cho số), `--center` căn giữa, `--gap-4` / `--gap-8` / `--gap-10` / `--gap-12` khoảng cách giữa các phần tử trong ô | `10-bang-tag.html` |
| Tag trạng thái trong bảng | `cms-tag` | `--success`, `--warning`, `--info`, `--neutral`, `--danger` | `10-bang-tag.html` |
| Loại hình nhà hàng | `cms-biz-type` | `--chain` chuỗi, `--franchise` nhượng quyền | `10-bang-tag.html` |
| Ô có link mở cấu hình | `cms-cfg-cell` | `--no-link` khi không có link | `10-bang-tag.html` |
| Biểu tượng bàn | `cms-table-icon` | `--off` bàn ngưng dùng | `10-bang-tag.html` |
| Phân trang dưới bảng | `cms-pagination`, mỗi nút trang `cms-pagination-btn` | Nút: `--active` trang hiện tại, `--arrow` nút mũi tên, `--ellipsis` dấu "…" | `12-phan-trang.html` |

### Bố cục trang và card

| Muốn hiển thị | Class gốc | Biến thể | Xem mẫu |
| --- | --- | --- | --- |
| Header trang (tiêu đề + nút) | `cms-page-header`, nút nhỏ trên header `cms-header-btn` | Nút: `--square`, `--renew`, `--lang` | `11-header-trang.html` |
| Hộp thoại xác nhận | `cms-dialog`, con: `__head` (tiêu đề), `__foot` (nút) | | `13-hop-thoai.html` |
| Card KPI có biểu đồ mini | `cms-card-kpi`, biểu đồ `cms-mini-chart` | | `05-dieu-huong.html` |
| Card khối nội dung | `cms-card-block` | | `05-dieu-huong.html` |
| Card chỉ số trang chủ | `cms-card-metric`, tiêu đề báo cáo `cms-report-head` | Màu nền icon: `cms-tone-blue`, `cms-tone-orange`, `cms-tone-green`, `cms-tone-sky` | `07-the-trang-chu.html` |
| Chuyển qua lại vài lựa chọn | `cms-segmented` chứa các `cms-segmented__item` | Mục: `--selected` đang chọn | `05-dieu-huong.html` |

### Điều hướng và ngữ cảnh

Layout và sidebar đã được dựng sẵn bằng Vue trong `src/components/navigation/` của cả hai POC. Màn hình mới dùng lại, không dựng lại từ class.

| Muốn hiển thị | Class gốc | Biến thể | Xem mẫu |
| --- | --- | --- | --- |
| Menu sidebar | `cms-menu-item`, nhãn nhóm `cms-menu-group-label`, mục con `cms-menu-sub` | `--active` đang chọn, `--collapsed` thu gọn | `06-menu-chinh.html` |
| Menu báo cáo nhiều cấp | `cms-panel-group`, `cms-panel-item`, `cms-panel-label` | Cấp: `--level-2`, `--level-3`. Trạng thái: `--open`, `--active` | `09-sidebar-v2.html` |
| Bộ chọn thương hiệu | `cms-brand-picker` | `--collapsed` thu gọn | `08-thuong-hieu.html` |
| Chip phạm vi cửa hàng | `cms-scope-chip` | `--partial` khi chỉ chọn một phần cửa hàng | `08-thuong-hieu.html` |

**Không dùng nữa:** `cms-rail-item` (thanh icon, thay bằng `cms-menu-item cms-menu-item--collapsed` từ 2026-10-15), `cms-nav-item` và `cms-nav-sub` (menu đời cũ ở trang 05).

## Khi Figma chưa có thiết kế

Figma CMS-26 chưa vẽ một số trạng thái và component hay gặp. Nếu không có quy ước, mỗi người (và mỗi lần prompt AI) sẽ tự vẽ một kiểu. Vì vậy tạm thống nhất theo bảng dưới. Chỗ nào dùng cách tạm thì ghi comment `TODO(design): chờ Figma` để sau này tìm lại và thay.

| Tình huống | Làm tạm như sau |
| --- | --- |
| Nút hoặc ô bị khoá (disabled) | Làm mờ 50%, con trỏ hình cấm, rê chuột không đổi màu |
| Nhập sai (lỗi validate) | Viền ô màu đỏ `--danger`, quầng 3px đỏ nhạt `--danger-soft`. Dưới ô có một dòng báo lỗi chữ 12px màu `--danger` |
| Nút đang xử lý | Giữ nguyên kích thước nút, thay icon bằng vòng xoay, thêm `aria-busy="true"` |
| Bảng hoặc card đang tải | Hiện khối xám nhạt (`--field`) có hình dạng giống nội dung sắp hiện (skeleton) |
| Bảng trống hoặc tìm không ra | Hình `assets/07-the-trang-chu/khong-tim-thay-mon.svg`, một dòng giải thích màu `--ink-muted`, thêm nút hành động nếu có |
| Tabs | Dưới 5 tab: dùng `cms-segmented`. Từ 5 tab trở lên: hỏi lại, không tự vẽ |
| Toast, chọn ngày, breadcrumb, tooltip chung | Không tự vẽ kiểu mới, hỏi lại. Nếu buộc phải làm: nền `--surface`, viền `--line`, bo `--radius-md`, bóng Overlay |

Class mới thêm cho các trường hợp này cũng theo quy ước BEM ở trên, ví dụ `cms-field__box--error`, `cms-field__error`.

## Viết code Vue

### Màu và font đi vào project Vue thế nào

Cả hai POC đều có lệnh `npm run sync:design`, tự chạy mỗi khi `npm run dev` hoặc `npm run build`. Lệnh này đọc `tokens.css` và `components.css` ở thư mục gốc (theo tên class `cms-*`) rồi sinh file `src/styles/_base.generated.scss` của POC. Vì vậy:

- Muốn đổi màu, bo góc, cỡ chữ: sửa `tokens.css` ở thư mục gốc. Không sửa `_base.generated.scss`, vì file này bị ghi đè mỗi lần chạy.
- Đổi tên class trong `components.css` thì phải sửa bảng `mixins` trong `scripts/sync-design.mjs` của cả hai POC, nếu không lệnh sync sẽ báo lỗi.
- Trong code dùng biến CSS như `var(--primary)`, hoặc mixin có sẵn như `base.button`, `base.badge`.

### Riêng Option 1 (`virtual-table-poc`)

- Có Tailwind với prefix `fb-`: viết `fb-flex`, `hover:fb-bg-subtle`. Màu của Tailwind đã nối sẵn với token, không thêm mã hex vào `tailwind.config.ts`.
- Chuỗi hiển thị đi qua `vue-i18n`.
- Bảng tự viết HTML, nên ô bảng phải theo đúng nhóm "Bảng" ở trên.

### Riêng Option 2 (`vxe-table-poc`)

- Không có Tailwind. Style viết bằng SCSS và dùng token.
- Chỉnh giao diện bảng trong `src/styles/_vxe-theme.scss`, bằng cách gán biến `--vxe-ui-*` sang token.
- Muốn đặt tag hay trạng thái trong ô: dùng slot `#default` của cột, bên trong dùng class `cms-tag`, `cms-status` như bình thường.

### Chung cho cả hai

- Gom code theo module, style scoped, theo `AGENTS.md` trong từng POC.
- Dữ liệu mẫu dùng tên giả như "Chanh Dev", "Cầu Giấy". Không bịa số liệu hay tên khách hàng thật.

## Kiểm tra trước khi bàn giao

- [ ] Không có mã màu hex hay cỡ chữ tự đặt. Mọi giá trị lấy từ token.
- [ ] Mỗi màn hình chỉ có một nút Chính (`cms-btn--primary`). Tím chỉ cho AI, cam không làm nút chính.
- [ ] Class mới đặt theo quy ước `cms-` + BEM, tiếng Anh.
- [ ] Không còn toạ độ `left` / `top` tuyệt đối hay class `ds-*` chép từ trang mẫu.
- [ ] Rê chuột, focus, disabled dùng `:hover`, `:focus-visible`, `:disabled` thật. Bấm phím Tab vẫn thấy rõ đang ở đâu.
- [ ] Đã xem ở màn 1440×1000 và 1280×720.
- [ ] Không trộn thư viện bảng của hai option.
- [ ] Đã liệt kê mọi chỗ có `TODO(design)` khi bàn giao.
