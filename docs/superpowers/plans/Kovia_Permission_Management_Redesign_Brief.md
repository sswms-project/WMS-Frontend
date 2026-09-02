# Kovia Permission Management – UI/UX Redesign Brief

## 1. Mục tiêu redesign

Thiết kế lại màn hình **Phân quyền** của Kovia để:

- Tăng diện tích hiển thị cho phần **danh sách quyền**.
- Giảm cảm giác lệch bố cục do khu vực chọn vai trò chiếm một cột riêng nhưng chỉ có rất ít role.
- Giảm khoảng trống không cần thiết ở bên trái.
- Giúp người dùng nhìn được nhiều permission/module hơn trong cùng một viewport.
- Giữ nguyên phong cách giao diện hiện tại của Kovia: clean, enterprise, light green, border mảnh, typography rõ ràng.
- Không redesign toàn bộ design system; chỉ redesign khu vực **Permission Management content area**.

---

## 2. Vấn đề của layout hiện tại

Màn hình hiện tại chia thành:

- Sidebar trái: chọn vai trò.
- Khu vực phải: xem và chỉnh permission.

### 2.1. Sidebar role đang chiếm quá nhiều không gian

Hiện tại chỉ có hai role chính cần cấu hình:

- Quản lý kho
- Nhân viên kho

Tuy nhiên toàn bộ một cột bên trái đang được dành riêng cho role selector. Điều này tạo ra nhiều khoảng trống phía dưới, phần permission bị thu hẹp và bố cục mất cân bằng.

### 2.2. Permission list nằm quá thấp

Trước khi tới danh sách permission, người dùng phải đi qua:

- tên role;
- mô tả;
- thống kê;
- search bar;
- các khoảng padding lớn.

Kết quả là permission list chỉ còn khoảng nửa chiều cao màn hình.

### 2.3. Permission list là nội dung chính nhưng chưa được ưu tiên

Chức năng quan trọng nhất của màn hình là:

> Xem và chỉnh quyền của từng role.

Do đó phần permission nên chiếm phần lớn diện tích màn hình.

### 2.4. Có quá nhiều card/border lồng nhau

Layout hiện tại có cảm giác:

> page → card → sub-card → accordion row

Nên giao diện hơi nặng và có cảm giác giống bảng lồng bảng.

---

# 3. Hướng redesign chính

## Bỏ sidebar role và chuyển sang role tabs nằm ngang

Không sử dụng sidebar riêng cho role nữa.

Thay vào đó đặt role selector ngay phía trên permission content.

Ví dụ:

```text
[ ✓ Quản lý kho · 40 ]     [ Nhân viên kho · 20 ]
```

Role đang chọn:

- background green rất nhạt;
- border green;
- icon/check;
- số lượng quyền hiển thị bên phải.

Role chưa chọn:

- background trắng;
- border neutral;
- hover nhẹ.

### Lý do

Hiện tại chỉ có 2 role nên tabs ngang phù hợp hơn sidebar.

Sidebar chỉ nên dùng khi hệ thống có nhiều role, ví dụ 5–10 role trở lên.

---

# 4. Layout đề xuất

```text
┌──────────────────────────────────────────────────────────────────────┐
│ 🛡 Phân quyền                                      Phạm vi tenant ⓘ │
│ Quản lý quyền truy cập của các vai trò trong tổ chức hiện tại.      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ [✓ Quản lý kho · 40]        [Nhân viên kho · 20]                    │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ Quản lý kho                                        [💾 Lưu thay đổi]│
│ Điều phối vận hành, phê duyệt và cấu hình trong phạm vi được giao.  │
│                                                                      │
│ 40 trực tiếp  •  40 hiệu lực  •  17 phân hệ                        │
│                                                                      │
│ 🔍 Tìm quyền...                                      ⇈ Thu gọn      │
├──────────────────────────────────────────────────────────────────────┤
│ ☑ Báo cáo               1 quyền trực tiếp        1/1 hiệu lực    ⌄ │
├──────────────────────────────────────────────────────────────────────┤
│ ☑ Chuyển kho            5 quyền trực tiếp        5/5 hiệu lực    ⌄ │
├──────────────────────────────────────────────────────────────────────┤
│ ☐ Điều chỉnh tồn        0 quyền trực tiếp        0/3 hiệu lực    ⌄ │
├──────────────────────────────────────────────────────────────────────┤
│ ☑ Giao hàng             2 quyền trực tiếp        2/2 hiệu lực    ⌄ │
├──────────────────────────────────────────────────────────────────────┤
│ ☑ Hoàn hàng             2 quyền trực tiếp        2/2 hiệu lực    ⌄ │
├──────────────────────────────────────────────────────────────────────┤
│ ☑ Khách hàng            3 quyền trực tiếp        3/3 hiệu lực    ⌄ │
│                                                                      │
│                           ↕ scroll                                  │
└──────────────────────────────────────────────────────────────────────┘
```

---

# 5. Header của page

Giữ cấu trúc hiện tại.

## Title

**Phân quyền**

## Subtitle

**Quản lý quyền truy cập của các vai trò vận hành trong tổ chức hiện tại.**

## Tenant scope badge

Giữ badge:

```text
Phạm vi tenant
```

Có thể thêm icon:

```text
Phạm vi tenant ⓘ
```

Tooltip:

> Các quyền được cấu hình trong phạm vi tenant hiện tại.

---

# 6. Role selector

Thay sidebar bằng horizontal role tabs.

Ví dụ:

```text
┌──────────────────────────┐
│ ✓ Quản lý kho        40  │
└──────────────────────────┘

┌──────────────────────────┐
│   Nhân viên kho      20  │
└──────────────────────────┘
```

### Selected role

- nền light green;
- border green;
- text đậm;
- check icon;
- hiển thị tổng số quyền.

### Unselected role

- nền trắng;
- border neutral;
- hover background nhẹ.

### Không cần hiển thị mô tả dài bên trong tab

Description của role sẽ hiển thị trong role detail header phía dưới.

---

# 7. Role Detail Header

Sau khi chọn role, hiển thị:

```text
Quản lý kho                         [Lưu thay đổi]

Điều phối vận hành, phê duyệt và cấu hình
trong phạm vi được giao.
```

### Save button

Đặt ở góc phải.

Button chỉ active khi có thay đổi.

State:

```text
Disabled:
Lưu thay đổi

Changed:
Lưu thay đổi
```

Có thể thêm dirty state:

```text
● Có thay đổi chưa lưu
```

---

# 8. Permission Statistics

Không sử dụng 3 block lớn như hiện tại.

Thay bằng một dòng compact:

```text
40 quyền trực tiếp  •  40 quyền hiệu lực  •  17 phân hệ
```

Hoặc dạng badge:

```text
[ 40 Trực tiếp ]   [ 40 Hiệu lực ]   [ 17 Phân hệ ]
```

Ưu tiên phương án một dòng để tiết kiệm vertical space.

---

# 9. Search & Action Bar

Đặt ngay phía trên permission list.

```text
┌────────────────────────────────────────────────────────────┐
│ 🔍 Tìm quyền...                              ⇈ Thu gọn hết │
└────────────────────────────────────────────────────────────┘
```

Search phải hỗ trợ tìm theo:

- tên module;
- tên permission;
- keyword.

Ví dụ:

```text
Tìm:
"transfer"

→ lọc:
Chuyển kho
Create Transfer Request
Approve Transfer Request
Receive Transfer
```

---

# 10. Permission List

Permission list là phần chiếm diện tích lớn nhất màn hình.

Mỗi module là một accordion row.

Ví dụ:

```text
☑ Chuyển kho       5 quyền trực tiếp      5/5 hiệu lực      ⌄
```

### Cấu trúc row

Bên trái:

- module checkbox;
- module name.

Ở giữa:

- số quyền trực tiếp.

Bên phải:

- effective permission;
- accordion chevron.

---

# 11. Module Checkbox Behavior

Nếu tất cả permission trong module được chọn:

```text
☑
```

Nếu không có permission nào:

```text
☐
```

Nếu chọn một phần:

```text
▣
```

Sử dụng indeterminate checkbox.

Ví dụ:

```text
▣ Kho hàng     3 quyền trực tiếp     3/4 hiệu lực
```

---

# 12. Expanded Permission Module

Khi accordion mở:

```text
☑ Chuyển kho                     5/5 hiệu lực
──────────────────────────────────────────────

☑ Xem danh sách phiếu chuyển kho
☑ Tạo yêu cầu chuyển kho
☑ Phê duyệt / từ chối yêu cầu
☑ Chuẩn bị và xuất kho
☑ Nhận hàng chuyển kho
```

Có thể hiển thị metadata nếu cần:

```text
Direct
Inherited
System
```

nhưng không làm UI quá phức tạp.

---

# 13. Effective Permission

Giữ concept:

```text
Direct Permission
Effective Permission
```

Nhưng cần thể hiện rõ bằng tooltip.

Ví dụ:

```text
5 quyền trực tiếp
5/5 hiệu lực ⓘ
```

Tooltip:

> Quyền hiệu lực bao gồm quyền được cấp trực tiếp và các quyền bắt buộc/phụ thuộc được hệ thống áp dụng.

---

# 14. Permission List Scroll

Permission list phải có vùng scroll riêng.

Không scroll toàn bộ page khi xem permission.

Ví dụ:

```css
.permission-list {
  height: calc(100vh - 340px);
  overflow-y: auto;
}
```

Role header và search bar có thể sticky.

Khi người dùng scroll xuống:

```text
Purchase Order
Inventory
Stock Adjustment
Transfer
...
```

vẫn luôn nhìn thấy:

```text
Quản lý kho
40 trực tiếp • 40 hiệu lực • 17 phân hệ
Search
```

---

# 15. Sticky Header

Permission control header nên sticky.

Ví dụ:

```text
┌──────────────────────────────────────────────┐
│ Quản lý kho                    Lưu thay đổi │
│ 40 trực tiếp • 40 hiệu lực • 17 phân hệ    │
│ 🔍 Tìm quyền...                            │
└──────────────────────────────────────────────┘
```

Khi scroll permission list, phần này không mất.

---

# 16. Bỏ box "Phạm vi quản lý" ở sidebar cũ

Hiện tại có một box:

```text
Phạm vi quản lý

Chỉ Chủ doanh nghiệp được thay đổi quyền.
Quyền hệ thống và quản trị nền tảng không được ủy quyền.
```

Không cần giữ thành một card riêng.

Chuyển thành:

```text
ⓘ Chỉ Chủ doanh nghiệp có thể thay đổi quyền.
```

hoặc tooltip cạnh:

```text
Phạm vi tenant ⓘ
```

Tooltip:

> Chỉ Chủ doanh nghiệp được phép thay đổi cấu hình quyền trong tenant. Quyền hệ thống và quyền quản trị nền tảng không thể được ủy quyền.

---

# 17. Spacing

Giảm vertical spacing để nhìn được nhiều permission hơn.

Recommended:

```text
Page padding: 24px
Section gap: 16–20px
Role tabs gap: 12px
Permission row height: 56–64px
Permission child row: 44–48px
```

Không dùng card quá cao.

---

# 18. Width

Permission content phải dùng gần toàn bộ chiều rộng của page.

Ví dụ:

```text
max-width: none
width: 100%
```

Hoặc:

```text
max-width: 1440px
margin: auto
```

Không để một sidebar 300–360px cho chỉ hai role.

---

# 19. Visual Style

Giữ style Kovia hiện tại.

### Background

```text
#F7FAF5 / light neutral green
```

### Primary Green

Dùng màu green hiện có trong design system.

### Border

- 1px;
- soft green/gray;
- không dùng border quá đậm.

### Selected State

- light green background;
- dark green text;
- green border.

### Typography

Role name:

```text
20–24px
font-weight: 600
```

Module name:

```text
16px
font-weight: 600
```

Permission:

```text
14–15px
```

---

# 20. Không redesign toàn bộ design system

AI redesign phải giữ:

- top navigation hiện tại;
- notification;
- theme switch;
- user profile;
- Kovia light green visual language;
- icon style;
- button style;
- typography style.

Chỉ redesign:

```text
Permission Management content area
```

---

# 21. Desktop Priority

Màn hình này chủ yếu phục vụ quản trị nên ưu tiên desktop.

Target:

```text
1366 × 768
1440 × 900
1920 × 1080
```

Ở 1366×768 vẫn phải nhìn được ít nhất khoảng:

```text
5–7 permission modules
```

mà không cần scroll page ngoài.

---

# 22. Responsive Behavior

### Desktop

Role tabs ngang.

### Tablet

Role tabs vẫn ngang, có thể scroll horizontal nếu thêm nhiều role.

### Mobile

Role selector chuyển thành dropdown:

```text
Vai trò
[ Quản lý kho ▼ ]
```

Permission modules full width.

---

# 23. Interaction Rules

### Role switch

Nếu user đã chỉnh permission nhưng chưa Save rồi chuyển role:

Hiển thị confirm dialog:

```text
Bạn có thay đổi chưa lưu.

[Hủy]
[Bỏ thay đổi]
[Lưu và chuyển]
```

### Save

Sau khi save:

```text
✓ Đã cập nhật quyền cho Quản lý kho
```

Toast notification.

### Permission dependencies

Nếu permission phụ thuộc permission khác:

- tự động bật required permission;
- hiển thị tooltip hoặc thông báo nhỏ.

Ví dụ:

```text
Quyền "Approve Transfer"
yêu cầu "View Transfer".
```

---

# 24. UX Priority

Thứ tự ưu tiên:

1. Permission list
2. Role switch
3. Search
4. Save
5. Permission statistics
6. Help information

Không để help content hoặc role description chiếm nhiều diện tích hơn permission list.

---

# 25. Final Design Direction

Layout cuối cùng nên có cấu trúc:

```text
Page Header
    ↓
Role Tabs
    ↓
Role Detail + Save
    ↓
Compact Statistics
    ↓
Search / Collapse
    ↓
Scrollable Permission Accordion
```

Không sử dụng:

```text
Permanent Role Sidebar
```

trong phiên bản hiện tại vì chỉ có hai role.

---

# 26. Expected Result

Redesign cần tạo cảm giác:

- rộng hơn;
- cân bằng hơn;
- ít khoảng trống;
- permission list nằm cao hơn;
- nhìn được nhiều module hơn;
- thao tác phân quyền nhanh hơn;
- giống một Enterprise Permission Management UI hiện đại.

Mục tiêu quan trọng nhất:

> Permission list phải trở thành nội dung chiếm phần lớn diện tích màn hình, thay vì bị thu hẹp bởi role sidebar và phần header quá lớn.
