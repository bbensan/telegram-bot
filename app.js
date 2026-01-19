// ═══════════════════════════════════════════════
// EXPRESS APP - API Server dengan Logging
// ═══════════════════════════════════════════════

const express = require('express');
const logger = require('./logger');
const sessionManager = require('./sessionManager');

const app = express();

// Middleware
app.use(express.json());

// ═══════════════════════════════════════════════
// ROUTES - HEALTH & STATUS
// ═══════════════════════════════════════════════

/**
 * GET /health - Health check
 */
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'OK',
    message: 'Bot API is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/status - Bot status
 */
app.get('/api/status', (req, res) => {
  logger.info('Status check requested');
  res.json({
    status: 'OK',
    message: 'Bot is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// ═══════════════════════════════════════════════
// ROUTES - LOGGING API
// ═══════════════════════════════════════════════

/**
 * GET /api/logs - Get all logs (dengan pagination)
 * Query params:
 *   - limit: jumlah logs (default: 100)
 *   - level: filter by level (ERROR, WARN, INFO, DEBUG, SUCCESS)
 *   - offset: skip logs (default: 0)
 */
app.get('/api/logs', (req, res) => {
  try {
    const { limit = 100, level = null, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 100, 1000); // Max 1000
    const offsetNum = parseInt(offset) || 0;

    let logs = logger.getAllLogs();

    // Filter by level jika ada
    if (level) {
      logs = logs.filter((log) => log.level === level.toUpperCase());
    }

    // Pagination
    const total = logs.length;
    const paginatedLogs = logs.slice(-offsetNum - limitNum, -offsetNum || undefined).reverse();

    logger.info('Logs retrieved via API', { limit: limitNum, level, offset: offsetNum, total });

    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total,
      },
    });
  } catch (error) {
    logger.error('Error retrieving logs', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/logs/stats - Get log statistics
 */
app.get('/api/logs/stats', (req, res) => {
  try {
    const stats = logger.getStatistics();
    logger.info('Log statistics requested');

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error retrieving statistics', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/logs/level/:level - Get logs by level
 * Params:
 *   - level: ERROR, WARN, INFO, DEBUG, SUCCESS
 */
app.get('/api/logs/level/:level', (req, res) => {
  try {
    const { level } = req.params;
    const { limit = 100 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 100, 1000);

    const logs = logger.getLogsByLevel(level.toUpperCase()).slice(-limitNum).reverse();

    logger.info(`Logs retrieved by level: ${level}`, { count: logs.length });

    res.json({
      success: true,
      level: level.toUpperCase(),
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    logger.error('Error retrieving logs by level', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/logs/file/:date - Get logs dari file
 * Params:
 *   - date: YYYY-MM-DD (default: today)
 */
app.get('/api/logs/file/:date?', (req, res) => {
  try {
    const { date } = req.params;
    const logs = logger.getLogsFromFile(date);

    logger.info(`Logs retrieved from file: ${date || 'today'}`);

    res.json({
      success: true,
      date: date || new Date().toISOString().split('T')[0],
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    logger.error('Error retrieving logs from file', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/logs/files - Get list of available log files
 */
app.get('/api/logs/files', (req, res) => {
  try {
    const files = logger.getAvailableLogFiles();
    logger.info('Available log files requested');

    res.json({
      success: true,
      data: files,
      count: files.length,
    });
  } catch (error) {
    logger.error('Error retrieving log files', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/logs/memory - Clear logs dari memory
 */
app.delete('/api/logs/memory', (req, res) => {
  try {
    logger.clearMemoryLogs();
    logger.info('Memory logs cleared via API');

    res.json({
      success: true,
      message: 'Memory logs cleared',
    });
  } catch (error) {
    logger.error('Error clearing memory logs', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════
// ROUTES - SESSION MANAGEMENT
// ═══════════════════════════════════════════════

/**
 * GET /api/sessions - Get all active sessions
 */
app.get('/api/sessions', (req, res) => {
  try {
    const stats = sessionManager.getStatistics();
    logger.info('Active sessions retrieved via API');

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error retrieving sessions', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/sessions/:chatId - Get specific session info
 */
app.get('/api/sessions/:chatId', (req, res) => {
  try {
    const { chatId } = req.params;
    const sessionInfo = sessionManager.getSessionInfo(parseInt(chatId));

    if (!sessionInfo) {
      logger.warn(`Session not found for chat ${chatId}`);
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        chatId,
      });
    }

    logger.info(`Session info retrieved for chat ${chatId}`);

    res.json({
      success: true,
      data: sessionInfo,
    });
  } catch (error) {
    logger.error('Error retrieving session info', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/sessions/:chatId - Force logout user
 */
app.delete('/api/sessions/:chatId', (req, res) => {
  try {
    const { chatId } = req.params;
    const chatIdNum = parseInt(chatId);

    if (!sessionManager.isSessionActive(chatIdNum)) {
      logger.warn(`Attempted to delete non-existent session for chat ${chatId}`);
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        chatId,
      });
    }

    sessionManager.destroySession(chatIdNum);
    logger.info(`Session force-logged out via API`, { chatId: chatIdNum });

    res.json({
      success: true,
      message: 'Session destroyed',
      chatId: chatIdNum,
    });
  } catch (error) {
    logger.error('Error destroying session', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════
// ERROR HANDLER
// ═══════════════════════════════════════════════

/**
 * 404 Handler
 */
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

/**
 * Error Handler
 */
app.use((err, req, res, next) => {
  logger.error('Express error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: err.message,
  });
});

module.exports = app;
