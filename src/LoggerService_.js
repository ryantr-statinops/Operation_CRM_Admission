/* ================================================
   LOGGER SERVICE
   Quản lý ghi log và thông báo lỗi
================================================ */

class LoggerService {
  constructor() {
    this.config = Config;
  }
  
  log(message) {
    console.log(`📝 ${this.getTimestamp()} - ${message}`);
  }
  
  info(message) {
    if (this.shouldLog('INFO')) {
      console.log(`ℹ️ ${this.getTimestamp()} - INFO: ${message}`);
    }
  }
  
  warn(message) {
    if (this.shouldLog('WARN')) {
      console.warn(`⚠️ ${this.getTimestamp()} - WARN: ${message}`);
    }
  }
  
  error(message) {
    if (this.shouldLog('ERROR')) {
      console.error(`❌ ${this.getTimestamp()} - ERROR: ${message}`);
      
      // Gửi email thông báo lỗi quan trọng (làm sau)
      this.sendErrorNotification(message);
    }
  }
  
  debug(message) {
    if (this.shouldLog('DEBUG')) {
      console.log(`🐛 ${this.getTimestamp()} - DEBUG: ${message}`);
    }
  }
  
  // Kiểm tra có nên ghi log không dựa trên LOG_LEVEL
  shouldLog(level) {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const currentLevelIndex = levels.indexOf(this.config.LOG_LEVEL);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }
  
  getTimestamp() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
  
  sendErrorNotification(errorMessage) {
    // Sẽ triển khai sau - gửi email cho admin
    // if (this.config.ADMIN_EMAILS) { ... }
  }
}

// Instance toàn cục
const logger = new LoggerService();