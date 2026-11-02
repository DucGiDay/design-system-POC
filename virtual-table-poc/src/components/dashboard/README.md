# Dashboard CMS-26

Nguồn: [Figma CMS-26, node 136:4080](https://www.figma.com/design/lksyF9cMWxH8sl4SPSuw17/CMS-26?node-id=136-4080).

Dashboard Vue 3 trong POC TanStack, route `/`. Chỉ sử dụng dữ liệu mẫu, chưa kết nối API.

- Desktop từ 960px: phần chào và bộ lọc cố định, nội dung bên dưới cuộn riêng.
- Mobile dưới 960px: cuộn toàn bộ dashboard trong vùng nội dung của shell.
- NET/GROSS, khoảng thời gian, phạm vi cửa hàng và sắp xếp mặt hàng cập nhật dữ liệu mẫu; các kỳ không có dữ liệu lãi lỗ hiển thị trống.
- Chi tiết mở bản xem trước; menu thẻ tải CSV, SVG hoặc PNG. Kết nối kênh chỉ hướng dẫn sang module Kênh bán hàng, không gọi dịch vụ bên ngoài.
- `TODO(design)`: phần mở chọn ngày dùng input date gốc trong khung overlay, chờ Figma thiết kế trạng thái mở.

Ảnh và các lớp SVG minh hoạ trong `public/dashboard/` được tải từ các asset của Figma node `136:4126`, `136:4116`, `136:4386`. Icon UI lấy từ bộ `assets/icons/` ở gốc repo và hiển thị qua `AppIcon`.

Token màu nền banner và chữ số 56/64, chỉ số 26/32, tiêu đề báo cáo 15/22, nhãn biểu đồ 10/14 được bổ sung vào `tokens.css` theo Figma. `_base.generated.scss` do `sync:design` sinh.

Kiểm tra UI: `.impeccable/review/check-dashboard.mjs` dùng Playwright đã có ở POC Vxe làm công cụ kiểm tra, không thêm thư viện Vxe vào app TanStack. Kết quả và ảnh chụp nằm trong `.impeccable/review/`.
