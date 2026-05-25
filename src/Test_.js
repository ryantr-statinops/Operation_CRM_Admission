/* ================================================
   TEST RUNNER 
================================================ */

class TestRunner {
  constructor() {
    this.results = [];
    this.logger = logger;
  }

  // 🎯 TEST CHÍNH - CHẠY TOÀN BỘ HỆ THỐNG
  runAllTests() {
    console.log('🧪 BẮT ĐẦU KIỂM TRA TOÀN HỆ THỐNG...\n');
    
    this.results = [];
    
    try {
      this._testSection('⚙️ CẤU HÌNH', this._testConfig.bind(this));
      this._testSection('🔧 DỊCH VỤ', this._testServices.bind(this));
      this._testSection('🗄️ DATABASE', this._testDatabase.bind(this));
      this._testSection('📝 FORM', this._testForm.bind(this));
      this._testSection('🔄 ĐỒNG BỘ', this._testSync.bind(this));
      
      this._showResults();
      
    } catch (error) {
      this.logger.error('Lỗi kiểm tra: ' + error.toString());
    }
  }

  _testSection(name, testFunction) {
    console.log(`\n${name}...`);
    try {
      const result = testFunction();
      this.results.push({ name, success: true, details: result });
      console.log(`✅ ${name}: THÀNH CÔNG`);
    } catch (error) {
      this.results.push({ name, success: false, error: error.message });
      console.log(`❌ ${name}: THẤT BẠI - ${error.message}`);
    }
  }

  _testConfig() {
    const required = ['DB_SHEET_NAME', 'MONTH_PREFIX', 'SDT_HEADER', 'FORM_SHEET_NAME', 'FORM_KHOAHOC_MAPPING'];
    const missing = required.filter(prop => !Config.hasOwnProperty(prop));
    
    if (missing.length > 0) {
      throw new Error(`Thiếu config: ${missing.join(', ')}`);
    }

    // 🎯 SỬA: Kiểm tra metadata mapping mới
    const hasKhoaHocMetadata = 
      Config.FORM_KHOAHOC_MAPPING['Sheet_goc'] && 
      Config.FORM_KHOAHOC_MAPPING['Dong_goc'];
    
    if (!hasKhoaHocMetadata) {
      throw new Error('Metadata chưa được cấu hình trong FORM_KHOAHOC_MAPPING');
    }

    return {
      configCount: Object.keys(Config).length,
      hasMetadata: hasKhoaHocMetadata
    };
  }

  _testServices() {
    const services = {
      'Logger': logger,
      'Database': databaseService,
      'Sync': syncService,
      'Form': formService
    };

    const missing = Object.entries(services)
      .filter(([_, service]) => typeof service === 'undefined')
      .map(([name]) => name);

    if (missing.length > 0) {
      throw new Error(`Thiếu services: ${missing.join(', ')}`);
    }

    // Test phương thức quan trọng
    const criticalMethods = [
      { service: databaseService, method: 'getDatabaseSheet' },
      { service: syncService, method: 'mergeSheetsToDatabase' },
      { service: formService, method: 'processLoadFormBySDT' }
    ];

    const missingMethods = criticalMethods
      .filter(({ service, method }) => typeof service[method] !== 'function')
      .map(({ method }) => method);

    if (missingMethods.length > 0) {
      throw new Error(`Thiếu phương thức: ${missingMethods.join(', ')}`);
    }

    return {
      serviceCount: Object.keys(services).length,
      allMethods: true
    };
  }

  _testDatabase() {
    const status = databaseService.getDatabaseStatus();
    
    if (!status.sheetExists) {
      throw new Error('Database sheet không tồn tại');
    }

    // Kiểm tra metadata columns
    const db = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.DB_SHEET_NAME);
    const headers = db.getRange(1, 1, 1, db.getLastColumn()).getValues()[0];
    
    const hasMetadata = 
      headers.includes(Config.SHEET_GOC_COL) && 
      headers.includes(Config.DONG_GOC_COL);

    if (!hasMetadata) {
      throw new Error('Database thiếu cột metadata');
    }

    return {
      totalRecords: status.dataRowCount,
      hasMetadata: hasMetadata,
      sheetName: Config.DB_SHEET_NAME
    };
  }

  _testForm() {
    const form = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.FORM_SHEET_NAME);
    
    if (!form) {
      throw new Error('Form sheet không tồn tại');
    }

    // 🎯 SỬA: Kiểm tra headers bảng khóa học với metadata mới
    const headers = form.getRange(Config.FORM_HEADER_ROW, 1, 1, 12).getValues()[0]; // 12 cột
    const requiredHeaders = [
      'KHÓA', 'MÔN', 'TIẾN ĐỘ', 'MÃ ƯU ĐÃI', 'KÊNH HỌC', 
      'KHAI GIẢNG\n(dd/mm)', 'NGÀY THI', 'ĐIỂM THI', 'GHI CHÚ',
      'Sheet_goc', 'Dong_goc', 'Dong_DB'
    ];
    
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Form thiếu headers: ${missingHeaders.join(', ')}`);
    }

    return {
      formExists: true,
      headers: headers.filter(h => h)
    };
  }

  _testSync() {
    // 🎯 SỬA: Test format phone number với formService
    const testCases = [
      { input: '0123456789', expected: '0123456789' },
      { input: '84123456789', expected: '0123456789' },
      { input: '123456789', expected: '0123456789' }
    ];

    const failedTests = testCases.filter(test => {
      const result = formService._formatPhoneNumber(test.input);
      return result !== test.expected;
    });

    if (failedTests.length > 0) {
      throw new Error(`Format phone number thất bại: ${failedTests.length} test`);
    }

    return {
      phoneTests: testCases.length,
      allPassed: true
    };
  }

  _showResults() {
    console.log('\n📊 KẾT QUẢ KIỂM TRA:');
    console.log('=' .repeat(50));
    
    this.results.forEach((result, index) => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      
      if (result.success && result.details) {
        Object.entries(result.details).forEach(([key, value]) => {
          console.log(`   📌 ${key}: ${value}`);
        });
      } else if (!result.success) {
        console.log(`   💥 Lỗi: ${result.error}`);
      }
    });

    const allPassed = this.results.every(r => r.success);
    const passedCount = this.results.filter(r => r.success).length;
    
    console.log('\n' + '=' .repeat(50));
    console.log(`🎯 TỔNG KẾT: ${passedCount}/${this.results.length} thành công`);
    
    if (allPassed) {
      console.log('🎉 TOÀN BỘ HỆ THỐNG HOẠT ĐỘNG TỐT!');
      SpreadsheetApp.getUi().alert('✅ KIỂM TRA HOÀN TẤT!\n\nToàn bộ hệ thống hoạt động tốt!');
    } else {
      const failed = this.results.filter(r => !r.success).map(r => r.name);
      console.log(`⚠️ CẦN KIỂM TRA: ${failed.join(', ')}`);
      SpreadsheetApp.getUi().alert(`⚠️ CÓ VẤN ĐỀ!\n\nCần kiểm tra: ${failed.join(', ')}`);
    }
  }

  // 🚀 TEST NHANH - CHO LẦN ĐẦU TIÊN
  quickTest() {
    console.log('🚀 KIỂM TRA NHANH HỆ THỐNG...');
    
    const tests = [
      () => typeof Config !== 'undefined',
      () => typeof logger !== 'undefined',
      () => typeof databaseService !== 'undefined', 
      () => typeof syncService !== 'undefined',
      () => typeof formService !== 'undefined'
    ];
    
    const results = tests.map((test, index) => {
      const success = test();
      console.log(`${success ? '✅' : '❌'} Test ${index + 1}: ${success ? 'PASS' : 'FAIL'}`);
      return success;
    });
    
    const allPassed = results.every(Boolean);
    console.log(allPassed ? '🎉 HỆ THỐNG OK!' : '💥 CÓ LỖI!');
    
    return allPassed;
  }
}

// 🎯 HÀM TOÀN CỤC
function runAllTests() {
  const testRunner = new TestRunner();
  testRunner.runAllTests();
}

function quickTest() {
  const testRunner = new TestRunner();
  return testRunner.quickTest();
}

// Tạo instance toàn cục
const testRunner = new TestRunner();

