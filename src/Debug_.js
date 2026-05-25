/* ================================================
   DEBUG TOOLKIT
================================================ */

class DebugToolkit {
  constructor() {
    this.logger = logger;
  }

  // 🚀 KIỂM TRA NHANH TOÀN HỆ THỐNG
  quickSystemCheck() {
    console.log('🔍 KIỂM TRA NHANH TOÀN HỆ THỐNG...\n');
    
    const checks = {
      '⚙️ Config': this._checkConfig(),
      '🔧 Services': this._checkServices(),
      '🗄️ Database': this._checkDatabase(),
      '📝 Form': this._checkForm(),
      '🔄 Sync': this._checkSync()
    };

    let allPassed = true;
    
    Object.entries(checks).forEach(([name, check]) => {
      const icon = check.passed ? '✅' : '❌';
      console.log(`${icon} ${name}: ${check.message}`);
      if (!check.passed) allPassed = false;
    });

    console.log(`\n🎯 KẾT QUẢ: ${allPassed ? 'HỆ THỐNG OK' : 'CÓ VẤN ĐỀ'}`);
    
    return {
      allPassed,
      details: checks
    };
  }

  _checkConfig() {
    const required = ['DB_SHEET_NAME', 'MONTH_PREFIX', 'SDT_HEADER', 'FORM_HEADER_ROW']; // 🎯 THÊM FORM_HEADER_ROW
    const missing = required.filter(prop => !Config.hasOwnProperty(prop));
    
    return {
      passed: missing.length === 0,
      message: missing.length > 0 ? `Thiếu: ${missing.join(', ')}` : 'Đầy đủ'
    };
  }

  _checkServices() {
    const services = ['logger', 'databaseService', 'syncService', 'formService'];
    const missing = services.filter(service => typeof this[service] === 'undefined');
    
    return {
      passed: missing.length === 0,
      message: missing.length > 0 ? `Thiếu: ${missing.join(', ')}` : 'Đầy đủ'
    };
  }

  _checkDatabase() {
    try {
      const status = databaseService.getDatabaseStatus();
      return {
        passed: status.sheetExists,
        message: status.sheetExists ? 
          `${status.dataRowCount} bản ghi` : 'Không tồn tại'
      };
    } catch (error) {
      return {
        passed: false,
        message: `Lỗi: ${error.message}`
      };
    }
  }

  _checkForm() {
    try {
      const form = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.FORM_SHEET_NAME);
      return {
        passed: !!form,
        message: form ? 'Tồn tại' : 'Không tồn tại'
      };
    } catch (error) {
      return {
        passed: false,
        message: `Lỗi: ${error.message}`
      };
    }
  }

  _checkSync() {
    try {
      // 🎯 SỬA: Dùng formService thay vì syncService (vì _formatPhoneNumber là private)
      const test = formService._formatPhoneNumber('0123456789');
      return {
        passed: test === '0123456789',
        message: test === '0123456789' ? 'Format OK' : 'Format lỗi'
      };
    } catch (error) {
      return {
        passed: false,
        message: `Lỗi: ${error.message}`
      };
    }
  }

  // 📊 DEBUG CHI TIẾT TỪNG THÀNH PHẦN
  debugDetailed() {
    console.log('🔍 DEBUG CHI TIẾT HỆ THỐNG...\n');
    
    this._debugConfig();
    this._debugServices();
    this._debugDatabase();
    this._debugForm();
    this._debugCurrentFormData();
  }

  _debugConfig() {
    console.log('⚙️ CẤU HÌNH:');
    console.log('   - DB_SHEET_NAME:', Config.DB_SHEET_NAME);
    console.log('   - MONTH_PREFIX:', Config.MONTH_PREFIX);
    console.log('   - SDT_HEADER:', Config.SDT_HEADER);
    console.log('   - FORM_SHEET_NAME:', Config.FORM_SHEET_NAME);
    console.log('   - LOG_LEVEL:', Config.LOG_LEVEL);
    console.log('   - FORM_HEADER_ROW:', Config.FORM_HEADER_ROW); // 🎯 THÊM
  }

  _debugServices() {
    console.log('\n🔧 DỊCH VỤ:');
    console.log('   - Logger:', typeof logger !== 'undefined' ? '✅' : '❌');
    console.log('   - DatabaseService:', typeof databaseService !== 'undefined' ? '✅' : '❌');
    console.log('   - SyncService:', typeof syncService !== 'undefined' ? '✅' : '❌');
    console.log('   - FormService:', typeof formService !== 'undefined' ? '✅' : '❌');
  }

  _debugDatabase() {
    console.log('\n🗄️ DATABASE:');
    try {
      const status = databaseService.getDatabaseStatus();
      console.log('   - Tồn tại:', status.sheetExists ? '✅' : '❌');
      console.log('   - Số dòng:', status.totalRows);
      console.log('   - Số bản ghi:', status.dataRowCount);
      console.log('   - Có cột SDT:', status.hasSdtColumn ? '✅' : '❌');
      
      if (status.sheetExists) {
        const db = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.DB_SHEET_NAME);
        const headers = db.getRange(1, 1, 1, db.getLastColumn()).getValues()[0];
        console.log('   - Số cột:', headers.length);
        console.log('   - Có metadata:', 
          headers.includes(Config.SHEET_GOC_COL) && headers.includes(Config.DONG_GOC_COL) ? '✅' : '❌'
        );
      }
    } catch (error) {
      console.log('   - Lỗi:', error.message);
    }
  }

  _debugForm() {
    console.log('\n📝 FORM:');
    try {
      const form = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.FORM_SHEET_NAME);
      console.log('   - Tồn tại:', !!form ? '✅' : '❌');
      
      if (form) {
        console.log('   - Số dòng:', form.getLastRow());
        console.log('   - Số cột:', form.getLastColumn());
        
        // Headers thực tế - 🎯 SỬA: Dùng FORM_HEADER_ROW
        const headers = form.getRange(Config.FORM_HEADER_ROW, 1, 1, form.getLastColumn()).getValues()[0];
        console.log('   - Headers:', headers.filter(h => h).join(' | '));
      }
    } catch (error) {
      console.log('   - Lỗi:', error.message);
    }
  }

  _debugCurrentFormData() {
    console.log('\n📋 FORM DATA HIỆN TẠI:');
    try {
      const form = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.FORM_SHEET_NAME);
      if (!form) return;

      const sdt = form.getRange(Config.FORM_SDT_CELL).getValue();
      console.log('   - SDT đang tìm:', sdt || '(trống)');

      // Dữ liệu dòng đầu tiên trong bảng khóa học - 🎯 SỬA: Dùng DATA_START_ROW
      const firstRowData = form.getRange(Config.FORM_KHOAHOC.DATA_START_ROW, 1, 1, 9).getValues()[0];
      const hasData = firstRowData.some(cell => cell !== '');
      
      if (hasData) {
        console.log('   - Dữ liệu khóa học:');
        console.log('     • KHÓA:', firstRowData[0]);
        console.log('     • MÔN:', firstRowData[2]);
        console.log('     • Sheet_goc:', firstRowData[6]);
        console.log('     • Dong_goc:', firstRowData[7]);
        console.log('     • Dong_DB:', firstRowData[8]);
      } else {
        console.log('   - Chưa có dữ liệu khóa học');
      }
    } catch (error) {
      console.log('   - Lỗi:', error.message);
    }
  }

  // 🔄 DEBUG METADATA & ĐỒNG BỘ
  debugMetadata() {
    console.log('📋 DEBUG METADATA...\n');
    
    try {
      const db = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.DB_SHEET_NAME);
      const form = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.FORM_SHEET_NAME);
      
      if (!db || !form) {
        console.log('❌ Thiếu Database hoặc Form');
        return;
      }

      // Lấy SDT từ Form
      const sdt = form.getRange(Config.FORM_SDT_CELL).getValue();
      console.log(`📞 SDT trong Form: ${sdt || '(trống)'}`);

      if (!sdt) {
        console.log('⚠️ Chưa có SDT để debug metadata');
        return;
      }

      // Tìm trong Database
      const data = db.getDataRange().getValues();
      const headers = data[0];
      const sdtColIndex = headers.indexOf(Config.SDT_HEADER);
      const sheetGocIndex = headers.indexOf(Config.SHEET_GOC_COL);
      const dongGocIndex = headers.indexOf(Config.DONG_GOC_COL);

      console.log(`   - Vị trí cột SDT: ${sdtColIndex + 1}`);
      console.log(`   - Vị trí Sheet_goc: ${sheetGocIndex + 1}`);
      console.log(`   - Vị trí Dong_goc: ${dongGocIndex + 1}`);

      // Tìm bản ghi
      const matches = [];
      for (let i = 1; i < data.length; i++) {
        const rowSdt = formService._formatPhoneNumber(String(data[i][sdtColIndex] || ''));
        if (rowSdt === sdt) {
          matches.push({
            row: i + 1,
            sheetGoc: data[i][sheetGocIndex],
            dongGoc: data[i][dongGocIndex],
            data: data[i].slice(0, 5) // 5 cột đầu
          });
        }
      }

      console.log(`\n🎯 Tìm thấy ${matches.length} bản ghi:`);
      matches.forEach(match => {
        console.log(`   📍 Dòng ${match.row}:`);
        console.log(`      - Sheet_goc: "${match.sheetGoc}"`);
        console.log(`      - Dong_goc: ${match.dongGoc}`);
        console.log(`      - Dữ liệu: ${match.data.filter(Boolean).join(' | ')}`);
      });

    } catch (error) {
      console.error('❌ Lỗi debug metadata:', error);
    }
  }

  // 🐛 DEBUG ĐỒNG BỘ
  debugSyncFlow() {
    console.log('🔄 DEBUG LUỒNG ĐỒNG BỘ...\n');
    
    try {
      const form = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.FORM_SHEET_NAME);
      if (!form) return;

      const formData = form.getRange(Config.FORM_KHOAHOC.DATA_START_ROW, 1, 1, 9).getValues()[0]; // 🎯 SỬA
      const sheetGoc = formData[6];
      const dongGoc = formData[7];
      const dongDB = formData[8];

      console.log('📋 METADATA HIỆN TẠI:');
      console.log(`   - Sheet_goc: "${sheetGoc}"`);
      console.log(`   - Dong_goc: ${dongGoc}`);
      console.log(`   - Dong_DB: ${dongDB}`);

      if (!sheetGoc || !dongGoc) {
        console.log('⚠️ Chưa có đủ metadata để debug đồng bộ');
        return;
      }

      // Kiểm tra sheet và dòng tồn tại
      const monthSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetGoc);
      const dbSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.DB_SHEET_NAME);

      console.log('\n🔍 KIỂM TRA TỒN TẠI:');
      console.log(`   - Sheet ${sheetGoc}: ${monthSheet ? '✅' : '❌'}`);
      console.log(`   - Database: ${dbSheet ? '✅' : '❌'}`);

      if (monthSheet && dongGoc <= monthSheet.getLastRow()) {
        const monthData = monthSheet.getRange(dongGoc, 1, 1, 5).getValues()[0];
        console.log(`   - Dữ liệu sheet ${sheetGoc} dòng ${dongGoc}:`, monthData.filter(Boolean).join(' | '));
      }

      if (dbSheet && dongDB <= dbSheet.getLastRow()) {
        const dbData = dbSheet.getRange(dongDB, 1, 1, 5).getValues()[0];
        console.log(`   - Dữ liệu Database dòng ${dongDB}:`, dbData.filter(Boolean).join(' | '));
      }

      console.log('\n💡 GỢI Ý DEBUG:');
      console.log('   - Chạy "syncCurrentRow()" từ menu để đồng bộ thủ công');
      console.log('   - Sửa dữ liệu trong Database và quan sát đồng bộ tự động');

    } catch (error) {
      console.error('❌ Lỗi debug sync:', error);
    }
  }

  // 🛠️ SỬA LỖI NHANH
  quickFix() {
    console.log('🛠️ SỬA LỖI NHANH...\n');
    
    const fixes = [];
    
    try {
      // 1. Đảm bảo Form sheet tồn tại
      const form = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.FORM_SHEET_NAME);
      if (!form) {
        formService.setupFormSheet();
        fixes.push('✅ Đã tạo Form sheet');
      } else {
        fixes.push('✅ Form sheet đã tồn tại');
      }

      // 2. Đảm bảo Database sheet tồn tại
      const db = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.DB_SHEET_NAME);
      if (!db) {
        databaseService.getDatabaseSheet();
        fixes.push('✅ Đã tạo Database sheet');
      } else {
        fixes.push('✅ Database sheet đã tồn tại');
      }

      // 3. Kiểm tra metadata trong Database
      if (db) {
        const headers = db.getRange(1, 1, 1, db.getLastColumn()).getValues()[0];
        const hasMetadata = headers.includes(Config.SHEET_GOC_COL) && headers.includes(Config.DONG_GOC_COL);
        
        if (!hasMetadata) {
          fixes.push('⚠️ Database thiếu cột metadata - Chạy lại "Gom dữ liệu"');
        } else {
          fixes.push('✅ Database có đủ metadata');
        }
      }

      console.log('📋 KẾT QUẢ SỬA LỖI:');
      fixes.forEach(fix => console.log(`   ${fix}`));

      return fixes;

    } catch (error) {
      console.error('❌ Lỗi khi sửa lỗi:', error);
      return ['❌ Lỗi: ' + error.message];
    }
  }
}

// 🎯 HÀM TOÀN CỤC
function quickTestDebug() {
  const debug = new DebugToolkit();
  return debug.quickSystemCheck();
}

function debugDetailed() {
  const debug = new DebugToolkit();
  debug.debugDetailed();
}

function debugMetadata() {
  const debug = new DebugToolkit();
  debug.debugMetadata();
}

function debugSyncFlow() {
  const debug = new DebugToolkit();
  debug.debugSyncFlow();
}

function quickFix() {
  const debug = new DebugToolkit();
  return debug.quickFix();
}

// Tạo instance toàn cục
const debugToolkit = new DebugToolkit();