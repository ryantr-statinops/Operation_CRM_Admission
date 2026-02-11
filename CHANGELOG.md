# Changelog

Tất cả các thay đổi quan trọng của dự án sẽ được ghi lại trong file này.

Format dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
và dự án tuân theo [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-02-11

### Added
- ✨ Hệ thống gom dữ liệu từ nhiều sheet "Tháng" vào Database tập trung
- ✨ Tự động điền ngày ghi nhận khi có Mã TVV hoặc SĐT
- ✨ Tự động xóa ngày khi xóa cả Mã TVV và SĐT
- ✨ Đồng bộ hai chiều giữa Database và các sheet Tháng
- ✨ Chuẩn hóa số điện thoại theo định dạng Việt Nam (+84, 84, với dấu gạch, khoảng trắng)
- ✨ Điền ngày hiện tại cho dữ liệu cũ
- ✨ Điền ngày tùy chỉnh cho dữ liệu cũ
- ✨ Service-based architecture (Config, Logger, Database, Sync)
- ✨ Test suite đầy đủ với nhiều test cases
- ✨ Menu hệ thống với các tùy chọn quản lý
- ✨ Kiểm tra trạng thái hệ thống
- ✨ Debug cấu trúc sheets
- ✨ Metadata tracking (sheet gốc, dòng gốc)
- 📝 README.md chi tiết với hướng dẫn đầy đủ
- 📝 CONTRIBUTING.md với quy tắc đóng góp
- 📝 LICENSE MIT
- 🔧 .gitignore cho Google Apps Script
- 🔧 .clasp.json.example cho Clasp deployment

### Features Details

#### Quản Lý Dữ Liệu (DatabaseService)
- Tạo và quản lý sheet Database
- Tìm kiếm bản ghi theo số điện thoại
- Kiểm tra trạng thái Database
- Validate cấu trúc columns

#### Đồng Bộ (SyncService)
- Gom dữ liệu từ nhiều sheet vào Database
- Cập nhật Database khi sửa sheet Tháng
- Cập nhật sheet Tháng khi sửa Database
- Xử lý ngày tháng linh hoạt
- Format số điện thoại tự động

#### Logging (LoggerService)
- 4 log levels: DEBUG, INFO, WARN, ERROR
- Timestamp cho mỗi log entry
- Console output integration

#### Testing (TestService)
- Test Config validation
- Test Logger functionality
- Test Database operations
- Test Sync operations
- Test phone number formatting
- Test sheets structure
- Test columns mapping
- Performance testing

#### Menu & UI
- Menu "Hệ Thống Database" với 8 tùy chọn
- Alert dialogs thân thiện
- Progress reporting
- Error messages rõ ràng

### Technical Improvements
- Separation of concerns với service-based architecture
- Error handling toàn diện
- Extensive logging cho debugging
- Configurable settings
- Scalable design

### Documentation
- Comprehensive README với examples
- API documentation trong comments
- Setup instructions
- Usage guide
- FAQ section

[Unreleased]: https://github.com/yourusername/google-apps-script-crm/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/google-apps-script-crm/releases/tag/v1.0.0
