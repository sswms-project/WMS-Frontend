# Import danh mục và setup nhanh VTHH

## Trạng thái tại điểm dừng 2026-10-08

**IN_PROGRESS — chưa đủ điều kiện production/merge.** Tạm dừng vì usage 5 giờ còn 5%, theo yêu cầu trước đó của người dùng. Không commit/push. Tiếp tục từ cây làm việc hiện tại, không viết lại từ đầu.

## Phạm vi đã duyệt

Hai cách setup: (1) import Đơn vị tính và Nhóm VTHH trước, sau đó import hàng hóa; (2) nhập hàng hóa ngay, chủ động chọn danh mục có sẵn hoặc xác nhận tạo mới tại bước Kiểm tra. Giữ bốn bước Chọn tệp → Ghép cột → Kiểm tra → Kết quả. Không thay nghiệp vụ NCC, khách hàng, nhân sự. Không thêm thư viện, schema DB, quyền hay seed.

### Đợt A — Import danh mục

- Endpoint `GET import/template`, `POST import/inspect`, `POST import/preview`, `POST import` dưới `/api/units` và `/api/categories`.
- FE `/units/import`, `/categories/import`; chỉ hiện nút khi có quyền manage tương ứng.
- ĐVT: Mã ĐVT, Tên ĐVT, Ký hiệu, Số chữ số thập phân (0–6, mặc định 0), Mô tả.
- Nhóm: Mã nhóm, Tên nhóm, Mã nhóm cha, Mô tả; cha trong DB hoặc cùng tệp, có thể đứng sau con; không vòng lặp, tối đa 5 cấp. Cha được tham chiếu trong tệp cần mã rõ ràng.
- Mã trống được gợi ý trong preview và chỉnh trước khi nhập. Chỉnh mã phải kiểm tra lại; đổi mã cha tường minh cập nhật tham chiếu con trong preview. Chọn con mà bỏ cha phải bị từ chối khi lưu, không lưu một phần.
- Chỉ tạo mới; không tự cập nhật hoặc kích hoạt lại. XLSX/CSV 5 MB, 500 dòng; dùng reader/mapping an toàn hiện có. Số dòng nguồn không đổi.
- Tên bắt buộc, mã/tên trùng, danh mục inactive, dữ liệu khác tenant đều phải kiểm tra ở BE. Lưu tập được chọn và audit trong một SaveChanges nguyên tử.

### Đợt B — Setup nhanh

- Hướng dẫn gọn tại bước chọn tệp, liên kết import danh mục tuân thủ xác nhận rời phiên. Mặc định mở nếu danh mục đang thiếu và có dữ liệu đọc được theo quyền view; người không có quyền đọc không được gọi API danh mục trái quyền.
- Bước 3: thanh “Danh mục cần xử lý · …” và nút “Xem và xử lý”. Sheet bên phải, toàn chiều ngang trên mobile. Phần nhóm/ĐVT chỉ hiện khi có dữ liệu liên quan.
- Gộp giá trị trim + Unicode NFC + không phân biệt hoa/thường; không bỏ dấu hay ghép gần đúng. Mã trước rồi tên; không tạo mới cho ô trống, inactive hoặc mơ hồ.
- Mỗi mục chọn chưa xử lý/dùng có sẵn/tạo mới. Tạo mới có mã gợi ý NHOM-/DVT-, tên, cha tùy chọn hoặc ký hiệu/precision. Checkbox xác nhận mặc định chưa chọn; Áp dụng và kiểm tra lại chỉ đọc, không ghi DB.
- Preview trả missingReferences, active catalogs, newCatalogs và capability tạo. Dòng đủ điều kiện có badge Sẽ tạo danh mục; lỗi độc lập còn nguyên.
- Commit chỉ gửi danh mục dùng bởi hàng hóa được chọn (kể cả đơn vị quy đổi). Xác nhận cuối nêu số hàng hóa/nhóm/ĐVT. Kiểm tra lại quyền products:import và manage theo loại, trạng thái/tenant/trùng, không tự đổi lựa chọn. Danh mục, hàng hóa, quy đổi, audit cùng một giao dịch. Payload ID cũ vẫn hoạt động.
- Không tự retry thao tác ghi; kết quả lưu chưa xác định cần đối soát. Giữ locks, aria-busy, live region, focus, reduced motion và footer ngoài thân bảng cuộn. Không window.alert/confirm.

## Đã triển khai trong cây làm việc

- BE: DTO, handler inspect/preview/template/import riêng cho danh mục; validator/rules cho mã/tên/precision/cây nhóm; mẫu tiếng Việt; endpoint manage; đọc/ghi theo tenant; một lần save; hỗ trợ codeOverrides chỉ ở preview.
- BE: mở rộng preview VTHH bằng lựa chọn tham chiếu + draft danh mục; kiểm quyền tạo; stage danh mục cùng hàng hóa/quy đổi/audit. Tăng giới hạn options preview lên 1 MiB có giới hạn multipart tương ứng.
- FE: hai route import, nút từ trang danh mục, reuse BulkImportPage/OperationalListPanel/Pagination; mã editable buộc recheck; panel setup nhanh, checkbox, badge, chọn lọc payload, invalidation danh mục sau lưu; hướng dẫn setup có capability.
- Build BE dùng `--artifacts-path D:\Kovia-QA\catalog-setup-build -p:EnableDefaultContentItems=false`, tránh DLL của API đang chạy và content glob API/tmp cũ.
- FE thêm `KOVIA_ISOLATED_BUILD=true` để build vào `tmp/catalog-production` trên ổ D, không ghi đè `.next` dev. Next tự sửa tsconfig include; đã bỏ các include output QA và format lại về cấu hình có trước sau khi build kết thúc.

## Kiểm thử đã xác nhận

- BE full Application.Tests: **1008 passed, 1 skipped, 1009 total**. Fixture mới in và xác nhận provider InMemory/server in-process/database tên ngẫu nhiên trước khi ghi.
- BE filter import/catalog: **110 passed**. Bao gồm gộp Unicode, preview không Add/Save, xác nhận/quyền theo loại, thu hồi quyền import/manage, inactive/tenant, cha sau con/bỏ chọn cha và lưu danh mục+hàng hóa+audit.
- FE trước hai test mới nhất: **78 passed / 3 files** (ProductImportPage, BulkImportPage, party-import-pages). Lần TypeScript trước test mới đạt; test mới thiếu ba trường nullable đã sửa, chưa có kết quả TypeScript cuối.
- **Production FE build hoàn tất, exit 0**, gồm TypeScript và 68 trang static; hai route mới xuất hiện trong bảng route. Output riêng, không đè server dev.
- Full FE Vitest: **605 passed, 2 failed / 607 tests, 105 passed + 1 failed / 106 files**. Hai lỗi là timeout 5000 ms trong BulkImportPage.test.tsx (“keeps hidden field errors…” và “distinguishes selecting…”). Trước đó cả hai đạt trong suite targeted. Chạy đồng thời build/full tests có thể ảnh hưởng tài nguyên, nhưng **chưa xác minh nguyên nhân**; cần chạy lại tách riêng và điều tra nếu tái diễn, không tự tăng timeout để che lỗi.
- Targeted ESLint đã kết thúc không báo lỗi; lệnh cùng phiên TypeScript từng báo thiếu nullable test và lỗi đó đã được sửa.
- Edge session `catalog-setup` đã mở localhost nhưng **chưa chạy mock/interact/screenshot QA**. Không xác nhận QA desktop/mobile/zoom/reduced motion đã đạt.

## Việc bắt buộc còn lại (Đợt C, và hoàn thiện A/B)

1. Chạy lại full FE test tách khỏi build, điều tra 2 timeout BulkImportPage; TypeScript trong production build đã đạt, nhưng chạy lại lint/TypeScript sau formatting cuối. Đã dọn tsconfig do build tự thêm.
2. Rà giới hạn 500 danh mục mỗi loại trong setup nhanh so với 500 sản phẩm/2000 quy đổi; hiện rules dùng chung chặn quá 500 mỗi loại, cần thông báo hoặc chốt rõ giới hạn thay vì lỗi chung.
3. Rà ưu tiên mã inactive so với tên active khác; không cho tự fallback làm mất ý nghĩa tham chiếu inactive. Kiểm dữ liệu thay đổi sau preview và lỗi commit phải yêu cầu recheck.
4. Rà mã gợi ý trống khi người dùng xóa, cache edit qua mapping/file/session và đổi mã cha; thêm test UI import ĐVT/nhóm, selection cha/con và lỗi tại ô. Mã không được coi là giữ chỗ.
5. Rà hướng dẫn setup mặc định mở/thu gọn, quản lý quyền capability, Sheet focus/lỗi trường/checkbox/live region, các tên nhóm trùng khác cha và đường dẫn đủ phân biệt.
6. Bổ sung QA/test: XLSX/CSV thật đúng/sai/rỗng/quá giới hạn, Unicode/case/trùng/inactive/tenant; vòng lặp/vượt5/cha blank; đơn vị dùng main+conversion; dòng bỏ chọn không tạo danh mục; concurrency và rollback **cả danh mục mới** với relational fixture (test rollback cũ chỉ sản phẩm/quy đổi/audit).
7. Test double-click/drop, chậm/lỗi/unknown-save, thu hồi quyền sau preview, xác nhận cuối đúng số danh mục. Không tự retry ghi.
8. Dùng Edge với mock/fixture (chặn write API thật) kiểm desktop/mobile, zoom125–150%, keyboard, reduced motion, footer. Chưa có mock browser cho tính năng mới.
9. Review diff/security/DI/template/hierarchy, cập nhật AI_REVIEW cả hai repo theo kết quả thật. Không gọi hoàn tất trước khi hai cách setup xuyên suốt.

## Bảo toàn và an toàn

- Không startup BE, không migration/seed/SQL/direct QA write/db71143 trong lượt này. API local PID36808 thuộc phiên khác, không dừng. Lần test đầu bị DLL lock, đã đổi artifacts output.
- `.playwright-cli`, skills-lock.json và các sửa UI import có trước cần giữ nguyên. Chưa commit/push.
- Khi chạy BE về sau phải tắt Database\_\_ApplyMigrationsOnStartup; mọi QA ghi dùng fixture cô lập đã xác nhận target, không deploy DB.

## Skill đã áp dụng

Ponytail: tái sử dụng reader/components và một lần save, không thêm dependency. shadcn + React best practices: composition, trạng thái xử lý và giữ dữ liệu preview. Web Interface Guidelines: đang rà accessibility/responsive, chưa có kết luận pass cuối. Playwright: chuẩn bị Edge QA, chưa thực hiện ma trận kiểm thử.
