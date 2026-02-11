#!/bin/bash

# Google Apps Script CRM - Auto Setup Script
# Chạy script này để tự động setup project

set -e  # Exit on error

echo "🚀 Google Apps Script CRM - Auto Setup"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt!"
    echo "   Vui lòng cài đặt từ: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm chưa được cài đặt!"
    exit 1
fi

echo "✅ npm: $(npm --version)"

# Check/Install Clasp
if ! command -v clasp &> /dev/null; then
    echo "📦 Đang cài đặt Clasp..."
    npm install -g @google/clasp
    echo "✅ Clasp đã được cài đặt"
else
    echo "✅ Clasp: $(clasp --version)"
fi

# Login to Clasp
echo ""
echo "🔐 Đăng nhập Clasp..."
echo "   (Trình duyệt sẽ mở ra, vui lòng đăng nhập)"
clasp login

# Create project
echo ""
echo "📝 Tạo Apps Script project..."
read -p "Nhập tên project (mặc định: CRM Quản Lý Học Viên): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-"CRM Quản Lý Học Viên"}

clasp create --type sheets --title "$PROJECT_NAME"

# Push code
echo ""
echo "📤 Đang push code lên Apps Script..."
clasp push

# Open in browser
echo ""
echo "🌐 Mở Apps Script Editor..."
clasp open

echo ""
echo "======================================"
echo "✅ Setup hoàn tất!"
echo ""
echo "📚 Next steps:"
echo "   1. Chỉnh sửa Config_.js nếu cần"
echo "   2. Reload Google Sheets"
echo "   3. Vào menu 'Hệ Thống Database' → 'Kiểm tra toàn bộ'"
echo ""
echo "📖 Tài liệu:"
echo "   - README.md - Tổng quan"
echo "   - SETUP.md - Hướng dẫn chi tiết"
echo "   - QUICK_START.md - Hướng dẫn nhanh"
echo ""
echo "🆘 Cần trợ giúp? Xem SETUP.md - Troubleshooting"
echo "======================================"
