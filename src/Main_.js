/* ================================================
   MAIN ENTRY POINT 
================================================ */

function onOpen() {
  try {
    logger.info('Khởi tạo menu hệ thống...');
    
    // 🚀 MENU CHÍNH - TEAM DATABASE
    const mainMenu = SpreadsheetApp.getUi().createMenu('Team Database');
    mainMenu.addItem('🔄 Gom dữ liệu từ sheets', 'mergeSheetsToDatabase');
    mainMenu.addItem('📁 Đồng bộ dòng hiện tại', 'syncCurrentRow');
    mainMenu.addItem('📊 Kiểm tra trạng thái', 'showSystemStatus');
    mainMenu.addItem('🧪 Chạy kiểm tra hệ thống', 'runAllTests');
    mainMenu.addToUi();
    
    // 👨‍🎓 MENU FORM - TRA CỨU HỌC VIÊN  
    const formMenu = SpreadsheetApp.getUi().createMenu('Form Tra Cứu');
    formMenu.addItem('🔍 Tìm kiếm theo SDT', 'loadFormBySDT');
    formMenu.addItem('💾 Lưu thay đổi', 'saveFormData');
    formMenu.addItem('🗑️ Xóa Form', 'clearForm');
    formMenu.addItem('🔄 Tạo Form bố cục mới', 'createNewFormLayout');
    formMenu.addToUi();
    
  // 🆕 TỰ ĐỘNG KIỂM TRA VÀ TẠO FORM
  try {
    if (Config.AUTO_CREATE_FORM) {
      const formSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.FORM_SHEET_NAME);
      if (!formSheet) {
        logger.info('Tự động tạo Form sheet...');
        setupFormSheet(); // 🎯 SỬA THÀNH setupFormSheet() (có sẵn trong FormService)
      }
    }
  } catch (error) {
  logger.warn('Không thể tự động tạo Form: ' + error.toString());
}
      
    logger.info('Menu hệ thống đã được tạo');
    
  } catch (error) {
    logger.error('Lỗi khi tạo menu: ' + error.toString());
  }
}

/* -----------------------------
   Hàm gom dữ liệu - gọi từ menu
----------------------------- */
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

/* -----------------------------
   🆕 HÀM ĐỒNG BỘ DÒNG HIỆN TẠI - GỌI TỪ MENU
----------------------------- */
function syncCurrentRow() {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const sheetName = sheet.getName();
    const row = sheet.getActiveRange().getRow();
    
    console.log(`🔍 Đang xử lý đồng bộ: Sheet "${sheetName}", Dòng ${row}`);
    
    // Chỉ xử lý nếu đang ở Database sheet và là dòng dữ liệu
    if (sheetName === Config.DB_SHEET_NAME && row >= Config.DB_DATA_START_ROW) {
      
      // Lấy metadata từ dòng hiện tại
      const headers = sheet.getRange(Config.DB_HEADER_ROW, 1, 1, sheet.getLastColumn()).getValues()[0];
      const metaSheetColIndex = headers.indexOf(Config.SHEET_GOC_COL) + 1;
      const metaRowColIndex = headers.indexOf(Config.DONG_GOC_COL) + 1;
      
      const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
      const sheetGoc = rowData[metaSheetColIndex - 1];
      const dongGoc = rowData[metaRowColIndex - 1];
      
      console.log(`📋 Metadata: Sheet_goc="${sheetGoc}", Dong_goc=${dongGoc}`);
      
      if (!sheetGoc || !dongGoc) {
        SpreadsheetApp.getUi().alert('❌ Dòng này không có metadata (Sheet_goc, Dong_goc)!\n\nKhông thể đồng bộ tự động.');
        return;
      }
      
      // Tạo event giả và gọi đồng bộ
      const fakeEvent = {
        range: sheet.getRange(row, 1),
        source: SpreadsheetApp.getActiveSpreadsheet()
      };
      
      console.log(`🔄 Đang đồng bộ: Database dòng ${row} → ${sheetGoc} dòng ${dongGoc}`);
      syncService.capNhatSheetThang(fakeEvent);
      
      SpreadsheetApp.getUi().alert(`✅ ĐÃ ĐỒNG BỘ THÀNH CÔNG!\n\n• Database dòng: ${row}\n• Sheet đích: ${sheetGoc}\n• Dòng đích: ${dongGoc}\n\nDữ liệu đã được cập nhật tự động.`);
      
    } else if (sheetName.startsWith(Config.MONTH_PREFIX) && row >= Config.DATA_START_ROW) {
      // Nếu đang ở sheet tháng, đồng bộ lên Database
      const fakeEvent = {
        range: sheet.getRange(row, 1),
        source: SpreadsheetApp.getActiveSpreadsheet()
      };
      
      console.log(`🔄 Đang đồng bộ: ${sheetName} dòng ${row} → Database`);
      syncService.capNhatDatabase(fakeEvent);
      
      SpreadsheetApp.getUi().alert(`✅ ĐÃ ĐỒNG BỘ THÀNH CÔNG!\n\n• Sheet: ${sheetName}\n• Dòng: ${row}\n• Đích: Database\n\nDữ liệu đã được cập nhật tự động.`);
      
    } else {
      SpreadsheetApp.getUi().alert('⚠️ KHÔNG THỂ ĐỒNG BỘ!\n\nChỉ có thể đồng bộ khi:\n• Ở sheet Database (từ dòng 2 trở đi)\n• Ở sheet tháng (từ dòng 3 trở đi)\n\nHiện tại: ' + sheetName + ' dòng ' + row);
    }
    
  } catch (error) {
    logger.error('Lỗi khi đồng bộ dòng hiện tại: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ LỖI KHI ĐỒNG BỘ:\n' + error.toString());
  }
}

/* -----------------------------
   Trigger onEdit - điều phối sự kiện chỉnh sửa
----------------------------- */
function onEdit(e) {
  if (!e) return;
  
  try {
    const sh = e.range.getSheet();
    const name = sh.getName();
    
    logger.debug(`Phát hiện sửa đổi trong sheet: ${name}`);

    // 🎯 GỌI VALIDATION CHO FORM (từ FormService mới)
    if (name === Config.FORM_SHEET_NAME) {
      validateDateInput(e);
    }

    if (name === Config.DB_SHEET_NAME) {
      // Sửa ở Database → cập nhật về sheet gốc
      syncService.capNhatSheetThang(e);
    } else if (name.startsWith(Config.MONTH_PREFIX)) {
      // Sửa ở sheet tháng → cập nhật lên Database
      syncService.capNhatDatabase(e);
    }
    
  } catch (error) {
    logger.error('Lỗi trong onEdit: ' + error.toString());
  }
}

/* -----------------------------
   Hiển thị trạng thái hệ thống
----------------------------- */
function showSystemStatus() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.DB_SHEET_NAME);
    let recordCount = 0;
    
    if (sheet && sheet.getLastRow() >= Config.DATA_START_ROW) {
      recordCount = sheet.getLastRow() - Config.DATA_START_ROW + 1;
    }
    
    const monthSheets = SpreadsheetApp.getActiveSpreadsheet()
      .getSheets()
      .filter(sh => sh.getName().startsWith(Config.MONTH_PREFIX))
      .length;
    
    const message = `📊 **THỐNG KÊ HỆ THỐNG**
    
• Sheet Database: ${Config.DB_SHEET_NAME}
• Số bản ghi: ${recordCount}
• Số sheet tháng: ${monthSheets}
• Prefix sheet tháng: ${Config.MONTH_PREFIX}

💡 **HƯỚNG DẪN**
1. Thêm sheet mới với tên bắt đầu bằng "${Config.MONTH_PREFIX}"
2. Đảm bảo có cột "${Config.SDT_HEADER}" 
3. Click "Gom dữ liệu" để đồng bộ
4. Mọi sửa đổi sẽ được đồng bộ tự động
5. Dùng "Đồng bộ dòng hiện tại" nếu cần đồng bộ thủ công`;

    SpreadsheetApp.getUi().alert(message);
    logger.info('User đã xem trạng thái hệ thống');
    
  } catch (error) {
    logger.error('Lỗi khi hiển thị trạng thái: ' + error.toString());
  }
}

/* ================================================
   HÀM TẠO FORM BỐ CỤC MỚI
================================================ */

function createNewFormLayout() {
  try {
    // Gọi hàm setupFormSheet từ FormService
    formService.setupFormSheet();
    
    SpreadsheetApp.getUi().alert(
      '✅ ĐÃ TẠO FORM BỐ CỤC MỚI THÀNH CÔNG!\n\n' +
      '• Bảng VỊ TRÍ DÒNG: E4:G9\n' +
      '• Bảng DANH SÁCH KHÓA HỌC: A11:I16\n' +
      '• Mỗi bảng tối đa 4 dòng dữ liệu'
    );
    
    logger.info('Đã tạo Form với bố cục mới');
    
  } catch (error) {
    logger.error('Lỗi tạo Form bố cục mới: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Lỗi tạo Form: ' + error.toString());
  }
}

/* ================================================
   HÀM TẠO FORM MỚI (ALIAS)
================================================ */

function createNewForm() {
  createNewFormLayout();
}