# VxeTable PoC · Vue 3 + TypeScript

Project trong folder con `vxe-table-poc`, dùng Vue Composition API và Vite. Folder cha là base design CMS-26; dữ liệu sản phẩm hoàn toàn giả lập.

## Layout desktop

Trang mặc định là layout CMS-26 với nội dung text placeholder. Home đóng/mở sidebar trực tiếp, không có backdrop. Click module chuyển sang thanh icon; nút panel ngay dưới logo FABI mở menu đầy đủ với backdrop. Thanh icon ẩn scrollbar, vẫn cuộn chuột được và có nút lên/xuống cuộn tối đa 240px mỗi lần. Module đang chọn tự được đưa vào vùng nhìn thấy khi resize. Drawer trượt vào/ra cùng backdrop, giữ modal tới hết animation đóng; hỗ trợ Esc, bàn phím và reduced motion. Module Báo cáo có sidebar riêng, tìm theo tên/mã không dấu và breadcrumb, hỗ trợ `Báo cáo → Báo cáo A → A01 → A01.1`.

- Router: `vue-router` history mode, URL không có hash. `/` là Trang chủ, `/<module>` cho từng module (vd `/menu`), `/reports/...` cho báo cáo. Khai báo route ở `src/router.ts`.
- Thử trực tiếp: `/reports/a/a01/a01-1`.
- Demo bảng cũ: `/table`.
- Khi deploy, server cần fallback mọi đường dẫn không phải file tĩnh về `index.html` (vd nginx `try_files $uri /index.html`). Vite dev/preview đã tự làm việc này.
- Topbar luôn hiện `Vue 3 · VxeTable`; click nhãn stack để mở demo bảng.
- Component layout: `src/components/navigation/`; asset xuất từ hai frame Figma nằm trong `public/navigation/`.
- Desktop được kiểm tra tại 1440×1000 và 1280×720.
- `tests/navigation.spec.ts` kiểm tra cùng hành vi trên cả hai repo. Trước khi chạy, mở thêm virtual-table-poc tại cổng 5174: `npm run dev -- --port 5174 --strictPort`. VXE dùng cổng 5175.

## Mobile web

Dưới 960px, topbar có nút mở menu chính và nút tên module Báo cáo để mở menu con trong cùng một drawer. Báo cáo đi từng cấp bằng nút mũi tên, có quay lại và tìm toàn bộ báo cáo kèm đường dẫn; bấm tên mở trang, chọn trang đóng drawer. Mỗi lần mở lại hiển thị cấp chứa mục đang chọn và xoá tìm kiếm cũ. Nhãn stack luôn hiện trên topbar. Resize sang desktop đóng drawer cũ. Vùng chạm của menu chính và mục báo cáo tối thiểu 44px, xử lý safe area và giảm chuyển động.

Playwright kiểm tra các viewport 390×844, 320×568 và 844×390, gồm tap và vuốt cuộn tổng hợp qua Chromium/Edge. Chưa xác minh trên thiết bị thật hoặc Safari iOS.

## Chạy local

Yêu cầu Node.js 22.12+ (đã kiểm tra với 22.23.4).

```sh
cd vxe-table-poc
npm ci
npm run dev
```

Mở http://127.0.0.1:5175. `npm run build` kiểm tra TypeScript rồi build production. `npm run preview` xem bản build.

## File chính

- `src/main.ts`: đăng ký `vxe-pc-ui` trước `vxe-table`, import đủ CSS, cấu hình tiếng Việt. Dùng `.ts` thay cho `main.js` theo yêu cầu TypeScript.
- `src/components/VxeTablePoC.vue`: bảng và toàn bộ luồng cuộn/kéo thả.
- `src/data/records.ts`: kiểu dữ liệu và bộ tạo dữ liệu mock xác định, ID không trùng khi nối trang.
- `src/styles/main.scss`: entry SCSS, dùng `@use` để tổ chức các layer.
- `src/styles/_base.generated.scss`: token màu/bo góc, font, typography và mixin button/badge được sinh từ `../tokens.css` và `../components.css`. Không sửa trực tiếp file này.
- `src/styles/_tokens.scss`: xuất token và semantic alias; `_base.scss`: reset và typography nền; `_components.scss`: button/badge dùng mixin base; `_vxe-theme.scss`: ánh xạ token sang theme VxeTable; `_layout.scss`: bố cục riêng của PoC.
- `scripts/sync-design.mjs`: đồng bộ từ folder cha bằng PostCSS. Chạy tự động trước `npm run dev` và `npm run build`; chạy riêng với `npm run sync:design`. Khi sửa base trong lúc dev đang chạy, chạy lại lệnh này để HMR cập nhật SCSS. Font import được lấy từ base, có sans-serif dự phòng.

Folder cha là nguồn chuẩn: giữ cấu trúc thư mục khi chạy sync/dev/build. Script báo lỗi nếu thiếu file hoặc selector base, không âm thầm dùng token cũ. Không mang CSS trang preview (`.ds-page`, `.ds-back`…) vào app. Không duy trì bảng màu hex riêng trong project con.

## API thực tế của phiên bản đã cài

`vxe-table 4.23.12` và `vxe-pc-ui 4.20.33` khai báo MIT trong package. Không cài plugin trả phí. Package lock khóa dependency để có thể tái tạo bản đã test. Nguồn: [VxeTable](https://github.com/x-extends/vxe-table), [Vxe UI](https://github.com/x-extends/vxe-pc-ui).

- `row-config="{ keyField: 'id', drag: true }"` và `column-config="{ drag: true }"` bật kéo thả tích hợp.
- Cột STT đầu bảng có `drag-sort`. Phiên bản này **không hỗ trợ `type="drag"`**. Kiểu cột và sự kiện được đối chiếu với type definitions và source trong dependency đã cài.
- Sự kiện là `row-dragend` / `column-dragend`, dùng `_index.oldIndex` và `_index.newIndex` (zero-based; UI log hiển thị one-based). Console còn in payload đầy đủ.
- `scroll-y="{ enabled: true, gt: 20 }"` giữ đúng yêu cầu. Đây là alias tương thích đã deprecated; API mới tương đương là `virtual-y-config="{ enabled: true, gt: 20 }"`.

## Luồng dữ liệu và hiệu năng

Khởi tạo 10.000 records trong `shallowRef`. Chiều cao bảng 600px, nội dung cell giới hạn một dòng, virtual rendering chỉ dựng một tập nhỏ hàng DOM.

Sự kiện `scroll` cung cấp `scrollTop`, `scrollHeight`, `bodyHeight`. Khi còn cách đáy tối đa 200px, tự tải 50 records sau 350ms mô phỏng mạng. Cờ `loading` ngăn tải trùng; nối bằng array mới để `shallowRef` kích hoạt cập nhật. Không dùng overlay chặn bảng trong lúc tải.

Kéo hàng đã được VxeTable xử lý nội bộ. Handler chỉ đồng bộ `getTableData().fullData`, không di chuyển lần thứ hai. Sau thời gian chờ tải, đọc thứ tự mới nhất trước khi nối, giữ cả thao tác kéo xảy ra trong lúc tải. Timer được dọn khi unmount. Có trạng thái lỗi và nút thử lại; mock mặc định không chủ động gây lỗi.

Nút **Đến cuối bảng** giúp thử tải tiếp mà không phải cuộn qua 10.000 hàng. Checkbox tạm ngừng việc tự tải cho các lần cuộn sau; một lượt đã bắt đầu vẫn hoàn tất. Nút **Về đầu bảng** giúp kiểm tra thứ tự sau tải.

PoC không có giới hạn tổng số bản ghi: virtual scroll giới hạn DOM, không giới hạn RAM; dữ liệu sẽ tiếp tục tăng khi tải thêm. Đây không phải benchmark FPS hay cam kết không giật trên mọi thiết bị. Full plugin registration được giữ để minh họa cài đặt; build hiện có cảnh báo bundle lớn, production nên cân nhắc import theo component.

## Kiểm thử

```sh
npm test
```

Playwright dùng Microsoft Edge cài trên máy (`channel: 'msedge'`), tự chạy dev server nếu cần. Nếu máy không có Edge, đổi channel hoặc cài trình duyệt Playwright tương ứng.

Test kiểm tra dưới 100 hàng DOM, kéo hàng và cột bằng chuột, tải hai batch thành 10.100 records, giữ thứ tự sau tải, tạm ngừng auto-load, không có page error và không tràn trang ở 390px. Ảnh desktop/mobile nằm trong `.impeccable/review/`.
