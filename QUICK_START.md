# ⚡ Quick Start Guide

Hướng dẫn nhanh 5 phút để chạy project.

## 🚀 Cài Đặt Nhanh

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/google-apps-script-crm.git
cd google-apps-script-crm
```

### 2. Cài Đặt Clasp

```bash
npm install -g @google/clasp
clasp login
```

### 3. Tạo Project

```bash
clasp create --type sheets --title "CRM Quản Lý Học Viên"
```

### 4. Push Code

```bash
clasp push
```

### 5. Mở & Test

```bash
clasp open
```

Trong Google Sheets:
- **Extensions** → **Apps Script**
- Reload trang
- Menu **Hệ Thống Database** → **Kiểm tra toàn bộ**

## ✅ Checklist

- [ ] Clone repository
- [ ] Cài Clasp & login
- [ ] Tạo project
- [ ] Push code
- [ ] Test menu hiển thị
- [ ] Chạy test suite
- [ ] Thử điền ngày tự động
- [ ] Thử gom dữ liệu

## 📝 Cấu Hình Cần Thiết

### Config_.js

```javascript
const Config = {
  DB_SHEET_NAME: 'Database',
  MONTH_PREFIX: 'Tháng',
  HEADER_ROW: 2,
  DATA_START_ROW: 3,
  SDT_HEADER: 'SĐT'
};
```

### Cấu Trúc Sheet

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| NGÀY | MÃ TVV | NGUỒN | MÃ ĐK | TÊN | FB | SĐT |

## 🎯 Sử Dụng Cơ Bản

### Gom Dữ Liệu

Menu → **Gom dữ liệu từ các sheet Tháng**

### Điền Ngày Cũ

Menu → **Điền ngày hiện tại cho dữ liệu cũ**

### Kiểm Tra

Menu → **Kiểm tra trạng thái**

## 📚 Tài Liệu Đầy Đủ

- [README.md](README.md) - Tổng quan
- [SETUP.md](SETUP.md) - Cài đặt chi tiết
- [GITHUB_SETUP.md](GITHUB_SETUP.md) - Push lên GitHub
- [CONTRIBUTING.md](CONTRIBUTING.md) - Đóng góp

## 🆘 Gặp Vấn Đề?

1. Kiểm tra [SETUP.md - Troubleshooting](SETUP.md#-troubleshooting)
2. Xem [Execution Log](https://script.google.com/home/executions)
3. [GitHub Issues](https://github.com/yourusername/google-apps-script-crm/issues)
