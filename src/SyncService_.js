/* ================================================
   SYNC SERVICE - ĐỒNG BỘ DỮ LIỆU 
================================================ */

class SyncService {
  constructor() {
    this.config = Config;
    this.logger = logger;
    this.databaseService = databaseService;
    console.log('✅ SyncService đã được khởi tạo (phiên bản metadata mới)');
  }

  /* -----------------------------
    Hàm gom dữ liệu từ các sheet "Tháng*" vào Database - ĐÃ FIX SỐ 0
  ----------------------------- */
  mergeSheetsToDatabase() {
    this.logger.info('Bắt đầu gom dữ liệu từ các sheet tháng...');
    
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let dbSheet = this.databaseService.getDatabaseSheet();

      // Xóa nội dung cũ (giữ nguyên sheet)
      dbSheet.clearContents();
      this.logger.info('Đã xóa nội dung cũ trong Database');

      let mergedData = [];
      let headerSet = false;
      let processedSheets = 0;

      // Lấy tất cả sheets và lọc những sheet bắt đầu bằng "Tháng"
      const sheets = ss.getSheets();
      this.logger.info(`Tìm thấy ${sheets.length} sheets trong file`);

      sheets.forEach(sh => {
        const name = sh.getName();
        
        // Chỉ xử lý sheet có tên bắt đầu bằng "Tháng"
        if (name.startsWith(this.config.MONTH_PREFIX)) {
          this.logger.info(`🎯 Đang xử lý sheet tháng: ${name}`);
          
          const lastRow = sh.getLastRow();
          const lastCol = sh.getLastColumn();

          this.logger.debug(`Sheet ${name}: lastRow=${lastRow}, lastCol=${lastCol}, HEADER_ROW=${this.config.HEADER_ROW}`);

          // Kiểm tra sheet có dữ liệu không
          if (lastRow <= this.config.HEADER_ROW) {
            this.logger.warn(`❌ Sheet ${name} không có dữ liệu (chỉ có header hoặc trống)`);
            return;
          }

          // 🆕 LẤY CẢ VALUES VÀ DISPLAY VALUES ĐỂ GIỮ SỐ 0
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
          
          const header = values[0];
          this.logger.debug(`Headers từ dòng ${this.config.HEADER_ROW}: ${header.filter(h => h).join(', ')}`);
          
          // Tìm cột SDT
          const sdtIndex = header.findIndex(h => 
            h.toString().trim().toUpperCase() === this.config.SDT_HEADER.toUpperCase()
          );

          this.logger.debug(`SDT column index: ${sdtIndex}`);

          if (sdtIndex === -1) {
            this.logger.error(`❌ Sheet ${name} KHÔNG có cột '${this.config.SDT_HEADER}', bỏ qua`);
            return;
          }

          // Thiết lập header cho Database (chỉ 1 lần) - header sẽ ở dòng 1
          if (!headerSet) {
            // 🆕 THÊM METADATA COLUMNS VÀO HEADER
            mergedData.push([...header, this.config.SHEET_GOC_COL, this.config.DONG_GOC_COL]);
            headerSet = true;
            this.logger.info('✅ Đã thiết lập header cho Database (dòng 1)');
          }

          let validRecords = 0;
          // Xử lý từng dòng dữ liệu (bắt đầu từ index 1, vì index 0 là header)
          for (let r = 1; r < values.length; r++) {
            const row = values[r];
            const displayRow = displayValues[r];
            
            // 🆕 SỬA: DÙNG DISPLAY VALUE CHO SDT ĐỂ GIỮ SỐ 0
            const sdtValue = displayRow[sdtIndex] ? this._formatPhoneNumber(displayRow[sdtIndex].toString().trim()) : '';
            
            if (sdtValue !== "") {
              // 🆕 SỬA: THAY THẾ GIÁ TRỊ SDT BẰNG GIÁ TRỊ ĐÃ ĐỊNH DẠNG
              const newRow = [...row];
              newRow[sdtIndex] = sdtValue;
              
              // 🆕 TÍNH TOÁN DÒNG GỐC CHÍNH XÁC
              const originalRow = this.config.HEADER_ROW + r;
              mergedData.push([...newRow, String(name), Number(originalRow)]);
              validRecords++;
              
              this.logger.debug(`✅ Thêm bản ghi: SDT=${sdtValue}, Sheet=${name}, Dòng=${originalRow}`);
            } else {
              this.logger.debug(`⚠️ Sheet ${name} dòng ${this.config.HEADER_ROW + r} không có SDT, bỏ qua`);
            }
          }
          
          this.logger.info(`📊 Sheet ${name}: Đã thêm ${validRecords} bản ghi hợp lệ`);
          processedSheets++;
          
        } else {
          this.logger.debug(`➖ Bỏ qua sheet không phải tháng: "${name}"`);
        }
      });

      this.logger.info(`📈 Kết quả: ${processedSheets} sheets được xử lý, ${mergedData.length} bản ghi tổng`);

      // Ghi dữ liệu đã gom vào Database
      if (mergedData.length > 0) {
        const nRows = mergedData.length;
        const nCols = mergedData[0].length;
        
        this.logger.info(`📝 Ghi ${nRows} dòng, ${nCols} cột vào Database (header: dòng 1, data: từ dòng 2)`);

        // 🆕 ĐẶT ĐỊNH DẠNG TEXT CHO CỘT SDT TRONG DATABASE
        const sdtColIndex = mergedData[0].indexOf(this.config.SDT_HEADER);
        if (sdtColIndex !== -1) {
          dbSheet.getRange(1, sdtColIndex + 1, dbSheet.getMaxRows(), 1).setNumberFormat('@');
          this.logger.info(`✅ Đã đặt định dạng text cho cột SDT (cột ${sdtColIndex + 1})`);
        }

        // Định dạng metadata columns
        const colSheetGoc = nCols - 1;
        const colDongGoc = nCols;

        try {
          dbSheet.getRange(1, colSheetGoc, dbSheet.getMaxRows(), 1).setNumberFormat('@STRING@');
        } catch (e) {
          try { 
            dbSheet.getRange(1, colSheetGoc, dbSheet.getMaxRows(), 1).setNumberFormat('@'); 
          } catch(e2){}
        }
        dbSheet.getRange(1, colDongGoc, dbSheet.getMaxRows(), 1).setNumberFormat('0');

        // Ghi dữ liệu (bắt đầu từ dòng 1)
        dbSheet.getRange(1, 1, nRows, nCols).setValues(mergedData);
        
        const recordCount = mergedData.length - 1; // Trừ header
        this.logger.info(`✅ Đã gom ${recordCount} bản ghi vào Database từ ${processedSheets} sheets`);
        
        SpreadsheetApp.getUi().alert(`✅ Đã gom ${recordCount} bản ghi vào Database từ ${processedSheets} sheets!\n\n• Header: Dòng 1\n• Dữ liệu: Từ dòng 2\n• SDT: Đã giữ số 0\n• Metadata: Đã thêm Sheet_goc, Dong_goc`);
      } else {
        this.logger.warn('⚠️ Không gom được bản ghi nào!');
        
        // Hiển thị nguyên nhân chi tiết
        let message = '⚠️ Không tìm thấy dữ liệu để gom!\n\n';
        message += `Nguyên nhân có thể:\n`;
        message += `• Không có sheet nào tên bắt đầu bằng "${this.config.MONTH_PREFIX}"\n`;
        message += `• Sheet tháng không có cột "${this.config.SDT_HEADER}"\n`;
        message += `• Sheet tháng không có dữ liệu (chỉ có header)\n`;
        message += `• Tất cả dòng đều thiếu số điện thoại\n\n`;
        message += `Hãy chạy "debugSheetsStructure()" để kiểm tra chi tiết.`;
        
        SpreadsheetApp.getUi().alert(message);
      }
      
    } catch (error) {
      this.logger.error('Lỗi khi gom dữ liệu: ' + error.toString());
      SpreadsheetApp.getUi().alert('❌ Lỗi khi gom dữ liệu: ' + error.toString());
      throw error;
    }
  }

  /* -----------------------------
    🆕 HÀM ĐỊNH DẠNG SỐ ĐIỆN THOẠI 
  ----------------------------- */
  _formatPhoneNumber(phone) {
    if (!phone) return '';
    
    let cleanPhone = phone.toString().replace(/\D/g, '');
    
    if (cleanPhone.startsWith('84')) {
      cleanPhone = '0' + cleanPhone.substring(2); //GIỮ SỐ 0 Ở ĐẦU
    }
    
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11 && cleanPhone.startsWith('0')) {
      return cleanPhone;
    }
    
    return phone;
  }

  /* -----------------------------
   Sử dụng metadata từ Database để xác định sheet và dòng gốc
  ----------------------------- */
  capNhatSheetThang(e) {
    if (!e) return;
    
    this.logger.debug('Cập nhật từ Database về sheet gốc...');
    
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const db = ss.getSheetByName(this.config.DB_SHEET_NAME);

      const row = e.range.getRow();
      
      // Chỉ xử lý từ dòng dữ liệu trở đi (dòng 2)
      if (row < this.config.DB_DATA_START_ROW) return;

      // Lấy header để xác định vị trí cột metadata
      const header = db.getRange(this.config.DB_HEADER_ROW, 1, 1, db.getLastColumn()).getValues()[0];
      const metaSheetColIndex = header.indexOf(this.config.SHEET_GOC_COL) + 1;
      const metaRowColIndex = header.indexOf(this.config.DONG_GOC_COL) + 1;

      // Kiểm tra có tìm thấy metadata columns không
      if (metaSheetColIndex === 0 || metaRowColIndex === 0) {
        this.logger.warn('❌ Không tìm thấy cột metadata trong Database');
        return;
      }

      // Lấy dữ liệu dòng đang sửa
      const rowValues = db.getRange(row, 1, 1, header.length).getValues()[0];
      const sheetName = rowValues[metaSheetColIndex - 1];
      const rowNumber = rowValues[metaRowColIndex - 1];

      this.logger.debug(`🔄 Cập nhật sheet gốc: ${sheetName} dòng ${rowNumber}`);

      // Tìm sheet gốc và cập nhật
      const sheetObj = ss.getSheetByName(sheetName);
      if (sheetObj && rowNumber) {
        // 🆕 CHỈ CẬP NHẬT DỮ LIỆU GỐC (KHÔNG BAO GỒM METADATA)
        const dataColumns = header.length - 2; // Trừ 2 cột metadata
        sheetObj.getRange(rowNumber, 1, 1, dataColumns)
          .setValues([rowValues.slice(0, dataColumns)]);
        
        this.logger.info(`✅ Đã cập nhật sheet ${sheetName} dòng ${rowNumber} từ Database`);
      } else {
        this.logger.warn(`❌ Không tìm thấy sheet gốc: "${sheetName}" hoặc dòng: ${rowNumber}`);
      }
      
    } catch (error) {
      this.logger.error('Lỗi khi cập nhật từ Database: ' + error.toString());
    }
  }

  /* -----------------------------
  Khi sửa ở sheet tháng → update Database
  ----------------------------- */
  capNhatDatabase(e) {
    if (!e) return;
    
    this.logger.debug('Cập nhật từ sheet tháng lên Database...');
    
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const db = ss.getSheetByName(this.config.DB_SHEET_NAME);
      if (!db) return;

      const sh = e.range.getSheet();
      const row = e.range.getRow();
      const sheetName = sh.getName();
      
      // Chỉ xử lý từ dòng dữ liệu trở đi (dòng 3)
      if (row < this.config.DATA_START_ROW) return;

      const header = db.getRange(this.config.DB_HEADER_ROW, 1, 1, db.getLastColumn()).getValues()[0];
      const sdtColIndex = header.indexOf(this.config.SDT_HEADER);
      const metaSheetColIndex = header.indexOf(this.config.SHEET_GOC_COL) + 1;
      const metaRowColIndex = header.indexOf(this.config.DONG_GOC_COL) + 1;

      // 🆕 KIỂM TRA METADATA COLUMNS
      if (metaSheetColIndex === 0 || metaRowColIndex === 0) {
        this.logger.warn('❌ Không tìm thấy cột metadata trong Database');
        return;
      }

      // 🆕 LẤY DISPLAY VALUE CHO SDT ĐỂ GIỮ SỐ 0
      const displayValues = sh.getRange(row, 1, 1, header.length - 2).getDisplayValues()[0];
      const sdt = this._formatPhoneNumber(String(displayValues[sdtColIndex] || '').trim());
      
      // Bỏ qua nếu không có SDT
      if (!sdt) {
        this.logger.debug('Dòng được sửa không có SDT, bỏ qua');
        return;
      }

      const lastRow = db.getLastRow();
      
      // Nếu Database chưa có dữ liệu
      if (lastRow < this.config.DB_DATA_START_ROW) {
        this.logger.info(`Thêm bản ghi mới với SDT: ${sdt}`);
        // 🆕 DÙNG DISPLAY VALUES ĐỂ GIỮ ĐỊNH DẠNG
        const rowValues = sh.getRange(row, 1, 1, header.length - 2).getDisplayValues()[0];
        const newRowValues = [...rowValues];
        newRowValues[sdtColIndex] = sdt; // Đảm bảo SDT có số 0
        
        // 🆕 THÊM METADATA KHI THÊM MỚI
        db.appendRow(newRowValues.concat([sheetName, row]));
        this.logger.info(`✅ Đã thêm bản ghi mới vào Database cho SDT: ${sdt}`);
        return;
      }

      // Tìm SDT trong Database (từ dòng 2)
      const sdtColValues = db.getRange(
        this.config.DB_DATA_START_ROW,
        sdtColIndex + 1,
        lastRow - this.config.DB_DATA_START_ROW + 1,
        1
      ).getDisplayValues(); // 🆕 DÙNG DISPLAY VALUES

      let dbRow = null;
      let foundIndex = -1;
      
      for (let i = 0; i < sdtColValues.length; i++) {
        const dbPhone = this._formatPhoneNumber(String(sdtColValues[i][0]).trim());
        if (dbPhone === sdt) {
          dbRow = this.config.DB_DATA_START_ROW + i;
          foundIndex = i;
          break;
        }
      }

      if (dbRow) {
        // Cập nhật bản ghi đã tồn tại - 🆕 DÙNG DISPLAY VALUES
        const rowValues = sh.getRange(row, 1, 1, header.length - 2).getDisplayValues()[0];
        const newRowValues = [...rowValues];
        newRowValues[sdtColIndex] = sdt; // Đảm bảo SDT có số 0
        
        // 🆕 CẬP NHẬT DỮ LIỆU VÀ METADATA
        db.getRange(dbRow, 1, 1, header.length - 2).setValues([newRowValues]);
        db.getRange(dbRow, metaSheetColIndex).setValue(sheetName);
        db.getRange(dbRow, metaRowColIndex).setValue(row);
        
        this.logger.info(`✅ Đã cập nhật Database dòng ${dbRow} cho SDT: ${sdt}`);
      } else {
        // Thêm bản ghi mới - 🆕 DÙNG DISPLAY VALUES
        const rowValues = sh.getRange(row, 1, 1, header.length - 2).getDisplayValues()[0];
        const newRowValues = [...rowValues];
        newRowValues[sdtColIndex] = sdt; // Đảm bảo SDT có số 0
        
        // 🆕 THÊM METADATA KHI THÊM MỚI
        db.appendRow(newRowValues.concat([sheetName, row]));
        this.logger.info(`✅ Đã thêm bản ghi mới vào Database cho SDT: ${sdt}`);
      }
      
    } catch (error) {
      this.logger.error('Lỗi khi cập nhật Database: ' + error.toString());
    }
  }

  /* -----------------------------
    HÀM KIỂM TRA CẤU TRÚC SHEETS
    Dùng để debug khi gom dữ liệu thất bại
  ----------------------------- */
  debugSheetsStructure() {
    this.logger.info('🔍 Kiểm tra cấu trúc sheets...');
    
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheets = ss.getSheets();
      
      let report = '📊 BÁO CÁO CẤU TRÚC SHEETS:\n\n';
      
      sheets.forEach(sh => {
        const name = sh.getName();
        const lastRow = sh.getLastRow();
        const lastCol = sh.getLastColumn();
        
        report += `📋 SHEET: "${name}"\n`;
        report += `   - Số dòng: ${lastRow}\n`;
        report += `   - Số cột: ${lastCol}\n`;
        
        if (lastRow > 0 && lastCol > 0) {
          // Lấy headers từ dòng HEADER_ROW
          const headerRow = Math.min(this.config.HEADER_ROW, lastRow);
          const headers = sh.getRange(headerRow, 1, 1, lastCol).getValues()[0];
          
          report += `   - Headers (dòng ${headerRow}): ${headers.filter(h => h).join(', ')}\n`;
          
          // Kiểm tra cột SDT
          const hasSdt = headers.some(h => 
            h.toString().trim().toUpperCase() === this.config.SDT_HEADER.toUpperCase()
          );
          
          report += `   - Có cột "${this.config.SDT_HEADER}": ${hasSdt ? '✅' : '❌'}\n`;
          
          if (hasSdt) {
            const sdtIndex = headers.findIndex(h => 
              h.toString().trim().toUpperCase() === this.config.SDT_HEADER.toUpperCase()
            );
            
            // Kiểm tra dữ liệu SDT
            if (lastRow > headerRow) {
              const sdtValues = sh.getRange(headerRow + 1, sdtIndex + 1, lastRow - headerRow, 1).getDisplayValues();
              const validSdtCount = sdtValues.filter(v => v[0].toString().trim() !== '').length;
              report += `   - Số bản ghi có SDT: ${validSdtCount}/${sdtValues.length}\n`;
            }
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

  /* -----------------------------
    HÀM ĐỒNG BỘ THỦ CÔNG CHO MỘT SHEET
    Dùng để đồng bộ lại một sheet cụ thể
  ----------------------------- */
  syncSingleSheet(sheetName) {
    this.logger.info(`Đồng bộ thủ công sheet: ${sheetName}`);
    
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        this.logger.error(`❌ Không tìm thấy sheet: ${sheetName}`);
        return;
      }
      
      // Tạo event giả để kích hoạt cập nhật
      const lastRow = sheet.getLastRow();
      if (lastRow >= this.config.DATA_START_ROW) {
        // Cập nhật từng dòng có dữ liệu
        for (let row = this.config.DATA_START_ROW; row <= lastRow; row++) {
          const fakeEvent = {
            range: sheet.getRange(row, 1),
            source: ss
          };
          this.capNhatDatabase(fakeEvent);
        }
        
        this.logger.info(`✅ Đã đồng bộ ${lastRow - this.config.DATA_START_ROW + 1} dòng từ sheet ${sheetName}`);
        SpreadsheetApp.getUi().alert(`✅ Đã đồng bộ sheet ${sheetName} thành công!`);
      } else {
        this.logger.warn(`⚠️ Sheet ${sheetName} không có dữ liệu để đồng bộ`);
      }
      
    } catch (error) {
      this.logger.error(`Lỗi khi đồng bộ sheet ${sheetName}: ` + error.toString());
      SpreadsheetApp.getUi().alert(`❌ Lỗi khi đồng bộ sheet ${sheetName}: ` + error.toString());
    }
  }

  /* -----------------------------
    HÀM KIỂM TRA VÀ SỬA LỖI METADATA
    Dùng để sửa các bản ghi bị mất metadata
  ----------------------------- */
  fixMissingMetadata() {
    this.logger.info('🔧 Kiểm tra và sửa lỗi metadata...');
    
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const db = ss.getSheetByName(this.config.DB_SHEET_NAME);
      
      if (!db || db.getLastRow() < this.config.DB_DATA_START_ROW) {
        this.logger.info('⚠️ Database trống hoặc không có dữ liệu');
        return;
      }
      
      const header = db.getRange(this.config.DB_HEADER_ROW, 1, 1, db.getLastColumn()).getValues()[0];
      const metaSheetColIndex = header.indexOf(this.config.SHEET_GOC_COL) + 1;
      const metaRowColIndex = header.indexOf(this.config.DONG_GOC_COL) + 1;
      
      if (metaSheetColIndex === 0 || metaRowColIndex === 0) {
        this.logger.error('❌ Không tìm thấy cột metadata trong Database');
        return;
      }
      
      let fixedCount = 0;
      const lastRow = db.getLastRow();
      
      // Kiểm tra từng dòng dữ liệu
      for (let row = this.config.DB_DATA_START_ROW; row <= lastRow; row++) {
        const sheetGoc = db.getRange(row, metaSheetColIndex).getValue();
        const dongGoc = db.getRange(row, metaRowColIndex).getValue();
        
        // Nếu metadata bị thiếu
        if (!sheetGoc || !dongGoc) {
          this.logger.warn(`⚠️ Dòng ${row} bị thiếu metadata: Sheet_goc="${sheetGoc}", Dong_goc="${dongGoc}"`);
          
          // 🆕 CÓ THỂ THÊM LOGIC TỰ ĐỘNG SỬA Ở ĐÂY
          // Hiện tại chỉ cảnh báo
          fixedCount++;
        }
      }
      
      if (fixedCount > 0) {
        this.logger.warn(`⚠️ Phát hiện ${fixedCount} bản ghi bị lỗi metadata`);
        SpreadsheetApp.getUi().alert(`⚠️ Phát hiện ${fixedCount} bản ghi bị lỗi metadata\n\nChạy lại "Gom dữ liệu từ sheets" để sửa lỗi.`);
      } else {
        this.logger.info('✅ Tất cả metadata đều hợp lệ');
        SpreadsheetApp.getUi().alert('✅ Tất cả metadata trong Database đều hợp lệ!');
      }
      
    } catch (error) {
      this.logger.error('Lỗi khi kiểm tra metadata: ' + error.toString());
    }
  }
    // Trong SyncService.js
  // TRONG SyncService.js - THÊM HÀM ĐỒNG BỘ ĐƠN GIẢN (tùy chọn)
dongBoMotDong(dongDB) {
  try {
    const db = this.databaseService.getDatabaseSheet();
    
    // Lấy thông tin từ Database
    const sheetGoc = db.getRange(dongDB, this.config.SHEET_GOC_COL).getValue();
    const dongGoc = db.getRange(dongDB, this.config.DONG_GOC_COL).getValue();
    
    if (!sheetGoc || !dongGoc) {
      this.logger.warn(`Không tìm thấy thông tin đồng bộ cho dòng ${dongDB}`);
      return false;
    }
    
    // Lấy dữ liệu
    const data = db.getRange(dongDB, 1, 1, db.getLastColumn()).getValues()[0];
    
    // Cập nhật sheet gốc
    const sheet = SpreadsheetApp.getActive().getSheetByName(sheetGoc);
    if (sheet) {
      sheet.getRange(dongGoc, 1, 1, data.length).setValues([data]);
      this.logger.info(`✅ Đã đồng bộ dòng ${dongDB} → ${sheetGoc}!D${dongGoc}`);
      return true;
    }
    
    return false;
    
  } catch (error) {
    this.logger.error('Lỗi đồng bộ 1 dòng: ' + error.toString());
    return false;
  }
}
  

}


const syncService = new SyncService();