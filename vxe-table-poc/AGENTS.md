# Quy ước giao diện

- Ưu tiên `rem` cho kích thước chữ, khoảng cách, padding, margin, gap, kích thước control và bo góc trong CSS/SCSS viết mới hoặc đang chỉnh sửa. Dùng line-height không đơn vị khi phù hợp.
- Với bố cục co giãn, dùng `%`, `fr`, `vw`/`dvh`, `min()`, `max()` hoặc `clamp()` theo mục đích; không thay mọi đơn vị bằng `rem` một cách máy móc.
- Hạn chế `px` trong CSS. Giữ `px` cho nét viền mảnh 1px hoặc phép đo cần khớp pixel. Các API scroll, virtualizer, canvas, phép đo DOM và kích thước nội tại SVG được phép dùng pixel theo hợp đồng của API/asset.
- Tái sử dụng token hiện có. Không sửa file sinh tự động `_base.generated.scss`, không đổi hàng loạt token nguồn hoặc toàn bộ CSS cũ chỉ để chuyển đơn vị nếu chưa được yêu cầu.
- Giữ cỡ chữ gốc theo trình duyệt; không đặt `html { font-size: 62.5% }` để quy đổi đơn vị. Quy đổi tham chiếu thông thường: `16px = 1rem` khi cỡ chữ gốc là 16px; kiểm tra lại layout và zoom sau thay đổi.

# Tổ chức theo module

- Gom code theo module/feature: component, logic/composable, type, dữ liệu, style và asset riêng của module đặt gần nhau trong thư mục module. Navigation hiện nằm tại `src/components/navigation/`.
- Style và hành vi chỉ thuộc một component nên nằm trong component đó hoặc file đi kèm trong cùng module; ưu tiên style scoped, tránh tác động module khác.
- Chỉ đưa code vào thư mục dùng chung khi thực sự được nhiều module sử dụng. Giữ điểm tích hợp giữa các module nhỏ và rõ; không tạo vòng phụ thuộc.
- Áp dụng khi thêm/sửa code. Không di chuyển toàn bộ project hoặc tạo sẵn thư mục trống chỉ để đạt cấu trúc hình thức.
