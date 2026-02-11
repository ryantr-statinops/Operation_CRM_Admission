/* ================================================
   DATABASE SERVICE - CẬP NHẬT CHO CỘT MỚI
================================================ */

class DatabaseService {
  constructor() {
    this.config = Config;
    this.logger = logger;
  }
  
  // Lấy sheet Database (tạo mới nếu chưa có)
  getDatabaseSheet() {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let dbSheet = ss.getSheetByName(this.config.DB_SHEET_NAME);
      
      if (!dbSheet) {
        this.logger.info('Tạo sheet Database mới');
        dbSheet = ss.insertSheet(this.config.DB_SHEET_NAME);
        this._initializeDatabaseHeaders(dbSheet);
      }
      
      return dbSheet;
    } catch (error) {
      this.logger.error('Lỗi khi lấy Database sheet: ' + error.toString());
      throw error;
    }
  }
  
  // 🆕 KHỞI TẠO HEADERS CHO DATABASE MỚI VỚI CÁC CỘT MỚI
  _initializeDatabaseHeaders(dbSheet) {
    try {
      // 🆕 TẠO HEADER TỪ DB_COLUMNS + METADATA
      const dbHeader = [...this.config.DB_COLUMNS, this.config.SHEET_GOC_COL, this.config.DONG_GOC_COL];
      dbSheet.getRange(this.config.DB_HEADER_ROW, 1, 1, dbHeader.length)
        .setValues([dbHeader]);
      this.logger.info(`Đã tạo ${dbHeader.length} cột cho Database`);
    } catch (error) {
      this.logger.warn('Không thể tạo headers cho Database: ' + error.toString());
    }
  }
  
  // Xóa toàn bộ nội dung Database
  clearDatabase() {
    try {
      const dbSheet = this.getDatabaseSheet();
      const lastRow = dbSheet.getLastRow();
      
      if (lastRow > 0) {
        dbSheet.clearContents();
        this.logger.info('Đã xóa nội dung cũ trong Database');
        this._initializeDatabaseHeaders(dbSheet);
      } else {
        this.logger.info('Database đã trống');
      }
      
      return dbSheet;
    } catch (error) {
      this.logger.error('Lỗi khi xóa Database: ' + error.toString());
      throw error;
    }
  }
  
  // Tìm kiếm bản ghi theo số điện thoại
  findRecordByPhone(phoneNumber) {
    try {
      const dbSheet = this.getDatabaseSheet();
      const lastRow = dbSheet.getLastRow();
      
      if (lastRow < this.config.DB_DATA_START_ROW) {
        this.logger.info('Database chưa có dữ liệu');
        return null;
      }
      
      const sdtColIndex = this.getSdtColumnIndex(dbSheet);
      if (sdtColIndex === -1) {
        this.logger.warn('Không tìm thấy cột SDT trong Database');
        return null;
      }
      
      const sdtValues = dbSheet.getRange(
        this.config.DB_DATA_START_ROW, 
        sdtColIndex + 1, 
        lastRow - this.config.DB_DATA_START_ROW + 1, 
        1
      ).getDisplayValues();
      
      const phoneStr = String(phoneNumber).trim();
      for (let i = 0; i < sdtValues.length; i++) {
        if (String(sdtValues[i][0]).trim() === phoneStr) {
          const foundRow = this.config.DB_DATA_START_ROW + i;
          this.logger.info(`Tìm thấy SDT ${phoneStr} tại dòng ${foundRow}`);
          return foundRow;
        }
      }
      
      this.logger.info(`Không tìm thấy SDT: ${phoneStr}`);
      return null;
      
    } catch (error) {
      this.logger.error('Lỗi khi tìm kiếm SDT: ' + error.toString());
      return null;
    }
  }
  
  // Lấy vị trí cột SĐT trong sheet
  getSdtColumnIndex(dbSheet) {
    try {
      const lastCol = dbSheet.getLastColumn();
      
      if (lastCol === 0) {
        this.logger.info('Database sheet trống');
        return -1;
      }
      
      const header = dbSheet.getRange(this.config.DB_HEADER_ROW, 1, 1, lastCol).getValues()[0];
      const index = header.indexOf(this.config.SDT_HEADER);
      
      if (index === -1) {
        this.logger.warn(`Không tìm thấy cột "${this.config.SDT_HEADER}" trong Database`);
        return -1;
      }
      
      this.logger.info(`Tìm thấy cột SĐT tại vị trí: ${index}`);
      return index;
      
    } catch (error) {
      this.logger.error('Lỗi khi tìm cột SĐT: ' + error.toString());
      return -1;
    }
  }
  
  // Kiểm tra trạng thái Database
  getDatabaseStatus() {
    try {
      const dbSheet = this.getDatabaseSheet();
      const lastRow = dbSheet.getLastRow();
      const lastCol = dbSheet.getLastColumn();
      
      const hasData = lastRow >= this.config.DB_DATA_START_ROW;
      const sdtColIndex = this.getSdtColumnIndex(dbSheet);
      const hasSdtColumn = sdtColIndex !== -1;
      
      return {
        sheetExists: true,
        totalRows: lastRow,
        totalColumns: lastCol,
        hasData: hasData,
        hasSdtColumn: hasSdtColumn,
        expectedColumns: this.config.DB_COLUMNS.length + 2, // +2 metadata
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

const databaseService = new DatabaseService();