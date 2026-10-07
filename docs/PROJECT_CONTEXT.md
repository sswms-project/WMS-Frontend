# Kovia — Ngữ cảnh dự án và bàn giao cho AI

Cập nhật: **2026-10-06**. Tài liệu này giúp tiếp nhận dự án trong chat mới hoặc sau khi cài lại máy; không thay thế `AGENTS.md`, `.rules`, hợp đồng API hoặc spec được duyệt. Thông tin Git, phiên bản, trạng thái triển khai và kết quả kiểm thử phải được kiểm tra lại khi tiếp tục.

## 1. Dự án và phạm vi

Kovia là phần mềm quản lý vận hành kho đa doanh nghiệp (multi-tenant), tên repository/kỹ thuật vẫn dùng SSWMS/WMS. Hai workspace chính:

- Frontend: `SSWMS-Frontend` / GitHub `sswms-project/WMS-Frontend`.
- Backend: `SSWMS-Backend` / GitHub `sswms-project/WMS-Backend`, nằm cạnh Frontend trong workspace.
- Workspace trên máy hiện tại: `D:\FPTUniversity\Ki9\SEP490\SSWMS_Project`. Đường dẫn máy khác có thể thay đổi; ưu tiên quan hệ giữa hai repo.

Phân biệt workspace nền tảng (Admin) và workspace tenant. Các vai trò thường dùng để kiểm thử là System Admin, Tenant Owner, Warehouse Manager và Warehouse Staff. Tên vai trò không thay thế việc kiểm tra quyền hiệu lực và phạm vi kho.

Nhóm nghiệp vụ chính: doanh nghiệp/nhân sự/phân quyền, kho và sơ đồ/vị trí, vật tư hàng hóa/đơn vị quy đổi, nhà cung cấp/đơn vị nhận hàng, nhập kho, tồn kho/kiểm kê/điều chỉnh, điều chuyển, xuất kho/trả hàng, công việc kho, thuê bao/thanh toán, thông báo/nhật ký và dashboard nền tảng.

## 2. Cách làm việc với chủ dự án

- Giao tiếp bằng tiếng Việt, trả lời trực tiếp, báo rõ đã làm gì và còn thiếu gì. Nhãn nghiệp vụ, trạng thái và lỗi hiển thị cho người dùng cần dễ hiểu bằng tiếng Việt; không dịch tên riêng của người hoặc doanh nghiệp.
- Nếu yêu cầu là phân tích, đề xuất, review hoặc “chưa code”: chỉ kiểm tra và giải thích, không tự sửa source. Khi đã được yêu cầu triển khai, tiếp tục trong phạm vi đã chốt; hỏi lại nếu cần quyết định mới làm thay đổi đáng kể nghiệp vụ hoặc quyền tác động.
- Trước thay đổi lớn: tìm nguyên nhân, nêu phương án ngắn gọn và ảnh hưởng BE/FE/UI. Ưu tiên sửa nguyên nhân gốc, tận dụng luồng/component hiện có, tránh dependency và abstraction không cần thiết.
- Tối ưu cho nhân viên vận hành kho: giảm nhập tay, giảm tự tính quy đổi, không thêm bước gán việc hoặc cấu hình trung gian nếu không có nhu cầu nghiệp vụ rõ ràng.
- AMIS/MISA là tham khảo về mật độ, bảng và tương tác; không sao chép mù quáng nghiệp vụ, màu sắc hoặc code. Nếu được yêu cầu trải nghiệm một tương tác, cần thử trực tiếp khi browser có quyền truy cập, không suy đoán chỉ từ ảnh.
- Với spec chia Gate: làm đúng thứ tự BE → FE logic → UI/UX; mỗi Gate kiểm thử, báo kết quả và dừng chờ lệnh tiếp tục nếu đó là điểm dừng đã chốt. Không coi “tiếp tục” là cho phép mọi tác động ngoài phạm vi.
- Khi sửa shared component, kiểm tra các nơi sử dụng và regression. Không sửa từng màn riêng lẻ nếu vấn đề thật sự nằm trong component chung.
- Phân biệt test tự động, self-review, independent review và live browser QA. Không gọi self-review là review độc lập, không coi PR xanh là bảo đảm mọi nghiệp vụ đã đúng.
- Không tự commit, push, tạo PR hoặc merge nếu chưa được yêu cầu. Khi giao PR, điền Title/Description có nội dung thay đổi, test và hạn chế; người dùng quyết định và bấm merge.

## 3. Quy tắc an toàn bắt buộc

Đọc [AGENTS.md của workspace](../../AGENTS.md) và [AGENTS.md của FE](../AGENTS.md) trước khi thao tác. Khi làm BE, đọc thêm `SSWMS-Backend/AGENTS.md` và `.rules` của BE. Tài liệu này không mở rộng quyền thao tác và không tự giải quyết xung đột giữa các hướng dẫn; nếu có mâu thuẫn an toàn chưa rõ, báo lại trước khi hành động.

- **Không xóa, drop, reset, recreate, replace, truncate, bulk-delete hoặc destructive rollback DB deploy `db71143`; không chạy `EnsureDeleted` với DB này.** Không lấy yêu cầu test/cleanup/spec làm quyền xóa DB.
- `db71143` là target được người dùng cho phép cho chạy ứng dụng local và kiểm thử qua luồng ứng dụng thông thường theo quy tắc workspace. Đây không phải quyền chạy seed, repair, direct SQL hoặc dọn dữ liệu tùy ý.
- Khi khởi động BE dùng DB này, luôn đặt `Database__ApplyMigrationsOnStartup=false`. **Không tự chạy migration.** Nếu pending, báo tên, tác động và chờ người dùng cho phép chính migration đó trên đúng target.
- Không dùng startup để kiểm tra migration. Ưu tiên migration history/model-drift/read-only inspection và SQL được sinh ra để review.
- Trước DB write, xác nhận cấu hình hiệu lực: provider/server/database, che mọi secret. Không chỉ tin biến môi trường dự định override. Target remote hoặc không khớp phải xử lý đúng các quy tắc xác minh/ủy quyền của AGENTS trước khi tiếp tục.
- Nếu có mutation ngoài dự kiến: dừng toàn bộ lệnh DB, giữ output và báo target/thao tác/thời gian; không tự recreate, seed hoặc khôi phục.
- Không tự xóa dữ liệu trên ổ C, cache, file temp hoặc sửa pagefile để giải quyết thiếu dung lượng. Trước build/QA nặng, kiểm tra tài nguyên; chỉ dừng đúng process của nhiệm vụ khi cần.
- Không đưa mật khẩu, access/refresh token, connection string, nội dung `.env` hoặc `auth.json` vào tài liệu, log bàn giao hay PR.
- Quyền seed/phân công kho/QA từng được cấp trong chat cũ không phải quyền mở để lặp lại bất kỳ lúc nào. Xác minh mục đích, target và ủy quyền hiện tại.

## 4. Kiến trúc và nơi tìm code

Stack FE tại thời điểm viết: Next.js 16 / React 19 / TypeScript, App Router, Tailwind CSS v4, shadcn/ui, TanStack Query/Table, React Hook Form + Zod, Axios, Zustand. Phiên bản cụ thể lấy từ `package.json` và lockfile; hiện `packageManager` là `pnpm@11.11.0`.

BE dùng .NET 10, Clean Architecture và CQRS/MediatR, EF Core/SQL Server, FluentValidation, Mapster. Các tầng: `API`, `Application`, `Domain`, `Infrastructure`, `Contract`; DTO trả về nằm trong `Contract/Models`.

| Phần FE                               | Nơi đọc                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------ |
| Route App Router và application shell | `src/app/`                                                               |
| Nghiệp vụ                             | `src/features/<feature>/{pages,components,hooks,services,schemas,types}` |
| UI primitives                         | `src/components/ui/`                                                     |
| Bố cục list/master-detail dùng chung  | `src/components/operations/`                                             |
| API client, refresh và chuẩn hóa lỗi  | `src/lib/axios.ts`                                                       |
| Route UI / endpoint API               | `src/routes/app-routes.ts`, `src/routes/api-endpoints.ts`                |
| Permission codes / bảo vệ route       | `src/config/permissionCodes.ts`, `src/config/route-permissions.ts`       |
| Client/UI state                       | `src/stores/`; không lưu server data vào đây                             |
| Runtime design tokens                 | `src/app/index.css`                                                      |

Page/container sở hữu query/mutation/form state, component hiển thị nhận data/callback. Giữ ngoại lệ orchestrator đúng hướng dẫn hiện hành. Server state thuộc TanStack Query; validation FE phải đối chiếu Command/Validator/Response BE trước khi sửa. Backend là nơi kiểm tra cuối cùng về quyền, scope, quy đổi và nghiệp vụ; ẩn nút ở FE không phải authorization.

Một số `.rules` còn mô tả Vite/React Router cũ. Không suy ra runtime từ các đoạn cũ: đối chiếu `AGENTS.md`, `package.json` và code App Router; báo mâu thuẫn liên quan, không tự thay kiến trúc.

## 5. Các quyết định nghiệp vụ/UX đã chốt

### Vật tư hàng hóa, đơn vị và sức chứa

- Product có đơn vị gốc (Base UOM) và đơn vị quy đổi theo từng sản phẩm. Ví dụ `1 Thùng = 24 Lon`; số lượng phải luôn có ngữ cảnh đơn vị.
- Hướng sức chứa hiện tại tập trung `None` và `Quantity`. Quantity cần maximum và unit rõ ràng; BE kiểm tra conversion/capacity và số lượng thực tế còn lại khi cất hàng.
- `None` không chặn theo sức chứa tối đa, **không** vô hiệu hóa quy tắc cho phép một hay nhiều sản phẩm trong kệ. Hai chính sách độc lập.
- Weight/Volume, khối lượng/kích thước theo bao bì, tự tính thể tích và làm tròn bao bì lẻ là hướng giai đoạn sau; không tự coi là đã triển khai.
- Nhân viên được nhập theo đơn vị vận hành và nhìn quy đổi sang đơn vị gốc. BE quy đổi/kiểm tra cuối cùng, inventory có thể giữ số lượng theo Base UOM. Dùng snapshot lịch sử khi contract quy định; không đổi chứng từ cũ theo tỷ lệ catalog mới.
- Kích thước vật lý là thông tin tùy chọn; không làm mandatory chỉ vì người dùng đã chọn unit nhưng chưa nhập giá trị. Đối chiếu schema/validator cụ thể trước khi sửa.

### Nhập kho và dữ liệu tồn

- Menu Nhập kho vẫn thuộc Hoạt động kho, mặc định tới `/inbound-requests`. Workspace gồm Yêu cầu nhập kho, Chờ nhận hàng, Phiếu nhận hàng và Chờ cất hàng; route tập trung tại `app-routes.ts`.
- Luồng vận hành: yêu cầu nhập → duyệt/xử lý theo trạng thái BE → nhận/kiểm tra hàng → phiếu nhận được duyệt → cất hàng. Không khôi phục yêu cầu cấu hình vị trí staging/chờ nhận hàng đã bị người dùng yêu cầu bỏ.
- Phân công từ yêu cầu nhập được hướng tới gán một lần cho luồng nhận/cất; quản lý vẫn có thể giao lại theo quyền và trạng thái. Không tự bỏ guard hoặc tạo task trùng để làm UI ngắn hơn.
- Mã yêu cầu là bắt buộc; có gợi ý nhưng không ghi đè input người dùng. Sửa nội dung và chỉ đổi mã là hai khả năng khác nhau; dùng `allowedActions`, reason/version và guard BE, không cho Tenant Owner sửa mọi trạng thái chỉ dựa tên vai trò.
- Form nhận thủ công cần ngữ cảnh phiếu/yêu cầu/nguồn hàng/kho, số lượng còn nhận, unit/quy đổi, hàng đạt/hỏng và lô/hạn dùng khi áp dụng. Khi sửa phân loại hàng trên phiếu cần correction, giữ những trường BE không cho thay đổi.
- Cùng SKU có thể có nhiều dòng tồn do khác kho/vị trí/lô/chất lượng/trạng thái. Không gộp ID tồn làm mất target thao tác. Nếu cần tổng hợp sản phẩm, phải thiết kế riêng; trước hết hiển thị rõ vị trí và đơn vị của từng dòng.
- `__SYSTEM_DEFAULT__` là định danh kỹ thuật cho một số kệ quản lý theo kệ, không phải vị trí staging. Hiển thị tên/mã kệ hợp lệ thay định danh nội bộ; không đổi ID/payload hoặc xóa dữ liệu để che nhãn.
- Lịch sử cần nhãn nghiệp vụ tiếng Việt, mã chứng từ dễ đọc, đơn vị và thông tin quy đổi khi contract có hỗ trợ.

### Thiết kế workspace

- Giữ nhận diện xanh Kovia, nền nghiệp vụ `#F1FBEC` qua design token; không chuyển toàn app sang màu/theme AMIS. Ưu tiên mật độ gọn, chữ dễ đọc, active/icon/badge tương phản rõ.
- Workspace list/table dùng đầy chiều rộng và chiều cao còn lại; tránh container căn giữa gây khoảng trống hai bên. Chỉ body bảng scroll; pagination chung cố định phía dưới. Tổng số ở footer, không lặp số lượng dưới tiêu đề; thống kê trạng thái/đã chọn vẫn có ý nghĩa riêng.
- Dùng `OperationalListPanel`, `OperationalPagination` và `OperationalMasterDetail`; không chép công thức chiều cao hoặc dựng scrollbar đồng bộ thứ hai.
- Master/detail: bấm mã chứng từ mới điều hướng tới chi tiết; chọn dòng cập nhật preview nhưng không tự mở panel đang đóng. Nút chevron nằm giữa hai bảng, ngoài vùng resize; mở/đóng được giữ qua lần vào lại. Kéo thu nhỏ liên tục tới đóng; nút không có animation vị trí chạy chậm theo chuột.
- Form dài thường dùng sheet bên phải, khoảng 50% desktop và responsive mobile. Phân quyền vai trò Admin đã được yêu cầu sheet rộng khoảng 75% desktop; không áp dụng 75% cho mọi popup.
- Popup giữa màn hình dùng zoom/fade nhanh; sheet trượt từ phải vào và đóng nhanh. Giữ component/animation hiện có, kiểm tra reduced motion, focus và keyboard; không áp đặt lại timing cũ nếu đã có thay đổi được duyệt.
- Phân quyền tổ chức theo Danh mục → Phân hệ → Quyền; metadata/thứ tự từ BE. Danh mục để điều hướng, không chọn tất cả cấp danh mục; module có checkbox ba trạng thái. Quyền nền tảng cần phân biệt rõ với quyền tenant.
- “Doanh nghiệp” là cách gọi UI người dùng đã chọn thay “Tổ chức” khi phù hợp; không tự rename entity/API/permission key kỹ thuật.

## 6. Tài liệu cần đọc theo nhiệm vụ

- Quy tắc FE: [AGENTS.md](../AGENTS.md), [.rules](../.rules), [Coding Guidelines](CODING_GUIDELINES.md), [AI Workflow](AI_WORKFLOW.md).
- UI: [Design System](DESIGN_SYSTEM.md), [List/Table Guidelines](LIST_TABLE_DESIGN_GUIDELINES.md); runtime tokens trong `src/app/index.css`.
- Git: [Git Workflow](GIT_WORKFLOW.md). Bàn giao/test/findings: [AI Review](AI_REVIEW.md); đọc round mới và những round được nó thay thế, không lấy một dòng “Approved” cũ làm trạng thái toàn dự án.
- Spec FE: `docs/superpowers/plans/`; ghi nhận gate/QA: `docs/features/`. Spec BE: `../SSWMS-Backend/docs/features/` khi tính từ root FE.
- Sức chứa: [spec BE](../../SSWMS-Backend/docs/features/2026-10-01-storage-location-capacity-spec.md), [FE Gate B](features/2026-10-02-storage-capacity-fe-gate-b.md), [Gate C QA](features/2026-10-02-storage-capacity-gate-c-qa.md).
- Đổi vị trí sau cất hàng: [spec FE tham chiếu](superpowers/plans/2026-10-05-post-putaway-relocation-spec.md) và [spec BE chung](../../SSWMS-Backend/docs/features/2026-10-05-post-putaway-relocation-spec.md). Spec FE hiện ghi **đã chốt kế hoạch, chưa triển khai**; không báo chức năng đã có chỉ vì spec tồn tại.
- Hỗ trợ cấp gói cho tenant từ Admin: spec BE `docs/features/2026-10-03-admin-tenant-subscription-support-spec.md`; xác minh implementation trước khi báo hoàn thành.
- `../docs/BUSINESS_RULES.md` được AGENTS nhắc tới nhưng chưa tồn tại trong workspace khi viết tài liệu này. Báo thiếu khi cần, dùng spec/code/tests đang có; không bịa nội dung hay tự tạo quy tắc nghiệp vụ thay thế.

Skills thường cần cho FE: `shadcn`, `vercel-react-best-practices`, `vercel-composition-patterns` khi phù hợp, `web-design-guidelines`; browser QA dùng công cụ/skill phù hợp (`playwright` khi chạy browser từ terminal). Ponytail hỗ trợ triển khai tối giản. GitNexus hỗ trợ impact/context/detect-changes theo AGENTS. Nếu skill/tool thiếu sau reset máy, báo chính xác, không giả vờ đã chạy. Đọc SKILL.md của skill được dùng trước khi hành động.

## 7. Git, chạy local và kiểm thử

- Nhánh làm việc người dùng đã chọn: FE `screen/huytv`, BE `feat/huytv`. Giữ hai nhánh này; không tự tạo nhánh mới hoặc chuyển sang dev/main cho một task thông thường.
- Fetch/pull/commit/push/PR khi người dùng yêu cầu; kiểm tra dirty tree và divergence trước, giữ thay đổi của người khác. Không force-push dev/main, không `reset --hard` hoặc discard thay đổi để giải conflict.
- Feature PR vào dev; release PR dev → main chỉ khi được yêu cầu và kiểm tra đủ điều kiện. Người dùng bấm merge; code người khác trên dev không mặc nhiên phải theo nhánh huytv.
- FE local hiện dùng `pnpm dev` → Turbopack, port 3000. Không tự đổi sang Webpack để chữa lỗi tài nguyên. BE local thường port 7070; xác minh launch/config thực tế trước khi bật, tắt hoặc báo server đang chạy.
- Axios client ưu tiên `NEXT_PUBLIC_API_BASE_URL`, có fallback khác và mặc định localhost:7070; tự chuẩn hóa suffix `/api`. Không đọc/in `.env` để bàn giao và không coi fallback là bằng chứng app đang gọi local.
- Lệnh xác minh FE chuẩn: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`. Chọn test phù hợp khi sửa nhỏ; source thay đổi phải có kiểm thử tương ứng. Không cần chạy build app cho một thay đổi Markdown thuần túy.
- Build/test có thể thiếu tài nguyên Windows dù code compile được. Khi ChunkLoadError/OOM: kiểm tra server/log/URL chunk/tài nguyên, không mặc nhiên xóa cache, dữ liệu hay chuyển bundler.

### Mốc bàn giao, không phải trạng thái remote trực tiếp

Kiểm tra local read-only ngày 2026-10-06: FE `screen/huytv` tại `37b4d48` (merge PR #173), BE `feat/huytv` tại `aeae02e` (merge PR #200); hai working tree sạch trước khi thêm tài liệu này. Không fetch remote trong lần viết này.

Đợt kiểm tra trước đã ghi nhận FE 75 files / 366 tests, typecheck/lint đạt; build local compile xong nhưng TS worker thoát với mã Windows `3221226505`, nên full build local chưa được xác minh trong đợt đó. Vercel của head FE PR #173 đã được kiểm tra đạt trước khi người dùng merge. BE đã ghi nhận 797 tests đạt / 1 opt-in SQL test bỏ qua. Đây là kết quả lịch sử, không thay thế test trên diff mới; live browser/API acceptance của đợt gần nhất còn cần xác minh.

Chưa kiểm tra migration history, DB hoặc server local trong lần viết tài liệu này. Không suy ra DB đã up-to-date, app đang chạy hoặc mọi finding đã hết từ các commit trên.

## 8. Tiếp nhận một chat mới

1. Xác nhận workspace/target repo và yêu cầu mới nhất của người dùng. Đọc file này, AGENTS workspace/repo và `.rules`; nếu làm xuyên BE–FE, đọc cả hai phía. File này không được coi là tự động nạp chỉ vì nằm trong `docs`.
2. Kiểm tra branch/HEAD/working tree read-only; ghi nhận thay đổi có sẵn và không ghi đè. Chỉ fetch hoặc đồng bộ khi được giao việc đó.
3. Đọc spec liên quan và round bàn giao mới nhất trong `docs/AI_REVIEW.md` ở hai phía; phân biệt plan, implemented, verified, deployed và pending.
4. Tóm tắt điều đã hiểu, ràng buộc, điều cần kiểm tra và bước tiếp theo. Không tự làm lại task đã xong hoặc chuyển sang kế hoạch cũ chỉ vì nó có trong lịch sử.
5. Trước source edit, dùng GitNexus impact theo AGENTS và đọc callers/contract/tests; báo HIGH/CRITICAL risk. Nếu tool không dùng được, báo hạn chế và cách kiểm tra thay thế, không tuyên bố đã đạt yêu cầu công cụ.
6. Kết thúc task: ghi kết quả kiểm thử thực tế, hạn chế và bước bàn giao vào AI_REVIEW khi workflow yêu cầu. Chỉ cập nhật file này khi tổng quan/quyết định lâu dài thay đổi; không đưa log dài hoặc credential vào đây.

Mẫu nhắn mở đầu cho chat mới:

> Đây là dự án Kovia. Đọc docs/PROJECT_CONTEXT.md ở FE, AGENTS.md ở gốc workspace, AGENTS.md và .rules ở hai repo, cùng phần bàn giao mới nhất trong AI_REVIEW.md. Kiểm tra Git thực tế, giữ screen/huytv và feat/huytv. Không xóa/reset db71143, không tự chạy migration hoặc dọn ổ C. Trước tiên tóm tắt điều bạn hiểu và bước tiếp theo; chỉ triển khai phạm vi tôi giao.
