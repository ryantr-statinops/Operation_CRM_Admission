/* ================================================
   FORM SERVICE 
================================================ */

class FormService {
  constructor() {
    this.config = Config;
    this.logger = logger;
    this.databaseService = databaseService;
  }

  get ui() {
    return SpreadsheetApp.getUi();
  }

  setupFormSheet() {
    this.logger.info('Thiết lập Form tra cứu học viên - BỐ CỤC CHUẨN...');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let formSheet = ss.getSheetByName(this.config.FORM_SHEET_NAME);

    if (!formSheet) {
      formSheet = ss.insertSheet(this.config.FORM_SHEET_NAME);
      this.logger.info('Đã tạo Form sheet mới');
    } else {
      formSheet.clear();
      this.logger.info('Đã xóa và tạo lại Form sheet');
    }

    // === PHẦN 1: TRA CỨU ===
    formSheet.getRange("A1").setValue("Nhập số điện thoại:").setFontWeight("bold");
    formSheet.getRange("B1").setValue("");

    // === PHẦN 2: THÔNG TIN CHUNG ===
    formSheet.getRange("A4").setValue("THÔNG TIN CHUNG").setFontWeight("bold");
    formSheet.getRange("A5").setValue("NHÂN VIÊN:");
    formSheet.getRange("A6").setValue("TÊN HV:");
    formSheet.getRange("A7").setValue("LINK FB:");
    formSheet.getRange("A8").setValue("SDT:");

    // === PHẦN 3: VỊ TRÍ DÒNG (E4:G9) === 
    // Tiêu đề bảng
    formSheet.getRange("E4").setValue("VỊ TRÍ DÒNG").setFontWeight("bold");
    
    // Tiêu đề cột
    formSheet.getRange("E5").setValue("Sheet gốc").setFontWeight("bold");
    formSheet.getRange("F5").setValue("Dòng gốc").setFontWeight("bold"); 
    formSheet.getRange("G5").setValue("Dòng DB").setFontWeight("bold");

    // === PHẦN 4: DANH SÁCH KHÓA HỌC (A11:I16) ===
    formSheet.getRange("A11").setValue("DANH SÁCH KHÓA HỌC").setFontWeight("bold");

    // HEADERS cho bảng khóa học - 9 CỘT
    const headers = [
      "KHÓA", "MÔN", "TIẾN ĐỘ", "MÃ ƯU ĐÃI", "KÊNH HỌC", 
      "KHAI GIẢNG\n(dd/mm)", "NGÀY THI", "KẾT QUẢ THI", "GHI CHÚ"
    ];
    
    // Header cho bảng khóa học (dòng 12)
    headers.forEach((header, index) => {
      formSheet.getRange(12, index + 1).setValue(header).setFontWeight("bold");
    });

    // === ĐỊNH DẠNG & STYLING ===
    
    // Định dạng cột/ô
    formSheet.setColumnWidths(1, 1, 120);  // Cột A
    formSheet.setColumnWidths(2, 8, 100);  // Cột B-I
    
    // Định dạng số điện thoại
    formSheet.getRange("B1").setNumberFormat('@');
    formSheet.getRange("B8").setNumberFormat('@');
    
    // Định dạng ngày tháng cho bảng khóa học
    formSheet.getRange("F13:F16").setNumberFormat("@"); // KHAI GIẢNG
    formSheet.getRange("G13:G16").setNumberFormat("@"); // NGÀY THI
    
    // Định dạng cho bảng VỊ TRÍ DÒNG
    formSheet.getRange("E6:E9").setNumberFormat('@STRING@'); // Sheet_goc
    formSheet.getRange("F6:F9").setNumberFormat('0'); // Dong_goc
    formSheet.getRange("G6:G9").setNumberFormat('0'); // Dong_DB

    // Thêm note hướng dẫn
    formSheet.getRange("F12").setNote("Định dạng: dd/mm (ví dụ: 15/03, 1/12)");
    formSheet.getRange("G12").setNote("Định dạng: dd/mm (ví dụ: 20/05, 5/11)");

    this.logger.info('✅ Form tra cứu đã được thiết lập với bố cục chuẩn.');
    return formSheet;
  }

  processLoadFormBySDT() {
    try {
      const db = this.databaseService.getDatabaseSheet();
      const form = this.getFormSheet();
      
      if (!db) {
        this.ui.alert("❌ Không tìm thấy Database!");
        return;
      }

      // Lấy SDT từ ô B1 nhưng KHÔNG set lại (tránh xóa SDT)
      const sdtInput = form.getRange(this.config.FORM_SDT_CELL).getValue();
      const sdt = this._formatPhoneNumber(sdtInput);
      
      if (!sdt) {
        this.ui.alert("⚠️ Vui lòng nhập SDT vào ô B1!");
        return;
      }

      // Lấy dữ liệu Database
      const dataRange = db.getDataRange();
      const data = dataRange.getValues();
      const displayData = dataRange.getDisplayValues();
      
      const headers = data[this.config.DB_HEADER_ROW - 1];
      const startDataRowIndex = this.config.DB_DATA_START_ROW - 1;
      const rows = data.slice(startDataRowIndex);
      const displayRows = displayData.slice(startDataRowIndex);

      // Tìm tất cả bản ghi khớp với SDT
      const matches = [];
      rows.forEach((row, index) => {
        const rowSdt = this._formatPhoneNumber(String(row[headers.indexOf(this.config.SDT_HEADER)] || ''));
        if (rowSdt === sdt) {
          const dbRowNumber = startDataRowIndex + index + 1;
          matches.push({
            row: row,
            displayRow: displayRows[index],
            rowIndex: dbRowNumber
          });
        }
      });

      if (matches.length === 0) {
        this.ui.alert(`❌ Không tìm thấy học viên với SDT: ${sdt}`);
        this._clearFormData(form);
        return;
      }

      // Xóa dữ liệu form cũ (KHÔNG xóa ô B1)
      this._clearFormData(form);

      // Load thông tin chung từ bản ghi đầu tiên
      this._loadCommonInfo(form, headers, matches[0].row, sdt);

      // Load bảng khóa học và vị trí
      this._loadKhoaHocTable(form, headers, matches);

      this.ui.alert(`✅ Đã tìm thấy ${matches.length} khóa học cho học viên!`);
      
    } catch (error) {
      this.logger.error('Lỗi tra cứu: ' + error.toString());
      this.ui.alert('❌ Lỗi khi tra cứu: ' + error.toString());
    }
  }

  _loadCommonInfo(form, headers, record, sdt) {
    const infoMapping = this.config.FORM_INFO_MAPPING;
    for (const [dbHeader, formCell] of Object.entries(infoMapping)) {
      const colIndex = headers.indexOf(dbHeader);
      if (colIndex !== -1) {
        const value = record[colIndex];
        form.getRange(formCell).setValue(value);
      }
    }
    // Set SDT trong thông tin chung (ô B8)
    form.getRange(infoMapping["SDT"]).setValue(sdt).setNumberFormat('@');
  }

  _loadKhoaHocTable(form, headers, matches) {
    const khoahocMapping = this.config.FORM_KHOAHOC_MAPPING;
    const viTriConfig = this.config.FORM_VI_TRI;
    
    // HIỆN THỊ METADATA Ở BẢNG VỊ TRÍ DÒNG (tối đa 4 dòng)
    matches.slice(0, viTriConfig.MAX_ROWS).forEach((match, index) => {
      const currentViTriRow = viTriConfig.DATA_START_ROW + index;
      const sheetGocIndex = headers.indexOf(this.config.SHEET_GOC_COL);
      const dongGocIndex = headers.indexOf(this.config.DONG_GOC_COL);
      
      const metaSheetGoc = match.row[sheetGocIndex];
      const metaDongGoc = match.row[dongGocIndex];
      const metaDongDB = match.rowIndex;
      
      form.getRange(currentViTriRow, viTriConfig.COLUMNS.SHEET_GOC).setValue(metaSheetGoc);
      form.getRange(currentViTriRow, viTriConfig.COLUMNS.DONG_GOC).setValue(metaDongGoc);
      form.getRange(currentViTriRow, viTriConfig.COLUMNS.DONG_DB).setValue(metaDongDB);
    });
    
    // LOAD DỮ LIỆU KHÓA HỌC (tối đa 4 dòng)
    matches.slice(0, this.config.FORM_KHOAHOC.MAX_ROWS).forEach((match, index) => {
      const currentRow = this.config.FORM_KHOAHOC.DATA_START_ROW + index;
      const displayRow = match.displayRow || match.row;
      
      for (const [dbHeader, formCol] of Object.entries(khoahocMapping)) {
        const colIndex = headers.indexOf(dbHeader);
        if (colIndex !== -1 && colIndex < displayRow.length) {
          let value = match.row[colIndex];
          let displayValue = displayRow[colIndex];
          
          // Xử lý đặc biệt cho cột MÔN
          if (dbHeader === "MÔN") {
            value = this._processMonColumn(value, displayValue);
          }
          
          // Xử lý ngày tháng cho các cột khác
          if (dbHeader === "KHAI GIẢNG\n(dd/mm)" || dbHeader === "NGÀY THI") {
            value = this._handleDateValue(value, "load");
          }
          
          form.getRange(currentRow, formCol).setValue(value);
        }
      }
    });
  }

  _clearFormData(form) {
    // Clear thông tin chung (KHÔNG bao gồm ô B1)
    Object.values(this.config.FORM_INFO_MAPPING).forEach(cell => {
      if (cell !== "B1") {
        form.getRange(cell).clearContent();
      }
    });

    // CLEAR BẢNG VỊ TRÍ DÒNG (E6:G9)
    const viTriConfig = this.config.FORM_VI_TRI;
    form.getRange(
      viTriConfig.DATA_START_ROW, 
      viTriConfig.COLUMNS.SHEET_GOC, 
      viTriConfig.MAX_ROWS, 
      3
    ).clearContent();

    // CLEAR BẢNG KHÓA HỌC (A13:I16)
    const khoaHocConfig = this.config.FORM_KHOAHOC;
    form.getRange(
      khoaHocConfig.DATA_START_ROW, 
      1, 
      khoaHocConfig.MAX_ROWS, 
      9
    ).clearContent();

    // KHÔNG clear ô B1 - giữ nguyên SDT người dùng nhập
  }

  // ==============================================
  // CÁC HÀM HỖ TRỢ
  // ==============================================

  _formatPhoneNumber(phone) {
    if (!phone) return '';
    let cleanPhone = String(phone).trim();
    if (typeof phone === 'number') cleanPhone = '0' + String(phone);
    cleanPhone = cleanPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('84')) cleanPhone = '0' + cleanPhone.substring(2);
    if (cleanPhone.length >= 9 && cleanPhone.length <= 11 && !cleanPhone.startsWith('0')) {
      cleanPhone = '0' + cleanPhone;
    }
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11 && cleanPhone.startsWith('0')) {
      return cleanPhone;
    }
    return cleanPhone;
  }

  _handleDateValue(value, action) {
    if (!value) return value;
    
    try {
      if (action === "load") {
        if (value instanceof Date) {
          const day = value.getDate().toString().padStart(2, '0');
          const month = (value.getMonth() + 1).toString().padStart(2, '0');
          return `${day}/${month}`;
        }
        
        if (typeof value === 'string' && value.includes('/')) {
          const parts = value.split('/');
          if (parts.length >= 2) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            return `${day}/${month}`;
          }
        }
        
        return value;
        
      } else if (action === "save") {
        if (typeof value === 'string' && value.match(/^\d{1,2}\/\d{1,2}$/)) {
          const [day, month] = value.split('/');
          return `${day.padStart(2, '0')}/${month.padStart(2, '0')}`;
        }
        
        if (value instanceof Date) {
          const day = value.getDate().toString().padStart(2, '0');
          const month = (value.getMonth() + 1).toString().padStart(2, '0');
          return `${day}/${month}`;
        }
        
        return value;
      }
    } catch (error) {
      this.logger.warn('Lỗi xử lý ngày tháng: ' + error.toString());
      return value;
    }
    return value;
  }

  _processMonColumn(value, displayValue) {
    if (value instanceof Date) {
      if (displayValue && typeof displayValue === 'string') {
        return displayValue;
      }
      const day = value.getDate().toString().padStart(2, '0');
      const month = (value.getMonth() + 1).toString().padStart(2, '0');
      const year = value.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return value;
  }

  processSaveFormData() {
    this.logger.info('Bắt đầu lưu dữ liệu Form...');
    
    try {
      const db = this.databaseService.getDatabaseSheet();
      const form = this.getFormSheet();
      
      if (!db) {
        this.ui.alert("❌ Không tìm thấy Database!");
        return;
      }

      // Lấy headers Database
      const dbHeaders = db.getRange(1, 1, 1, db.getLastColumn()).getValues()[0];
      
      let updatedCount = 0;
      const updatedFields = [];
      let dongDB = null;

      // SỬA LỖI: Kiểm tra và ép kiểu dongDB
      const dongDBCell = form.getRange(this.config.FORM_VI_TRI.DATA_START_ROW, this.config.FORM_VI_TRI.COLUMNS.DONG_DB).getValue();
      dongDB = Number(dongDBCell); // Ép kiểu thành number

      if (!dongDB || isNaN(dongDB)) {
        this.ui.alert("❌ Không tìm thấy thông tin vị trí (Dong_DB) hoặc giá trị không hợp lệ!");
        return;
      }

      // THÊM KIỂM TRA: Đảm bảo dongDB nằm trong phạm vi hợp lệ
      const lastDBRow = db.getLastRow();
      if (dongDB < this.config.DB_DATA_START_ROW || dongDB > lastDBRow) {
        this.ui.alert(`❌ Dòng Database ${dongDB} không tồn tại! Phạm vi hợp lệ: ${this.config.DB_DATA_START_ROW}-${lastDBRow}`);
        return;
      }

      // CẬP NHẬT DỮ LIỆU VÀO DATABASE
      for (const [dbHeader, formCol] of Object.entries(this.config.FORM_KHOAHOC_MAPPING)) {
        const dbColIndex = dbHeaders.indexOf(dbHeader);
        
        if (dbColIndex !== -1) {
          // SỬA LỖI: Thêm kiểm tra formCol hợp lệ
          if (formCol < 1 || formCol > 9) {
            this.logger.warn(`Cột Form không hợp lệ: ${formCol} cho ${dbHeader}`);
            continue;
          }
          
          let newValue = form.getRange(this.config.FORM_KHOAHOC.DATA_START_ROW, formCol).getDisplayValue();
          const oldValue = db.getRange(dongDB, dbColIndex + 1).getDisplayValue();
          
          // Xử lý ngày tháng khi lưu
          if (dbHeader === "KHAI GIẢNG\n(dd/mm)" || dbHeader === "NGÀY THI") {
            newValue = this._handleDateValue(newValue, "save");
          }
          
          const hasChanged = String(newValue || '') !== String(oldValue || '');
          
          if (hasChanged) {
            db.getRange(dongDB, dbColIndex + 1).setValue(newValue);
            updatedCount++;
            updatedFields.push(`${dbHeader}: "${oldValue}" → "${newValue}"`);
          }
        }
      }

      // TỰ ĐỘNG ĐỒNG BỘ SAU KHI LƯU THÀNH CÔNG
      if (updatedCount > 0 && dongDB) {
        const syncResult = this._dongBoTuDong(db, dongDB);
        
        if (syncResult) {
          this.logger.info(`✅ Đã tự động đồng bộ dòng ${dongDB} về sheet gốc`);
        } else {
          this.logger.warn(`⚠️ Lưu Database thành công nhưng đồng bộ sheet gốc thất bại`);
        }
      }

      // Thông báo kết quả
      if (updatedCount > 0) {
        let message = `✅ ĐÃ LƯU THÀNH CÔNG!\n\nĐã cập nhật ${updatedCount} ô dữ liệu.\n`;
        
        if (updatedFields.length > 0) {
          message += "\nCác thay đổi:\n";
          updatedFields.slice(0, 5).forEach(field => {
            message += `• ${field}\n`;
          });
          
          if (updatedFields.length > 5) {
            message += `• ... và ${updatedFields.length - 5} thay đổi khác\n`;
          }
        }
        
        this.ui.alert(message);
        
      } else {
        this.ui.alert('ℹ️ Không có thay đổi nào để lưu hoặc dữ liệu giống nhau.');
      }

    } catch (error) {
      this.logger.error('Lỗi lưu dữ liệu: ' + error.toString());
      this.ui.alert('❌ LỖI KHI LƯU DỮ LIỆU:\n' + error.toString());
    }
  }

  _dongBoTuDong(db, dongDB) {
  try {
    this.logger.info(`Bắt đầu đồng bộ tự động cho dòng ${dongDB}...`);
    
    // 1. LẤY THÔNG TIN VỊ TRÍ GỐC
    const sheetGoc = db.getRange(dongDB, this._getSheetGocColumnIndex(db)).getValue();
    const dongGoc = db.getRange(dongDB, this._getDongGocColumnIndex(db)).getValue();
    
    if (!sheetGoc || !dongGoc) {
      this.logger.warn(`❌ Không tìm thấy thông tin sheet gốc: ${sheetGoc} hoặc dòng gốc: ${dongGoc}`);
      return false;
    }
    
    this.logger.info(`📍 Vị trí gốc: ${sheetGoc}!D${dongGoc}`);

    // 2. LẤY DỮ LIỆU TỪ DATABASE
    const dbHeaders = db.getRange(1, 1, 1, db.getLastColumn()).getValues()[0];
    
    // TÌM VỊ TRÍ CÁC CỘT METADATA
    const sheetGocCol = this._getSheetGocColumnIndex(db);
    const dongGocCol = this._getDongGocColumnIndex(db);
    
    // CHỈ LẤY CÁC CỘT DỮ LIỆU (LOẠI BỎ METADATA)
    const dataToSync = [];
    for (let col = 1; col <= dbHeaders.length; col++) {
      // BỎ QUA 2 CỘT METADATA
      if (col !== sheetGocCol && col !== dongGocCol) {
        const value = db.getRange(dongDB, col).getValue();
        dataToSync.push(value);
      }
    }

    // 3. TÌM SHEET GỐC
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetTarget = ss.getSheetByName(sheetGoc);
    
    if (!sheetTarget) {
      this.logger.warn(`❌ Không tìm thấy sheet: ${sheetGoc}`);
      return false;
    }

    // 4. CẬP NHẬT DỮ LIỆU VỀ SHEET GỐC - CHỈ DỮ LIỆU GỐC
    sheetTarget.getRange(dongGoc, 1, 1, dataToSync.length).setValues([dataToSync]);
    
    this.logger.info(`✅ ĐÃ TỰ ĐỘNG ĐỒNG BỘ: Database!D${dongDB} → ${sheetGoc}!D${dongGoc}`);
    this.logger.info(`📊 Đồng bộ ${dataToSync.length} cột dữ liệu (đã loại bỏ metadata)`);
    
    return true;
    
  } catch (error) {
    this.logger.error('❌ Lỗi đồng bộ tự động: ' + error.toString());
    return false;
  }}

  _getSheetGocColumnIndex(db) {
    const headers = db.getRange(1, 1, 1, db.getLastColumn()).getValues()[0];
    return headers.indexOf(this.config.SHEET_GOC_COL) + 1;
  }

  _getDongGocColumnIndex(db) {
    const headers = db.getRange(1, 1, 1, db.getLastColumn()).getValues()[0];
    return headers.indexOf(this.config.DONG_GOC_COL) + 1;
  }

  getFormSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let formSheet = ss.getSheetByName(this.config.FORM_SHEET_NAME);
    if (!formSheet) {
      this.logger.warn('Form sheet chưa tồn tại, đang tạo mới...');
      formSheet = this.setupFormSheet();
    }
    return formSheet;
  }

} // ĐÓNG CLASS FORM SERVICE

// ==============================================
// HÀM TOÀN CỤC CHO MENU
// ==============================================

function loadFormBySDT() {
  try {
    formService.processLoadFormBySDT();
  } catch (error) {
    logger.error('Lỗi tìm kiếm: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Lỗi tìm kiếm: ' + error.toString());
  }
}

function saveFormData() {
  try {
    formService.processSaveFormData();
  } catch (error) {
    logger.error('Lỗi lưu dữ liệu: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Lỗi lưu dữ liệu: ' + error.toString());
  }
}

function clearForm() {
  try {
    const form = formService.getFormSheet();
    formService._clearFormData(form);
    form.getRange(Config.FORM_SDT_CELL).clearContent();
    SpreadsheetApp.getUi().alert('✅ Đã xóa dữ liệu Form!');
  } catch (error) {
    logger.error('Lỗi xóa Form: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Lỗi xóa Form: ' + error.toString());
  }
}

function setupFormSheet() {
  try {
    formService.setupFormSheet();
    SpreadsheetApp.getUi().alert('✅ Form tra cứu đã được tạo!');
  } catch (error) {
    logger.error('Lỗi tạo Form: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Lỗi tạo Form: ' + error.toString());
  }
}

// Tạo instance toàn cục
const formService = new FormService();