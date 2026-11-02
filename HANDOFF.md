# Bàn giao phiên làm việc · 2026-11-02

Tài liệu này dành cho AI hoặc dev nhận việc tiếp. Đọc hết file này trước, rồi đọc theo thứ tự trong `AGENTS.md` (`AGENTS.md` → `DESIGN.md` → `tokens.css` → `components.css` → `virtual-table-poc/AGENTS.md`).

Người dùng giao tiếp bằng tiếng Việt, xưng "t", gọi AI là "m". Trả lời tiếng Việt, ngắn gọn.

---

## 1. Quy tắc làm việc với người dùng (bắt buộc)

1. **Không tự mở trình duyệt.** Muốn kiểm tra UI bằng trình duyệt phải hỏi trước. Lần này người dùng đã đồng ý cho kiểm tra trang `/ui`. Việc mới thì hỏi lại.
2. **Cần sửa gì thì nhắn trước.** Người dùng đã dặn: khi kiểm tra mà thấy cần sửa thì báo danh sách và chờ duyệt, không tự sửa.
3. **Khi người dùng hỏi "chỉ trả lời thôi không sửa"** thì chỉ trả lời, không động vào file.
4. **Chưa commit gì cả.** Không commit hay push nếu người dùng chưa bảo. Branch hiện tại là `master`, branch chính là `main`.
5. **Quyết định kiến trúc thì hỏi.** Ví dụ: component đặt ở đâu, chọn option bảng nào. Không tự chọn hướng khác với mặc định trong `AGENTS.md`.
6. Sau mỗi mục roadmap làm xong: cập nhật `ROADMAP.md` (bảng tổng quan, dòng "Việc tiếp theo", chi tiết mục, ngày "Cập nhật lần cuối").

---

## 2. Bối cảnh repo

- Design system CMS-26 cho bản redesign FABI CMS (iPOS). Sản phẩm đích là Vue 3.
- `tokens.css`, `components.css` ở thư mục gốc là nguồn gốc. Các trang `01-…15-*.html` là bản sao canvas Figma, chỉ để tham khảo.
- Hai POC song song, **chưa chốt chọn cái nào**:
  - `virtual-table-poc/`: Option 1, TanStack + Tailwind (prefix `fb-`) + `vue-i18n`. **Mọi việc trong phiên này làm ở đây.**
  - `vxe-table-poc/`: Option 2, VxeTable, SCSS, không có i18n.
- Mỗi POC có `npm run sync:design` (tự chạy trước `dev` và `build`). Lệnh này đọc `tokens.css` và `components.css` gốc, rồi sinh `src/styles/_base.generated.scss`. **Không sửa file generated.**
- Chạy dev server: `.claude/launch.json` có cấu hình `virtual-table-poc` (port 5174). Lần này 5174 bị chiếm nên server chạy ở **5176**. Trang xem component: `http://localhost:5176/ui`.

---

## 3. Lộ trình và tiến độ

Chi tiết đầy đủ ở `ROADMAP.md`. Đường găng: 1 → 2 → 3 → 7 → 10.

| Ưu tiên | Nội dung | Trạng thái |
| --- | --- | --- |
| 1 | Chốt 4 quyết định (thư viện bảng, đơn vị px/rem, i18n, phạm vi dark/AI) | 🟡 Có mặc định tạm, **chưa chốt mục nào**. Cần người quyết, AI không tự chốt |
| 2 | `AGENTS.md` gốc | ✅ |
| 3.5 | Token spacing `--space-*` | ✅ Làm trong phiên này |
| 3.6 | Component `<Icon>` dùng bộ `assets/icons` gốc | 🟡 Có `AppIcon.vue` nhưng icon phải chép tay vào `src/assets/icons`. **Người dùng nói "để sau"** |
| 4.7 | Component Vue đợt 1 | ✅ Làm trong phiên này, chỉ ở `virtual-table-poc` |
| 4.8 | Component đợt 2 | ⬜ |
| 4.9 | Đóng gói bảng | 🟡 |
| 5 | Mẫu trang (danh sách, form, cài đặt) | ⬜ Việc tiếp theo trên đường găng là **mục 10: trang danh sách** |
| 6 | Thiết kế còn thiếu (chờ Figma) | 🟡 Có quy ước tạm trong `AGENTS.md` |
| 7 | Dọn tài liệu tham chiếu | ⬜ |

---

## 4. Những gì phiên này đã làm (tất cả CHƯA commit)

### 4.1. `ROADMAP.md` (mới)

Lưu lộ trình 7 ưu tiên kèm trạng thái từng mục. Đã thêm một dòng trỏ tới nó trong bảng "Repo gồm gì" của `AGENTS.md`.

### 4.2. Token spacing (mục 5)

- `tokens.css`: thêm `--space-2`, `-4`, `-6`, `-8`, `-10`, `-12`, `-14`, `-16`, `-24` vào `:root`. Tên đặt theo số px, giá trị viết px.
- `virtual-table-poc/scripts/sync-design.mjs` và `vxe-table-poc/scripts/sync-design.mjs`: thêm hàm `toRem`, đổi `--space-*` từ px sang rem khi sinh file (ví dụ `--space-16: 1rem`). Nếu một `--space-*` không viết bằng px thì lệnh sync báo lỗi. Hai script này viết khác nhau, nhớ sửa cả hai.
- `virtual-table-poc/tailwind.config.ts`: `theme.extend.spacing` trỏ các bậc `0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 6` vào `var(--space-*)`. Quy đổi: bậc Tailwind × 4 = số px, ví dụ `fb-gap-2` = `--space-8`.
- `DESIGN.md`: thêm `spacing:` vào frontmatter YAML và sửa đoạn mô tả spacing ở mục layout.
- `AGENTS.md`: dòng "Spacing" trong bảng quyết định tạm chuyển sang "Đã token hoá". Quy tắc số 1 thêm "khoảng cách".
- **Chưa làm:** `components.css` vẫn ghi px trực tiếp (ví dụ `padding: 8px 14px`). Có giá trị lẻ ngoài thang như `7px` của nút SM.

### 4.3. Component Vue đợt 1 (mục 7)

Người dùng chọn đặt **chỉ trong `virtual-table-poc`**, không làm thư mục dùng chung, không chép sang vxe.

Thư mục `virtual-table-poc/src/components/ui/`:

| File | Vai trò |
| --- | --- |
| `CmsButton.vue` | `variant` primary/secondary/subtle/ai/danger, `size` md/sm, `icon`, `loading` (vòng xoay + `aria-busy`), `disabled`, `type` |
| `CmsIconButton.vue` | `icon`, `label` (bắt buộc, làm aria-label và title), `outline`, `disabled` |
| `CmsTag.vue` | `tone` success/warning/info/neutral/danger, chữ qua slot |
| `CmsStatus.vue` | `status` pending/processing/completed/cancelled/paused, chữ qua slot |
| `CmsField.vue` | Khung chung: label, `*` required, box, hint/error, readonly (icon `khoa`), disabled. Slot trả về `{ id, describedBy, invalid }`. Style phần tử nhập viết bằng `:slotted()` |
| `field.ts` | Type `FieldProps` dùng chung, và `useFieldAttrs()`: class/style ở lại khung ngoài, attr khác đi vào `<input>` |
| `CmsInput.vue` | `v-model` string, `type`, `placeholder`. Có CSS ẩn mũi tên tăng/giảm của ô số |
| `CmsTextarea.vue` | Ô nhiều dòng, cao 6rem |
| `CmsSelect.vue` | Generic `T extends string \| number`, dùng `<select>` gốc, `options`, `placeholder`. Khi readonly hiện chữ thay cho select |
| `CmsDialog.vue` | Dựng trên `<dialog>` gốc với `showModal`. `v-model:open`, `title`, `description`, `width` (mặc định 27.5rem), `closable`. Slot mặc định và `#footer`. Khoá cuộn trang khi mở |
| `scroll-lock.ts` | `lockPageScroll` / `unlockPageScroll`, có đếm số lần khoá, bù độ rộng thanh cuộn |
| `CmsPagination.vue` | `v-model:page`, `v-model:page-size`, `total`, `pageSizeOptions`. Tóm tắt dùng `I18nT` |
| `pagination.ts` | `pageItems(current, count)`: tối đa 7 ô, ví dụ `1 … 4 5 6 … 62` |
| `CmsPageHeader.vue` | `title`, `description`, slot `#actions` |
| `UiPreview.vue` | Trang xem thử ở route `/ui` (đã thêm vào `src/router.ts`, có `meta.titleKey`) |

Các quy ước đã áp dụng:
- Style là SCSS scoped. Tên class `cms-*` theo BEM, giống tên trong `components.css`.
- Giá trị lấy từ token: `--space-*`, `--type-*-font-size/line-height`, `--radius-*`, màu. Không có mã hex.
- Một số giá trị Figma không có token thì để rem kèm comment: đệm 7px của nút SM (`.4375rem`), tiêu đề dialog 18/26, mô tả header 13/18.
- Chuỗi bên trong component đi qua `vue-i18n`, key `ui.dialog.*` và `ui.pagination.*`. Chuỗi của trang preview nằm dưới key `uiPreview.*`. Đã thêm cả `vi.json` và `en.json`.
- Có comment `TODO(design): chờ Figma` ở: disabled và loading của `CmsButton`, disabled của `CmsIconButton`, lỗi validate và disabled của `CmsField`.
- `AGENTS.md`, mục "Riêng Option 1": có bảng tra props của 10 component.

Icon đã chép từ `assets/icons/` vào `virtual-table-poc/src/assets/icons/`: `cong, dong, khoa, loc, mui-ten-phai, mui-ten-xuong, sua, tai-xuong, xoa`.
**Lưu ý tên icon:** `them.svg` là dấu "⋯" (thêm tuỳ chọn), còn **`cong.svg` mới là dấu cộng**. Mình từng dùng nhầm `them` cho nút "Thêm món", đã sửa và xoá `them.svg` khỏi POC.

### 4.4. Kiểm tra trên trình duyệt (người dùng đã cho phép)

Kết quả ở 1440×1000 và 1280×720:
- Không vỡ layout, không có cuộn ngang, console không báo lỗi.
- Hộp thoại: khi mở, focus nhảy vào trong; Tab chỉ chạy quanh nút trong hộp thoại; Esc, nút X, bấm nền mờ, nút Huỷ đều đóng được; bấm bên trong không đóng; đóng xong focus quay về nút mở.
- Phân trang đúng logic. Đổi số dòng mỗi trang thì về trang 1.

Sau khi kiểm tra, người dùng duyệt sửa 4 điểm. **Đã sửa xong và kiểm tra lại:**
1. Ô readonly khi focus hiện viền `--line-strong` (trước đó không có dấu hiệu focus).
2. Quầng 3px của ô lỗi đổi sang `color-mix(in srgb, var(--danger) 20%, transparent)`, vì `--danger-soft` nhạt đến mức không nhìn thấy. Đã sửa dòng "Nhập sai" trong bảng "Khi Figma chưa có thiết kế" của `AGENTS.md`. **`auth.scss` ở hai POC vẫn dùng quầng cũ.**
3. Ẩn mũi tên tăng/giảm của `input[type=number]` trong `CmsInput`.
4. Khoá cuộn trang khi mở hộp thoại.

Type-check (`npx vue-tsc -b`) qua. `npm run build` đã chạy qua trước các sửa cuối, nên nên build lại một lần.

---

## 5. Bẫy kỹ thuật đã gặp

- **Trình duyệt trong app (Claude Browser pane) không phát sự kiện `close` của `<dialog>`.** Đã thử với một `<dialog>` trần, kết quả giống nhau. Vì vậy `CmsDialog` không dựa vào sự kiện này để mở khoá cuộn. Nó dùng cờ `scrollLocked` cho từng hộp thoại, đặt lại ngay trong `sync()`. `@close` chỉ là đường phụ.
- **`transition` làm `getComputedStyle` trả giá trị cũ** nếu đọc ngay sau khi focus. Chờ khoảng 150ms rồi mới đọc.
- **Ảnh chụp ngay sau khi navigate có thể trắng** vì trang chưa tải xong. Chờ 1 giây rồi chụp lại.
- **`:slotted()` trong `CmsField`:** phần tử nhập thuộc scope của `CmsInput`/`CmsSelect`, không thuộc `CmsField`. Muốn đè style đã đặt qua `:slotted` thì selector phải mạnh hơn. Ví dụ trong `CmsSelect.vue`: `.cms-field__box .cms-select__control--placeholder`.
- **`noUnusedLocals` đang bật**, và `noUncheckedIndexedAccess` cũng bật.
- **Vue 3.5:** có thể dùng `useId`, `defineModel`, viết tắt `:prop` cùng tên, `defineProps` với type import.

---

## 6. Việc đang chờ (chọn theo yêu cầu của người dùng)

### 6.1. Token màu: đang CHỜ DUYỆT, chưa sửa file nào

Bối cảnh: người dùng hỏi bảng màu có ít quá không. Kết luận: số lượng không ít (khoảng 40 token sáng), nhưng thiếu một số vai trò. Danh sách đề xuất đã gửi cho người dùng:

**Nhóm A: có thể làm ngay khi được duyệt**

| Token | Sáng | Tối | Dùng cho | Tương phản sáng / tối |
| --- | --- | --- | --- | --- |
| `--warning-text` | `#b45309` | `#ffc58f` | Chữ tag warning, `cms-status--pending` | 4.72 / 9.83. Hiện `--warning` trên nền soft chỉ đạt 2.99 |
| `--danger-text` | `#b42318` | `#fca394` | Chữ trên `danger-soft` | 6.00 / 8.18. Hiện đạt 4.41 |
| `--danger-soft-hover` | `#fbe4e2` | `#4a1f1a` | Nền nút danger khi rê, thay cho viền inset hiện tại | 5.42 / 7.19 |
| `--violet-strong` | `#4f2bd9` | `#b3b1ff` | Nền nút AI khi rê (hiện mượn `--violet-text`) | 7.84 / 8.69 |
| `--backdrop` | `rgba(15,23,42,.4)` | `rgba(0,0,0,.6)` | Nền mờ sau dialog (hiện là `color-mix(var(--ink) 40%)` trong `CmsDialog`) | |
| `--shadow-raised` | `0 2px 6px rgba(15,23,42,.04), 0 1px 2px rgba(15,23,42,.06)` | Dùng `rgba(0,0,0,…)` đậm hơn | Mục đang chọn | |
| `--shadow-overlay` | `0 2px 6px rgba(15,23,41,.06), 0 16px 40px rgba(15,23,41,.14)` | Như trên | Popover, dropdown | |
| `--shadow-dialog` | `0 16px 40px -4px rgba(15,23,41,.14), 0 2px 6px rgba(15,23,41,.06)` | Như trên | Hộp thoại | |
| `--shadow-tooltip` | `0 4px 12px rgba(15,23,41,.16)` | Như trên | Tooltip | |
| `--focus-ring` | `0 0 0 3px var(--primary-soft)` | Tự đổi theo token | Focus trường nhập | |
| `--focus-ring-danger` | `0 0 0 3px` danger 20% | Tự đổi | Focus ô lỗi | |
| `--shadow-inside-stroke` | `inset 0 0 0 1px var(--line)` | Tự đổi | Viền trong của nút phụ | |

Giá trị bóng lấy từ mục "Shadow Vocabulary" trong `DESIGN.md`. Hiện `--shadow-raised`, `--shadow-overlay`, `--shadow-inside-stroke`, `--focus-ring` đang định nghĩa riêng trong `src/styles/_tokens.scss` của **mỗi** POC.

Khi được duyệt nhóm A, làm theo thứ tự:
1. Thêm token vào `:root` và `[data-theme="dark"]` của `tokens.css`, và vào frontmatter `colors:` của `DESIGN.md`.
2. Thay các chỗ tương ứng trong `components.css`:
   - `.cms-tag--warning` → `--warning-text`
   - `.cms-status--pending` → `--warning-text`
   - chữ trong `.cms-btn--danger`, `.cms-tag--danger`, `.cms-status--cancelled`, `.cms-delta--down` → `--danger-text`
   - bóng ở các dòng có `rgba(15,23,4x,…)` khớp với 4 bóng trên → token bóng
   - `box-shadow: 0 0 0 3px #e3eef9` (focus của field) → `--focus-ring`
3. Xoá các định nghĩa trùng trong `virtual-table-poc/src/styles/_tokens.scss` và `vxe-table-poc/src/styles/_tokens.scss`. Kiểm tra token mới đã có trong `_base.generated.scss` sau khi chạy `npm run sync:design`.
4. Cho component đợt 1 dùng token mới:
   - `CmsTag`, `CmsStatus` dùng màu chữ mới.
   - `CmsButton--danger` khi rê đổi nền `--danger-soft-hover`, bỏ viền inset.
   - `CmsButton--ai` khi rê dùng `--violet-strong`.
   - `CmsDialog` dùng `--backdrop` và `--shadow-dialog`.
   - `CmsField` dùng `--focus-ring-danger`.
5. Chạy `npm run build` ở cả hai POC. Muốn xem lại bằng trình duyệt thì hỏi người dùng trước.
6. Thêm một dòng vào `ROADMAP.md` (mục 5 hoặc ghi chú ở Ưu tiên 3).

**Nhóm B: cần designer quyết, không tự làm**
- `--notification`: đề xuất `#dc2626` / tối `#f87171`, chữ dùng `--surface`. Hiện có **hai màu đỏ khác nhau**: `#ef4444` ở `.cms-badge--notification` (khoảng dòng 79 của `components.css`) và `#db2626` ở `.cms-header-btn__badge-count` (khoảng dòng 1594).
- Họ `--info` / `--info-text` / `--info-soft`: `#0284c7` / `#0369a1` / `#e8f4fb`, tối `#4fb3e8` / `#8fd0f2` / `#10283a`. Đây là thêm một màu mới vào bảng màu.
- Viền avatar `#0560a6` + `#0f79cb` (khoảng dòng 1602–1603). Có thể đổi sang `--primary` và `--primary-400`, nhưng màu sẽ lệch nhẹ.

**Để nguyên:** gradient segmented `#eceff4` → `#f8f9fb`, gradient logo `#a3e635` → `#16a34a`, các lớp kính `rgba(255,255,255,…)`, `#fff` ở viền logo.

### 6.2. Việc khác còn mở (chỉ làm khi người dùng yêu cầu)

- **Mục 6, icon:** cho `AppIcon` lấy icon thẳng từ `assets/icons` gốc (alias Vite hoặc thêm bước trong `sync:design`), bỏ việc chép tay. Sau đó sửa dòng "Icon" trong `AGENTS.md`. Người dùng đã nói "để sau".
- **Mục 10, mẫu trang danh sách:** header, bộ lọc, bảng, phân trang. Dùng `CmsPageHeader`, `CmsPagination`, bảng `VirtualTanStackTable`, layout `DesktopShell`. Phải có bộ chọn thương hiệu và chip phạm vi cửa hàng (quy tắc 10 trong `AGENTS.md`).
- **Chuyển màn cũ sang component mới:** auth (`src/components/auth/auth.scss` có bản `.cms-btn`, `.cms-field` riêng, nằm dưới `.cms-auth`), `src/components/table/StatusBadge.vue`, và `.fb-button` / `.fb-status-badge` trong `src/styles/_components.scss`.
- **Component đợt 2** (mục 8): Switch, Checkbox, Radio/ChoiceCard, Dropdown/Menu, SearchBox, tách BrandPicker và ScopeChip khỏi `MainNavigation.vue`, Card KPI/Khối, Upload.
- **Nút trên header** (`cms-header-btn`: square, renew, lang) chưa có component.
- **Chuyển px trong `components.css` sang `--space-*`.**
- `PRODUCT.md` vẫn ghi i18n "chưa được quyết định", trong khi Option 1 đã có `vue-i18n`. Chờ người dùng chốt quyết định số 3.

---

## 7. Checklist trước khi bàn giao lại cho người dùng

- [ ] Không có hex hay cỡ chữ tự đặt trong code mới.
- [ ] Mỗi màn hình chỉ một nút `primary`. Tím chỉ cho AI.
- [ ] Chuỗi hiển thị trong `virtual-table-poc` đi qua `vue-i18n` (thêm cả `vi.json` và `en.json`).
- [ ] `npx vue-tsc -b` và `npm run build` qua.
- [ ] Đã cập nhật `ROADMAP.md`.
- [ ] Đã liệt kê các `TODO(design)` mới.
- [ ] Không commit nếu chưa được bảo.
