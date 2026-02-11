/* ================================================
   MAIN ENTRY POINT - TVV SYSTEM (ĐÃ SỬA LỖI TỰ ĐỘNG ĐIỀN NGÀY)
================================================ */

function onOpen() {
  try {
    logger.info('Khởi tạo menu hệ thống...');
   
    const mainMenu = SpreadsheetApp.getUi().createMenu('Hệ Thống Database');
    mainMenu.addItem('🔄 Gom dữ liệu từ các sheet Tháng', 'mergeSheetsToDatabase');
    mainMenu.addItem('📅 Điền ngày hiện tại cho dữ liệu cũ', 'fillMissingDates');
    mainMenu.addItem('📆 Điền ngày tùy chỉnh cho dữ liệu cũ', 'fillMissingDatesCustom');
    mainMenu.addSeparator();
    mainMenu.addItem('📊 Kiểm tra trạng thái', 'showSystemStatus');
    mainMenu.addItem('🔍 Kiểm tra cấu trúc sheets', 'debugSheetsStructure');
    mainMenu.addSeparator();
    mainMenu.addItem('🧪 Kiểm tra toàn bộ', 'runAllTests');
    mainMenu.addItem('⚡ Kiểm tra nhanh', 'quickTest');
    mainMenu.addToUi();
   
    logger.info('Menu hệ thống Database đã được tạo');
   
  } catch (error) {
    logger.error('Lỗi khi tạo menu: ' + error.toString());
  }
}

function mergeSheetsToDatabase() {
  logger.info('User kích hoạt gom dữ liệu từ menu');
  try {
    syncService.mergeSheetsToDatabase();
    logger.info('Gom dữ liệu hoàn tất');
  } catch (error) {
    logger.error('Lỗi khi gom dữ liệu: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Lỗi khi gom dữ liệu: ' + error.toString());
  }
}

// 🆕 HÀM onEdit ĐÃ SỬA LỖI
function onEdit(e) {
  if (!e) return;
  
  try {
    const range = e.range;
    const sh = range.getSheet();
    const name = sh.getName();
    const col = range.getColumn();
    const row = range.getRow();

    // CHỈ XỬ LÝ VỚI CÁC SHEET THÁNG
    if (!name.startsWith(Config.MONTH_PREFIX)) {
      return;
    }

    // CHỈ XỬ LÝ DÒNG DỮ LIỆU (BỎ QUA HEADER)
    if (row < Config.DATA_START_ROW) {
      return;
    }

    // 🔥 LOGIC TỰ ĐỘNG ĐIỀN NGÀY GHI NHẬN
    const cellA = sh.getRange(row, 1);
    
    // Lấy giá trị của Mã TVV (Cột B=2) và SĐT (Cột G=7)
    const valMaTVV = sh.getRange(row, 2).getValue();
    const valSDT = sh.getRange(row, 7).getValue();

    // ĐIỀU KIỆN 1: Nếu cả 2 cột định danh đều trống → Xóa ngày cũ (nếu có)
    if (valMaTVV === "" && valSDT === "") {
      if (cellA.getValue() !== "") {
        cellA.clearContent();
        cellA.setBackground(null);
        logger.info(`🗑️ Đã xóa ngày ở dòng ${row} do cả Mã TVV và SĐT đều trống`);
      }
    } 
    // ĐIỀU KIỆN 2: Nếu một trong hai cột có dữ liệu VÀ cột A đang trống → Ghi ngày mới
    else if ((valMaTVV !== "" || valSDT !== "") && cellA.getValue() === "") {
      const today = new Date();
      cellA.setValue(today);
      cellA.setNumberFormat("dd/mm/yyyy");
      cellA.setBackground("#e6f4ea"); // Màu xanh nhạt
      logger.info(`📅 Đã điền ngày ${Utilities.formatDate(today, Session.getScriptTimeZone(), "dd/MM/yyyy")} vào dòng ${row}`);
    }

    // 🔥 ĐẨY DỮ LIỆU SANG DATABASE (CHỈ KHI CÓ SĐT)
    // Kiểm tra xem có SĐT không trước khi gọi sync
    const currentSDT = sh.getRange(row, 7).getValue();
    if (currentSDT && currentSDT.toString().trim() !== "") {
      if (typeof syncService !== 'undefined') {
        syncService.capNhatDatabase(e);
        logger.debug(`🔄 Đã đồng bộ dòng ${row} sang Database`);
      }
    }

  } catch (err) {
    logger.error("❌ Lỗi onEdit: " + err.toString());
    console.error("Lỗi onEdit: " + err.toString());
  }
}

function showSystemStatus() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.DB_SHEET_NAME);
    let recordCount = 0;
   
    if (sheet && sheet.getLastRow() >= Config.DB_DATA_START_ROW) {
      recordCount = sheet.getLastRow() - Config.DB_DATA_START_ROW + 1;
    }
   
    const tvvSheets = SpreadsheetApp.getActiveSpreadsheet()
      .getSheets()
      .filter(sh => sh.getName().startsWith(Config.MONTH_PREFIX))
      .length;
   
    const dbStatus = databaseService.getDatabaseStatus();
   
    const message = `📊 **THỐNG KÊ HỆ THỐNG CRM**
   
• Sheet Database: ${Config.DB_SHEET_NAME}
• Số bản ghi: ${recordCount}
• Số sheet TVV: ${tvvSheets}
• Số cột Database: ${dbStatus.expectedColumns}
• Các cột dữ liệu: ${Config.DB_COLUMNS.length}

📋 **DANH SÁCH CỘT:**
${Config.DB_COLUMNS.map((col, index) => `${index + 1}. ${col}`).join('\n')}

💡 **HƯỚNG DẪN**
1. Thêm sheet mới với tên bắt đầu bằng "${Config.MONTH_PREFIX}"
2. Đảm bảo có cột "${Config.SDT_HEADER}" và các cột khác
3. Click "Gom dữ liệu" để đồng bộ
4. Mọi sửa đổi sẽ được đồng bộ tự động`;

    SpreadsheetApp.getUi().alert(message);
    logger.info('User đã xem trạng thái hệ thống');
   
  } catch (error) {
    logger.error('Lỗi khi hiển thị trạng thái: ' + error.toString());
  }
}

function debugSheetsStructure() {
  try {
    syncService.debugSheetsStructure();
  } catch (error) {
    logger.error('Lỗi kiểm tra cấu trúc: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Lỗi kiểm tra cấu trúc: ' + error.toString());
  }
}

// 🆕 HÀM ĐIỀN NGÀY CHO DỮ LIỆU CŨ
function fillMissingDates() {
  logger.info('🔄 Bắt đầu điền ngày cho dữ liệu cũ...');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    
    let totalFilled = 0;
    let processedSheets = 0;
    
    sheets.forEach(sh => {
      const name = sh.getName();
      
      // CHỈ XỬ LÝ CÁC SHEET THÁNG
      if (!name.startsWith(Config.MONTH_PREFIX)) {
        return;
      }
      
      logger.info(`📋 Xử lý sheet: ${name}`);
      
      const lastRow = sh.getLastRow();
      
      if (lastRow < Config.DATA_START_ROW) {
        logger.info(`   ⚠️ Sheet ${name} không có dữ liệu`);
        return;
      }
      
      let filledInSheet = 0;
      
      // DUYỆT QUA TỪNG DÒNG DỮ LIỆU
      for (let row = Config.DATA_START_ROW; row <= lastRow; row++) {
        const cellA = sh.getRange(row, 1); // Cột NGÀY GHI NHẬN
        const cellB = sh.getRange(row, 2); // Cột MÃ TVV
        const cellG = sh.getRange(row, 7); // Cột SĐT
        
        const dateValue = cellA.getValue();
        const maTVV = cellB.getValue();
        const sdt = cellG.getValue();
        
        // ĐIỀU KIỆN: Có MÃ TVV hoặc SĐT, nhưng chưa có ngày
        if ((maTVV !== "" || sdt !== "") && dateValue === "") {
          const today = new Date();
          cellA.setValue(today);
          cellA.setNumberFormat("dd/mm/yyyy");
          cellA.setBackground("#e6f4ea"); // Màu xanh nhạt
          
          filledInSheet++;
          totalFilled++;
          
          logger.debug(`   ✅ Điền ngày dòng ${row}: Mã TVV=${maTVV}, SĐT=${sdt}`);
        }
      }
      
      if (filledInSheet > 0) {
        processedSheets++;
        logger.info(`   📊 Đã điền ${filledInSheet} dòng trong sheet ${name}`);
      } else {
        logger.info(`   ✅ Tất cả dòng trong ${name} đã có ngày`);
      }
    });
    
    const message = `✅ **HOÀN TẤT ĐIỀN NGÀY CHO DỮ LIỆU CŨ**

📊 **KẾT QUẢ:**
• Tổng số sheet xử lý: ${processedSheets}
• Tổng số dòng đã điền ngày: ${totalFilled}

${totalFilled > 0 ? '✨ Các dòng đã được điền ngày hiện tại!' : '✅ Tất cả dữ liệu đã có ngày!'}`;
    
    logger.info(message);
    SpreadsheetApp.getUi().alert(message);
    
  } catch (error) {
    logger.error('❌ Lỗi khi điền ngày: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Lỗi khi điền ngày: ' + error.toString());
  }
}

// 🆕 HÀM ĐIỀN NGÀY TÙY CHỈNH CHO DỮ LIỆU CŨ
function fillMissingDatesCustom() {
  logger.info('🔄 Bắt đầu điền ngày tùy chỉnh cho dữ liệu cũ...');
  
  try {
    const ui = SpreadsheetApp.getUi();
    
    // YÊU CẦU NGƯỜI DÙNG NHẬP NGÀY
    const response = ui.prompt(
      '📆 Nhập ngày cần điền',
      'Nhập ngày theo định dạng: dd/mm/yyyy\n(Ví dụ: 15/01/2026)',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (response.getSelectedButton() !== ui.Button.OK) {
      logger.info('❌ Người dùng hủy thao tác');
      return;
    }
    
    const dateInput = response.getResponseText().trim();
    
    // KIỂM TRA ĐỊNH DẠNG NGÀY
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateInput.match(dateRegex);
    
    if (!match) {
      ui.alert('❌ Định dạng ngày không hợp lệ!\n\nVui lòng nhập theo định dạng: dd/mm/yyyy\n(Ví dụ: 15/01/2026)');
      return;
    }
    
    const day = parseInt(match[1]);
    const month = parseInt(match[2]) - 1; // JavaScript month is 0-indexed
    const year = parseInt(match[3]);
    
    const customDate = new Date(year, month, day);
    
    // KIỂM TRA NGÀY HỢP LỆ
    if (isNaN(customDate.getTime()) || day < 1 || day > 31 || month < 0 || month > 11) {
      ui.alert('❌ Ngày không hợp lệ!\n\nVui lòng kiểm tra lại ngày/tháng/năm.');
      return;
    }
    
    logger.info(`📅 Ngày được chọn: ${Utilities.formatDate(customDate, Session.getScriptTimeZone(), 'dd/MM/yyyy')}`);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    
    let totalFilled = 0;
    let processedSheets = 0;
    
    sheets.forEach(sh => {
      const name = sh.getName();
      
      // CHỈ XỬ LÝ CÁC SHEET THÁNG
      if (!name.startsWith(Config.MONTH_PREFIX)) {
        return;
      }
      
      logger.info(`📋 Xử lý sheet: ${name}`);
      
      const lastRow = sh.getLastRow();
      
      if (lastRow < Config.DATA_START_ROW) {
        logger.info(`   ⚠️ Sheet ${name} không có dữ liệu`);
        return;
      }
      
      let filledInSheet = 0;
      
      // DUYỆT QUA TỪNG DÒNG DỮ LIỆU
      for (let row = Config.DATA_START_ROW; row <= lastRow; row++) {
        const cellA = sh.getRange(row, 1); // Cột NGÀY GHI NHẬN
        const cellB = sh.getRange(row, 2); // Cột MÃ TVV
        const cellG = sh.getRange(row, 7); // Cột SĐT
        
        const dateValue = cellA.getValue();
        const maTVV = cellB.getValue();
        const sdt = cellG.getValue();
        
        // ĐIỀU KIỆN: Có MÃ TVV hoặc SĐT, nhưng chưa có ngày
        if ((maTVV !== "" || sdt !== "") && dateValue === "") {
          cellA.setValue(customDate);
          cellA.setNumberFormat("dd/mm/yyyy");
          cellA.setBackground("#fff4e6"); // Màu vàng nhạt để phân biệt với ngày tự động
          
          filledInSheet++;
          totalFilled++;
          
          logger.debug(`   ✅ Điền ngày dòng ${row}: Mã TVV=${maTVV}, SĐT=${sdt}`);
        }
      }
      
      if (filledInSheet > 0) {
        processedSheets++;
        logger.info(`   📊 Đã điền ${filledInSheet} dòng trong sheet ${name}`);
      } else {
        logger.info(`   ✅ Tất cả dòng trong ${name} đã có ngày`);
      }
    });
    
    const message = `✅ **HOÀN TẤT ĐIỀN NGÀY TÙY CHỈNH**

📅 **NGÀY ĐÃ ĐIỀN:** ${Utilities.formatDate(customDate, Session.getScriptTimeZone(), 'dd/MM/yyyy')}

📊 **KẾT QUẢ:**
• Tổng số sheet xử lý: ${processedSheets}
• Tổng số dòng đã điền: ${totalFilled}

${totalFilled > 0 ? '✨ Các dòng đã được điền ngày tùy chỉnh (nền vàng nhạt)!' : '✅ Tất cả dữ liệu đã có ngày!'}`;
    
    logger.info(message);
    ui.alert(message);
    
  } catch (error) {
    logger.error('❌ Lỗi khi điền ngày tùy chỉnh: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Lỗi khi điền ngày tùy chỉnh: ' + error.toString());
  }
}
