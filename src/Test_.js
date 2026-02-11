/* ================================================
   TEST SERVICE - KIỂM TRA HỆ THỐNG TVV (CỘT MỚI)
================================================ */

class TestService {
  constructor() {
    this.config = Config;
    this.logger = logger;
  }

  // Kiểm tra toàn bộ hệ thống với các cột mới
  runAllTests() {
    this.logger.info('🚀 Bắt đầu kiểm tra toàn bộ hệ thống Tháng (cột mới)...');
    
    try {
      const results = [];
      
      results.push(this.testConfig());
      results.push(this.testLogger());
      results.push(this.testDatabaseService());
      results.push(this.testSyncService());
      results.push(this.testSheetsStructure());
      results.push(this.testColumnsMapping());
      
      this.showTestResults(results);
      
    } catch (error) {
      this.logger.error('Lỗi khi chạy kiểm tra: ' + error.toString());
      SpreadsheetApp.getUi().alert('❌ Lỗi khi chạy kiểm tra: ' + error.toString());
    }
  }

  // Kiểm tra nhanh - ĐÃ SỬA LỖI: chỉ gọi các hàm có tồn tại
  quickTest() {
    this.logger.info('⚡ Kiểm tra nhanh hệ thống...');
    
    try {
      const tests = [
        this.testConfig(),
        this.testDatabaseService(),
        this.testSyncService(),
        this.testColumnsMapping()
      ];
      
      this.showTestResults(tests);
      
    } catch (error) {
      this.logger.error('Lỗi kiểm tra nhanh: ' + error.toString());
      SpreadsheetApp.getUi().alert('❌ Lỗi kiểm tra nhanh: ' + error.toString());
    }
  }

  // Kiểm tra Config
  testConfig() {
    this.logger.info('🔧 Kiểm tra Config (cột mới)...');
    
    try {
      const requiredConfigs = [
        'DB_SHEET_NAME', 'MONTH_PREFIX', 'HEADER_ROW', 
        'DATA_START_ROW', 'SDT_HEADER', 'SHEET_GOC_COL', 'DONG_GOC_COL', 'DB_COLUMNS'
      ];
      
      const missingConfigs = requiredConfigs.filter(key => !this.config[key]);
      
      if (missingConfigs.length > 0) {
        return {
          name: 'Config',
          status: '❌ FAILED',
          message: `Thiếu config: ${missingConfigs.join(', ')}`
        };
      }
      
      return {
        name: 'Config',
        status: '✅ PASSED',
        message: `Đã tải ${Object.keys(this.config).length} cấu hình | ${this.config.DB_COLUMNS.length} cột dữ liệu`
      };
      
    } catch (error) {
      return {
        name: 'Config',
        status: '❌ ERROR',
        message: error.toString()
      };
    }
  }

  // Kiểm tra Logger
  testLogger() {
    this.logger.info('📝 Kiểm tra Logger...');
    
    try {
      // Test các mức log
      logger.debug('Test debug message');
      logger.info('Test info message');
      logger.warn('Test warn message');
      logger.error('Test error message');
      
      return {
        name: 'Logger',
        status: '✅ PASSED',
        message: 'Tất cả mức log hoạt động'
      };
      
    } catch (error) {
      return {
        name: 'Logger',
        status: '❌ ERROR',
        message: error.toString()
      };
    }
  }

  // Kiểm tra DatabaseService
  testDatabaseService() {
    this.logger.info('🗄️ Kiểm tra DatabaseService...');
    
    try {
      const dbSheet = databaseService.getDatabaseSheet();
      
      if (!dbSheet) {
        return {
          name: 'DatabaseService',
          status: '❌ FAILED',
          message: 'Không thể tạo/lấy Database sheet'
        };
      }
      
      const status = databaseService.getDatabaseStatus();
      
      let message = `Sheet: ${status.sheetExists ? '✅' : '❌'}`;
      message += ` | Dữ liệu: ${status.hasData ? '✅' : '⚠️'}`;
      message += ` | Cột SĐT: ${status.hasSdtColumn ? '✅' : '❌'}`;
      message += ` | Số bản ghi: ${status.dataRowCount}`;
      message += ` | Cột: ${status.expectedColumns || 'N/A'}`;
      
      return {
        name: 'DatabaseService',
        status: '✅ PASSED',
        message: message
      };
      
    } catch (error) {
      return {
        name: 'DatabaseService',
        status: '❌ ERROR',
        message: error.toString()
      };
    }
  }

  // Kiểm tra SyncService
  testSyncService() {
    this.logger.info('🔄 Kiểm tra SyncService...');
    
    try {
      // Kiểm tra các hàm có tồn tại không
      const requiredFunctions = [
        'mergeSheetsToDatabase', 'capNhatSheetThang', 'capNhatDatabase', '_formatPhoneNumber'
      ];
      
      const missingFunctions = requiredFunctions.filter(func => !syncService[func]);
      
      if (missingFunctions.length > 0) {
        return {
          name: 'SyncService',
          status: '❌ FAILED',
          message: `Thiếu hàm: ${missingFunctions.join(', ')}`
        };
      }
      
      // Test định dạng số điện thoại
      const phoneTests = [
        { input: '0764069635', expected: '0764069635' },
        { input: '0903306958', expected: '0903306958' },
        { input: '0797360179', expected: '0797360179' },
        { input: '0933019714', expected: '0933019714' },
        // 🆕 THÊM TEST VỚI CÁC ĐỊNH DẠNG KHÁC
        { input: '84764069635', expected: '0764069635' }, // Định dạng 84
        { input: '076 406 9635', expected: '0764069635' }, // Có khoảng trắng
        { input: '076-406-9635', expected: '0764069635' }, // Có dấu gạch
        { input: '+84764069635', expected: '0764069635' }  // Có dấu +

      ];
      
      let phoneTestPassed = true;
      phoneTests.forEach(test => {
        const result = syncService._formatPhoneNumber(test.input);
        if (result !== test.expected) {
          phoneTestPassed = false;
          this.logger.warn(`Định dạng SĐT sai: ${test.input} → ${result} (mong đợi: ${test.expected})`);
        }
      });
      
      return {
        name: 'SyncService',
        status: phoneTestPassed ? '✅ PASSED' : '⚠️ WARNING',
        message: `Có ${requiredFunctions.length} hàm | Định dạng SĐT: ${phoneTestPassed ? '✅' : '⚠️'}`
      };
      
    } catch (error) {
      return {
        name: 'SyncService',
        status: '❌ ERROR',
        message: error.toString()
      };
    }
  }

  // Kiểm tra cấu trúc sheets
  testSheetsStructure() {
    this.logger.info('📊 Kiểm tra cấu trúc sheets (cột mới)...');
    
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheets = ss.getSheets();
      
      const tvvSheets = sheets.filter(sh => 
        sh.getName().startsWith(this.config.MONTH_PREFIX)
      );
      
      let sheetsWithAllColumns = 0;
      const sheetsReport = [];
      
      tvvSheets.forEach(sh => {
        const name = sh.getName();
        const lastRow = sh.getLastRow();
        const lastCol = sh.getLastColumn();
        
        if (lastRow > 0 && lastCol > 0) {
          const headers = sh.getRange(this.config.HEADER_ROW, 1, 1, lastCol).getValues()[0];
          
          const missingColumns = this.config.DB_COLUMNS.filter(dbColumn => 
            !headers.some(h => h.toString().trim().toUpperCase() === dbColumn.toUpperCase())
          );
          
          if (missingColumns.length === 0) {
            sheetsWithAllColumns++;
          }
          
          sheetsReport.push({
            name: name,
            hasAllColumns: missingColumns.length === 0,
            missingColumns: missingColumns
          });
        }
      });
      
      let message = `Tổng sheets TVV: ${tvvSheets.length} | Đủ cột: ${sheetsWithAllColumns}`;
      
      if (sheetsWithAllColumns < tvvSheets.length) {
        message += `\nSheets thiếu cột:`;
        sheetsReport.forEach(report => {
          if (!report.hasAllColumns) {
            message += `\n• ${report.name}: ${report.missingColumns.join(', ')}`;
          }
        });
      }
      
      return {
        name: 'Sheets Structure',
        status: sheetsWithAllColumns > 0 ? '✅ PASSED' : '⚠️ WARNING',
        message: message
      };
      
    } catch (error) {
      return {
        name: 'Sheets Structure',
        status: '❌ ERROR',
        message: error.toString()
      };
    }
  }

  // Kiểm tra mapping các cột mới
  testColumnsMapping() {
    this.logger.info('🗂️ Kiểm tra mapping các cột mới...');
    
    try {
      const requiredColumns = this.config.DB_COLUMNS;
      const sdtColumn = this.config.SDT_HEADER;
      
      if (!requiredColumns.includes(sdtColumn)) {
        return {
          name: 'Columns Mapping',
          status: '❌ FAILED',
          message: `Cột SĐT "${sdtColumn}" không có trong DB_COLUMNS`
        };
      }
      
      // Kiểm tra số lượng cột
      if (requiredColumns.length !== 14) {
        return {
          name: 'Columns Mapping',
          status: '⚠️ WARNING',
          message: `Có ${requiredColumns.length} cột (mong đợi: 14) | Cột SĐT: "${sdtColumn}"`
        };
      }
      
      return {
        name: 'Columns Mapping',
        status: '✅ PASSED',
        message: `Có ${requiredColumns.length} cột | Cột SĐT: "${sdtColumn}"`
      };
      
    } catch (error) {
      return {
        name: 'Columns Mapping',
        status: '❌ ERROR',
        message: error.toString()
      };
    }
  }

  // Kiểm tra hiệu suất
  performanceTest() {
    this.logger.info('⏱️ Kiểm tra hiệu suất...');
    
    try {
      const startTime = new Date().getTime();
      
      // Test tốc độ đọc Database
      const dbSheet = databaseService.getDatabaseSheet();
      const lastRow = dbSheet.getLastRow();
      const lastCol = dbSheet.getLastColumn();
      
      const readTime = new Date().getTime();
      
      if (lastRow > 0 && lastCol > 0) {
        const testData = dbSheet.getRange(1, 1, Math.min(lastRow, 100), lastCol).getValues();
      }
      
      const processTime = new Date().getTime();
      
      const totalTime = processTime - startTime;
      const readDuration = readTime - startTime;
      const processDuration = processTime - readTime;
      
      const message = `⏱️ **KIỂM TRA HIỆU SUẤT**\n\n` +
        `• Tổng thời gian: ${totalTime}ms\n` +
        `• Thời gian đọc: ${readDuration}ms\n` +
        `• Thời gian xử lý: ${processDuration}ms\n` +
        `• Số dòng Database: ${lastRow}\n` +
        `• Số cột Database: ${lastCol}\n\n` +
        `💡 **ĐÁNH GIÁ:** ${totalTime < 1000 ? '✅ Tốt' : totalTime < 3000 ? '⚠️ Chấp nhận được' : '❌ Chậm'}`;
      
      this.logger.info(`Kiểm tra hiệu suất: ${totalTime}ms`);
      SpreadsheetApp.getUi().alert(message);
      
    } catch (error) {
      this.logger.error('Lỗi kiểm tra hiệu suất: ' + error.toString());
      SpreadsheetApp.getUi().alert('❌ Lỗi kiểm tra hiệu suất: ' + error.toString());
    }
  }

  // Hiển thị kết quả kiểm tra
  showTestResults(results) {
    const passed = results.filter(r => r.status.includes('✅')).length;
    const warning = results.filter(r => r.status.includes('⚠️')).length;
    const failed = results.filter(r => r.status.includes('❌')).length;
    
    let message = `📊 **KẾT QUẢ KIỂM TRA HỆ THỐNG TVV (CỘT MỚI)**\n\n`;
    message += `✅ Đạt: ${passed} | ⚠️ Cảnh báo: ${warning} | ❌ Lỗi: ${failed}\n\n`;
    
    results.forEach(result => {
      message += `${result.status} **${result.name}**\n`;
      message += `   ${result.message}\n\n`;
    });
    
    // Đánh giá tổng quan
    if (failed === 0 && warning === 0) {
      message += '🎉 **HỆ THỐNG HOẠT ĐỘNG TỐT VỚI CÁC CỘT MỚI!**';
    } else if (failed === 0) {
      message += 'ℹ️ **Hệ thống hoạt động với một số cảnh báo.**';
    } else {
      message += '❌ **Hệ thống cần sửa lỗi trước khi sử dụng!**';
    }
    
    this.logger.info('Kết thúc kiểm tra hệ thống với các cột mới');
    SpreadsheetApp.getUi().alert(message);
  }
}

const testService = new TestService();

/* ================================================
   HÀM TOÀN CỤC CHO MENU
================================================ */

function runAllTests() {
  try {
    testService.runAllTests();
  } catch (error) {
    logger.error('Lỗi chạy kiểm tra: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Lỗi chạy kiểm tra: ' + error.toString());
  }
}

function quickTest() {
  try {
    testService.quickTest();
  } catch (error) {
    logger.error('Lỗi kiểm tra nhanh: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Lỗi kiểm tra nhanh: ' + error.toString());
  }
}

function performanceTest() {
  try {
    testService.performanceTest();
  } catch (error) {
    logger.error('Lỗi kiểm tra hiệu suất: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Lỗi kiểm tra hiệu suất: ' + error.toString());
  }
}