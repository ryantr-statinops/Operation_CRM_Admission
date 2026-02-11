# 🎓 Google Apps Script - CRM Quản Lý Học Viên

> Hệ thống quản lý dữ liệu học viên tự động với Google Sheets & Apps Script

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=flat&logo=google&logoColor=white)](https://script.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng](#-tính-năng)
- [Cài Đặt](#-cài-đặt)
- [Cấu Hình](#️-cấu-hình)
- [Sử Dụng](#-sử-dụng)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Đóng Góp](#-đóng-góp)
- [Giấy Phép](#-giấy-phép)

## 🎯 Giới Thiệu

Hệ thống CRM quản lý thông tin học viên được xây dựng trên Google Apps Script, giúp tự động hóa việc thu thập, đồng bộ và quản lý dữ liệu từ nhiều sheet Google Sheets.

### 🌟 Điểm Nổi Bật

- ✅ **Tự động đồng bộ** dữ liệu từ nhiều sheet tháng vào Database tập trung
- ✅ **Tự động điền ngày ghi nhận** khi có dữ liệu mới
- ✅ **Chuẩn hóa số điện thoại** theo định dạng Việt Nam
- ✅ **Đồng bộ hai chiều** giữa Database và các sheet tháng
- ✅ **Logging chi tiết** để theo dõi và debug
- ✅ **Test suite** đầy đủ để đảm bảo chất lượng

## 🚀 Tính Năng

### 1. Quản Lý Dữ Liệu
- Thu thập dữ liệu từ nhiều sheet "Tháng" vào một Database duy nhất
- Lưu trữ metadata (sheet gốc, dòng gốc) để truy vết
- Hỗ trợ 14 cột thông tin học viên

### 2. Tự Động Hóa
- Tự động điền ngày ghi nhận khi có Mã TVV hoặc SĐT
- Tự động xóa ngày khi xóa cả Mã TVV và SĐT
- Đồng bộ thay đổi giữa Database ↔ Sheet Tháng

### 3. Xử Lý Dữ Liệu
- Chuẩn hóa số điện thoại (hỗ trợ format +84, 84, có dấu gạch, khoảng trắng)
- Xử lý ngày tháng linh hoạt
- Kiểm tra và validate dữ liệu

### 4. Công Cụ Hỗ Trợ
- Điền ngày cho dữ liệu cũ (ngày hiện tại hoặc tùy chỉnh)
- Kiểm tra trạng thái hệ thống
- Debug cấu trúc sheets
- Test suite với nhiều test case

## 📥 Cài Đặt

### Yêu Cầu
- Tài khoản Google
- Quyền chỉnh sửa Google Sheets
- Google Apps Script Editor

### Các Bước Cài Đặt

#### Phương Pháp 1: Sử Dụng Clasp (Khuyến Nghị)

1. **Cài đặt Clasp**
```bash
npm install -g @google/clasp
```

2. **Clone repository**
```bash
git clone https://github.com/YOUR_USERNAME/google-apps-script-crm.git
cd google-apps-script-crm
```

3. **Đăng nhập Clasp**
```bash
clasp login
```

4. **Tạo Apps Script project mới**
```bash
clasp create --type sheets --title "CRM Quản Lý Học Viên"
```

5. **Push code lên Apps Script**
```bash
clasp push
```

#### Phương Pháp 2: Copy Thủ Công

1. Mở Google Sheets của bạn
2. Vào **Extensions** → **Apps Script**
3. Copy nội dung từng file `.js` vào Apps Script Editor
4. Lưu project

## ⚙️ Cấu Hình

### File `Config_.js`

Chỉnh sửa file này để phù hợp với cấu trúc sheets của bạn:

```javascript
const Config = {
  // Tên sheet Database
  DB_SHEET_NAME: 'Database',
  
  // Tiền tố sheet tháng (ví dụ: "Tháng 1", "Tháng 2")
  MONTH_PREFIX: 'Tháng',
  
  // Cấu hình dòng
  HEADER_ROW: 2,        // Dòng chứa header
  DATA_START_ROW: 3,    // Dòng bắt đầu dữ liệu
  
  // Cột quan trọng
  SDT_HEADER: 'SĐT',    // Tên cột số điện thoại
  
  // Danh sách cột cần đồng bộ
  DB_COLUMNS: [
    "NGÀY\nGHI NHẬN",
    "MÃ TVV",
    "NGUỒN",
    // ... thêm các cột khác
  ]
};
```

### Cấu Trúc Sheet Yêu Cầu

Mỗi sheet "Tháng" cần có các cột sau:

| Cột | Tên | Bắt buộc | Mô Tả |
|-----|-----|----------|-------|
| A | NGÀY GHI NHẬN | Không | Tự động điền |
| B | MÃ TVV | Có | Mã tư vấn viên |
| G | SĐT | Có | Số điện thoại (khóa chính) |

## 💡 Sử Dụng

### Menu Hệ Thống

Sau khi cài đặt, bạn sẽ thấy menu **"Hệ Thống Database"** với các tùy chọn:

#### 🔄 Gom dữ liệu từ các sheet Tháng
- Thu thập toàn bộ dữ liệu từ các sheet "Tháng" vào Database
- Xóa dữ liệu cũ và tạo mới

#### 📅 Điền ngày hiện tại cho dữ liệu cũ
- Quét tất cả sheet "Tháng"
- Điền ngày hôm nay cho các dòng có Mã TVV/SĐT nhưng chưa có ngày

#### 📆 Điền ngày tùy chỉnh cho dữ liệu cũ
- Cho phép chọn ngày cụ thể
- Hữu ích khi import dữ liệu cũ

#### 📊 Kiểm tra trạng thái
- Xem số lượng bản ghi
- Kiểm tra cấu hình hệ thống
- Liệt kê các cột đang quản lý

#### 🔍 Kiểm tra cấu trúc sheets
- Debug cấu trúc từng sheet
- Phát hiện cột thiếu
- Xem số dòng/cột

#### 🧪 Kiểm tra toàn bộ / ⚡ Kiểm tra nhanh
- Chạy test suite
- Kiểm tra tính năng hệ thống

### Sử Dụng Trigger Tự Động

Hệ thống sử dụng trigger `onEdit()` để tự động:

1. **Điền ngày** khi nhập Mã TVV hoặc SĐT
2. **Xóa ngày** khi xóa cả Mã TVV và SĐT  
3. **Đồng bộ sang Database** khi có thay đổi

### Ví Dụ Workflow

```
1. Nhập dữ liệu học viên mới vào sheet "Tháng 1"
   → Hệ thống tự động điền ngày vào cột A
   
2. Dữ liệu tự động đồng bộ sang Database
   
3. Nếu sửa dữ liệu trong Database
   → Tự động cập nhật lại sheet "Tháng 1"
   
4. Cuối tháng, gom tất cả dữ liệu:
   Menu → "Gom dữ liệu từ các sheet Tháng"
```

## 📁 Cấu Trúc Dự Án

```
google-apps-script-crm/
├── src/
│   ├── Config_.js              # Cấu hình hệ thống
│   ├── LoggerService_.js       # Service logging
│   ├── DatabaseService_.js     # Service quản lý Database
│   ├── SyncService_.js         # Service đồng bộ dữ liệu
│   ├── Main_.js                # Entry point & menu
│   └── Test_.js                # Test suite
├── .clasp.json                 # Cấu hình Clasp
├── appsscript.json            # Manifest Apps Script
├── README.md                   # Tài liệu này
├── LICENSE                     # Giấy phép MIT
└── .gitignore                 # Git ignore
```

## 🧪 Testing

### Chạy Test

Từ menu: **Hệ Thống Database** → **Kiểm tra toàn bộ**

Test bao gồm:
- ✅ Config validation
- ✅ Logger functionality  
- ✅ Database operations
- ✅ Sync operations
- ✅ Phone number formatting
- ✅ Sheets structure validation
- ✅ Columns mapping

### Test Thủ Công

1. Nhập dữ liệu mới → Kiểm tra tự động điền ngày
2. Xóa Mã TVV + SĐT → Kiểm tra xóa ngày
3. Sửa Database → Kiểm tra đồng bộ ngược
4. Gom dữ liệu → Kiểm tra kết quả Database

## 🔧 Tùy Chỉnh

### Thêm Cột Mới

1. Mở `Config_.js`
2. Thêm tên cột vào mảng `DB_COLUMNS`
3. Đảm bảo sheet "Tháng" có cột tương ứng

### Thay Đổi Logic Tự Động Điền Ngày

Chỉnh sửa hàm `onEdit()` trong `Main_.js`:

```javascript
// Tùy chỉnh điều kiện điền ngày
if ((valMaTVV !== "" || valSDT !== "") && cellA.getValue() === "") {
  // Logic của bạn ở đây
}
```

### Thêm Validation

Chỉnh sửa `SyncService_.js`, thêm validation trong hàm `capNhatDatabase()`.

## 📊 Logging

Xem log trong Apps Script Editor:

1. Vào **Extensions** → **Apps Script**
2. Click biểu tượng **Execution log** (⏱️) bên trái
3. Xem chi tiết từng bước thực thi

Log levels:
- `DEBUG`: Chi tiết kỹ thuật
- `INFO`: Thông tin chung
- `WARN`: Cảnh báo
- `ERROR`: Lỗi cần xử lý

## 🤝 Đóng Góp

Chúng tôi rất hoan nghênh mọi đóng góp!

### Cách Đóng Góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Quy Tắc Code

- Sử dụng tiếng Việt cho comments
- Đặt tên biến/hàm bằng tiếng Anh
- Tuân thủ coding style hiện tại
- Thêm test cho tính năng mới

## ❓ FAQ

### Tại sao ngày không tự động điền?

Kiểm tra:
1. Sheet có bắt đầu bằng "Tháng" không?
2. Dòng có >= `DATA_START_ROW` không?
3. Có Mã TVV hoặc SĐT không?
4. Cột A có đang trống không?

### Làm sao để khôi phục dữ liệu?

Google Sheets tự động lưu version history:
1. **File** → **Version History** → **See version history**
2. Chọn version cần khôi phục

### Có giới hạn số lượng dữ liệu không?

Google Sheets giới hạn:
- 10 triệu cells/spreadsheet
- 5 triệu cells/sheet
- 18,278 columns/sheet

## 📝 Changelog

### Version 1.0.0 (2026-02-11)
- ✨ Tính năng gom dữ liệu từ nhiều sheet
- ✨ Tự động điền ngày ghi nhận
- ✨ Đồng bộ hai chiều Database ↔ Sheet
- ✨ Chuẩn hóa số điện thoại
- ✨ Điền ngày cho dữ liệu cũ
- ✨ Test suite đầy đủ

## 📄 Giấy Phép

Dự án này được phân phối dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👥 Tác Giả

- **Your Name** - *Initial work*

## 🙏 Lời Cảm Ơn

- Google Apps Script Documentation
- Cộng đồng Stack Overflow
- Tất cả contributors

## 📞 Liên Hệ

- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

---

⭐ Nếu project hữu ích, hãy cho một star nhé!
