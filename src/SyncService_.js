/* ================================================
   SYNC SERVICE - ĐỒNG BỘ DỮ LIỆU Tháng 
================================================ */

class SyncService {
  constructor() {
    this.config = Config;
    this.logger = logger;
    this.databaseService = databaseService;
  }

  // Hàm gom dữ liệu từ các sheet Tháng vào Database - CẬP NHẬT CỘT MỚI
  mergeSheetsToDatabase() {
    this.logger.info('Bắt đầu gom dữ liệu từ các sheet Tháng...');
    
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let dbSheet = this.databaseService.clearDatabase();

      let mergedData = [];
      let processedSheets = 0;

      // 🆕 TẠO HEADER CHO DATABASE TỪ DB_COLUMNS + METADATA
      const dbHeader = [...this.config.DB_COLUMNS, this.config.SHEET_GOC_COL, this.config.DONG_GOC_COL];
      mergedData.push(dbHeader);
      this.logger.info(`Đã thiết lập header cho Database với ${dbHeader.length} cột`);

      const sheets = ss.getSheets();
      this.logger.info(`Tìm thấy ${sheets.length} sheets trong file`);

      sheets.forEach(sh => {
        const name = sh.getName();
        
        if (name.startsWith(this.config.MONTH_PREFIX)) {
          this.logger.info(`Đang xử lý sheet Tháng: ${name}`);
          
          const lastRow = sh.getLastRow();
          const lastCol = sh.getLastColumn();

          if (lastRow <= this.config.HEADER_ROW) {
            this.logger.warn(`Sheet ${name} không có dữ liệu`);
            return;
          }

          // 🆕 LẤY TOÀN BỘ DỮ LIỆU SHEET
          const values = sh.getRange(
            this.config.HEADER_ROW, 1, 
            lastRow - this.config.HEADER_ROW + 1, 
            lastCol
          ).getValues();
          
          const displayValues = sh.getRange(
            this.config.HEADER_ROW, 1, 
            lastRow - this.config.HEADER_ROW + 1, 
            lastCol
          ).getDisplayValues();
          
          const sheetHeader = values[0];
          this.logger.debug(`Headers sheet ${name}: ${sheetHeader.filter(h => h).join(', ')}`);
          
          // 🆕 TÌM VỊ TRÍ CÁC CỘT TRONG SHEET SO VỚI DB_COLUMNS
          const columnMapping = {};
          this.config.DB_COLUMNS.forEach(dbColumn => {
            const index = sheetHeader.findIndex(h => 
              h.toString().trim().toUpperCase() === dbColumn.toUpperCase()
            );
            columnMapping[dbColumn] = index;
          });

          // 🆕 KIỂM TRA CÓ CỘT SĐT KHÔNG
          if (columnMapping[this.config.SDT_HEADER] === -1) {
            this.logger.error(`Sheet ${name} KHÔNG có cột '${this.config.SDT_HEADER}', bỏ qua`);
            return;
          }

          let validRecords = 0;
          
          // 🆕 XỬ LÝ TỪNG DÒNG DỮ LIỆU VỚI CÁC CỘT MỚI
          for (let r = 1; r < values.length; r++) {
            const row = values[r];
            const displayRow = displayValues[r];
            
            const sdtValue = displayRow[columnMapping[this.config.SDT_HEADER]] ? 
              this._formatPhoneNumber(displayRow[columnMapping[this.config.SDT_HEADER]].toString().trim()) : '';
            
            if (sdtValue !== "") {
              // 🆕 TẠO DÒNG MỚI CHỈ VỚI CÁC CỘT TRONG DB_COLUMNS
              const newRow = this.config.DB_COLUMNS.map(dbColumn => {
                const colIndex = columnMapping[dbColumn];
                if (colIndex === -1) return ''; // Nếu không tìm thấy cột
                
                let value = row[colIndex];
                let displayValue = displayRow[colIndex];
                
                // XỬ LÝ ĐẶC BIỆT CHO CÁC CỘT
                if (dbColumn === this.config.SDT_HEADER) {
                  return sdtValue; // Dùng SDT đã định dạng
                }
                
                // 🆕 XỬ LÝ CÁC CỘT NGÀY THÁNG
                if (dbColumn === "KHAI GIẢNG\n(dự kiến)" || dbColumn === "THÁNG TIẾP NHẬN") {
                  return this._handleDateValue(displayValue, "load");
                }
                
                // Dùng display value cho các cột text để giữ định dạng
                return displayValue !== undefined ? displayValue : value;
              });
              
              // THÊM METADATA
              const originalRow = this.config.HEADER_ROW + r;
              newRow.push(String(name), Number(originalRow));
              
              mergedData.push(newRow);
              validRecords++;
              
              this.logger.debug(`✅ Thêm bản ghi: SDT=${sdtValue}, Sheet=${name}, Dòng=${originalRow}`);
            }
          }
          
          this.logger.info(`📊 Sheet ${name}: Đã thêm ${validRecords} bản ghi`);
          processedSheets++;
        }
      });

      this.logger.info(`📈 Kết quả: ${processedSheets} sheets được xử lý, ${mergedData.length} bản ghi tổng`);

      // GHI DỮ LIỆU VÀO DATABASE
      if (mergedData.length > 0) {
        const nRows = mergedData.length;
        const nCols = mergedData[0].length;
        
        this.logger.info(`📝 Ghi ${nRows} dòng, ${nCols} cột vào Database`);

        // 🆕 ĐẶT ĐỊNH DẠNG CHO CÁC CỘT
        const sdtColIndex = this.config.DB_COLUMNS.indexOf(this.config.SDT_HEADER) + 1;
        if (sdtColIndex > 0) {
          dbSheet.getRange(1, sdtColIndex, dbSheet.getMaxRows(), 1).setNumberFormat('@');
        }

        // Định dạng metadata columns
        const colSheetGoc = nCols - 1;
        const colDongGoc = nCols;
        dbSheet.getRange(1, colSheetGoc, dbSheet.getMaxRows(), 1).setNumberFormat('@');
        dbSheet.getRange(1, colDongGoc, dbSheet.getMaxRows(), 1).setNumberFormat('0');

        // Ghi dữ liệu
        dbSheet.getRange(1, 1, nRows, nCols).setValues(mergedData);
        
        const recordCount = mergedData.length - 1;
        this.logger.info(`✅ Đã gom ${recordCount} bản ghi vào Database từ ${processedSheets} sheets Tháng`);
        
        SpreadsheetApp.getUi().alert(`✅ ĐÃ GOM ${recordCount} BẢN GHI!\n\nTừ ${processedSheets} sheets Tháng với ${this.config.DB_COLUMNS.length} cột dữ liệu.`);
      } else {
        this.logger.warn('⚠️ Không gom được bản ghi nào!');
        SpreadsheetApp.getUi().alert('⚠️ Không tìm thấy dữ liệu để gom!');
      }
      
    } catch (error) {
      this.logger.error('Lỗi khi gom dữ liệu: ' + error.toString());
      SpreadsheetApp.getUi().alert('❌ Lỗi khi gom dữ liệu: ' + error.toString());
      throw error;
    }
  }

  // 🆕 HÀM XỬ LÝ NGÀY THÁNG CHO CÁC CỘT MỚI
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

  // Định dạng số điện thoại (GIỮ NGUYÊN)
  _formatPhoneNumber(phone) {
    if (!phone) return '';
    
    let cleanPhone = phone.toString().replace(/\D/g, '');
    
    if (cleanPhone.startsWith('84')) {
      cleanPhone = '0' + cleanPhone.substring(2);
    }
    
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11 && cleanPhone.startsWith('0')) {
      return cleanPhone;
    }
    
    return phone;
  }

  // Cập nhật từ Database về sheet Tháng gốc (CẬP NHẬT CHO CÁC CỘT MỚI)
  capNhatSheetThang(e) {
    if (!e) return;
    
    this.logger.debug('Cập nhật từ Database về sheet Tháng gốc...');
    
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const db = ss.getSheetByName(this.config.DB_SHEET_NAME);

      const row = e.range.getRow();
      if (row < this.config.DB_DATA_START_ROW) return;

      const header = db.getRange(this.config.DB_HEADER_ROW, 1, 1, db.getLastColumn()).getValues()[0];
      const metaSheetColIndex = header.indexOf(this.config.SHEET_GOC_COL) + 1;
      const metaRowColIndex = header.indexOf(this.config.DONG_GOC_COL) + 1;

      if (metaSheetColIndex === 0 || metaRowColIndex === 0) {
        this.logger.warn('Không tìm thấy cột metadata trong Database');
        return;
      }

      const rowValues = db.getRange(row, 1, 1, header.length).getValues()[0];
      const sheetName = rowValues[metaSheetColIndex - 1];
      const rowNumber = rowValues[metaRowColIndex - 1];

      const sheetObj = ss.getSheetByName(sheetName);
      if (sheetObj && rowNumber) {
        // 🆕 CHỈ CẬP NHẬT CÁC CỘT TRONG DB_COLUMNS (KHÔNG BAO GỒM METADATA)
        const dataColumns = this.config.DB_COLUMNS.length;
        sheetObj.getRange(rowNumber, 1, 1, dataColumns)
          .setValues([rowValues.slice(0, dataColumns)]);
        
        this.logger.info(`✅ Đã cập nhật sheet ${sheetName} dòng ${rowNumber} từ Database`);
      }
      
    } catch (error) {
      this.logger.error('Lỗi khi cập nhật từ Database: ' + error.toString());
    }
  }

  // Cập nhật từ sheet Tháng lên Database (CẬP NHẬT CHO CÁC CỘT MỚI)
  capNhatDatabase(e) {
    if (!e) return;
    
    this.logger.debug('Cập nhật từ sheet Tháng lên Database...');
    
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const db = ss.getSheetByName(this.config.DB_SHEET_NAME);
      if (!db) return;

      const sh = e.range.getSheet();
      const row = e.range.getRow();
      const sheetName = sh.getName();
      
      if (!sheetName.startsWith(this.config.MONTH_PREFIX)) return;
      if (row < this.config.DATA_START_ROW) return;

      const header = db.getRange(this.config.DB_HEADER_ROW, 1, 1, db.getLastColumn()).getValues()[0];
      const sdtColIndex = header.indexOf(this.config.SDT_HEADER);
      const metaSheetColIndex = header.indexOf(this.config.SHEET_GOC_COL) + 1;
      const metaRowColIndex = header.indexOf(this.config.DONG_GOC_COL) + 1;

      if (metaSheetColIndex === 0 || metaRowColIndex === 0) {
        this.logger.warn('Không tìm thấy cột metadata trong Database');
        return;
      }

      // 🆕 LẤY DỮ LIỆU TỪ SHEET Tháng VỚI CÁC CỘT MỚI
      const displayValues = sh.getRange(row, 1, 1, this.config.DB_COLUMNS.length).getDisplayValues()[0];
      const sdt = this._formatPhoneNumber(String(displayValues[sdtColIndex] || '').trim());
      
      if (!sdt) {
        this.logger.debug('Dòng được sửa không có SDT, bỏ qua');
        return;
      }

      const lastRow = db.getLastRow();
      
      if (lastRow < this.config.DB_DATA_START_ROW) {
        // 🆕 THÊM MỚI VỚI CÁC CỘT MỚI
        const newRowValues = [...displayValues];
        newRowValues[sdtColIndex] = sdt;
        
        db.appendRow(newRowValues.concat([sheetName, row]));
        this.logger.info(`✅ Đã thêm bản ghi mới vào Database cho SDT: ${sdt}`);
        return;
      }

      const sdtColValues = db.getRange(
        this.config.DB_DATA_START_ROW,
        sdtColIndex + 1,
        lastRow - this.config.DB_DATA_START_ROW + 1,
        1
      ).getDisplayValues();

      let dbRow = null;
      
      for (let i = 0; i < sdtColValues.length; i++) {
        const dbPhone = this._formatPhoneNumber(String(sdtColValues[i][0]).trim());
        if (dbPhone === sdt) {
          dbRow = this.config.DB_DATA_START_ROW + i;
          break;
        }
      }

      if (dbRow) {
        // 🆕 CẬP NHẬT VỚI CÁC CỘT MỚI
        const newRowValues = [...displayValues];
        newRowValues[sdtColIndex] = sdt;
        
        db.getRange(dbRow, 1, 1, this.config.DB_COLUMNS.length).setValues([newRowValues]);
        db.getRange(dbRow, metaSheetColIndex).setValue(sheetName);
        db.getRange(dbRow, metaRowColIndex).setValue(row);
        
        this.logger.info(`✅ Đã cập nhật Database dòng ${dbRow} cho SDT: ${sdt}`);
      } else {
        // 🆕 THÊM MỚI VỚI CÁC CỘT MỚI
        const newRowValues = [...displayValues];
        newRowValues[sdtColIndex] = sdt;
        
        db.appendRow(newRowValues.concat([sheetName, row]));
        this.logger.info(`✅ Đã thêm bản ghi mới vào Database cho SDT: ${sdt}`);
      }
      
    } catch (error) {
      this.logger.error('Lỗi khi cập nhật Database: ' + error.toString());
    }
  }

  // 🆕 HÀM KIỂM TRA CẤU TRÚC SHEETS VỚI CÁC CỘT MỚI
  debugSheetsStructure() {
    this.logger.info('🔍 Kiểm tra cấu trúc sheets với các cột mới...');
    
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheets = ss.getSheets();
      
      let report = '📊 **BÁO CÁO CẤU TRÚC SHEETS (CỘT MỚI)**\n\n';
      
      sheets.forEach(sh => {
        const name = sh.getName();
        const lastRow = sh.getLastRow();
        const lastCol = sh.getLastColumn();
        
        report += `📋 **SHEET: "${name}"**\n`;
        report += `   - Số dòng: ${lastRow}\n`;
        report += `   - Số cột: ${lastCol}\n`;
        
        if (lastRow > 0 && lastCol > 0) {
          const headers = sh.getRange(this.config.HEADER_ROW, 1, 1, lastCol).getValues()[0];
          
          report += `   - Headers (dòng ${this.config.HEADER_ROW}): ${headers.filter(h => h).join(', ')}\n`;
          
          // 🆕 KIỂM TRA CÁC CỘT MỚI
          const missingColumns = [];
          this.config.DB_COLUMNS.forEach(column => {
            const hasColumn = headers.some(h => 
              h.toString().trim().toUpperCase() === column.toUpperCase()
            );
            if (!hasColumn) {
              missingColumns.push(column);
            }
          });
          
          report += `   - Có cột "${this.config.SDT_HEADER}": ${headers.some(h => 
            h.toString().trim().toUpperCase() === this.config.SDT_HEADER.toUpperCase()) ? '✅' : '❌'}\n`;
          
          if (missingColumns.length > 0) {
            report += `   - ⚠️ Thiếu cột: ${missingColumns.join(', ')}\n`;
          } else {
            report += `   - ✅ Đủ tất cả ${this.config.DB_COLUMNS.length} cột\n`;
          }
        }
        
        report += '\n';
      });
      
      this.logger.info(report);
      SpreadsheetApp.getUi().alert(report);
      
    } catch (error) {
      this.logger.error('Lỗi khi kiểm tra cấu trúc sheets: ' + error.toString());
      SpreadsheetApp.getUi().alert('❌ Lỗi khi kiểm tra cấu trúc sheets: ' + error.toString());
    }
  }
}

const syncService = new SyncService();