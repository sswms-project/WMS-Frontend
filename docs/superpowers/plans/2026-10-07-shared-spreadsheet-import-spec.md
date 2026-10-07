# Kovia — Import Excel/CSV dùng chung, triển khai VTHH trước

Ngày: **2026-10-07**  
Trạng thái: **Gate A đã commit. Gate B đã triển khai logic và đạt test/typecheck/lint; chưa chốt nghiệm thu vì production build thiếu bộ nhớ. Gate C chưa bắt đầu.**

Phạm vi: **Backend → Frontend logic → UI/UX**, sau đó mới mở rộng sang NCC/đơn vị nhận hàng.  
Nhánh làm việc: BE `feat/huytv`, FE `screen/huytv`. Không tự tạo nhánh khác.

## 1. Mục tiêu và quyết định thiết kế

Người dùng có thể nhập nhiều vật tư hàng hóa từ một file, tự ghép cột, xem lỗi rõ ràng và xác nhận các hàng hợp lệ. Không bắt họ nhập từng sản phẩm hoặc tự chuyển đổi file thành payload API.

Các quyết định dưới đây đã được người dùng duyệt sau review ngày 2026-10-07. Người dùng đã cho triển khai Gate A và Gate B; tiến độ và giới hạn kiểm chứng nằm ở mục 13:

| Nội dung      | Quyết định cho phiên bản đầu                                                             |
| ------------- | ---------------------------------------------------------------------------------------- |
| Luồng         | Chọn tệp → Ghép cột → Kiểm tra → Xác nhận nhập và xem kết quả                            |
| Điểm mở       | Danh mục VTHH → nút “Nhập từ tệp” → workspace `/products/import`                         |
| Định dạng     | `.xlsx`, `.csv`; tối đa 5 MiB (5 × 1024 × 1024 byte)                                     |
| Quy mô        | Tối đa 500 sản phẩm và 2.000 dòng quy đổi trong một file                                 |
| Phương pháp   | Chỉ **Thêm mới**, không tự cập nhật sản phẩm đã có                                       |
| Hàng đã có mã | Báo không hợp lệ; người dùng bỏ chọn, sửa file hoặc xử lý ở màn sửa hàng hóa             |
| Hàng có lỗi   | Không thể chọn để nhập; không âm thầm sửa hoặc bỏ qua lỗi                                |
| Một lần nhập  | Toàn bộ sản phẩm được chọn và quy đổi của chúng lưu nguyên tử; không lưu một nửa batch   |
| Preview       | Chỉ đọc/kiểm tra; không tạo sản phẩm, quy đổi, mã hoặc dữ liệu nghiệp vụ                 |
| API cũ        | Giữ `POST /api/products/import` và payload `items`; mở rộng bằng trường tùy chọn         |
| Tái sử dụng   | Mở rộng reader/template/UI hiện có, không tạo generic import engine hoặc plugin registry |
| Database      | Không dự kiến migration, không seed, không sửa/xóa dữ liệu cũ                            |

**Không có chế độ “Ghi đè/xóa toàn bộ”.** Việc duyệt spec hoặc triển khai tính năng không cho phép xóa, reset hay recreate `db71143`.

## 2. Căn cứ và hiện trạng đã kiểm tra

### 2.1. AMIS và mẫu Excel

Đã xem trực tiếp [AMIS VTHH](https://amisapp.misa.vn/warehouse/dictionary/inventoryitem) ngày 2026-10-07, tải lên mẫu VTHH cơ bản và đi tới bước kiểm tra, sau đó hủy. **Không bấm “Nhập khẩu”, không kiểm thử bước lưu cuối cùng của AMIS.**

Quan sát thực tế:

- Wizard có Chọn tệp, Ghép dữ liệu, Kiểm tra dữ liệu và Kết quả.
- Nhận `.xls`/`.xlsx` tới 20 MB; tự nhận sheet “Mẫu cơ bản” và dòng tiêu đề số 8.
- Tự ghép 9 cột; có bộ lọc đã ghép/chưa ghép và thông tin bắt buộc.
- Mẫu cho kết quả 8 dòng sản phẩm: 3 hợp lệ, 5 không hợp lệ.
- Preview có số dòng gốc, tình trạng, chi tiết lỗi, lọc hợp lệ/không hợp lệ và tải tệp kiểm tra.
- Ví dụ lỗi: đơn vị “Cuộn” chưa có trong danh mục; dòng combo thiếu mã hàng chi tiết.
- Có tùy chọn Thêm mới, Cập nhật và Ghi đè. Kovia **không sao chép** tùy chọn Ghi đè.

Thư mục khảo sát: `D:\FPTUniversity\Ki9\SEP490\Mẫu Excel`:

| Mẫu                | Sheet             | Dòng tiêu đề | Điểm đáng tham khảo                                                                |
| ------------------ | ----------------- | ------------ | ---------------------------------------------------------------------------------- |
| VTHH cơ bản        | Mẫu cơ bản        | 8            | Mã, tên, đơn vị chính, tính chất, nhóm và chi tiết combo                           |
| VTHH đầy đủ        | Mẫu đầy đủ        | 8            | Có nhóm đơn vị chuyển đổi, tỷ lệ, phép tính và nhiều nghiệp vụ ngoài phạm vi Kovia |
| Vị trí VTHH đầy đủ | Mẫu nhập từ Excel | 10           | Kho, cấp cha, vị trí, hàng hóa và thông tin sức chứa                               |
| Tồn đầu kỳ cơ bản  | Mẫu cơ bản        | 8            | Kho, vị trí, ngày/phiếu nhập, hàng hóa, đơn vị và số lượng                         |
| Tồn đầu kỳ đầy đủ  | Mẫu đầy đủ        | 9            | Bổ sung giá, lô, hạn sử dụng, chất lượng và quy cách                               |

Đây là **file XLS nhị phân thật**. Không đổi đuôi `.xls` thành `.xlsx` để lách kiểm tra. Phiên bản đầu không cam kết nhập trực tiếp toàn bộ mẫu AMIS; người dùng cần lưu lại dưới dạng XLSX và ghép các trường Kovia hỗ trợ. Cột không hỗ trợ phải được báo rõ, không tự suy diễn nghiệp vụ combo/serial/tồn đầu kỳ.

### 2.2. Backend hiện có

- `Infrastructure/ExternalServices/Documents/SpreadsheetTableReader.cs`: reader chung cho XLSX/CSV, chuẩn hóa header và đọc cell; chưa cho chọn sheet/dòng tiêu đề; XLSX đang lấy worksheet theo tên entry.
- `SupplierImportParser`, `StockRecipientImportParser`, `PersonnelImportParser` sử dụng reader này nhưng có mapping nghiệp vụ riêng.
- `XlsxTemplateWriter`: tạo dữ liệu + hướng dẫn dùng chung; hiện hỗ trợ hai sheet.
- `ImportProductsCommand`: nhận JSON `items`, chưa nhận file và chưa có `unitConversions`.
- `ImportProductsCommandHandler`: kiểm tra tenant, mã trùng, unit/category đang hoạt động và lưu batch; không phải endpoint preview file.
- `CreateProductCommand` đã nhận danh sách quy đổi; `ProductUnitConversion` và bảng tương ứng đã tồn tại.
- Có unique index `(TenantId, SKU)` và `(TenantId, ProductId, UnitId)`; factor quy đổi lưu `decimal(18,6)`. Handler hiện dùng `OrdinalIgnoreCase` để tìm SKU trùng trong file; so khớp với DB phụ thuộc collation thực tế, chưa được xác minh bằng truy vấn DB.
- Có quyền `ProductPermissions.Import` (`products:import`); không cần permission mới cho phần thêm mới này.

### 2.3. Frontend hiện có

- `src/components/operations/BulkImportPage.tsx`: dùng chung cho NCC và đơn vị nhận hàng; có preview, lọc lỗi, chọn hàng, xác nhận, kết quả.
- `bulk-import.ts`: giới hạn file 5 MiB, `.xlsx`/`.csv`, xuất CSV có bảo vệ formula injection.
- VTHH đã có type/service/hook import JSON; chưa có đầy đủ wizard nhập file như đặc tả này.
- Import nhân sự có import job, quyền, lời mời và xử lý tiếp diễn riêng; không ép sang cơ chế stateless VTHH.
- Import chứng từ nhập kho có extraction/review và nhiều định dạng tài liệu; không thay thế bằng wizard danh mục.

### 2.4. Hướng dẫn áp dụng

- Đọc `AGENTS.md` workspace và hai repo, `.rules` hai repo trước triển khai.
- FE đọc thêm `docs/PROJECT_CONTEXT.md`, `CODING_GUIDELINES.md`, `DESIGN_SYSTEM.md`, `LIST_TABLE_DESIGN_GUIDELINES.md`, `AI_WORKFLOW.md` và tokens thực tế trong `src/app/index.css`.
- `docs/BUSINESS_RULES.md` của workspace được hướng dẫn nhắc đến nhưng hiện không tồn tại; không bịa quy tắc thay thế.
- Ponytail: ưu tiên code sẵn có, không thêm dependency nếu chưa chứng minh thiếu khả năng cần thiết.
- Composition Patterns: feature sở hữu API/logic; ghép các phần UI chung, không thêm một loạt boolean theo tên feature.
- GitNexus đã tra được context `BulkImportPage` và `ImportProductsCommandHandler`; query theo từ khóa báo thiếu FTS index. Trước sửa source cần khắc phục/xác minh index và chạy impact theo AGENTS; không coi kết quả query rỗng là không có caller.

## 3. Phạm vi, thứ tự và ngoài phạm vi

### 3.1. Phiên bản đầu — VTHH

- Tải mẫu cơ bản/đầy đủ của Kovia và nhập XLSX/CSV.
- Chọn sheet và dòng tiêu đề; gợi ý ghép cột, cho sửa thủ công.
- Preview có lỗi từng dòng, resolve nhóm và đơn vị trong đúng tenant.
- Nhập hàng hóa mới cùng quy đổi; chọn các sản phẩm hợp lệ để nhập.
- Báo cáo kiểm tra/kết quả; lỗi cạnh tranh mã và tình huống mất kết nối.
- Regression NCC, đơn vị nhận hàng và nhân sự khi thay reader/UI chung.

### 3.2. Giai đoạn tiếp theo

- Áp dụng các bước chọn tệp/ghép cột và giao diện đã đạt cho NCC/đơn vị nhận hàng.
- Giữ field, format mã, quyền, validator và cách tạo mã riêng hiện có.
- Nhân sự chỉ tái sử dụng những phần trình bày/parser phù hợp, không bỏ import job/lời mời/outbox.
- Vị trí và tồn đầu kỳ cần spec nghiệp vụ riêng; chỉ dùng lại reader/mapping/table, không dùng chung handler lưu VTHH.

### 3.3. Chưa triển khai

- XLS cũ, XLSM, Google Sheets, import qua URL, OCR/AI, xử lý nền cho file lớn.
- Cập nhật/upsert, thay đổi đơn vị chính hoặc quy đổi của hàng đã có bằng import.
- Xóa dữ liệu, replace danh mục, tạo đơn vị/nhóm hàng tự động.
- Combo, serial, giá, ảnh, chính sách tồn theo kho, vị trí mặc định, số dư tồn đầu kỳ.
- Lưu file/preview vào DB hoặc xây ImportJob cho danh mục chỉ để dùng về sau.

## 4. Hợp đồng mẫu VTHH và quy tắc dữ liệu

### 4.1. Mẫu cơ bản

XLSX có sheet `HangHoa` và `HuongDan`. CSV có một bảng tương đương `HangHoa`.

| Field chuẩn     | Nhãn cột               | Bắt buộc | Quy tắc                                                           |
| --------------- | ---------------------- | -------- | ----------------------------------------------------------------- |
| `sku`           | Mã hàng (\*)           | Có       | Trim, không rỗng, tối đa 100 ký tự; duy nhất trong file và tenant |
| `productName`   | Tên hàng (\*)          | Có       | Trim, không rỗng, tối đa 255 ký tự                                |
| `unit`          | Đơn vị tính chính (\*) | Có       | Mã hoặc tên duy nhất của đơn vị đang hoạt động thuộc tenant       |
| `category`      | Nhóm VTHH (\*)         | Có       | Mã hoặc tên duy nhất của nhóm đang hoạt động thuộc tenant         |
| `description`   | Mô tả                  | Không    | Tối đa 500 ký tự; trống → null                                    |
| `isLotTracked`  | Quản lý theo lô        | Không    | Có/Không, true/false hoặc 1/0; trống → false                      |
| `shelfLifeDays` | Số ngày sử dụng        | Không    | Số nguyên dương; chỉ khai báo khi quản lý theo lô                 |

Không thêm trạng thái active/inactive tùy ý: sản phẩm mới được tạo đang hoạt động như import hiện tại. Không tự sinh SKU rỗng; thiếu mã là lỗi.

Header mẫu Kovia ở dòng 1; hướng dẫn ở sheet riêng để nhập nhanh. Việc cho chọn dòng tiêu đề vẫn hỗ trợ file khác có hướng dẫn đầu trang.

### 4.2. Mẫu đầy đủ và nhiều đơn vị quy đổi

XLSX đầy đủ có `HangHoa`, `QuyDoi`, `HuongDan`. `HangHoa` giữ các cột ở 4.1, không thêm cột cho nghiệp vụ Kovia chưa hỗ trợ.

Sheet `QuyDoi`:

| Field chuẩn        | Nhãn                | Bắt buộc nếu dòng có dữ liệu                                      |
| ------------------ | ------------------- | ----------------------------------------------------------------- |
| `sku`              | Mã hàng (\*)        | Có; tham chiếu đúng một sản phẩm trong sheet HangHoa của file này |
| `unit`             | Đơn vị quy đổi (\*) | Có; đơn vị đang hoạt động cùng tenant, khác đơn vị chính          |
| `conversionFactor` | Hệ số quy đổi (\*)  | Có; lớn hơn 0, nằm trong miền decimal(18,6)                       |

Chỉ có một ý nghĩa: **1 ĐVQĐ = hệ số × ĐVT chính**. Ví dụ: Bia có ĐVT chính Lon; Thùng có hệ số 24 → **1 Thùng = 24 Lon**. Không thêm cột “Phép tính nhân/chia” gây hai cách diễn giải.

- Một SKU chỉ xuất hiện một lần trong `HangHoa`, nhưng có thể có nhiều dòng ở `QuyDoi` cho nhiều đơn vị.
- Không cho trùng `(SKU, đơn vị quy đổi)`; đánh lỗi tất cả các dòng trùng, không lấy dòng đầu/cuối tùy ý.
- Dòng quy đổi lỗi làm **sản phẩm cha không hợp lệ**. Không nhập sản phẩm rồi âm thầm bỏ quy đổi lỗi.
- Quy đổi tham chiếu SKU không có trong `HangHoa` là lỗi file; chặn xác nhận cho tới khi sửa hoặc người dùng bỏ chọn rõ sheet quy đổi, được cảnh báo dữ liệu sẽ không nhập.
- Phiên bản đầu giữ quy tắc chặn trên để không thêm cơ chế loại riêng dòng mồ côi. Cho phép xác nhận bỏ riêng từng dòng mồ côi là cải tiến UX để sau; không tự mở rộng options hoặc âm thầm bỏ các dòng đó. Lỗi child đã liên kết vẫn làm parent không hợp lệ.
- Không cập nhật quy đổi của SKU đã có trong hệ thống.
- CSV phiên bản đầu chỉ có bảng hàng hóa cơ bản; muốn nhập nhiều quy đổi dùng XLSX đầy đủ hoặc form quy đổi sau khi tạo. UI phải ghi rõ giới hạn này.
- File có sheet quy đổi được gợi ý chọn, nhưng không tự bỏ qua. Nếu người dùng quyết định không nhập sheet đó, hiện cảnh báo và yêu cầu xác nhận ở bước kiểm tra.

### 4.3. Chuẩn hóa và tra cứu tham chiếu

- Chuẩn hóa header bằng helper hiện có: trim, BOM, hoa/thường, dấu tiếng Việt và ký tự phân cách; chỉ dùng alias khai báo cho field, không đoán theo vị trí cột.
- Chuẩn hóa header **không** được dùng để sửa SKU, tên hàng hay tên đơn vị nghiệp vụ.
- Alias tối thiểu: Mã hàng/Mã VTHH/SKU; Tên hàng/Tên VTHH; ĐVT chính/Đơn vị tính chính; Nhóm VTHH; ĐVQĐ/Đơn vị quy đổi.
- Tra cứu unit/category trong đúng tenant và chỉ nhận bản ghi đang hoạt động: tìm mã trước; có đúng một mã khớp thì dùng bản ghi đó, chỉ khi không có mã khớp mới tìm theo tên. Nếu một chuỗi là mã của A và tên của B, **chọn A theo quy tắc ưu tiên mã**, không coi đó là lỗi mơ hồ. Nhiều mã khớp hoặc nhiều tên khớp ở bước đang tra cứu → lỗi, không tự chọn bản ghi đầu.
- Không dùng `Unit.Symbol` để tra cứu vì không có unique index bảo đảm duy nhất. Chuỗi như `kg` chỉ được nhận nếu khớp mã hoặc tên theo quy tắc trên. Preview hiển thị mã và tên đơn vị/nhóm đã resolve để người dùng kiểm tra.
- Nhóm trùng tên ở nhiều cấp không được tự gộp. Khuyến nghị dùng mã nhóm.
- Mã SKU trim; kiểm tra trùng trong file bằng `OrdinalIgnoreCase` tại handler, **không phải validator**. Không tự uppercase hay bỏ dấu SKU. Gate A phải xác minh read-only collation hiệu lực của cột SKU và phép so khớp DB/unique index, rồi kiểm thử mã khác hoa/thường. Không giả định SQL Server luôn case-insensitive và không tự đổi collation/tạo migration; nếu có bất nhất ảnh hưởng kiểm tra trùng thì báo lại trước chốt Gate A.
  - Đã xác minh ngày 07/10/2026: cột SKU và database `db71143` cùng dùng `Vietnamese_CI_AI_KS_WS`; unique index `(TenantId, SKU)` đang bật. DB coi cả `SKU-A`/`sku-a` và `SKU-A`/`SKU-Á` là bằng nhau. Vì vậy giữ kiểm tra `OrdinalIgnoreCase` hiện có nhưng **bổ sung kiểm tra theo collation DB** cho từng dòng ở preview và commit bằng `IProductImportSkuReader` → `ProductImportSkuReader`: một truy vấn SELECT có parameter, nhận danh sách SKU và tenant từ handler, chỉ trả row index/loại va chạm. Không mô phỏng SQL collation bằng comparer .NET, không đổi collation/schema. Mã bị giữ bởi unique index, kể cả bản ghi archived/deleted, không được tái sử dụng. Unique index vẫn xử lý race sau precheck qua 409.
- XLSX: cột mã hàng ở cả `HangHoa` và `QuyDoi` phải là **ô Text thực sự** (shared string/inline string), không chỉ có number format hiển thị như Text. Ô Number → lỗi `skuMustBeText` tại dòng/cột, yêu cầu sửa mã từ nguồn đáng tin cậy và lưu ô Text; không tự nhận số hoặc ký hiệu khoa học làm SKU. CSV đọc SKU như chuỗi, không chuyển qua kiểu số. Hệ thống không thể khôi phục số 0 đầu hoặc chữ số dài đã mất do Excel; đổi định dạng sau khi mất dữ liệu không khôi phục được mã.
- CSV bản đầu không có field thập phân nên **không có `decimalSeparator`** trong options, validator, UI hoặc test. `shelfLifeDays` vẫn phải là số nguyên dương.
- Hệ số quy đổi XLSX đọc từ giá trị cell, không evaluate công thức; reader giữ raw value, kiểu Number/Text và source. Với Text, parse decimal dùng dấu `.` theo hướng dẫn mẫu, không đoán dấu hàng nghìn và không làm tròn phần thập phân có ý nghĩa vượt 6 chữ số.
- Với Number, xử lý có giới hạn nhiễu biểu diễn số thực: tạo giá trị decimal ứng viên từ biểu diễn 15 chữ số có nghĩa (invariant culture); chỉ chấp nhận nếu ứng viên có tối đa 6 chữ số thập phân có ý nghĩa, lớn hơn 0, nằm trong `decimal(18,6)` và sai khác với giá trị Number gốc không quá **1 ULP** của giá trị đó (khoảng cách giữa các số `double` liền kề). Từ chối NaN/Infinity, ngoài miền hoặc không đạt điều kiện; không dùng epsilon cố định và không làm tròn mọi ô về 6 chữ số. `1.1000000000000001` kiểu Number có thể được nhận là `1.1`; `1.1234567` vẫn phải lỗi, và chuỗi Text `1.1000000000000001` không được sửa như nhiễu số. Giá trị đã chuẩn hóa phải hiện trong preview và được validator commit kiểm tra lại.
- Dòng/cột chỉ có format không được coi là dữ liệu. Dòng có một phần giá trị vẫn cần validation; không bỏ qua vì thiếu SKU.
- Không gộp hai SKU trùng trong bảng chính. Các dòng sample phải được xóa/thay bằng dữ liệu thật trước import; mẫu sinh ra không chứa sample trong sheet nhập.

## 5. Gate A — Backend

### 5.1. Reader và mapping dùng chung

Mở rộng `SpreadsheetTableReader` thay vì viết reader thứ hai:

1. Đọc metadata workbook: sheet theo thứ tự workbook, id ổn định trong file, tên, cột và số dòng gốc; giữ raw value và kiểu cell cho quy tắc mã Text/số ở 4.3, không stringify mọi kiểu rồi mất metadata. Giữ contract string-only cũ tương thích cho các parser hiện tại.
2. Resolve worksheet từ workbook relationships, không chọn bằng thứ tự lexical `sheet1/sheet10/sheet2`, không ghép đường dẫn do client gửi.
3. Cho chọn sheet và `headerRowNumber`; giữ số dòng vật lý trước khi lọc blank để lỗi không lệch.
4. Mặc định reader cũ giữ hành vi tương thích của các parser hiện tại; API mới dùng lựa chọn tường minh.
5. Gợi ý header trong tối đa 50 dòng đầu. Chỉ tự chọn khi có một ứng viên rõ và nhận đủ cột bắt buộc; nếu không, yêu cầu người dùng chọn.
6. Trả column index/letter + raw header, kể cả header trùng; mapping dùng index, không dùng tên làm khóa duy nhất.
7. Mỗi field nhận tối đa một cột; một cột không được dùng cho hai field. Header trùng không tự ghép; yêu cầu chọn rõ cột A/B/... hoặc sửa file.
8. Không cho đi tiếp nếu thiếu mapping bắt buộc. Optional field không mapped → default khai báo; không tự lấy cột gần nhất.
9. Cột có dữ liệu nhưng không mapped: liệt kê tên và cảnh báo; người dùng xác nhận bỏ qua. Cột chỉ có format không sinh cảnh báo.
10. CSV phải xử lý đúng dấu quote, escaped quote, dấu phân cách trong ô, CRLF/LF và newline trong ô được quote. Không tiếp tục sử dụng parser mỗi dòng vật lý nếu không đáp ứng các trường hợp này.

Các contract read/mapping đặt ở lớp phù hợp với Clean Architecture. Reader **tệp spreadsheet** ở Infrastructure không gọi DB; feature handler resolve unit/category và điều phối kiểm tra trùng. Reader SKU theo collation là truy vấn đọc riêng của feature, không parser/generic import engine; cần thiết vì đã phát hiện lệch phép so sánh .NET và SQL Server. Chỉ tách helper nhỏ có thực sự dùng ở nhiều parser, không dựng base handler/generic CRUD/import service.

### 5.2. Giới hạn và bảo vệ file

- `.xlsx`/`.csv` và 5 MiB được kiểm tra lại ở BE trước parse. MIME chỉ hỗ trợ chẩn đoán, không là bằng chứng định dạng.
- Từ chối `.xls`, `.xlsm`, file ZIP/XML hỏng, encrypted/password-protected hoặc extension không khớp nội dung.
- XLSX giữ giới hạn an toàn archive hiện có: tối đa 128 entry, 20 MiB giải nén, compression ratio không quá 100; cấm DTD và external entity.
- Không evaluate công thức hoặc truy cập external workbook/URL; từ chối công thức trong vùng nhập được chọn. Không tải external relationship.
- Giới hạn tối đa 10 sheet, 100 cột trong vùng có dữ liệu, 1.000 ký tự/cell, 10.000 dòng vật lý mỗi sheet. Khả năng scan vẫn có giới hạn byte; không tin dimension trong XML.
- Bỏ trailing cell/row chỉ có format trước khi tính giới hạn dữ liệu; không bỏ cell có giá trị thật ngoài giới hạn.
- Tối đa 500 sản phẩm chính, 2.000 dòng quy đổi. Vượt giới hạn là lỗi toàn file, không cắt lấy 500 dòng đầu.
- CSV chỉ UTF-8/UTF-8 BOM; lỗi encoding phải rõ, không silently thay ký tự. Dấu phân cách: auto nếu xác định rõ, hoặc chọn dấu phẩy/chấm phẩy/tab.
- Header dòng 1–50 và sheet/column index phải được kiểm tra phía BE. Sheet quy đổi không được là chính sheet HangHoa đang chọn.
- Không lưu upload lâu dài, không ghi raw file, payload, email hay toàn bộ ô vào log. Dùng memory cho giới hạn 5 MiB, không yêu cầu file temp trên ổ C.
- Giữ rate limit/request limit hiện hành; no fire-and-forget parse, tất cả I/O và truy vấn có CancellationToken.

### 5.3. API dự kiến

Các route dưới đây đã được triển khai trong Gate A ngày 07/10/2026. Contract v1 được kiểm thử trước Gate B; UI wizard chưa được triển khai.

| API                                                     | Mục đích                                                                                                            | Tác động DB                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `GET /api/products/import/template?variant=basic\|full` | Trả XLSX mẫu tương ứng                                                                                              | Không ghi                                            |
| `POST /api/products/import/inspect`                     | Multipart file; trả schema, limits, template version, sheet/header candidate, columns và tối đa 5 dòng mẫu mỗi bảng | Không ghi                                            |
| `POST /api/products/import/preview`                     | Multipart file + options JSON; parse, resolve, validation, trả preview                                              | Chỉ đọc nghiệp vụ                                    |
| `POST /api/products/import`                             | JSON items đã chọn, giữ route hiện tại                                                                              | Tạo sản phẩm/quy đổi và audit trong cùng transaction |

Mọi API trên dùng `ProductPermissions.Import` và tenant từ `IUserContext`. Không nhận/trust tenantId do FE gửi. Endpoint chỉ trả thông tin danh mục tối thiểu phục vụ import, không mở một API tra cứu toàn tenant khác. Gộp field/alias/required/default, limits và template version vào response `inspect`; không thêm endpoint `GET /schema` riêng. Phiên bản đầu chỉ thêm **3 endpoint** (template, inspect, preview), giữ endpoint commit hiện có.

Contract inspect đã chốt: sheet id là `sheetId` trong workbook, CSV dùng `csv`; chỉ có một header đầy đủ rõ ràng thì `sampleRows` là tối đa 5 dòng sau header và `dataRowCount` đếm các dòng đó. Nếu header mơ hồ/chưa đủ, samples/count chỉ là thông tin thô tạm thời; FE phải yêu cầu chọn header, không tự coi là số sản phẩm sẽ nhập. Mẫu header-only có thể inspect để nhận cấu trúc nhưng preview sẽ từ chối nếu bảng chính không có dữ liệu.

Options của preview:

```json
{
  "main": {
    "sheetId": "sheet-id-from-inspect",
    "headerRowNumber": 1,
    "columnMapping": [
      { "field": "sku", "columnIndex": 0 },
      { "field": "productName", "columnIndex": 1 },
      { "field": "unit", "columnIndex": 2 },
      { "field": "category", "columnIndex": 3 }
    ]
  },
  "conversions": null,
  "csvDelimiter": "auto"
}
```

Ví dụ trên dùng header dòng 1 của mẫu Kovia; file kiểu AMIS đã chuyển XLSX có thể chọn dòng 8 hoặc dòng phù hợp sau inspect. `columnIndex` là zero-based; số dòng hiển thị là one-based. `conversions` khi có dùng cùng cấu trúc sheet/header/mapping với fields ở 4.2. CSV không có sheet selector. Schema/options có version để không lẫn field mới với client cũ.

Preview response cần chứa:

- `schemaVersion`, sheet/header đã dùng và danh sách mapping/cột bị bỏ qua.
- `summary`: số sản phẩm, hợp lệ, không hợp lệ, số dòng quy đổi và lỗi toàn file.
- `rows`: `rowNumber`, `sheetName`, giá trị đã chuẩn hóa, unit/category display và IDs đã resolve; `unitConversions`; `errors`; `warnings`.
- Mỗi dòng quy đổi giữ `conversionFactor` numeric cho tương thích và thêm `conversionFactorText` dạng decimal invariant do BE tạo. FE dùng chuỗi chuẩn này khi hiển thị, xuất báo cáo và gửi commit để không mất precision khi JSON đi qua JavaScript Number; không tự làm tròn hệ số.
- Error có `code`, `field`, `message` tiếng Việt và `source` gồm sheet/row/column. Đây là metadata chẩn đoán, không phải quyền thao tác hoặc authorization token.
- `fileErrors`: lỗi cấu trúc/quan hệ không gắn được vào sản phẩm cụ thể. Khi có lỗi blocking toàn file, không cho commit.
- Không trả exception stack, SQL hoặc định danh/tên danh mục của tenant khác.

### 5.4. API lưu và tương thích

Mở rộng `ImportProductItemRequest` bằng `rowNumber` tùy chọn và `unitConversions` tùy chọn; không bỏ field cũ hay thay `items` bằng upload bắt buộc. Conversion dùng `unitId`, `conversionFactor`; có thể thêm `sourceRowNumber`/`sourceSheetName` tùy chọn để báo lỗi, không tin metadata này để quyết định quyền.

```json
{
  "items": [
    {
      "rowNumber": 2,
      "sku": "BIA-LARUE",
      "productName": "Bia Larue",
      "unitId": "11111111-1111-4111-8111-111111111111",
      "categoryId": "22222222-2222-4222-8222-222222222222",
      "isLotTracked": false,
      "unitConversions": [
        {
          "unitId": "33333333-3333-4333-8333-333333333333",
          "conversionFactor": 24
        }
      ]
    }
  ]
}
```

Các UUID trên chỉ minh họa, không phải dữ liệu QA. Giữ response `ApiResponse<Unit>` hiện tại cho commit; sau HTTP thành công FE xây kết quả từ batch được xác nhận, không bịa thành công khi request lỗi.

- Payload cũ không có rowNumber/unitConversions vẫn hoạt động, theo giới hạn và validator được chốt.
- `conversionFactor` nhận số JSON như cũ hoặc chuỗi decimal chuẩn từ preview. Chỉ property này cho phép đọc số từ chuỗi; BE vẫn deserialize thành decimal và kiểm tra precision/range như trước. FE mới ưu tiên `conversionFactorText`, chỉ fallback numeric khi nối BE cũ không trả chuỗi. Ví dụ `999999999999.123456` không bị biến thành giá trị khác trên đường FE → BE.
- Không tin `errors: []`, ID từ preview hoặc bảng chọn FE: handler lưu kiểm tra lại tất cả field, quyền hiệu lực, tenant, đơn vị/nhóm active, SKU trùng và quy đổi.
- Giới hạn cả endpoint JSON trực tiếp: tối đa 500 items và 2.000 conversion, chống đi vòng giới hạn upload.
- Có quyền import được tạo quy đổi của **sản phẩm mới trong cùng batch**, không được cập nhật quy đổi của hàng đã có.
- Tái sử dụng quy tắc create/conversion có sẵn; không gọi `CreateProductCommand` rồi SaveChanges từng sản phẩm trong vòng lặp.
- Prevalidate toàn batch; tạo entities + audit; một lần SaveChanges hoặc transaction tương đương. Nếu một selected item có lỗi mới hoặc unique conflict, toàn batch thất bại và không giữ sản phẩm/quy đổi/audit một phần.
- SKU unique index và conversion unique index là lớp bảo vệ race cuối cùng; map conflict thành 409 tiếng Việt, không trả 500 SQL thô.
- Không tăng permissions, tự tạo nhóm/đơn vị, thêm tồn kho hoặc liên kết kho trong handler import VTHH.

### 5.5. Preview hết hiệu lực, double submit và mất kết nối

Thiết kế stateless: file/options giữ trong phiên FE, inspect/preview được gửi lại khi cần; không thêm bảng import session hoặc token giả chỉ để triển khai wizard.

- Đổi file/sheet/header/mapping làm preview cũ hết hiệu lực, phải kiểm tra lại trước xác nhận.
- Khi commit, BE kiểm tra DB hiện tại, nên unit/category vừa bị khóa hoặc SKU vừa được tạo có thể khiến batch bị từ chối.
- FE hiển thị lỗi và nút “Kiểm tra lại”; giữ file/options, không tự bỏ selected item lỗi rồi gửi phần còn lại.
- Chốt contract v1: preview tổng hợp lỗi theo từng dòng; commit giữ response/exception hiện hành và có thể chỉ trả **lỗi đầu tiên**, không cam kết trả toàn bộ row errors. FE không suy diễn lỗi cho các dòng chưa được BE báo và không dùng error commit như một preview mới; người dùng phải “Kiểm tra lại” để nhận tập lỗi cập nhật. Không thêm DTO lỗi batch chỉ để mở rộng phạm vi v1.
- 409 không phải thành công và không tự retry. Re-preview đưa dữ liệu mới tới người dùng để chọn lại.
- Unique SKU chặn tạo bản sao khi double submit/replay; **không tuyên bố exactly-once hoặc idempotency bền vững** khi chưa có cơ chế đó.
- Request mất kết nối có thể đã lưu: báo “Chưa xác định được kết quả. Kiểm tra lại trước khi nhập lại”; không tự resend hoặc tự coi SKU đã tồn tại là hàng mình vừa nhập.
- Mặc định mutation commit `retry: false`; người dùng kiểm tra lại danh sách/preview rồi quyết định, không âm thầm sinh mã SKU khác.

### 5.6. Template và audit

- Mở rộng `XlsxTemplateWriter` để nhận danh sách data sheet nếu cần; giữ overload hai sheet hiện tại, không làm hỏng template NCC/khách hàng/nhân sự.
- `HuongDan` chứa phiên bản, field bắt buộc, format, giới hạn, ví dụ quy đổi, quy tắc ưu tiên mã (không lookup Symbol), hệ số Text dùng dấu `.` và hướng dẫn lưu mã dạng Text từ trước khi nhập. Cột SKU của cả hai data sheet được định dạng Text trong mẫu. Cảnh báo mã số dài/0 đầu đã bị Excel biến đổi phải lấy lại từ nguồn, không thể sửa bằng đổi format đơn thuần. Ví dụ nằm ở hướng dẫn, **không** nằm trong sheet nhập hàng thật.
- Header có `(*)`, freeze header, độ rộng đủ đọc, filter và data validation phù hợp. Không dùng formula trong vùng nhập.
- Template không chứa ID/database/tenant secret hoặc danh mục của doanh nghiệp khác.
- Audit theo `IAuditLog` hiện hành, ghi actor/tenant, hành động Import, số lượng và entity phù hợp; audit quy đổi nhất quán với create flow.
- Log vận hành chỉ có correlation ID, loại file, byte, dòng, thời gian và kết quả; không dump file/payload.

### 5.7. Kiểm thử và điểm dừng Gate A

Đây là checklist nghiệm thu đầy đủ, có cả các nhánh live acceptance. Kết quả thực tế và giới hạn của lượt triển khai Gate A nằm ở mục 13.2; không đánh dấu đạt toàn bộ một mục nếu chưa kiểm đủ các nhánh được liệt kê.

- [ ] XLSX nhiều sheet chọn đúng theo workbook relationship; header 1/8/9/10; tên Unicode; header mơ hồ/trùng.
- [ ] Blank row giữa dữ liệu giữ đúng số dòng lỗi; trailing format không tạo sản phẩm giả hoặc lỗi số cột giả.
- [ ] CSV BOM, tiếng Việt, comma/semicolon/tab, quoted delimiter, escaped quote, multiline cell, malformed quote và encoding lỗi.
- [ ] File trống/header-only, vượt byte/row/column/cell, corrupt ZIP/XML, công thức, external relationship, encrypted và `.xls` bị từ chối rõ.
- [ ] Required field, alias, duplicate mapping, cột không hỗ trợ và warning xác nhận.
- [ ] Tenant A không resolve/commit unit/category/conversion của tenant B; không lộ tên tenant B trong lỗi.
- [ ] Allowed/denied effective import permission, cả lúc preview và commit; không dựa vào tên vai trò.
- [ ] SKU trùng trong file/trong DB; mã hoa/thường theo collation đã xác minh; nhóm/đơn vị ngừng hoạt động; nhiều tên khớp; chuỗi là mã A/tên B chọn A; chỉ Symbol khớp nhưng không khớp mã/tên bị từ chối.
- [ ] XLSX SKU Text có 0 đầu/mã dài giữ nguyên; SKU Number, dạng khoa học và Number có format Text bị lỗi ở cả HangHoa/QuyDoi; CSV SKU không ép kiểu số.
- [ ] Number `1.1000000000000001` chuẩn hóa thành `1.1` theo giới hạn ULP; Text tương ứng và `1.1234567` bị từ chối; thử ranh giới 1 ULP, hơn 1 ULP, số rất nhỏ, miền decimal(18,6), overflow/NaN/Infinity. Không chấp nhận số quá precision chỉ vì làm tròn 6 chữ số.
- [ ] Quy đổi > 0, precision/range, khác đơn vị chính, nhiều quy đổi, trùng quy đổi, orphan, lỗi child làm parent invalid.
- [ ] Commit selected subset, revalidation sau preview, audit, unique race/double submit và atomic rollback trên fixture an toàn; commit lỗi đầu tiên → re-preview trả đủ lỗi cập nhật, không lưu một phần.
- [ ] Inspect trả đủ schema/alias/limits/template version; không phụ thuộc endpoint schema riêng hay option decimalSeparator.
- [ ] Endpoint JSON cũ hoạt động khi không có field mới; cap mới được kiểm thử/chứng minh không phá client đang dùng.
- [ ] Reader/template regression NCC, đơn vị nhận hàng, nhân sự và inbound extraction có gọi reader chung.
- [ ] GitNexus impact trước sửa symbol; báo HIGH/CRITICAL. Detect changes sau hoàn tất, trước commit được ủy quyền.
- [ ] `dotnet build SSWMS-API.slnx` và toàn bộ `dotnet test Application.Tests/Application.Tests.csproj` đạt; opt-in test bỏ qua phải ghi lý do.

**Dừng sau Gate A:** báo file/contract đã đổi, kết quả test thực tế, migration có/không, hạn chế và chờ lệnh người dùng để sang Gate B. Không tự seed, chạy migration, commit/push/PR nếu chưa được yêu cầu tương ứng.

## 6. Gate B — Frontend và dữ liệu giao diện

### 6.1. Route, capability và dữ liệu

- Thêm route `/products/import` theo App Router hiện có, route constant và permission config tập trung.
- Guard `route-permissions.ts` hiện kiểm theo tên vai trò và tiền tố `/products`; WarehouseStaff có thể vượt guard này. Không coi guard tiền tố là kiểm tra quyền import. Page phải kiểm **quyền hiệu lực `P.PRODUCTS_IMPORT`** trước khi gọi API hoặc cho thao tác, kể cả truy cập URL trực tiếp; loading quyền chưa xong không được gọi import API. Ẩn nút mở khi không có capability; quyền bị thu hồi giữa phiên phải khóa thao tác/xử lý 403, không cấp thêm quyền theo vai trò.
- Trang có tiêu đề “Nhập vật tư hàng hóa”. Dùng permission code/config tập trung, không hard-code chuỗi trong component. FE chỉ điều khiển UX, BE vẫn authorization.
- Page/orchestrator quản lý queries/mutations, file, options, preview, selected SKUs/rows và kết quả. Component hiển thị nhận data/callback.
- Service dùng client Axios hiện có của feature; types/schema bám DTO Gate A, không đổi key tùy ý.
- Metadata server nằm trong TanStack Query; không đưa dữ liệu file/preview vào Zustand hoặc localStorage.
- React Hook Form + Zod cho sheet/header/CSV settings/mapping; match validator BE.
- Không parse workbook bằng dependency FE mới; BE là parser và validator chính.

### 6.2. State và tính đúng đắn

Trạng thái hữu hạn: `SelectFile → Inspecting → Mapping → Previewing → Reviewing → Confirming → Importing → Result`, kèm lỗi ở chính bước đang xử lý.

- Stepper không cho nhảy tới bước chưa hợp lệ; Quay lại giữ file/options nếu chưa đổi.
- Mỗi phiên file có session/generation ID; response trễ của file A không được ghi đè file B. Abort/cancel request trước nếu có hỗ trợ, đồng thời vẫn kiểm tra phiên khi nhận response.
- Thay file, sheet, header, mapping, conversion config hoặc delimiter: xóa preview/selection/result có liên quan ngay, không tiếp tục import preview cũ.
- Không lấy normalized DTO từ localStorage hoặc tin checkbox DOM; selected items chỉ lấy từ preview của phiên hiện tại.
- Ban đầu chọn sẵn các sản phẩm hợp lệ khi không có lỗi file blocking; các dòng lỗi không thể chọn. Có text “Đã chọn N sản phẩm hợp lệ”.
- Checkbox header ba trạng thái, chỉ chọn/bỏ hàng hợp lệ **trang đang hiển thị**. Hành động chọn toàn bộ hàng hợp lệ của file phải là nút riêng ghi rõ phạm vi.
- Search/lọc/page chỉ thay view, không xóa selection các trang khác. Thay search/filter/pageSize reset page về 1.
- Selection lấy sản phẩm cha; tất cả conversion hợp lệ của sản phẩm đó đi kèm, không chọn child độc lập.
- Mở chi tiết quy đổi hiển thị `1 Thùng = 24 Lon`, source row và lỗi; không tự tính factor mới khi render.
- Preview readonly; sửa file/mapping rồi kiểm tra lại, chưa hỗ trợ inline editor từng ô.
- Khi pending: khóa xác nhận, đổi file và thao tác gây mất phiên; không thay bằng một vòng spinner phủ trắng workspace.

### 6.3. Dùng chung mà không phá các luồng cũ

- Giữ `BulkImportPage`, `BulkImportResult`, helper file/export và Table/Pagination sẵn có là điểm tái sử dụng.
- Tách phần chọn file, bảng mapping, bảng preview và kết quả nếu component lớn; ưu tiên composition bằng children/data/callback, không tạo các flags như isProduct/isPersonnel/isSupplier.
- Giữ public props/cách gọi NCC và đơn vị nhận hàng đang dùng hoặc adapter mỏng tương thích; không yêu cầu hai feature chuyển API trong Gate B.
- Common UI không gọi endpoint theo entity string và không biết business field unit/category/personnel.
- Chỉ promote feature helper thành shared khi có ít nhất hai caller thực tế hoặc bổ sung trực tiếp cho abstraction đã dùng chung.
- Không viết schema-driven form builder tổng quát, global context/import store/plugin registry chỉ vì muốn “dùng chung”.

### 6.4. Lưu, kết quả và báo cáo

- Trước gửi: dialog “Nhập N sản phẩm và M đơn vị quy đổi?”; nêu rõ N sản phẩm không được chọn/không hợp lệ sẽ không nhập và cảnh báo sheet/cột đã bỏ qua.
- Nút chính “Xác nhận nhập”; 0 selected hoặc file blocking thì disabled có lý do.
- HTTP thành công → Result với từng hàng đã nhập/bỏ qua; count sản phẩm tách count quy đổi. Không gọi tổng số dòng sheet là số sản phẩm.
- Lỗi validation/409 → giữ Reviewing, hiển thị message lỗi đầu tiên và “Kiểm tra lại”; không set result success, không đánh dấu mọi dòng bằng lỗi đó, không cam kết commit trả toàn bộ lỗi và không tự gửi lại. Preview mới mới là nguồn lỗi từng dòng cập nhật.
- Mất kết nối → trạng thái chưa xác định, không thông báo thất bại chắc chắn khi server có thể đã lưu.
- Sau success invalidate query keys sản phẩm/quy đổi liên quan; không `window.location.reload()`.
- “Nhập tệp khác” reset phiên rõ; “Về danh sách” trở về route VTHH theo navigation hiện hành.
- Export CSV kiểm tra/kết quả từ metadata preview: sheet, dòng, mã hàng, tên, trạng thái, lỗi/cảnh báo, ĐVT và quy đổi. Escape quote/newline, UTF-8 BOM nếu cần, formula injection protection dùng helper chung.
- Xuất báo cáo toàn file, không chỉ các hàng đang thấy sau filter; UI ghi rõ phạm vi. Không chứa stack, SQL hoặc dữ liệu tenant khác.
- Reload/navigate away không khôi phục file từ localStorage; báo xác nhận rời trang khi có preview chưa nhập. Cancel trước commit không rollback/delete dữ liệu vì chưa ghi nghiệp vụ.

### 6.5. Kiểm thử và điểm dừng Gate B

- [x] File/type/size/schema/version/options validation; template download error.
- [x] Route literal đã đối chiếu source/typegen; kiểm thử quyền import có/không/loading/thu hồi độc lập guard vai trò, không gọi import API trái capability. HTTP/browser route acceptance còn ở Gate C.
- [x] Header suggestions và mapping ambiguous/required/duplicate/ignored columns.
- [x] File A → B và response A đến trễ; back/đổi cấu hình không dùng preview cũ.
- [x] Group parent/conversion; counts chính xác; lỗi child, orphan và warning sheet bỏ qua.
- [x] Checkbox ba trạng thái, visible-page select, explicit select-all, selection qua filter/page và invalid disabled.
- [x] Không cho commit 0 items/fileErrors; xác nhận chỉ gửi đúng các DTO của hàng được chọn.
- [x] Pending chống double-click; success, 400/409/403, network unknown; không auto retry.
- [x] Export injection/quote/newline, tải đúng toàn báo cáo; invalidate thay vì reload toàn trang; giữ chính xác decimal từ preview tới payload/report.
- [x] Guard rời trang đã triển khai; unit test kiểm tra link/reload và không persist dữ liệu file. Browser Back/Forward thực tế còn phải QA ở Gate C.
- [ ] NCC/đơn vị nhận hàng vẫn preview/import được qua public contract cũ; nhân sự giữ job riêng.
- [ ] Chạy `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`; ghi rõ mọi lỗi/tài nguyên thiếu, không gọi compile một phần là build đạt.
- [x] GitNexus impact/detect changes theo AGENTS, đối chiếu callers NCC/đơn vị nhận hàng và source mới ngoài index.

Kiểm chứng 07/10/2026: toàn bộ FE **84 files / 441 tests passed**, typecheck và lint đạt. `pnpm build` (Turbopack mặc định) thất bại do thiếu bộ nhớ, chưa có build đạt. Regression tự động shared import đã chạy trong toàn bộ suite; chưa thực hiện live import NCC/đơn vị nhận hàng. Không đánh dấu hoàn tất Gate B khi build vẫn bị chặn.

**Dừng sau Gate B:** báo logic/contract/test đã đạt, phần UI/QA chưa xong và chờ lệnh sang Gate C.

## 7. Gate C — UI/UX

### 7.1. Bố cục chung

- Workspace trong application shell, chiếm toàn chiều rộng và chiều cao còn lại; không popup nhỏ/75% drawer cho bảng import rộng.
- Header: nút quay lại, “Nhập vật tư hàng hóa”, stepper 4 bước. Không thêm đoạn giới thiệu dài chiếm chiều cao.
- Nền dùng `bg-background` của Kovia (design hiện tại tương ứng F1FBEC), bảng/card `bg-card`, active/action theo primary. Không sao chép màu xanh dương AMIS, không hard-code hex vào feature.
- Header và footer thao tác cố định trong workspace; bảng dùng `OperationalListPanel`, shared `Table` và `OperationalPagination`.
- Chỉ vùng bảng cuộn; không tạo hai scrollbar đồng bộ. Chân bảng không lặp tổng số dưới tiêu đề.
- Dùng font/table density hiện có; mã monospace, số căn phải, nhãn quan trọng semibold vừa phải.

### 7.2. Bước 1 — Chọn tệp

- Vùng kéo thả có nút chọn file thật, tên file/size và “Chọn tệp khác”.
- Dòng trợ giúp ngắn: “XLSX, CSV · Tối đa 5 MB · 500 sản phẩm”. Nêu XLS không hỗ trợ khi người dùng chọn sai định dạng.
- Hai lựa chọn tải “Mẫu cơ bản” / “Mẫu đầy đủ có quy đổi”. Ghi CSV không chứa bảng quy đổi.
- Sau inspect: sheet hàng hóa, dòng tiêu đề; phần tùy chọn sheet quy đổi chỉ xuất hiện cho XLSX.
- Sheet/header được gợi ý vẫn cho chỉnh; bên dưới sample tối đa 5 dòng để nhận biết chọn nhầm sheet hướng dẫn.
- CSV chỉ hiện control delimiter thay sheet, không có control dấu thập phân. Giữ bố cục gọn, controls wrap trên màn hẹp.
- Sheet có dữ liệu quy đổi mà không chọn phải có cảnh báo, không giấu trong tooltip.

### 7.3. Bước 2 — Ghép cột

| Cột bảng        | Hiển thị                                                              |
| --------------- | --------------------------------------------------------------------- |
| Thông tin Kovia | Tên field + dấu bắt buộc, tooltip/description ngắn                    |
| Cột trong tệp   | Select “A — Mã hàng”, “B — Tên hàng”…; option không ghép cho optional |
| Dữ liệu mẫu     | 1–2 giá trị từ file đã tải, hỗ trợ xem đầy đủ                         |
| Trạng thái      | Đã ghép / Chưa ghép / Mơ hồ, bằng icon + text                         |

- Bộ lọc Tất cả/Đã ghép/Chưa ghép, search theo tên field/header; không tự map nhầm để tăng count.
- Mapping HangHoa và QuyDoi ở hai section khi có quy đổi; không lẫn field của hai bảng.
- Required là metadata của BE, không checkbox để người dùng bỏ yêu cầu bắt buộc.
- Nội dung bị bỏ qua liệt kê gọn và mở xem thêm. Nút “Kiểm tra dữ liệu” chỉ bật khi cấu hình hợp lệ.

### 7.4. Bước 3 — Kiểm tra và xác nhận

- Toolbar: Tất cả/Hợp lệ/Không hợp lệ, search, tải báo cáo, “Đã chọn N sản phẩm” cùng hàng.
- Bảng chính: checkbox, Dòng, Trạng thái, Chi tiết lỗi, Mã hàng, Tên hàng, ĐVT chính, Nhóm VTHH, Quy đổi; thông tin lô/ngày sử dụng xem thêm hoặc cột phù hợp chiều rộng.
- Conversion nhiều đơn vị: cell tóm tắt và mở phần chi tiết của sản phẩm; các dòng quy đổi không làm nhân đôi dòng sản phẩm cha.
- Error cell có text ngắn và nút/tooltip xem đầy đủ; không chỉ đổi ô sang màu đỏ. Lỗi dài wrap trong chi tiết, không đẩy toàn layout.
- Footer cố định: Hủy, Quay lại, Xác nhận nhập; thông tin “Nhập N sản phẩm · M quy đổi”.
- Checkbox lỗi disabled có tên truy cập và lý do; không cursor-not-allowed vô nghĩa ở cả hàng.
- Confirmation nhắc rõ những gì sẽ nhập và sẽ bỏ qua; không xác nhận bằng một toast tạm thời.

### 7.5. Bước 4 — Kết quả

- Tóm tắt đã nhập N sản phẩm/M quy đổi, bỏ qua K sản phẩm; bảng trạng thái từng hàng và nút tải kết quả.
- Trường hợp batch fail không hiển thị “Một phần thành công” khi transaction đã rollback toàn bộ.
- “Về danh sách” và “Nhập tệp khác” là actions rõ; không tự chuyển trang trước khi người dùng đọc kết quả.
- Nếu chưa xác định kết quả do network, không dùng màu xanh/checkmark success; nêu bước kiểm tra tiếp theo.

### 7.6. Responsive, accessibility và tương tác

- Desktop: bảng workspace; tablet: toolbar wrap, labels giữ đủ; mobile: stepper gọn, các lựa chọn xếp dọc, table scroll ngang trong panel, actions không bị khuất.
- Kiểm tra ít nhất 360×800, 768×1024, 1280×720 và 1920×1080; zoom 125%, 150%, 200%.
- Tab/Shift+Tab tới được mọi control; Enter/Space chọn và xác nhận; focus-visible rõ; Select/Tooltip theo component hiện có.
- Sau chuyển bước focus vào heading bước; lỗi validation focus field đầu, summary/status có aria-live phù hợp, spinner có accessible name.
- Status không chỉ dùng màu; checkbox/select/icon button có accessible name; error và help text được nối với input.
- Không animation bảng/scroll gây trễ; confirmation overlay dùng animation chuẩn hiện có và tôn trọng reduced motion.
- Dùng shadcn/React performance/composition/guidelines theo AGENTS khi triển khai; không thêm dependency animation/parser FE.

### 7.7. Kiểm thử và điểm dừng Gate C

- [ ] Browser QA đủ 4 bước với file cơ bản, đầy đủ quy đổi, CSV, file lỗi và batch cạnh tranh.
- [ ] Người có/không có products:import, quyền bị thu hồi giữa phiên; cross-tenant ở test an toàn.
- [ ] Desktop/tablet/mobile/zoom, tên Unicode dài, error dài, số lượng ít/nhiều, footer/sticky/scroll ngang.
- [ ] Keyboard, screen reader status, focus khi đổi bước/dialog, contrast, reduced motion.
- [ ] Tải template/báo cáo, quay lại/hủy/rời trang, mất kết nối và kiểm tra lại không tạo bản sao.
- [ ] Regression UI import NCC/đơn vị nhận hàng; bảo đảm các màn khác không đổi màu, border hoặc pagination ngoài ý muốn.
- [ ] Re-run test/typecheck/lint/build nếu Gate C đổi source; ghi screenshot/test evidence không chứa secret.

**Dừng sau Gate C:** báo hoàn thành và hạn chế còn lại; không tự chuyển sang mở rộng tính năng hoặc tự import dữ liệu thật.

## 8. Gate D — Mở rộng NCC/đơn vị nhận hàng (chỉ sau lệnh riêng)

- Dùng wizard/reader đã đạt; bổ sung field catalog/options vào parser và endpoint đúng feature.
- Giữ API preview/import cũ tương thích; không buộc mọi client thêm sheet/mapping.
- Không áp dụng quy tắc SKU bắt buộc của VTHH cho Mã NCC/khách hàng; giữ cơ chế mã được nhập hoặc tự cấp hiện hành.
- Tiếp tục chỉ thêm mới; upsert/update cần spec quyền/cạnh tranh riêng.
- Chạy test nghiệp vụ riêng từng feature và bộ shared regression; báo kết quả sau mỗi feature.
- Không gộp Gate D với nhân sự, vị trí hoặc tồn đầu kỳ bằng một generic handler.

## 9. An toàn DB, QA và bàn giao

- **Tuyệt đối không drop/delete/reset/recreate/replace/EnsureDeleted/truncate/bulk-delete/destructive rollback `db71143`.**
- Không auto migration; khi chạy BE local phải đặt `Database__ApplyMigrationsOnStartup=false`.
- Tận dụng bảng/constraint hiện có. Nếu phát hiện cần migration, báo tên/tác động và dừng, không coi spec này là quyền tạo/chạy migration.
- Automated tests dùng fixtures an toàn; test rollback transaction không phải rollback schema hay xóa DB. Không chạy cleanup “để chuẩn bị test”.
- QA ghi nghiệp vụ chỉ qua luồng ứng dụng được phép; trước write phải xác minh effective provider/server/database, che secrets, tuân thủ cả hướng dẫn workspace/repo. Nếu target remote hoặc xung đột hướng dẫn chưa giải quyết, dừng báo trước write.
- Seed/direct SQL/repair/import hàng loạt dữ liệu QA cần ủy quyền riêng cho đúng target và mục đích. Các quyền QA trong chat cũ không mặc nhiên còn áp dụng.
- Không dùng tài khoản AMIS để thực hiện final import từ mẫu khảo sát. AMIS chỉ là tham khảo, không môi trường QA Kovia.
- Không tự dọn/xóa ổ C, cache hoặc temp vì thiếu RAM/disk. Ưu tiên artifact ở D khi phù hợp và chỉ dừng process của task.
- Mỗi gate ghi test thực tế và hạn chế vào record workflow phù hợp; self-review không gọi là independent review.
- Commit/push/PR chỉ khi người dùng yêu cầu. Khi được yêu cầu commit, chia BE, FE logic và UI/UX; không trộn source của người khác, không force-push main/dev.

## 10. Tiêu chí nghiệm thu cuối

1. Từ Danh mục VTHH mở được wizard theo quyền hiệu lực, không thêm grant theo tên vai trò.
2. XLSX/CSV đúng giới hạn được đọc; chọn sheet/header và sửa mapping; không nhận giả `.xls` đổi đuôi.
3. Mẫu basic và full của Kovia khớp contract; sheet quy đổi của full không bị bỏ qua âm thầm.
4. Preview cho đúng số sản phẩm và dòng nguồn, lỗi tham chiếu/tenant/đơn vị/quy đổi; không ghi nghiệp vụ.
5. Chọn subset hợp lệ, lưu sản phẩm và tất cả quy đổi của subset trong cùng transaction; invalid parent không được nhập.
6. Backend kiểm tra lại và chặn race/tampered payload; 409/network không dẫn đến retry mù hoặc báo thành công giả.
7. Không thay đổi dữ liệu đã có, không tự tạo danh mục phụ, không phát sinh tồn kho/migration/seed.
8. Report có lỗi/kết quả dễ đọc, export an toàn; layout/keyboard/zoom/scroll đạt các gate.
9. API import JSON cũ, import NCC/đơn vị nhận hàng/nhân sự và template cũ không regress.
10. Báo đủ build/test/QA, gate nào chưa đạt phải ghi chưa đạt; người dùng quyết định bước tiếp theo.

## 11. File dự kiến ảnh hưởng khi triển khai

Đây là bản đồ điểm sửa, không yêu cầu tạo tất cả file mới ngay từ đầu:

| Repo | Vị trí                                                                                   | Thay đổi dự kiến                                                       |
| ---- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| BE   | `Infrastructure/ExternalServices/Documents/SpreadsheetTableReader.cs`                    | Inspect/chọn sheet/header, giữ source row và CSV đúng cấu trúc         |
| BE   | `Infrastructure/ExternalServices/Documents/XlsxTemplateWriter.cs`                        | Overload nhiều data sheet, giữ template cũ                             |
| BE   | `Application/Features/Product/ImportProducts/`                                           | Optional source/conversions, giới hạn, validate và lưu batch           |
| BE   | Feature Product và `Contract/Models/Product/`                                            | Schema/inspect/preview/template query/command và response DTO đúng lớp |
| BE   | `API/Controllers/Product/ProductsController.cs`                                          | Endpoint mỏng ISender, permission constant, tiếng Việt/XML summary     |
| BE   | `Application.Tests/` và parser tests hiện có                                             | New behavior + tenant/concurrency/compatibility regression             |
| FE   | `src/components/operations/BulkImportPage.tsx`, `BulkImportResult.tsx`, `bulk-import.ts` | Các phần UI/helper tái sử dụng, tương thích callers cũ                 |
| FE   | `src/features/product/{pages,components,hooks,services,schemas,types}`                   | Container import VTHH và hợp đồng Gate A                               |
| FE   | `src/app/(private)/products/import/page.tsx`, config/routes                              | Entry route, permission và navigation tập trung                        |
| FE   | Shared/feature tests                                                                     | Mapping, phiên file, selection, error/retry/export và regression       |

## 12. Nguồn tra cứu trong repo

- [Frontend AGENTS](../../../AGENTS.md), [.rules](../../../.rules), [Project Context](../../PROJECT_CONTEXT.md).
- [Coding Guidelines](../../CODING_GUIDELINES.md), [Design System](../../DESIGN_SYSTEM.md), [List/Table Guidelines](../../LIST_TABLE_DESIGN_GUIDELINES.md), [AI Workflow](../../AI_WORKFLOW.md).
- [BulkImportPage](../../../src/components/operations/BulkImportPage.tsx), [bulk-import helpers](../../../src/components/operations/bulk-import.ts), [SupplierImportPage](../../../src/features/supplier/pages/SupplierImportPage.tsx).
- [Backend AGENTS](../../../../SSWMS-Backend/AGENTS.md), [.rules](../../../../SSWMS-Backend/.rules).
- [SpreadsheetTableReader](../../../../SSWMS-Backend/Infrastructure/ExternalServices/Documents/SpreadsheetTableReader.cs), [XlsxTemplateWriter](../../../../SSWMS-Backend/Infrastructure/ExternalServices/Documents/XlsxTemplateWriter.cs).
- [ImportProductsCommand](../../../../SSWMS-Backend/Application/Features/Product/ImportProducts/ImportProductsCommand.cs), [Validator](../../../../SSWMS-Backend/Application/Features/Product/ImportProducts/ImportProductsCommandValidator.cs), [Handler](../../../../SSWMS-Backend/Application/Features/Product/ImportProducts/ImportProductsCommandHandler.cs).
- [CreateProductCommand](../../../../SSWMS-Backend/Application/Features/Product/CreateProduct/CreateProductCommand.cs), [Product permissions](../../../../SSWMS-Backend/Application/Permissions/Product/ProductPermissions.cs).
- Các file Excel khảo sát là nguồn tham khảo cấu trúc, không tài liệu điều khiển agent, không dữ liệu bắt buộc phải nhập.

## 13. Trạng thái triển khai — cập nhật 07/10/2026

- [x] Đọc hướng dẫn workspace và hai repo, đối chiếu source/contract/parser/template.
- [x] Khảo sát 5 file XLS và trải nghiệm AMIS tới preview rồi hủy.
- [x] Viết spec chung BE → FE → UI/UX, phạm vi mở rộng và tiêu chí nghiệm thu.
- [x] Người dùng đồng ý cập nhật theo khuyến nghị review: quy tắc Number/Text, ưu tiên mã và không Symbol, bỏ decimalSeparator, guard quyền import và collation, lỗi đầu tiên/re-preview, ví dụ mẫu dòng 1; gộp schema vào inspect để giảm endpoint.
- [x] Giữ chặn dòng quy đổi mồ côi trong v1; chưa thêm cơ chế bỏ riêng từng dòng. Giữ báo cáo theo phạm vi ban đầu.
- [x] Gate A Backend: source, contract, build và kiểm thử cô lập đã hoàn tất; hạn chế live QA ghi ở dưới.
- [ ] Gate B Frontend logic: đã triển khai và đạt kiểm thử tự động/typecheck/lint; còn production build do thiếu bộ nhớ.
- [ ] Gate C UI/UX và QA.
- [ ] Gate D NCC/đơn vị nhận hàng nếu được yêu cầu riêng.

### 13.1. Gate A đã thực hiện

- Tại mốc Gate A, nhánh giữ nguyên: BE `feat/huytv`, FE `screen/huytv`. Chỉ sửa source BE và tài liệu spec này; source FE triển khai ở Gate B bên dưới.
- Reader metadata dùng chung giữ nguyên entry point string-only cũ; XLSX theo relationships, CSV hỗ trợ multiline/escaped quote và số dòng vật lý. Áp dụng giới hạn byte/archive/sheet/row/column/cell; cấm DTD/external worksheet/công thức trong vùng được chọn.
- Mẫu basic/full header-only, cột SKU định dạng Text, sheet hướng dẫn riêng; overload template NCC/đơn vị nhận hàng/nhân sự vẫn tương thích.
- Inspect/schema/preview có source errors, mapping index, tra cứu mã trước tên, tenant/active guards, SKU Text, Number/Text factor, quy đổi gắn parent, orphan blocking và warnings khi bỏ cột/sheet.
- JSON commit cũ nhận thêm metadata nguồn và quy đổi tùy chọn; giới hạn 500/2.000, revalidation, audit và một lần SaveChanges; giữ response cũ và xử lý conflict.
- Đã xử lý phát hiện collation bằng truy vấn SKU batch SELECT trong Infrastructure, không migration. Probe chỉ đọc gọi chính reader production với tenant rỗng và các SKU kiểm thử để xác minh duplicate khác dấu và parameter hóa; không tạo hàng QA.

### 13.2. Kết quả kiểm tra thực tế tại mốc Gate A

- Build solution .NET 10 đạt; bản cuối không có warning/error. Toàn bộ Application tests: **911 passed, 1 skipped, 0 failed**; có **70 case mới** thuộc hai file `ProductImportFileTests` và `ProductImportWorkflowTests`.
- Test SQL Server capacity-lock opt-in bỏ qua vì không cấp connection tới DB SQL fixture riêng. Không dùng `db71143` để chạy test ghi SQL/concurrency.
- Atomicity test dùng SQLite `:memory:`: assert/print effective provider/target trước write, lỗi insert quy đổi có chủ ý và xác minh Products/Conversions/Audit không lưu một phần. Các fixture khác dùng InMemory riêng; không EnsureDeleted/drop/reset/cleanup.
- Read-only target đã xác minh: `Microsoft.EntityFrameworkCore.SqlServer` / `db71143.public.databaseasp.net` / `db71143`; `Database:ApplyMigrationsOnStartup=false`. Collation/index và probe SELECT đạt; EF không có pending model changes. Không tạo/chạy migration, seed, ghi DB deploy hoặc khởi động server/jobs/webhook.
- GitNexus impact trước sửa; reader legacy `Read` có risk Critical nên không thay hành vi entry point đó. Detect changes cuối báo Low trên 6 file tracked. Index/FTS có hạn chế và không bao phủ các symbol/file mới chưa tracked; đã kiểm tra trực tiếp các file mới và chạy toàn bộ regression. Đây là self-review, không independent approval.
- Build/test/temp/results nằm tại `D:/Kovia-QA/product-import-20261007`; SDK content glob `API/tmp` cũ được loại bằng file build props **ngoài repo**, chỉ áp dụng command kiểm tra, không xóa file. Một lượt build song song thiếu bộ nhớ; chạy lại tuần tự đã đạt. Không sửa project/dependency để né lỗi môi trường.
- Chưa kiểm thử HTTP/browser với quyền bị thu hồi, import dữ liệu thật hoặc race SQL Server bằng write. Các bước này chỉ thực hiện trong QA được phép khi nối FE; không coi probe chỉ đọc là kiểm thử concurrency/ghi nghiệp vụ.

### 13.3. Điểm tiếp tục và giới hạn usage

- Người dùng đã cho sang Gate B. Logic đã triển khai, nhưng chưa chốt nghiệm thu do production build thiếu bộ nhớ; cần chạy lại build khi đủ tài nguyên. Chưa sang Gate C UI/UX/browser QA hoặc Gate D.
- Đã commit phần trước theo yêu cầu: BE `e15c3f2` (Gate A), FE `7b15491` (spec và kết quả Gate A). Người dùng tiếp tục yêu cầu commit riêng source Gate B và bổ sung decimal contract BE; mã commit của lượt này xem Git log từng repo. Chưa push/PR. Không động vào `.playwright-cli/` hoặc `skills-lock.json` có sẵn ở FE.
- Theo yêu cầu người dùng, kiểm tra usage định kỳ: nếu cửa sổ quota khả dụng nào còn **≤5%**, cập nhật mục này với việc đã làm/chưa làm và kết quả test gần nhất rồi dừng. Lần kiểm tra gần nhất còn **10% cửa sổ 5 giờ**, **73% tuần**; chưa chạm ngưỡng. Điểm bàn giao hiện tại là Gate B bị chặn ở kiểm chứng build, không phải dừng do quota.

### 13.4. Gate B đã thực hiện và kiểm chứng

- Thêm workspace `/products/import` và nút “Nhập từ tệp” theo quyền hiệu lực `P.PRODUCTS_IMPORT`; loading/denied không mount workflow gọi API. Phiên được tách theo tenant/user; 403 khóa thao tác.
- Service multipart inspect/preview, mẫu basic/full, RHF/Zod mapping theo schema BE; CSV delimiter auto/comma/semicolon/tab, không decimalSeparator. File và metadata không lưu localStorage/Zustand; query cache phiên có `gcTime: 0`, cancel request và generation/revision ngăn response cũ.
- Preview chọn sản phẩm cha hợp lệ cùng toàn bộ quy đổi; checkbox ba trạng thái theo trang và nút chọn toàn bộ tệp riêng. Search/filter/pagination chỉ thay view, không mất selection. Lỗi child/file blocking chặn commit, warnings bỏ sheet/cột phải hiện trong xác nhận.
- Commit có ref lock chống gửi hai lần, không retry; 400/409/422 yêu cầu kiểm tra lại, network/HTTP không chắc kết quả không báo thành công giả. Thành công invalidate product/query keys, không reload trang. Xuất CSV toàn tệp có source/errors/conversions, BOM, quote/newline và bảo vệ formula injection.
- Tách `BulkImportHeader`/`BulkImportFilePicker` dùng chung; giữ props và API flow NCC/đơn vị nhận hàng. `BulkImportResult` chỉ thêm callback export tùy chọn. Không dependency mới hoặc generic import engine; common UI không chứa API theo entity string.
- Bổ sung nhỏ BE cho Gate B: preview thêm chuỗi decimal invariant `conversionFactorText`, commit nhận chuỗi hoặc numeric tại đúng property factor. Thêm **4 test tương thích/precision**; build solution **0 warnings / 0 errors**, toàn bộ Application **915 passed / 1 opt-in SQL Server test skipped / 0 failed**. Không entity/model/migration thay đổi.
- FE thêm **38 test** (34 page/logic, 4 service). Lượt toàn bộ cuối chạy một worker, không chạy song song tác vụ nặng: **84 files / 441 tests passed**. `pnpm typecheck` và `pnpm lint` đạt trên source cuối.
- `pnpm build` mặc định thất bại với `Fatal process out of memory: Zone` / `Committing semi space failed`. Một lượt Vitest hai worker chạy đồng thời build cũng lỗi worker do tài nguyên; không coi lượt đó đạt, đã chạy lại toàn bộ một worker và đạt. Không đổi bundler/project/dependency để né kiểm chứng, không xóa cache/ổ C hoặc dừng process ngoài task.
- GitNexus pre-impact shared import Low: hai caller NCC/đơn vị nhận hàng, giữ public contracts. Detect FE Medium trên các symbol tracked và hai flow dự kiến; BE decimal follow-up Low. Symbol/file mới ngoài index được kiểm tra trực tiếp; thiếu FTS không được coi là bằng chứng không có caller.
- Đã rà source accessibility theo Web Interface Guidelines: nút chọn tệp thật dùng bàn phím, label/control, focus, giữ selection khi pending và sticky table header. Đây là self-verification, không independent approval; chưa browser QA desktop/tablet/mobile/zoom/reduced motion, Back/Forward hoặc live permission/race/write acceptance.
- Toàn bộ artifacts/temp/test results ở `D:/Kovia-QA/product-import-20261007`. Không khởi động BE/FE, không kết nối/ghi DB deploy ở Gate B, không migration/seed/cleanup. Giữ nguyên các nhánh làm việc.
