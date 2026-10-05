# Đổi vị trí hàng đã cất — Frontend và UI/UX

**Ngày:** 2026-10-05
**Trạng thái:** Đã chốt kế hoạch; chưa triển khai chức năng.

Spec chung BE → FE → UI/UX được duy trì tại repo Backend để tránh hai bản đặc tả khác nhau:

[Spec Đổi vị trí hàng đã cất](../../../../SSWMS-Backend/docs/features/2026-10-05-post-putaway-relocation-spec.md).

Khi xem riêng repo trên GitHub, mở `sswms-project/WMS-Backend`, đường dẫn `docs/features/2026-10-05-post-putaway-relocation-spec.md` trên nhánh tương ứng hoặc `dev` sau khi PR Backend đã merge.

## Quyết định đã chốt cho FE

- Hai điểm mở: Phiếu nhận hàng → Lịch sử cất hàng; Tồn kho khả dụng → thao tác trên dòng.
- Xác nhận di chuyển trực tiếp, không thêm bước tạo/giao công việc hoặc phê duyệt.
- Dùng quyền Cất hàng hiện có và kiểm tra phạm vi kho từ BE; không thêm permission hoặc kiểm tra tên vai trò.
- Dùng chung form nhập số lượng, đơn vị, vị trí đích và lý do; BE quy đổi và kiểm tra cuối cùng.
- Sheet 50% chiều rộng desktop, toàn chiều rộng mobile; giữ design tokens, shadcn và animation hiện có.
- Lịch sử A → B → C là lịch sử thao tác, không phải truy xuất tồn riêng từng phiếu khi nguồn đã gộp chung.
- Giữ nguyên lịch sử cất hàng gốc; không reload trang hoặc tự mở bảng chi tiết đang đóng.
- Retry chưa xác định kết quả phải dùng lại command ID và payload cũ; không tạo thao tác mới tự động.
- Chỉ triển khai sau Gate A và hợp đồng API được kiểm thử; chạy test, typecheck, lint, build và QA responsive/accessibility.
- Migration dự kiến trong spec chỉ là kế hoạch; không tạo hoặc chạy migration trong PR tài liệu này.
