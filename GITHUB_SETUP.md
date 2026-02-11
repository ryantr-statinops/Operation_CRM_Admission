# 📤 Hướng Dẫn Đẩy Code Lên GitHub

Tài liệu này hướng dẫn chi tiết cách tạo repository và push code lên GitHub.

## 📋 Mục Lục

- [Chuẩn Bị](#-chuẩn-bị)
- [Tạo Repository Trên GitHub](#-tạo-repository-trên-github)
- [Push Code Lần Đầu](#-push-code-lần-đầu)
- [Cập Nhật Sau Này](#-cập-nhật-sau-này)
- [Best Practices](#-best-practices)

## ✅ Chuẩn Bị

### 1. Cài Đặt Git

**Windows:**
```bash
# Tải từ: https://git-scm.com/download/win
# Chạy installer
```

**macOS:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt install git
```

Kiểm tra:
```bash
git --version
```

### 2. Cấu Hình Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Kiểm tra:
```bash
git config --list
```

### 3. Tạo Tài Khoản GitHub

Nếu chưa có: https://github.com/signup

## 🌐 Tạo Repository Trên GitHub

### Cách 1: Trên Website

1. **Đăng nhập GitHub**
2. Click **+** (góc trên phải) → **New repository**
3. **Điền thông tin:**
   - Repository name: `google-apps-script-crm`
   - Description: `Hệ thống CRM quản lý học viên với Google Apps Script`
   - Visibility: `Public` hoặc `Private`
   - ❌ **KHÔNG** check "Initialize this repository with:"
     - Không thêm README (bạn đã có)
     - Không thêm .gitignore (bạn đã có)
     - Không thêm license (bạn đã có)
4. Click **Create repository**

### Cách 2: Qua GitHub CLI (Tùy Chọn)

```bash
# Cài đặt GitHub CLI
brew install gh  # macOS
# hoặc tải từ: https://cli.github.com/

# Đăng nhập
gh auth login

# Tạo repository
gh repo create google-apps-script-crm --public --description "Hệ thống CRM quản lý học viên với Google Apps Script"
```

## 🚀 Push Code Lần Đầu

### Bước 1: Di Chuyển Vào Thư Mục Project

```bash
cd /path/to/google-apps-script-crm
```

### Bước 2: Khởi Tạo Git Repository

```bash
git init
```

### Bước 3: Chỉnh Sửa File Cá Nhân

Trước khi commit, cập nhật các file sau:

#### 📝 README.md
```bash
# Tìm và thay thế:
YOUR_USERNAME → your-github-username
your.email@example.com → email@của.bạn
Your Name → Tên Của Bạn
```

#### 📝 package.json
```bash
# Tìm và thay thế:
yourusername → your-github-username
your.email@example.com → email@của.bạn
Your Name → Tên Của Bạn
```

#### 📝 LICENSE
```bash
# Tìm và thay thế:
[Your Name] → Tên Của Bạn
```

#### 📝 .clasp.json.example
```bash
# File này là mẫu, không cần sửa
# User sẽ tự tạo .clasp.json riêng
```

### Bước 4: Kiểm Tra Files

```bash
# Xem danh sách files sẽ được commit
git status
```

Output mong đợi:
```
Untracked files:
  .gitignore
  CHANGELOG.md
  CONTRIBUTING.md
  LICENSE
  README.md
  SETUP.md
  GITHUB_SETUP.md
  package.json
  .clasp.json.example
  src/
```

### Bước 5: Add Files

```bash
# Add tất cả files
git add .

# Hoặc add từng loại:
git add .gitignore
git add *.md
git add LICENSE
git add package.json
git add .clasp.json.example
git add src/
```

Kiểm tra lại:
```bash
git status
```

### Bước 6: Commit

```bash
git commit -m "feat: initial commit - Google Apps Script CRM v1.0.0

- Thêm hệ thống gom dữ liệu từ nhiều sheet
- Tự động điền ngày ghi nhận
- Đồng bộ hai chiều Database ↔ Sheet
- Chuẩn hóa số điện thoại
- Service-based architecture
- Test suite đầy đủ
- Documentation hoàn chỉnh"
```

### Bước 7: Thêm Remote Repository

```bash
# Thay YOUR_USERNAME bằng username GitHub của bạn
git remote add origin https://github.com/YOUR_USERNAME/google-apps-script-crm.git
```

Kiểm tra:
```bash
git remote -v
```

Output:
```
origin  https://github.com/YOUR_USERNAME/google-apps-script-crm.git (fetch)
origin  https://github.com/YOUR_USERNAME/google-apps-script-crm.git (push)
```

### Bước 8: Push Lên GitHub

```bash
# Tạo branch main và push
git branch -M main
git push -u origin main
```

Nếu yêu cầu authentication:
- Nhập username GitHub
- Nhập **Personal Access Token** (không phải password)

### Bước 9: Tạo Personal Access Token (Nếu Cần)

1. Vào GitHub → **Settings** → **Developer settings**
2. **Personal access tokens** → **Tokens (classic)**
3. **Generate new token** → **Generate new token (classic)**
4. Note: `Git operations`
5. Expiration: `90 days` hoặc tùy chọn
6. Scopes: Check **repo** (tất cả)
7. **Generate token**
8. **Copy token** (chỉ hiện 1 lần!)
9. Dùng token này thay cho password khi push

### Bước 10: Xác Nhận Trên GitHub

1. Vào https://github.com/YOUR_USERNAME/google-apps-script-crm
2. Kiểm tra:
   - ✅ Tất cả files đã có
   - ✅ README hiển thị đẹp
   - ✅ Commit message rõ ràng

## 🔄 Cập Nhật Sau Này

### Khi Có Thay Đổi Code

```bash
# 1. Kiểm tra files đã thay đổi
git status

# 2. Add files đã sửa
git add .

# 3. Commit với message rõ ràng
git commit -m "fix: sửa lỗi tự động điền ngày"

# 4. Push lên GitHub
git push
```

### Pull Code Từ GitHub

```bash
# Nếu có người khác cập nhật repository
git pull
```

### Tạo Branch Mới Cho Feature

```bash
# Tạo và chuyển sang branch mới
git checkout -b feature/new-feature

# Làm việc và commit
git add .
git commit -m "feat: thêm tính năng mới"

# Push branch lên GitHub
git push -u origin feature/new-feature
```

Sau đó tạo Pull Request trên GitHub.

## ✨ Best Practices

### Commit Messages

Sử dụng format:
```
<type>: <subject>

<body>
```

Types:
- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Cập nhật docs
- `style:` - Format code
- `refactor:` - Tái cấu trúc
- `test:` - Thêm/sửa tests
- `chore:` - Maintenance

Ví dụ:
```bash
git commit -m "feat: thêm tính năng export Excel

- Thêm nút export trong menu
- Hỗ trợ export theo tháng
- Tự động format cells"
```

### Git Ignore

File `.gitignore` đã bao gồm:
- `.clasp.json` - Chứa scriptId riêng của mỗi người
- `node_modules/` - Dependencies
- IDE configs
- OS files

### Branching Strategy

```
main (production)
  ↑
develop (development)
  ↑
feature/* (tính năng mới)
bugfix/* (sửa lỗi)
```

### Tags & Releases

Khi release version mới:

```bash
# Tạo tag
git tag -a v1.0.0 -m "Release v1.0.0"

# Push tag
git push origin v1.0.0
```

Sau đó tạo Release trên GitHub:
1. **Releases** → **Create a new release**
2. Tag: `v1.0.0`
3. Title: `v1.0.0 - Initial Release`
4. Description: Copy từ CHANGELOG.md
5. **Publish release**

## 🔒 Bảo Mật

### ⚠️ KHÔNG COMMIT:

- `.clasp.json` với scriptId thật
- API keys
- Passwords
- Personal access tokens
- Sensitive data

### ✅ NÊN LÀM:

- Dùng `.gitignore`
- Tạo `.env.example` cho environment variables
- Document nhưng không commit credentials
- Review trước khi commit

## 📊 Cải Thiện Repository

### Thêm GitHub Actions (CI/CD)

Tạo `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install -g @google/clasp
      - run: echo "Add your test commands here"
```

### Thêm Badges

Thêm vào README.md:
```markdown
[![GitHub Stars](https://img.shields.io/github/stars/YOUR_USERNAME/google-apps-script-crm)](https://github.com/YOUR_USERNAME/google-apps-script-crm/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/YOUR_USERNAME/google-apps-script-crm)](https://github.com/YOUR_USERNAME/google-apps-script-crm/network)
[![GitHub Issues](https://img.shields.io/github/issues/YOUR_USERNAME/google-apps-script-crm)](https://github.com/YOUR_USERNAME/google-apps-script-crm/issues)
```

### Tạo Templates

#### Issue Template

`.github/ISSUE_TEMPLATE/bug_report.md`:
```markdown
---
name: Bug report
about: Báo cáo lỗi
---

**Mô tả lỗi**
Mô tả ngắn gọn lỗi.

**Các bước tái hiện**
1. ...
2. ...

**Kết quả mong đợi**
...

**Screenshots**
...
```

#### Pull Request Template

`.github/pull_request_template.md`:
```markdown
## Description
Mô tả thay đổi

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update

## Checklist
- [ ] Tests pass
- [ ] Code reviewed
- [ ] Documentation updated
```

## 🎉 Hoàn Thành!

Repository của bạn đã sẵn sàng!

### Next Steps:

1. ⭐ **Star** repository của bạn
2. 📝 Viết blog post về project
3. 🐦 Share trên social media
4. 🤝 Mời contributors
5. 📊 Add to awesome lists

## 📞 Cần Trợ Giúp?

- 📖 [Git Documentation](https://git-scm.com/doc)
- 📖 [GitHub Guides](https://guides.github.com/)
- 💬 [GitHub Community](https://github.community/)
