/* ================================================
   DATABASE SERVICE 
   Xử lý mọi thao tác với sheet Database
================================================ */

class DatabaseService {
  constructor() {
    this.config = Config;
    console.log('✅ DatabaseService đã được khởi tạo');
  }
  
  // Lấy sheet Database (tạo mới nếu chưa có)
  getDatabaseSheet() {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let dbSheet = ss.getSheetByName(this.config.DB_SHEET_NAME);
      
      if (!dbSheet) {
        console.log('📝 Tạo sheet Database mới');
        dbSheet = ss.insertSheet(this.config.DB_SHEET_NAME);
        
        // 🆕 TẠO HEADER CƠ BẢN NẾU SHEET MỚI
        this._initializeDatabaseHeaders(dbSheet);
      }
      
      return dbSheet;
    } catch (error) {
      console.error('❌ Lỗi khi lấy Database sheet:', error);
      throw error;
    }
  }
  
  // 🆕 KHỞI TẠO HEADERS CHO DATABASE MỚI
  _initializeDatabaseHeaders(dbSheet) {
    try {
      const basicHeaders = [this.config.SDT_HEADER, 'Sheet_goc', 'Dong_goc'];
      // 🎯 SỬA: Dùng DB_HEADER_ROW (dòng 1) cho Database
      dbSheet.getRange(this.config.DB_HEADER_ROW, 1, 1, basicHeaders.length)
        .setValues([basicHeaders]);
      console.log('✅ Đã tạo headers cơ bản cho Database (dòng 1)');
    } catch (error) {
      console.warn('⚠️ Không thể tạo headers cho Database:', error);
    }
  }
  
  // Xóa toàn bộ nội dung Database (trước khi gom dữ liệu mới)
  clearDatabase() {
    try {
      const dbSheet = this.getDatabaseSheet();
      const lastRow = dbSheet.getLastRow();
      
      if (lastRow > 0) {
        dbSheet.clearContents();
        console.log('🧹 Đã xóa nội dung cũ trong Database');
        
        // 🆕 KHÔI PHỤC HEADERS SAU KHI XÓA
        this._initializeDatabaseHeaders(dbSheet);
      } else {
        console.log('ℹ️ Database đã trống, không cần xóa');
      }
      
      return dbSheet;
    } catch (error) {
      console.error('❌ Lỗi khi xóa Database:', error);
      throw error;
    }
  }
  
  // Tìm kiếm bản ghi theo số điện thoại
  findRecordByPhone(phoneNumber) {
    try {
      const dbSheet = this.getDatabaseSheet();
      const lastRow = dbSheet.getLastRow();
      
      // 🎯 SỬA: Dùng DB_DATA_START_ROW (dòng 2) cho Database
      if (lastRow < this.config.DB_DATA_START_ROW) {
        console.log('ℹ️ Database chưa có dữ liệu');
        return null;
      }
      
      // 🆕 KIỂM TRA CÓ HEADER KHÔNG
      const sdtColIndex = this.getSdtColumnIndex(dbSheet);
      if (sdtColIndex === -1) {
        console.log('❌ Không tìm thấy cột SDT trong Database');
        return null;
      }
      
      // 🎯 SỬA: Dùng DB_DATA_START_ROW (dòng 2) cho Database
      const sdtValues = dbSheet.getRange(
        this.config.DB_DATA_START_ROW, 
        sdtColIndex + 1, 
        lastRow - this.config.DB_DATA_START_ROW + 1, 
        1
      ).getValues();
      
      // Tìm kiếm tuyến tính
      const phoneStr = String(phoneNumber).trim();
      for (let i = 0; i < sdtValues.length; i++) {
        if (String(sdtValues[i][0]).trim() === phoneStr) {
          // 🎯 SỬA: Dùng DB_DATA_START_ROW (dòng 2) cho Database
          const foundRow = this.config.DB_DATA_START_ROW + i;
          console.log(`🔍 Tìm thấy SDT ${phoneStr} tại dòng ${foundRow}`);
          return foundRow;
        }
      }
      
      console.log(`❌ Không tìm thấy SDT: ${phoneStr}`);
      return null;
      
    } catch (error) {
      console.error('❌ Lỗi khi tìm kiếm SDT:', error);
      return null;
    }
  }
  
  // Lấy vị trí cột SDT trong sheet
  getSdtColumnIndex(dbSheet) {
    try {
      const lastCol = dbSheet.getLastColumn();
      
      // 🆕 KIỂM TRA NẾU SHEET TRỐNG
      if (lastCol === 0) {
        console.log('ℹ️ Database sheet trống');
        return -1;
      }
      
      // 🎯 SỬA: Dùng DB_HEADER_ROW (dòng 1) cho Database
      const header = dbSheet.getRange(this.config.DB_HEADER_ROW, 1, 1, lastCol).getValues()[0];
      const index = header.indexOf(this.config.SDT_HEADER);
      
      if (index === -1) {
        console.warn(`⚠️ Không tìm thấy cột "${this.config.SDT_HEADER}" trong Database`);
        console.log('Headers có sẵn:', header.filter(h => h));
        return -1;
      }
      
      console.log(`✅ Tìm thấy cột SDT tại vị trí: ${index}`);
      return index;
      
    } catch (error) {
      console.error('❌ Lỗi khi tìm cột SDT:', error);
      return -1;
    }
  }
  
  // 🆕 KIỂM TRA TRẠNG THÁI DATABASE
  getDatabaseStatus() {
    try {
      const dbSheet = this.getDatabaseSheet();
      const lastRow = dbSheet.getLastRow();
      const lastCol = dbSheet.getLastColumn();
      
      // 🎯 SỬA: Dùng DB_DATA_START_ROW (dòng 2) cho Database
      const hasData = lastRow >= this.config.DB_DATA_START_ROW;
      const sdtColIndex = this.getSdtColumnIndex(dbSheet);
      const hasSdtColumn = sdtColIndex !== -1;
      
      return {
        sheetExists: true,
        totalRows: lastRow,
        totalColumns: lastCol,
        hasData: hasData,
        hasSdtColumn: hasSdtColumn,
        // 🎯 SỬA: Dùng DB_DATA_START_ROW (dòng 2) cho Database
        dataRowCount: hasData ? lastRow - this.config.DB_DATA_START_ROW + 1 : 0
      };
    } catch (error) {
      return {
        sheetExists: false,
        error: error.toString()
      };
    }
  }
}

// Tạo instance toàn cục để sử dụng
const databaseService = new DatabaseService();