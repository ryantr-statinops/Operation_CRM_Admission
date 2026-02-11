# 🤝 Hướng Dẫn Đóng Góp

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án! Chúng tôi rất hoan nghênh mọi đóng góp từ cộng đồng.

## 📋 Quy Trình Đóng Góp

### 1. Fork Repository

Click nút "Fork" ở góc trên bên phải của repository.

### 2. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/google-apps-script-crm.git
cd google-apps-script-crm
```

### 3. Tạo Branch Mới

```bash
git checkout -b feature/your-feature-name
```

Quy ước đặt tên branch:
- `feature/` - Tính năng mới
- `bugfix/` - Sửa lỗi
- `docs/` - Cập nhật tài liệu
- `refactor/` - Tái cấu trúc code

### 4. Thực Hiện Thay Đổi

- Tuân thủ coding style hiện tại
- Thêm comments bằng tiếng Việt
- Đặt tên biến/hàm bằng tiếng Anh
- Thêm test cho tính năng mới

### 5. Test

Chạy test trước khi commit:

```bash
# Trong Apps Script Editor:
# Menu → Hệ Thống Database → Kiểm tra toàn bộ
```

### 6. Commit

```bash
git add .
git commit -m "feat: thêm tính năng XYZ"
```

Quy ước commit message:
- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Cập nhật tài liệu
- `style:` - Format code
- `refactor:` - Tái cấu trúc
- `test:` - Thêm/sửa test
- `chore:` - Công việc khác

### 7. Push

```bash
git push origin feature/your-feature-name
```

### 8. Tạo Pull Request

1. Vào repository của bạn trên GitHub
2. Click "New Pull Request"
3. Chọn base repository và branch
4. Mô tả chi tiết thay đổi
5. Submit Pull Request

## 📝 Coding Standards

### JavaScript Style

```javascript
// ✅ GOOD
function capNhatDatabase(e) {
  if (!e) return;
  
  const sh = e.range.getSheet();
  const name = sh.getName();
  
  // Logic ở đây
}

// ❌ BAD
function capNhatDatabase(e){
    if(!e) return
    const sh=e.range.getSheet()
    const name=sh.getName()
}
```

### Comments

```javascript
// ✅ GOOD - Comment bằng tiếng Việt, giải thích "tại sao"
// Kiểm tra sheet có phải là sheet Tháng không
// vì chỉ sheet Tháng mới có cấu trúc cần xử lý
if (name.startsWith(Config.MONTH_PREFIX)) {
  // ...
}

// ❌ BAD - Comment quá rõ ràng, không cần thiết
// Kiểm tra name bắt đầu với MONTH_PREFIX
if (name.startsWith(Config.MONTH_PREFIX)) {
  // ...
}
```

### Error Handling

```javascript
// ✅ GOOD
try {
  // Logic
} catch (error) {
  this.logger.error('Lỗi khi xử lý: ' + error.toString());
  throw error; // Re-throw nếu cần
}

// ❌ BAD
try {
  // Logic  
} catch (error) {
  // Bỏ qua lỗi
}
```

## 🧪 Testing

### Test Checklist

- [ ] Tất cả test case pass
- [ ] Thêm test cho code mới
- [ ] Test thủ công trên Google Sheets
- [ ] Kiểm tra logging

### Test Cases Cần Cover

1. **Config Validation**
   - Tất cả config keys tồn tại
   - Giá trị config hợp lệ

2. **Database Operations**
   - Tạo/đọc/cập nhật/xóa
   - Tìm kiếm theo SĐT

3. **Sync Operations**
   - Sheet → Database
   - Database → Sheet
   - Format phone number

4. **Auto Fill Date**
   - Điền ngày khi có Mã TVV/SĐT
   - Xóa ngày khi xóa cả 2

## 📋 Pull Request Checklist

- [ ] Code tuân thủ coding standards
- [ ] Đã thêm/cập nhật tests
- [ ] Tất cả tests pass
- [ ] Đã cập nhật README nếu cần
- [ ] Commit messages rõ ràng
- [ ] Không có conflict với main branch

## 🐛 Báo Lỗi

### Template Báo Lỗi

```markdown
**Mô tả lỗi**
Mô tả ngắn gọn lỗi gặp phải.

**Các bước tái hiện**
1. Vào '...'
2. Click vào '....'
3. Scroll xuống '....'
4. Thấy lỗi

**Kết quả mong đợi**
Mô tả điều bạn mong đợi xảy ra.

**Kết quả thực tế**
Mô tả điều thực sự xảy ra.

**Screenshots**
Nếu có, thêm screenshots.

**Môi trường:**
 - Browser: [e.g. Chrome, Safari]
 - Version: [e.g. 22]

**Thông tin thêm**
Thêm context khác về lỗi.
```

## 💡 Đề Xuất Tính Năng

### Template Đề Xuất

```markdown
**Tính năng đề xuất**
Mô tả rõ ràng tính năng mong muốn.

**Vấn đề hiện tại**
Mô tả vấn đề/nhu cầu mà tính năng này giải quyết.

**Giải pháp đề xuất**
Mô tả cách bạn muốn tính năng hoạt động.

**Giải pháp thay thế**
Mô tả các giải pháp khác bạn đã xem xét.

**Thông tin thêm**
Context, screenshots, v.v.
```

## 📞 Liên Hệ

Nếu có câu hỏi, vui lòng:
- Mở Issue trên GitHub
- Email: your.email@example.com

## 🙏 Cảm ơn!

Cảm ơn bạn đã dành thời gian đóng góp cho dự án!
