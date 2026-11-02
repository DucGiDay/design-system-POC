# Dashboard CMS-26

Nguồn: [Figma CMS-26, node 136:4080](https://www.figma.com/design/lksyF9cMWxH8sl4SPSuw17/CMS-26?node-id=136-4080).

Dashboard Vue 3 trong POC TanStack, route `/`. Chỉ sử dụng dữ liệu mẫu, chưa kết nối API.

- Desktop từ 960px: phần chào và bộ lọc cố định, nội dung bên dưới cuộn riêng.
- Mobile dưới 960px: cuộn toàn bộ dashboard trong vùng nội dung của shell.
- NET/GROSS, khoảng thời gian, phạm vi cửa hàng và sắp xếp mặt hàng cập nhật dữ liệu mẫu; các kỳ không có dữ liệu lãi lỗ hiển thị trống.
- Mỗi card báo cáo chỉ có một hành động "Chi tiết" (luôn hiện chữ), mở bản xem trước. Menu "⋯" tải CSV, SVG, PNG đã bỏ. Kết nối kênh chỉ hướng dẫn sang module Kênh bán hàng, không gọi dịch vụ bên ngoài.
- Dải chỉ số là một khung chia bởi vạch 1px, có 4 hoặc 5 ô. Ô "Phí dịch vụ" chỉ có khi cửa hàng bật phí dịch vụ; xem thử bằng `/?metrics=5`. Từ 67rem trở xuống 5 ô chia 3 + 2, dưới 46rem chia 2 cột (ô lẻ cuối trải hết hàng), dưới 32rem một cột.
- Banner cấp ứng dụng (`CmsBanner`, gắn ở `DesktopShell`) nằm trên cùng, trên cả sidebar và topbar, không cuộn theo nội dung. Xem thử: `/?banner=expiry` (gói sắp hết hạn, cam, có nút Gia hạn, ẩn được), `/?banner=maintenance` (bảo trì, xanh, ẩn được), `/?banner=incident` (sự cố, đỏ, không ẩn được). Nút Gia hạn đang trỏ tạm sang Marketplace, cần nối luồng gia hạn thật.
- `TODO(design)`: banner chưa có trong Figma, đang làm theo Soft-Pair.
- `TODO(design)`: phần mở chọn ngày dùng input date gốc trong khung overlay, chờ Figma thiết kế trạng thái mở.

Ảnh và các lớp SVG minh hoạ trong `public/dashboard/` được tải từ các asset của Figma node `136:4126`, `136:4116`, `136:4386`. Icon UI lấy từ bộ `assets/icons/` ở gốc repo và hiển thị qua `AppIcon`.

Token màu nền banner và chữ số 56/64, chỉ số 26/32, tiêu đề báo cáo 15/22, nhãn biểu đồ 10/14 được bổ sung vào `tokens.css` theo Figma. `_base.generated.scss` do `sync:design` sinh.

Kiểm tra UI: `.impeccable/review/check-dashboard.mjs` dùng Playwright đã có ở POC Vxe làm công cụ kiểm tra, không thêm thư viện Vxe vào app TanStack. Kết quả và ảnh chụp nằm trong `.impeccable/review/`.

Màn này ưu tiên taste skill hơn bản Figma ở các điểm sau: ô chỉ số chỉ có nhãn và con số (bỏ icon trong ô màu, con số màu mực), biến động là nhãn nền nhạt theo tốt/xấu cho nhà hàng (giảm giá và chi phí tăng là đỏ); con số doanh thu hạ xuống 36/44 nhưng giữ màu primary, kỳ so sánh đọc qua trình đọc màn hình; icon card báo cáo là icon xám trơn; chữ biểu đồ tối thiểu 11px; không dùng ký tự ▲ làm icon.
