# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Người dùng chính là những người vận hành chuỗi F&B trên FABI CMS (iPOS):

- **Chủ chuỗi / quản lý vùng:** theo dõi báo cáo và KPI trên nhiều thương hiệu và cửa hàng, so sánh hiệu quả giữa các điểm bán.
- **Quản lý cửa hàng:** cấu hình hằng ngày cho cửa hàng của mình: menu, bàn, nhân viên, các thiết lập vận hành.
- **Kế toán / vận hành:** đối soát, xuất báo cáo, làm việc nhiều trên bảng dữ liệu và form dài.

Phần lớn công việc là thao tác lặp lại, nhiều dữ liệu, thực hiện trên laptop/desktop trong giờ làm việc.

## Product Purpose

Đây là design system cho bản redesign FABI CMS. Nó gồm token, component và các trang tham chiếu HTML được dựng lại từ file Figma CMS-26, để đội dev triển khai bản CMS mới bằng Vue 3 bám đúng thiết kế.

Thành công nghĩa là:

- dev dựng màn hình mới từ các component có sẵn mà không phải tự chế;
- giao diện CMS nhất quán giữa các module;
- bản code khớp với Figma.

## Positioning

Chưa xác định. Chưa có tuyên bố khác biệt nào được xác nhận so với các CMS F&B khác. Không được tự đặt ra.

## Operating Context

- Nguồn thiết kế: Figma [CMS-26](https://www.figma.com/design/lksyF9cMWxH8sl4SPSuw17/CMS-26). Mỗi trang HTML tương ứng với một frame/section và ghi node id của nó trên `index.html`.
- Sản phẩm đích: FABI CMS viết bằng Vue 3. Repo này là bản tham chiếu HTML/CSS tĩnh, không phải mã chạy trong sản phẩm.
- Ngữ cảnh đa thương hiệu, đa cửa hàng: bộ chọn thương hiệu và chip phạm vi cửa hàng là khái niệm lõi. Mọi dữ liệu đều được lọc theo thương hiệu và cửa hàng đang chọn.
- Vận hành nhà hàng: sơ đồ bàn, loại hình bàn, menu tiện ích bàn, báo cáo doanh thu và chỉ số.

## Capabilities and Constraints

- **Figma CMS-26 là nguồn gốc.** HTML phải khớp Figma về toạ độ, kích thước, biến màu và asset. Khi có xung đột, Figma thắng. Các sai lệch đã biết được ghi chú trên `index.html`.
- **Desktop là chính.** CMS được dùng chủ yếu trên laptop/desktop. Mobile chỉ là phụ và không chi phối quyết định layout.
- **Cấu trúc:** token ở `tokens.css`, style dùng chung ở `components.css`, mỗi nhóm component một trang (`01-mau-sac.html` … `15-dropdown.html`), asset ở `assets/`. Icon là bộ Lucide 24px, nét 1.8 (`assets/icons`).
- **Font:** Be Vietnam Pro, tải từ Google Fonts. Ngoài font, mọi thứ đều là file cục bộ và mở thẳng được bằng trình duyệt.
- **Ngôn ngữ:** copy và tên component hiện tại đều bằng tiếng Việt. Việc có hỗ trợ đa ngôn ngữ hay không chưa được quyết định.
- **AI:** có component Chip AI và nút AI, nhưng phạm vi tính năng AI trong sản phẩm chưa được xác nhận.

## Brand Commitments

- Tên: FABI (iPOS); hệ thống thiết kế: CMS-26.
- Font Be Vietnam Pro và bộ icon Lucide là lựa chọn đã có trong Figma.

## Evidence on Hand

- 15 trang component tham chiếu cùng asset xuất từ Figma, nằm trong `assets/`.
- Dữ liệu mẫu trong component (ví dụ "Chanh Dev", "Ngọc Béo", "Cầu Giấy") chỉ là placeholder, không phải khách hàng thật.
- Chưa có số liệu, testimonial hay case study thật. Không được bịa ra.

## Product Principles

1. **Figma là chuẩn.** Code tái hiện thiết kế, không diễn giải lại.
2. **Dựng màn hình bằng ghép component.** Màn hình mới ưu tiên ghép từ component có sẵn. Thiếu component thì bổ sung vào hệ thống, không vá cục bộ.
3. **Mật độ dữ liệu phục vụ công việc.** Người dùng làm việc nhiều giờ với bảng, form và báo cáo, nên độ dễ quét và sự nhất quán quan trọng hơn trang trí.
4. **Ngữ cảnh luôn rõ ràng.** Người dùng phải luôn biết mình đang thao tác trên thương hiệu và cửa hàng nào.
