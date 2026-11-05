# So sánh hai phương án thư viện bảng

Tài liệu này phục vụ quyết định #1 trong `ROADMAP.md`: Option 1 (TanStack, `virtual-table-poc/`) hay Option 2 (vxe-table, `vxe-table-poc/`).

Số liệu lấy ngày 2026-11-05, tại commit `2f83501`, sau khoảng một tuần code song song (29/10 – 05/11).

## Tóm tắt

| Tiêu chí | Option 1 · TanStack | Option 2 · vxe-table | Lợi thế |
| --- | --- | --- | --- |
| Bundle khi build (JS + CSS, gzip) | **222 KB** | **634 KB** | Option 1 (nhỏ hơn ~2,9 lần) |
| Chunk tải ngay ở trang đầu (gzip) | `index` 49 KB | `index` 447 KB | Option 1 |
| Code bảng danh sách (`CmsDataTable.vue`) | 294 dòng | 103 dòng | Option 2 |
| Code bảng báo cáo lớn (`ReportGrid.vue`) | 251 dòng | 123 dòng | Option 2 |
| Khớp Figma CMS-26 | Tự dựng markup, khớp tới từng pixel | Gán biến `--vxe-ui-*` và đè `:deep()`. Cần thêm lớp skin, preflight riêng và xử lý xung đột thanh cuộn | Option 1 |
| Tính năng dựng sẵn | Chỉ có logic (sort, filter, chọn dòng). Phần vẽ, ghim cột, dòng tổng, cuộn ảo đều tự viết | Có sẵn sort, ghim cột, dòng tổng, cuộn ảo cả dọc lẫn ngang, chọn dòng giữ qua các trang | Option 2 |
| Khả năng tiếp cận (a11y) | Tự gắn `role`, `aria-sort`, `aria-rowcount`, nút sắp xếp bấm được bằng bàn phím | Phụ thuộc DOM của vxe, chưa kiểm tra | Option 1 (theo những gì đã kiểm) |
| Dung lượng `node_modules` | 127 MB | 186 MB | Không đáng kể |
| Hiệu năng ≤ 100k dòng | Mọi thao tác ≤ ~1,1 s. Nạp dữ liệu nhanh hơn 4–12 lần | Mọi thao tác ≤ ~0,9 s. Tìm kiếm nhanh hơn ~2 lần | Hoà |
| Hiệu năng 300k–1M dòng | Sắp xếp, tìm kiếm mất 2–7 s; RAM tới ~1,8 GB | Sắp xếp, tìm kiếm mất 1,4–10 s; RAM tới ~1,1 GB | Không bên nào dùng được |
| Công sức dev cho bảng nặng (gộp ô, ghim, tiêu đề nhiều tầng, kéo/đổi rộng cột) | Thư viện chỉ tính toán. Phần vẽ, kéo thả, tương tác với cuộn ảo đều tự viết | Phần lớn là cấu hình. Popup và ô sửa của vxe vẫn phải thay bằng component CMS-26 | **Option 2, rõ rệt** (mục 8) |
| Bài thử cùng một bảng nặng (mục 9) | 292 dòng, gặp 4 vấn đề, còn thiếu cuộn ảo ngang và kéo thả trên màn hình cảm ứng | 76 dòng, gặp 1 vấn đề. Gộp ô + cột ghim + cuộn ảo chạy đúng | **Option 2, ~3,8 lần ít code** |

**Kết quả bài thử nghiêng hẳn về Option 2.** Hai bên đổi chỗ tuỳ trọng số:

- **Ưu tiên công sức dev** (dự án nặng về bảng): Option 2 thắng rõ. Kéo thả cột/dòng, đổi độ rộng cột, ghim cột, tiêu đề nhiều tầng, cây, sửa ô, gộp ô đều là cấu hình. Ở Option 1, mỗi tính năng là vài chục tới vài trăm dòng tự viết, chưa kể phần kết hợp với nhau (mục 8).
- **Ưu tiên giao diện, bundle và a11y:** Option 1 thắng. Bundle nhẹ hơn ~3 lần, markup là của mình nên khớp CMS-26 dễ hơn, và không phải gánh `vxe-pc-ui` (33 MB) chỉ để bảng chạy được.

Với yêu cầu đã nêu (gộp ô, sticky, kéo thả cột…), **đề xuất chọn Option 2 (vxe-table)**. Bài thử ở mục 9 đã kiểm tra điều kiện quyết định: tài liệu vxe cảnh báo `spanMethod` khi có cuộn ảo kèm cột ghim, nhưng trong bài thử, tổ hợp gộp ô + cột ghim + cuộn ảo hai chiều chạy đúng ở mọi trường hợp đã thử.

Khi chọn Option 2, cần xử lý các điểm yếu còn lại:
- Nạp vxe theo nhu cầu, chỉ ở route có bảng, để giảm bundle.
- Gói vxe trong các component `Cms*` dùng chung, và chỉ đè style ở `_vxe-theme.scss`.
- Khoá phiên bản vxe; mỗi lần nâng cấp thì chụp ảnh so sánh giao diện.

Bất kể chọn bên nào: báo cáo trên ~100k dòng phải sắp xếp, lọc và phân trang ở server. Ở 300k dòng trở lên, cả hai thư viện đều mất vài giây cho mỗi thao tác.

## Hai POC giống và khác nhau ở đâu

Hai POC có cùng layout, navigation (sidebar con, drawer mobile), bộ component UI, đăng nhập, dashboard, trang Thực đơn và trang báo cáo. `diff` hai thư mục `src/` chỉ khác ở:

- **Lớp bảng:** `components/table/`, `components/report/ReportGrid.vue`, `pages/menu/CityDishListPage.vue` (khai báo cột theo API của từng thư viện).
- **Cách viết style:** Option 1 dùng Tailwind (prefix `fb-`) cộng SCSS. Option 2 chỉ dùng SCSS, nên phải tự chép phần Tailwind preflight mà các component dùng chung cần (`_preflight.scss`).
- **Phần chỉ có ở Option 2:** công tắc skin bảng (CMS-26 / vxe gốc), `_vxe-theme.scss`, `_table-skin.scss`, cấu hình ngôn ngữ `vi-VN` cho `vxe-pc-ui`.

Công sức trong tuần song song gần bằng nhau: Option 1 có 13 commit, +10.065 dòng trong `src`; Option 2 có 11 commit, +9.518 dòng. Tổng code `src` hiện tại: 8.018 và 7.411 dòng.

## Chi tiết

### 1. Kích thước bundle

Build bằng `npm run build` ở từng POC, cộng mọi file trong `dist/assets`:

| | JS (raw / gzip) | CSS (raw / gzip) | Tổng gzip |
| --- | --- | --- | --- |
| Option 1 | 575 KB / 194 KB | 123 KB / 28 KB | 222 KB |
| Option 2 | 1.645 KB / 509 KB | 705 KB / 125 KB | 634 KB |

- Option 2 dồn gần hết vào chunk `index` (1.475 KB, gzip 447 KB) và bị Vite cảnh báo chunk > 500 KB. Nguyên nhân: `main.ts` cài toàn bộ `VxeUI` và `VxeUITable` bằng `app.use()`, nên trang đăng nhập cũng phải tải cả thư viện bảng.
- CSS của Option 2 lớn chủ yếu vì `vxe-pc-ui/lib/style.css` và `vxe-table/lib/style.css` được import nguyên bộ.
- Có thể giảm bằng cách import vxe theo nhu cầu và chỉ nạp ở route có bảng. Việc này chưa thử, và khó về được mức của Option 1, vì `vxe-table` v4 bắt buộc kèm `vxe-pc-ui`.

### 2. Bảng danh sách có phân trang (`CmsDataTable.vue`)

Cả hai cùng props: cột, dữ liệu một trang, cột chọn, cột STT, `v-model:selection` giữ theo id.

- **Option 1 (294 dòng):** tự vẽ `<table>`. Tự tính offset cho cột ghim, bóng ở mép cột ghim khi cuộn ngang, tooltip (i) ở tiêu đề, hover và dòng đã chọn. Chiều cao 38/54 khớp Figma.
- **Option 2 (103 dòng):** khai báo `vxe-grid` và gán biến CSS. Đổi lại phải chịu ba điều:
  - Khoá dòng là **tên trường** (`rowKey: 'id'`), không nhận hàm như `getRowId`, nên API của component khác Option 1.
  - Đồng bộ lựa chọn giữa `v-model` và trạng thái nội bộ của vxe cần hai `watch`, và phải gộp `getCheckboxRecords()` với `getCheckboxReserveRecords()`.
  - vxe đo chiều cao phần tử cha để tính `max-height`, nên khung bọc phải đặt `height: 100vh` rồi để layout co lại.

### 3. Bảng báo cáo lớn (`ReportGrid.vue`)

Đầu bài chung: 16 cột rộng ~2.000 px, 2 cột ghim trái, sắp xếp, tìm kiếm không dấu, dòng tổng, 10k–1M dòng (`SALES_PRESETS`).

- **Option 1 (251 dòng):** sort và filter dùng row model của TanStack. Tự viết phần vẽ bằng `div` và sticky, cuộn ảo dọc bằng `@tanstack/vue-virtual`, dòng tổng. **Chỉ ảo hoá theo dòng, chưa ảo hoá cột.** Với 16 cột thì ổn; nếu báo cáo có 50+ cột thì phải thêm virtualizer ngang.
- **Option 2 (123 dòng):** sort, ghim cột, dòng tổng, cuộn ảo cả dọc lẫn ngang đều là cấu hình. vxe **không có tìm kiếm toàn cục**, nên lọc bằng JS rồi gọi `loadData()`, cùng hàm so khớp với Option 1.

### 4. Khớp giao diện CMS-26

- **Option 1:** markup là của mình, đổi gì cũng chỉ là CSS thường. Chỉ có 4 `!important` trong toàn bộ `src`.
- **Option 2:** phải duy trì thêm một lớp riêng cho vxe:
  - `_vxe-theme.scss`: ánh xạ token sang `--vxe-ui-*`, kèm các rule `:deep(.vxe-header--column)`… trong từng bảng.
  - `_table-skin.scss`: selector `$app-owned` / `$vxe-owned`, để rule chung của app (`button`, `*`, thanh cuộn) không phá phần vxe vẽ.
  - `_preflight.scss`: chép tay phần Tailwind preflight, giới hạn để không chạm vxe.
  - Thanh cuộn: vxe ẩn thanh cuộn native rồi tự vẽ, xung đột với `scrollbar-width: thin` của shell. Đã phải trả các node `vxe-*` về `auto`.
  - Nút, modal, icon của `vxe-pc-ui` không khớp CMS-26, nên vẫn dùng component của design system.

Mỗi lần nâng cấp vxe, các selector `.vxe-*` này có thể vỡ.

### 5. i18n

Cả hai POC đều đã có `vue-i18n` (vi/en) và `locale-bridge` cho micro-frontend. Option 2 còn có chữ dựng sẵn của vxe (nút, thông báo trống, lọc…). Phần đó lấy từ gói `vi-VN` của `vxe-pc-ui`, phải đổi ngôn ngữ song song với app (`VxeUI.setLanguage`). Hiện `main.ts` mới đặt cố định `vi-VN`.

### 6. Khả năng tiếp cận

`ReportGrid` của Option 1 có 13 thuộc tính `role` / `aria-*`: `role="table"`, `aria-rowcount`, `aria-rowindex`, `aria-sort`, và tiêu đề là `<button>` nên sắp xếp được bằng bàn phím. Bản vxe chỉ có `role="region"` ở khung bọc; phần bên trong do vxe sinh ra và chưa được kiểm tra bằng trình đọc màn hình.

### 7. Hiệu năng

Đo ngày 05/11 bằng nút **"Chạy đo"** ở trang báo cáo A01 (`/reports/a/a01`), trên bản build production (`vite preview`). Cả hai chạy trong cùng trình duyệt Chromium của app Claude, viewport giả lập 1440×900, cùng một máy Windows.

Mỗi mức 10k / 100k / 300k chạy 3 lần trong cùng một trang, bảng dưới ghi số trung vị. Mức 1M chỉ chạy 1 lần, trên trang mới tải. Đơn vị ms; mỗi số tính từ lúc gọi thao tác tới khi DOM vẽ xong.

| Số dòng | Thao tác | TanStack | vxe |
| --- | --- | ---: | ---: |
| 10k | Nạp dữ liệu | **15** | 182 |
| | Sắp xếp theo số tiền | 67 | 68 |
| | Sắp xếp theo tên món | 100 | 100 |
| | Tìm "pho" | **98** | 202 |
| | Xoá tìm kiếm | **87** | 241 |
| | Cuộn xuống cuối | 46 | 49 |
| 100k | Nạp dữ liệu | **97** | 447 |
| | Sắp xếp theo số tiền | **273** | 501 |
| | Sắp xếp theo tên món | 833 | **543** |
| | Tìm "pho" | 1.095 | **546** |
| | Xoá tìm kiếm | **578** | 915 |
| | Cuộn xuống cuối | 39 | 57 |
| 300k | Nạp dữ liệu | **386** | 1.312 |
| | Sắp xếp theo số tiền | **765** | 2.115 |
| | Sắp xếp theo tên món | 2.082 | 1.990 |
| | Tìm "pho" | 2.661 | **1.379** |
| | Xoá tìm kiếm | 3.195 | 2.439 |
| | Cuộn xuống cuối | 50 | 44 |
| | RAM (JS heap) | 570–969 MB | 272–500 MB |
| 1M | Nạp dữ liệu | **2.260** | 3.719 |
| | Sắp xếp theo số tiền | **2.111** | 6.553 |
| | Sắp xếp theo tên món | 6.331 | 6.622 |
| | Tìm "pho" | 6.644 | **4.512** |
| | Xoá tìm kiếm | **5.718** | 9.854 |
| | Cuộn xuống cuối | 40 | 115 |
| | RAM (JS heap) | 1.771 MB | 1.133 MB |

Đọc kết quả:

- **Cuộn:** cả hai đều dưới ~120 ms ở mọi mức. Cuộn ảo không phải vấn đề với bên nào.
- **Nạp dữ liệu và sắp xếp theo số:** TanStack nhanh hơn rõ, gấp 2–12 lần.
- **Tìm kiếm và sắp xếp theo chữ:** TanStack chậm hơn ở 100k. Phần chậm nằm ở logic, không phải ở thư viện vẽ bảng:
  - Tìm kiếm của TanStack chạy qua filtered row model, gọi hàm lọc cho từng ô. Bản vxe lọc bằng một vòng JS thuần (`filterSalesRows`). TanStack cũng có thể lọc trước bằng đúng hàm đó.
  - Sắp xếp chữ dùng `sortFn_alphanumeric` của TanStack. Đổi sang `Intl.Collator` hoặc tính trước khoá sắp xếp sẽ nhanh hơn.
- **RAM:** TanStack tốn hơn, khoảng 1,5–2 lần, vì giữ thêm đối tượng row model cho mỗi dòng.
- **Từ 300k dòng:** cả hai đều mất 1,4–10 s cho mỗi lần sắp xếp hoặc tìm. Đây là giới hạn của việc xử lý toàn bộ dữ liệu ở trình duyệt, đổi thư viện cũng không khắc phục được.

Độ nhiễu cao: cùng một bài đo TanStack 1M chạy lúc khung trình duyệt hẹp (519 px) cho số chậm gấp ~2 lần, ví dụ tìm kiếm mất 14,6 s thay vì 6,6 s. Vì vậy chỉ nên tin chênh lệch từ ~2 lần trở lên.

### 8. Công sức phát triển với bảng nặng

Kiểm tra trên phiên bản đã cài: `@tanstack/table-core` 9.3.1, `vxe-table` 4.23.12, `vxe-pc-ui` 4.20.33. Nguồn đối chiếu là type definitions và mã nguồn trong `node_modules`.

**Bằng chứng có sẵn: bảng kéo thả ở `/table`.** Cả hai POC đều có một bảng 10.000 dòng, cuộn ảo, kéo đổi thứ tự dòng và cột.

| | TanStack (`VirtualTanStackTable.vue` + `columns.ts`) | vxe (`VxeProductTable.vue`) |
| --- | --- | --- |
| Tổng số dòng | 389 + 98 | 152 |
| Riêng phần kéo thả | ~100 dòng logic, thêm thư viện `@formkit/drag-and-drop` và CSS trạng thái kéo | 4 dòng cấu hình + 2 hàm xử lý sự kiện (~12 dòng) |
| Đổi độ rộng cột | Chưa làm | Có, `resizable: true` |
| Chỗ khó phải tự xử lý | Thư viện kéo thả chỉ "thấy" ~20 dòng đang vẽ, nên phải ánh xạ chỉ số dòng trong DOM về mảng dữ liệu. Phải giữ dòng đang kéo trong DOM khi nó trôi khỏi vùng nhìn thấy (`rangeExtractor`) | Không có. vxe tự chuyển dòng, chỉ cần đồng bộ thứ tự mới ra ngoài |

**Từng tính năng:**

| Tính năng | TanStack: thư viện cho gì, mình phải viết gì | vxe-table |
| --- | --- | --- |
| Header sticky, ghim cột trái/phải | `columnPinningFeature` tính offset. Tự viết CSS `sticky`, bóng ở mép cột ghim (đã có, ~40 dòng trong `CmsDataTable`) | `fixed: 'left' \| 'right'` |
| Tiêu đề nhiều tầng | `getHeaderGroups()` có sẵn `colSpan`. Tự vẽ nhiều dòng `<th>`, ô giữ chỗ, sticky từng tầng, offset ghim theo nhóm | `children` trong cột / `vxe-colgroup` |
| Gộp ô | v9 có `cellSpanningFeature`: tính `rowSpan` / `colSpan`. Tự vẽ. Bảng cuộn ảo dùng `div` định vị tuyệt đối nên không có `rowspan` thật: phải tự tính chiều cao ô gộp và vẽ ô gốc khi nó đã trôi khỏi vùng nhìn thấy | `mergeCells` (danh sách tĩnh) hoặc `spanMethod`. **Lưu ý:** type definition ghi `spanMethod` không khuyến nghị khi có cuộn ảo kèm cột ghim hoặc cây, và không gộp được cả hàng lẫn cột cùng lúc |
| Kéo thả đổi thứ tự cột | `columnOrderingFeature` giữ state. Kéo thả tự làm bằng thư viện ngoài (~40 dòng). Còn phải tự chặn kéo qua ranh giới cột ghim hoặc nhóm tiêu đề | `column-config="{ drag: true }"`, có `columnDragConfig` |
| Kéo thả dòng | Như bảng `/table`: ~60 dòng, kèm xử lý riêng cho cuộn ảo | `row-config="{ drag: true }"` |
| Đổi độ rộng cột | `columnResizingFeature` có sẵn handler. Tự vẽ tay nắm và CSS (~30 dòng) | `resizable: true` |
| Cây dòng, nhóm + tổng phụ | `rowExpandingFeature`, `columnGroupingFeature`, `rowAggregationFeature` (logic). Tự vẽ thụt lề, nút mở/đóng, dòng tổng phụ | `treeConfig`, `aggregateConfig` |
| Sửa trong ô + kiểm tra hợp lệ | Không có. Tự làm hoàn toàn bằng `CmsInput`, `CmsSelect`… | `editConfig`, `validConfig`. Ô sửa mặc định là input của `vxe-pc-ui`, muốn đúng CMS-26 thì phải thay bằng slot dùng component của mình |
| Chọn vùng ô, copy/paste | v9 có `cellSelectionFeature` (logic). Tự vẽ vùng chọn, tự xử lý clipboard | `areaConfig` / `clipConfig` chỉ có type; mã chạy nằm trong plugin `extend-cell-area` **không có trong gói đã cài** (bản trả phí của vxe) |
| Xuất Excel | Không có. Tự dùng SheetJS/exceljs, tự dựng tiêu đề nhiều tầng và ô gộp | `exportConfig` có sẵn CSV/HTML. Muốn `.xlsx` phải cài thêm `@vxe-ui/plugin-export-xlsx` (mã nguồn báo `reqPlugin` nếu thiếu) |
| Ẩn/hiện, tuỳ chỉnh cột | `columnVisibilityFeature`. Tự làm panel | `customConfig` + panel có sẵn (giao diện `vxe-pc-ui`) |

**Chi phí ẩn của vxe:** cứ mỗi tính năng có giao diện riêng (popup lọc, panel tuỳ chỉnh cột, ô sửa, menu chuột phải, hộp thoại xuất file), phần giao diện đó là của `vxe-pc-ui` và không khớp CMS-26. Muốn khớp thì phải chọn một trong hai:
- đè style bằng `:deep(.vxe-*)`, dễ vỡ khi nâng cấp vxe;
- thay hẳn bằng slot dùng component CMS-26.

Vì vậy phần tiết kiệm thực tế nhỏ hơn bảng trên, nhất là với popup và ô sửa. Nó vẫn lớn với các phần không có giao diện riêng: kéo thả, đổi rộng, ghim, gộp ô, tiêu đề nhiều tầng, cuộn ảo ngang.

**Ước lượng thô** cho một bảng có đủ ghim cột, tiêu đề 2 tầng, gộp ô, kéo + đổi rộng cột và cuộn ảo hai chiều:
- TanStack: ~600–900 dòng cho component bảng dùng chung.
- vxe: ~150–250 dòng cấu hình + style, chưa tính các slot thay giao diện CMS-26.

Phần này viết một lần trong component dùng chung, nhưng tổ hợp tính năng càng nhiều thì chỗ khó ở TanStack tăng nhanh. Rõ nhất là gộp ô + cuộn ảo + kéo cột cùng lúc. Bài thử ở mục 9 cho tỉ lệ ~3,8 lần, cùng chiều với ước lượng này.

### 9. Bài thử: cùng một bảng nặng ở cả hai POC

Làm ngày 05/11. Mở ở `/spike` của từng POC.

**Đầu bài:**
- 100.000 dòng hoá đơn, cuộn ảo.
- Tiêu đề 2 tầng: Hoá đơn / Nơi bán / Món / Thanh toán.
- Nhóm "Hoá đơn" (2 cột) ghim trái.
- Gộp ô theo hoá đơn ở 3 cột: 2 cột ghim (Mã HĐ, Thời gian) và 1 cột không ghim (Thanh toán).
- Kéo đổi thứ tự cột, chỉ trong cùng nhóm, không kéo cột ghim.
- Kéo đổi độ rộng cột.

**Chỗ dùng chung và chỗ khác nhau:**
- `src/spike/spike.ts` (dữ liệu, bộ cột, quy tắc gộp ô) và `SpikePage.vue` giống hệt nhau ở hai POC.
- Chỉ `SpikeGrid.vue` dựng bằng thư viện của từng POC.

**Số dòng code của `SpikeGrid.vue`:**

| | Script | Template | Style | Tổng | JS sau build (gzip) |
| --- | ---: | ---: | ---: | ---: | ---: |
| TanStack | 120 | 83 | 87 | **292** | 6,2 KB |
| vxe | 39 | 20 | 15 | **76** | 1,4 KB (cộng thư viện vxe đã có sẵn) |

**Kiểm tra trên trình duyệt** (viewport 1440×900, dev server):

| Kiểm tra | TanStack | vxe |
| --- | --- | --- |
| Ô gộp đúng 3 dòng/hoá đơn ở đầu bảng | Đạt | Đạt |
| Nhảy tới dòng 60.001 khi ô gộp bị cắt dưới header | Đạt (ô gộp vẫn được vẽ dù dòng đầu nhóm đã trôi khỏi vùng nhìn thấy) | Đạt |
| Cuộn ngang tới cuối: cột ghim đứng yên, cột gộp không ghim vẫn đúng | Đạt | Đạt |
| Kéo đổi thứ tự cột bằng chuột thật | Logic đạt khi bắn `DragEvent` bằng JS. Kéo chuột qua công cụ tự động không kích hoạt được HTML5 drag-and-drop, nên chưa xác minh bằng thao tác thật | Đạt |
| Chặn kéo cột sang nhóm khác | Đạt | Mặc định |
| Kéo đổi độ rộng cột (header, thân, nhóm cha cùng cập nhật) | Đạt | Đạt |
| Lỗi trên console | Không | Không |

**Vấn đề gặp khi làm:**
- **vxe (1):** mặc định chỉ hiện tay nắm kéo ở tiêu đề nhóm. Muốn kéo từng cột trong nhóm phải bật `isPeerDrag: true`.
- **TanStack (4):**
  1. API v9 khác v8: ghim cột dùng `start`/`end` thay cho `left`/`right`.
  2. `getVisibleLeafColumns()` cần thêm `columnVisibilityFeature`.
  3. Id cột nhóm trùng id cột lá (`invoice`) làm tiêu đề nhóm hiện sai, phải đổi id nhóm.
  4. Phải ép kiểu mảng cột lá khi lồng vào nhóm.

  Ngoài ra phải tự thiết kế hai chỗ:
  - Lớp chồng (`z-index`) để ô gộp cao nhiều dòng không bị các dòng sau che, vì mỗi dòng dùng `transform` và tạo stacking context riêng.
  - `rangeExtractor` để luôn vẽ dòng đầu nhóm.

**Bản TanStack còn thiếu so với vxe:**
- Cuộn ảo ngang (vxe có sẵn).
- Kéo thả trên màn hình cảm ứng: HTML5 drag-and-drop không chạy trên touch, muốn có thì phải đổi sang thư viện kéo thả hoặc tự viết bằng pointer event.
- Hiệu ứng kéo và bóng mờ của cột đang kéo.

Muốn bằng vxe thì bản TanStack còn phải viết thêm, nên tỉ lệ thực tế sẽ lớn hơn 3,8 lần.

**Bản vxe còn thiếu:** tay nắm kéo, tooltip và đường dẫn khi kéo vẫn là giao diện của vxe, chưa chỉnh theo CMS-26.

## Chưa so sánh

- Kéo đổi thứ tự cột bằng chuột thật ở bản TanStack (`/spike`, thử tay).
- Tối ưu tìm kiếm và sắp xếp chữ cho TanStack như mục 7 gợi ý, rồi đo lại.
- Bản vxe import theo nhu cầu, để biết bundle giảm được bao nhiêu.
- Trình đọc màn hình trên bảng vxe; mobile trên thiết bị thật.

## Cách lấy lại số liệu

```bash
cd virtual-table-poc && npm run build
```

```bash
cd vxe-table-poc && npm run build
```

Kích thước: cộng các file trong `dist/assets/*.js` và `*.css` (gzip từng file). Số dòng: đếm `*.vue`, `*.ts`, `*.scss`, `*.css` trong `src/`.
