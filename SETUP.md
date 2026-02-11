# 🚀 Hướng Dẫn Cài Đặt Chi Tiết

Tài liệu này hướng dẫn từng bước để setup dự án Google Apps Script CRM.

## 📋 Mục Lục

- [Yêu Cầu](#-yêu-cầu)
- [Phương Pháp 1: Sử Dụng Clasp](#-phương-pháp-1-sử-dụng-clasp-khuyến-nghị)
- [Phương Pháp 2: Copy Thủ Công](#-phương-pháp-2-copy-thủ-công)
- [Cấu Hình](#️-cấu-hình)
- [Kiểm Tra](#-kiểm-tra)
- [Troubleshooting](#-troubleshooting)

## ✅ Yêu Cầu

### Bắt Buộc
- ✅ Tài khoản Google
- ✅ Google Sheets với quyền chỉnh sửa
- ✅ Trình duyệt web (Chrome, Firefox, Safari, Edge)

### Tùy Chọn (cho Clasp)
- Node.js >= 12.0.0
- npm hoặc yarn
- Terminal/Command Line

## 🔧 Phương Pháp 1: Sử Dụng Clasp (Khuyến Nghị)

Clasp (Command Line Apps Script Projects) cho phép quản lý code Apps Script từ terminal.

### Bước 1: Cài Đặt Node.js

**Windows:**
```bash
# Tải từ https://nodejs.org/
# Chạy installer và làm theo hướng dẫn
```

**macOS:**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nodejs npm
```

Kiểm tra cài đặt:
```bash
node --version
npm --version
```

### Bước 2: Cài Đặt Clasp

```bash
npm install -g @google/clasp
```

Kiểm tra:
```bash
clasp --version
```

### Bước 3: Clone Repository

```bash
git clone https://github.com/yourusername/google-apps-script-crm.git
cd google-apps-script-crm
```

### Bước 4: Đăng Nhập Clasp

```bash
clasp login
```

- Trình duyệt sẽ mở ra
- Đăng nhập với tài khoản Google
- Cho phép Clasp truy cập

### Bước 5: Tạo Project Mới

**Option A: Tạo project riêng**
```bash
clasp create --type sheets --title "CRM Quản Lý Học Viên"
```

**Option B: Link với Google Sheets có sẵn**
```bash
# 1. Mở Google Sheets
# 2. Extensions → Apps Script
# 3. Lấy Script ID từ URL: 
#    https://script.google.com/...../d/SCRIPT_ID_HERE/edit
# 4. Tạo file .clasp.json:
```

```json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "src"
}
```

### Bước 6: Push Code

```bash
clasp push
```

Xác nhận overwrite nếu có:
```
? Manifest file has been updated. Do you want to push and overwrite? (y/N) y
```

### Bước 7: Mở Script Editor

```bash
clasp open
```

Hoặc mở thủ công:
- Vào Google Sheets
- **Extensions** → **Apps Script**

### Bước 8: Test

Trong Apps Script Editor:
1. Reload trang
2. Menu **Hệ Thống Database** → **Kiểm tra toàn bộ**

## 📝 Phương Pháp 2: Copy Thủ Công

### Bước 1: Tải Code

**Option A: Clone với Git**
```bash
git clone https://github.com/yourusername/google-apps-script-crm.git
```

**Option B: Download ZIP**
1. Vào GitHub repository
2. Click nút **Code** → **Download ZIP**
3. Giải nén file

### Bước 2: Mở Google Sheets

1. Tạo hoặc mở Google Sheets
2. **Extensions** → **Apps Script**

### Bước 3: Copy Files

Copy từng file từ thư mục `src/` theo thứ tự:

1. **Config_.js**
   - Tạo file mới: Click **+** → **Script**
   - Đặt tên: `Config_`
   - Copy nội dung từ `src/Config_.js`
   - Paste vào Editor
   - Save (Ctrl+S)

2. **LoggerService_.js**
   - Tạo file mới
   - Đặt tên: `LoggerService_`
   - Copy & Paste
   - Save

3. **DatabaseService_.js**
   - Tạo file mới
   - Đặt tên: `DatabaseService_`
   - Copy & Paste
   - Save

4. **SyncService_.js**
   - Tạo file mới
   - Đặt tên: `SyncService_`
   - Copy & Paste
   - Save

5. **Main_.js**
   - Tạo file mới
   - Đặt tên: `Main_`
   - Copy & Paste
   - Save

6. **Test_.js**
   - Tạo file mới
   - Đặt tên: `Test_`
   - Copy & Paste
   - Save

### Bước 4: Copy appsscript.json

1. Click vào **Project Settings** (⚙️ icon bên trái)
2. Check **Show "appsscript.json" manifest file**
3. Quay lại **Editor**
4. Mở file `appsscript.json`
5. Copy nội dung từ `src/appsscript.json`
6. Paste và Save

## ⚙️ Cấu Hình

### 1. Chỉnh Sửa Config_.js

Mở `Config_.js` và chỉnh sửa:

```javascript
const Config = {
  // Tên sheet Database
  DB_SHEET_NAME: 'Database',  // Đổi nếu cần
  
  // Tiền tố sheet tháng
  MONTH_PREFIX: 'Tháng',      // Ví dụ: "Tháng 1", "Tháng 2"
  
  // Dòng header và data
  HEADER_ROW: 2,              // Dòng chứa header
  DATA_START_ROW: 3,          // Dòng đầu tiên có data
  
  // Cột số điện thoại
  SDT_HEADER: 'SĐT',          // Tên chính xác của cột SĐT
  
  // Danh sách cột cần sync
  DB_COLUMNS: [
    "NGÀY\nGHI NHẬN",
    "MÃ TVV",
    "NGUỒN",
    // ... thêm các cột của bạn
  ]
};
```

### 2. Kiểm Tra Cấu Trúc Sheet

Đảm bảo sheet "Tháng" có cấu trúc:

| Cột | Tên | Bắt buộc |
|-----|-----|----------|
| A | NGÀY GHI NHẬN | Không (tự động) |
| B | MÃ TVV | Có |
| G | SĐT | Có |

### 3. Tạo Trigger (Tùy Chọn)

Nếu muốn menu tự động load:

1. **Triggers** (⏰ icon bên trái)
2. **Add Trigger**
3. Function: `onOpen`
4. Event source: **From spreadsheet**
5. Event type: **On open**
6. Save

## 🧪 Kiểm Tra

### Test 1: Menu Hiển Thị

1. **Đóng Google Sheets**
2. **Mở lại**
3. Kiểm tra menu **Hệ Thống Database** có xuất hiện không

### Test 2: Chạy Test Suite

1. Menu → **Hệ Thống Database** → **Kiểm tra toàn bộ**
2. Xem kết quả
3. Tất cả phải PASSED ✅

### Test 3: Điền Ngày Tự Động

1. Vào một sheet "Tháng"
2. Nhập SĐT vào một dòng mới
3. Kiểm tra cột A có tự động điền ngày không

### Test 4: Gom Dữ Liệu

1. Menu → **Hệ Thống Database** → **Gom dữ liệu**
2. Kiểm tra sheet "Database" được tạo và có dữ liệu

## 🔍 Troubleshooting

### Menu Không Hiển Thị

**Nguyên nhân:** Script chưa được authorize

**Giải pháp:**
1. Vào Apps Script Editor
2. Chọn function `onOpen` từ dropdown
3. Click **Run**
4. Authorize khi được yêu cầu

### Lỗi "ReferenceError: Config is not defined"

**Nguyên nhân:** Thiếu file hoặc sai thứ tự load

**Giải pháp:**
1. Kiểm tra file `Config_.js` có tồn tại
2. Đảm bảo tên file chính xác
3. Reload Apps Script Editor

### Không Tự Động Điền Ngày

**Nguyên nhân:** Sheet name không đúng hoặc config sai

**Giải pháp:**
1. Kiểm tra sheet có bắt đầu bằng "Tháng" không
2. Kiểm tra `MONTH_PREFIX` trong Config
3. Kiểm tra `DATA_START_ROW` đúng không
4. Xem Execution log để debug

### Xem Execution Log

1. Apps Script Editor
2. Click **Executions** (⏱️ icon)
3. Xem chi tiết lỗi

### Clasp Push Bị Lỗi

**Lỗi:** "User has not enabled the Apps Script API"

**Giải pháp:**
1. Vào https://script.google.com/home/usersettings
2. Bật "Google Apps Script API"
3. Thử lại `clasp push`

## 📞 Cần Hỗ Trợ?

- 🐛 Báo lỗi: [GitHub Issues](https://github.com/yourusername/google-apps-script-crm/issues)
- 📧 Email: your.email@example.com
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/google-apps-script-crm/discussions)

## 🎉 Hoàn Tất!

Bây giờ bạn đã sẵn sàng sử dụng hệ thống CRM!

Next steps:
- Đọc [README.md](README.md) để tìm hiểu các tính năng
- Xem [CONTRIBUTING.md](CONTRIBUTING.md) nếu muốn đóng góp
- Check [CHANGELOG.md](CHANGELOG.md) để cập nhật phiên bản mới
