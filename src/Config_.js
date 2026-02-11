/* ================================================
   CONFIGURATION FILE - CẬP NHẬT THEO YÊU CẦU RIÊNG
================================================ */

const Config = {
  // === 1. ĐỔI LẠI TIỀN TỐ SHEET ===
  DB_SHEET_NAME: 'Database',
  MONTH_PREFIX: 'Tháng',        // Đổi từ 'TVV' thành 'Tháng'
  
  // === 2. CẤU HÌNH HÀNG (Giữ nguyên hoặc chỉnh theo file gốc) ===
  HEADER_ROW: 2,                // Nếu sheet Tháng có header ở dòng 2 thì để là 2
  DATA_START_ROW: 3,            // Nếu dữ liệu bắt đầu từ dòng 3
  DB_HEADER_ROW: 1,             
  DB_DATA_START_ROW: 2,         
  
  // === 3. CỘT QUAN TRỌNG ĐỂ TRA SOÁT ===
  SDT_HEADER: 'SĐT',            // Đảm bảo chữ SĐT này khớp chính xác với tiêu đề trong sheet
  SHEET_GOC_COL: 'Sheet_goc', 
  DONG_GOC_COL: 'Dong_goc',
  
  // === 4. DANH SÁCH CỘT BẠN MUỐN LẤY ===
  // Lưu ý: Tên ở đây phải khớp 100% với tiêu đề cột ở các sheet "Tháng"
  DB_COLUMNS: [
    "NGÀY\nGHI NHẬN",
    "MÃ TVV", 
    "NGUỒN", 
    "MÃ ĐĂNG KÝ", 
    "TÊN HỌC VIÊN", 
    "Link Facebook", 
    "SĐT", 
    "TRƯỜNG",
    "KHOÁ", 
    "MÔN", 
    "KHAI GIẢNG\n(dd/mm)", // Lưu ý: \n(xuống dòng)
    "KÊNH HỌC", 
    "HỌC PHÍ", 
    "GHI CHÚ"
  ],
  
  LOG_LEVEL: 'INFO'
};