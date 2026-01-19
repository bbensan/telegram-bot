// ═══════════════════════════════════════════════
// LOGGER SERVICE - Logging dengan file storage
// ═══════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

// Direktori untuk menyimpan logs
const logsDir = path.join(__dirname, 'logs');

// Buat direktori logs jika belum ada
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Tipe log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  SUCCESS: 'SUCCESS',
};

// Warna untuk console output
const COLORS = {
  ERROR: '\x1b[31m',      // Red
  WARN: '\x1b[33m',       // Yellow
  INFO: '\x1b[36m',       // Cyan
  DEBUG: '\x1b[35m',      // Magenta
  SUCCESS: '\x1b[32m',    // Green
  RESET: '\x1b[0m',       // Reset
};

// In-memory logs (untuk API access)
let logsInMemory = [];
const MAX_LOGS_IN_MEMORY = 1000; // Simpan max 1000 logs di memory

class Logger {
  constructor() {
    this.logsDir = logsDir;
  }

  /**
   * Format log message
   */
  formatLog(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data || null,
    };

    return logEntry;
  }

  /**
   * Write log ke file
   */
  writeToFile(level, logEntry) {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const logFile = path.join(logsDir, `${dateStr}.log`);

    const logLine = `[${logEntry.timestamp}] [${level}] ${logEntry.message}${
      logEntry.data ? ` | ${JSON.stringify(logEntry.data)}` : ''
    }\n`;

    fs.appendFileSync(logFile, logLine, 'utf8');
  }

  /**
   * Add log ke memory
   */
  addToMemory(logEntry) {
    logsInMemory.push(logEntry);

    // Jika sudah melebihi max, hapus yang paling lama
    if (logsInMemory.length > MAX_LOGS_IN_MEMORY) {
      logsInMemory.shift();
    }
  }

  /**
   * Console output dengan warna
   */
  consoleOutput(level, message, data = null) {
    const color = COLORS[level] || COLORS.INFO;
    const reset = COLORS.RESET;

    if (data) {
      console.log(`${color}[${level}]${reset} ${message}`, data);
    } else {
      console.log(`${color}[${level}]${reset} ${message}`);
    }
  }

  /**
   * Main logging function
   */
  log(level, message, data = null) {
    const logEntry = this.formatLog(level, message, data);

    // Write ke file
    this.writeToFile(level, logEntry);

    // Add ke memory
    this.addToMemory(logEntry);

    // Console output
    this.consoleOutput(level, message, data);
  }

  // Convenience methods
  error(message, data = null) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data = null) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }

  success(message, data = null) {
    this.log(LOG_LEVELS.SUCCESS, message, data);
  }

  /**
   * Get all logs dari memory
   */
  getAllLogs() {
    return logsInMemory;
  }

  /**
   * Get logs dengan filter
   */
  getLogsByLevel(level) {
    return logsInMemory.filter((log) => log.level === level);
  }

  /**
   * Get logs dengan limit
   */
  getLogsWithLimit(limit = 100) {
    return logsInMemory.slice(-limit);
  }

  /**
   * Get logs dari file
   */
  getLogsFromFile(dateStr = null) {
    try {
      const date = dateStr || new Date().toISOString().split('T')[0];
      const logFile = path.join(logsDir, `${date}.log`);

      if (!fs.existsSync(logFile)) {
        return [];
      }

      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.split('\n').filter((line) => line.trim());

      return lines.map((line) => {
        // Parse log line
        const match = line.match(/\[(.*?)\] \[(.*?)\] (.*?)(?:\s\|\s(.*))?$/);
        if (match) {
          return {
            timestamp: match[1],
            level: match[2],
            message: match[3],
            data: match[4] ? JSON.parse(match[4]) : null,
          };
        }
        return null;
      }).filter(Boolean);
    } catch (error) {
      console.error('Error reading log file:', error);
      return [];
    }
  }

  /**
   * Get list of available log files
   */
  getAvailableLogFiles() {
    try {
      const files = fs.readdirSync(logsDir);
      return files
        .filter((file) => file.endsWith('.log'))
        .sort()
        .reverse();
    } catch (error) {
      console.error('Error reading logs directory:', error);
      return [];
    }
  }

  /**
   * Clear logs dari memory
   */
  clearMemoryLogs() {
    logsInMemory = [];
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const stats = {
      totalLogs: logsInMemory.length,
      byLevel: {},
      availableFiles: this.getAvailableLogFiles(),
    };

    // Count by level
    Object.values(LOG_LEVELS).forEach((level) => {
      stats.byLevel[level] = logsInMemory.filter((log) => log.level === level).length;
    });

    return stats;
  }
}

module.exports = new Logger();
