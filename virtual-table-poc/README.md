# Virtual table — CMS-26

Vue 3 POC dùng base design ở folder cha. Style được biên dịch bằng Sass; utility Tailwind giữ prefix `fb-` theo quy ước FABI.

## Layout desktop

Trang mặc định là layout CMS-26 với nội dung text placeholder. Home đóng/mở sidebar trực tiếp, không có backdrop. Click module chuyển sang thanh icon; nút panel ngay dưới logo FABI mở menu đầy đủ với backdrop. Thanh icon ẩn scrollbar, vẫn cuộn chuột được và có nút lên/xuống cuộn tối đa 240px mỗi lần. Module đang chọn tự được đưa vào vùng nhìn thấy khi resize. Drawer trượt vào/ra cùng backdrop, giữ modal tới hết animation đóng; hỗ trợ Esc, bàn phím và reduced motion. Module Báo cáo có sidebar riêng, tìm theo tên/mã không dấu và breadcrumb, hỗ trợ `Báo cáo → Báo cáo A → A01 → A01.1`.

- Router: `vue-router` history mode, URL không có hash. `/` là Trang chủ, `/<module>` cho từng module (vd `/menu`), `/reports/...` cho báo cáo. Khai báo route ở `src/router.ts`.
- Thử trực tiếp: `/reports/a/a01/a01-1`.
- Demo bảng cũ: `/table`.
- Khi deploy, server cần fallback mọi đường dẫn không phải file tĩnh về `index.html` (vd nginx `try_files $uri /index.html`). Vite dev/preview đã tự làm việc này.
- Topbar luôn hiện `Vue 3 · TanStack Table`; click nhãn stack để mở demo bảng.
- Component layout: `src/components/navigation/`; asset xuất từ hai frame Figma nằm trong `public/navigation/`.
- Desktop được kiểm tra tại 1440×1000 và 1280×720.
- Bộ kiểm tra điều hướng dùng chung ở `../vxe-table-poc/tests/navigation.spec.ts`, chạy khi hai dev server đang mở tại cổng 5174 và 5175.

## Mobile web

Dưới 960px, topbar có nút mở menu chính và nút tên module Báo cáo để mở menu con trong cùng một drawer. Báo cáo đi từng cấp bằng nút mũi tên, có quay lại và tìm toàn bộ báo cáo kèm đường dẫn; bấm tên mở trang, chọn trang đóng drawer. Mỗi lần mở lại hiển thị cấp chứa mục đang chọn và xoá tìm kiếm cũ. Nhãn stack luôn hiện trên topbar. Resize sang desktop đóng drawer cũ. Vùng chạm của menu chính và mục báo cáo tối thiểu 44px, xử lý safe area và giảm chuyển động.

Playwright kiểm tra các viewport 390×844, 320×568 và 844×390, gồm tap và vuốt cuộn tổng hợp qua Chromium/Edge. Chưa xác minh trên thiết bị thật hoặc Safari iOS.

## Nguồn thiết kế

- `../tokens.css`: màu, bo góc, font và toàn bộ thang typography.
- `../components.css`: button SM, badge và các cặp màu trạng thái.
- `../DESIGN.md`: quy tắc elevation, focus và mật độ dữ liệu.

`npm run sync:design` đọc hai file CSS nguồn bằng PostCSS và sinh `src/styles/_base.generated.scss`. File sinh chỉ chứa token/mixin, không kéo layout canvas hay reset của trang tham chiếu vào ứng dụng. Không sửa file này bằng tay.

## Cấu trúc SCSS

- `src/styles/_tokens.scss`: xuất CSS custom properties từ base, thêm shadow/focus và motion cho POC.
- `src/styles/_components.scss`: button và status badge dùng các mixin được sinh từ base.
- `src/style.scss`: entry point, nền ứng dụng, trạng thái kéo thả, scrollbar và reduced motion.
- `tailwind.config.ts`: ánh xạ utility tới CSS variables, không lặp lại giá trị màu/typography.

Khi base design thay đổi, chạy lại `npm run sync:design` hoặc khởi động lại dev server. Đồng bộ tự chạy trước `npm run dev` và `npm run build`, đồng thời chạy khi Vite nạp config để hỗ trợ cả khởi động trực tiếp qua IDE hoặc lệnh `vite`. Shadow trong `_tokens.scss` cần đối chiếu thủ công khi vocabulary trong `DESIGN.md` thay đổi.

## Chạy

```sh
npm install
npm run dev
npm run build
```

Giữ folder cha khi build vì đó là nguồn thiết kế. Có thể chọn port bằng `npm run dev -- --port 5180 --strictPort`.
