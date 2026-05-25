/* ================================================
   CONFIGURATION FILE 
================================================ */

const Config = {
  // Tên các sheet
  DB_SHEET_NAME: 'Database',
  MONTH_PREFIX: 'Tháng',
  
  // CẤU HÌNH HEADER LINH HOẠT
  HEADER_ROW: 2,                // Header ở sheet Tháng nằm ở dòng 2
  DATA_START_ROW: 3,            // Dữ liệu bắt đầu từ dòng 3 ở sheet Tháng
  
  // THÊM CẤU HÌNH CHO DATABASE
  DB_HEADER_ROW: 1,             // Header trong Database nằm ở dòng 1
  DB_DATA_START_ROW: 2,         // Dữ liệu trong Database bắt đầu từ dòng 2
  
  // Tên cột quan trọng
  SDT_HEADER: 'SDT',            // Cột số điện thoại (khóa chính)
  SHEET_GOC_COL: 'Sheet_goc',   // Tên sheet gốc
  DONG_GOC_COL: 'Dong_goc',     // Số dòng gốc
  
  // Cấu hình hệ thống
  LOG_LEVEL: 'INFO',            // DEBUG, INFO, WARN, ERROR
  MAX_RECORDS: 10000,           // Giới hạn số bản ghi
  BACKUP_ENABLED: true,         // Tự động backup

  // ========================
  // FORM CONFIG - TỰ ĐỘNG TẠO SHEET
  // ========================
  FORM_SHEET_NAME: "Tra cứu học viên",
  FORM_SDT_CELL: "B1",          // Ô nhập SDT
  FORM_HEADER_ROW: 12,          // Header row cho bảng khóa học
  
  // Mapping thông tin chung
  FORM_INFO_MAPPING: {
    "NHÂN VIÊN": "B5",
    "TÊN HV": "B6", 
    "LINK FB": "B7",
    "SDT": "B8"      
  },
  
  // BẢNG DANH SACH KHÓA HỌC MAPPING
  FORM_KHOAHOC_MAPPING: {
    "KHOÁ": 1,                  // Cột A
    "MÔN": 2,                   // Cột B  
    "TIẾN ĐỘ": 3,               // Cột C
    "MÃ ƯU ĐÃI": 4,             // Cột D
    "KÊNH HỌC": 5,              // Cột E
    "KHAI GIẢNG\n(dd/mm)": 6,   // Cột F
    "NGÀY THI": 7,              // Cột G
    "KẾT QUẢ THI": 8,              // Cột H
    "GHI CHÚ": 9,               // Cột I
  
  },

  // CẤU HÌNH VỊ TRÍ 
  FORM_VI_TRI: {
    "TITLE_ROW": 4,             // Dòng 4 - "VỊ TRÍ DÒNG"
    "HEADER_ROW": 5,            // Dòng 5 - tiêu đề cột
    "DATA_START_ROW": 6,        // Dòng 6 - bắt đầu dữ liệu
    "DATA_END_ROW": 9,          // Dòng 9 - kết thúc dữ liệu (tối đa 4 dòng)
    "MAX_ROWS": 4,              // Tối đa 4 dòng
    "COLUMNS": {
      "SHEET_GOC": 5,           // Cột E
      "DONG_GOC": 6,            // Cột F  
      "DONG_DB": 7              // Cột G
    }
  },


  // CẤU HÌNH BẢNG KHÓA HỌC
  FORM_KHOAHOC: {
    "TITLE_ROW": 11,            // Dòng 11 - "DANH SÁCH KHÓA HỌC"
    "HEADER_ROW": 12,           // Dòng 12 - headers bảng
    "DATA_START_ROW": 13,       // Dòng 13 - bắt đầu dữ liệu
    "DATA_END_ROW": 16,         // Dòng 16 - kết thúc dữ liệu (tối đa 4 dòng)
    "MAX_ROWS": 4               // Tối đa 4 dòng
  },

  // Options cho dropdown (BỎ KHÔNG LÀM )
  TIENDO_OPTIONS: ["Chưa bắt đầu", "Đang học", "Hoàn thành", "Bỏ học"],
  KETQUA_OPTIONS: ["Chưa thi", "Đạt", "Không đạt", "Chờ kết quả"],
  KENH_HOC_OPTIONS: ["Online", "Offline", "Hybrid", "Blended"],
  
  // Auto-create form khi hệ thống khởi động
  AUTO_CREATE_FORM: true
};