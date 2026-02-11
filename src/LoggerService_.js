/* ================================================
   LOGGER 
================================================ */

class Logger {
  constructor() {
    this.config = Config;
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    // Hiển thị trong console Apps Script
    console.log(logMessage);
    
    // Có thể mở rộng: ghi vào sheet Log, gửi email, etc.
  }

  debug(message) {
    if (this.config.LOG_LEVEL === 'DEBUG') {
      this.log('DEBUG', message);
    }
  }

  info(message) {
    if (['DEBUG', 'INFO'].includes(this.config.LOG_LEVEL)) {
      this.log('INFO', message);
    }
  }

  warn(message) {
    if (['DEBUG', 'INFO', 'WARN'].includes(this.config.LOG_LEVEL)) {
      this.log('WARN', message);
    }
  }

  error(message) {
    this.log('ERROR', message);
  }
}

// Tạo instance toàn cục
const logger = new Logger();