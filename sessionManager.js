// ═══════════════════════════════════════════════
// SESSION MANAGER - Manage user sessions & auto-logout
// ═══════════════════════════════════════════════

const config = require('./config');
const logger = require('./logger');

class SessionManager {
  constructor() {
    // Store user sessions: { chatId: { lastActivity: timestamp, loginTime: timestamp } }
    this.sessions = new Map();
    
    // Idle timeout in milliseconds
    this.idleTimeoutMs = config.session.idleTimeoutMinutes * 60 * 1000;
    
    // Check interval in milliseconds
    this.checkIntervalMs = config.session.checkIntervalMinutes * 60 * 1000;
    
    // Start cleanup interval
    this.startCleanupInterval();
    
    logger.info(`Session manager initialized`, {
      idleTimeoutMinutes: config.session.idleTimeoutMinutes,
      checkIntervalMinutes: config.session.checkIntervalMinutes,
    });
  }

  /**
   * Create session untuk user yang baru login
   */
  createSession(chatId) {
    const now = Date.now();
    this.sessions.set(chatId, {
      lastActivity: now,
      loginTime: now,
    });
    
    logger.info(`Session created`, { chatId, idleTimeoutMinutes: config.session.idleTimeoutMinutes });
  }

  /**
   * Update last activity time
   */
  updateActivity(chatId) {
    if (this.sessions.has(chatId)) {
      this.sessions.get(chatId).lastActivity = Date.now();
    }
  }

  /**
   * Destroy session (logout)
   */
  destroySession(chatId) {
    if (this.sessions.has(chatId)) {
      const session = this.sessions.get(chatId);
      const sessionDurationMs = Date.now() - session.loginTime;
      const sessionDurationMinutes = Math.round(sessionDurationMs / 60000);
      
      this.sessions.delete(chatId);
      logger.info(`Session destroyed`, { chatId, sessionDurationMinutes });
    }
  }

  /**
   * Check if session is active
   */
  isSessionActive(chatId) {
    return this.sessions.has(chatId);
  }

  /**
   * Get session info
   */
  getSessionInfo(chatId) {
    if (!this.sessions.has(chatId)) {
      return null;
    }

    const session = this.sessions.get(chatId);
    const now = Date.now();
    const idleTimeMs = now - session.lastActivity;
    const idleTimeMinutes = Math.round(idleTimeMs / 60000);
    const sessionDurationMs = now - session.loginTime;
    const sessionDurationMinutes = Math.round(sessionDurationMs / 60000);

    return {
      chatId,
      loginTime: new Date(session.loginTime).toISOString(),
      lastActivity: new Date(session.lastActivity).toISOString(),
      idleTimeMinutes,
      sessionDurationMinutes,
      isExpired: idleTimeMs > this.idleTimeoutMs,
    };
  }

  /**
   * Get all active sessions
   */
  getAllSessions() {
    const sessions = [];
    const now = Date.now();

    for (const [chatId, session] of this.sessions) {
      const idleTimeMs = now - session.lastActivity;
      const idleTimeMinutes = Math.round(idleTimeMs / 60000);
      const sessionDurationMs = now - session.loginTime;
      const sessionDurationMinutes = Math.round(sessionDurationMs / 60000);

      sessions.push({
        chatId,
        loginTime: new Date(session.loginTime).toISOString(),
        lastActivity: new Date(session.lastActivity).toISOString(),
        idleTimeMinutes,
        sessionDurationMinutes,
        isExpired: idleTimeMs > this.idleTimeoutMs,
      });
    }

    return sessions;
  }

  /**
   * Get expired sessions
   */
  getExpiredSessions() {
    const expired = [];
    const now = Date.now();

    for (const [chatId, session] of this.sessions) {
      const idleTimeMs = now - session.lastActivity;
      if (idleTimeMs > this.idleTimeoutMs) {
        expired.push(chatId);
      }
    }

    return expired;
  }

  /**
   * Start cleanup interval untuk auto-logout
   */
  startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      const expiredSessions = this.getExpiredSessions();

      if (expiredSessions.length > 0) {
        logger.warn(`Found ${expiredSessions.length} expired session(s)`, {
          expiredChatIds: expiredSessions,
        });

        // Return array of expired chat IDs untuk di-handle di bot.js
        this.onSessionsExpired(expiredSessions);
      }
    }, this.checkIntervalMs);

    logger.info(`Session cleanup interval started`, {
      checkIntervalMinutes: config.session.checkIntervalMinutes,
    });
  }

  /**
   * Stop cleanup interval
   */
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      logger.info(`Session cleanup interval stopped`);
    }
  }

  /**
   * Callback untuk handle expired sessions
   * Override ini di bot.js untuk send notification ke user
   */
  onSessionsExpired(expiredChatIds) {
    // Override di bot.js
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const sessions = this.getAllSessions();
    const expiredCount = sessions.filter((s) => s.isExpired).length;

    return {
      totalActiveSessions: sessions.length,
      expiredSessions: expiredCount,
      activeSessions: sessions.length - expiredCount,
      idleTimeoutMinutes: config.session.idleTimeoutMinutes,
      checkIntervalMinutes: config.session.checkIntervalMinutes,
      sessions,
    };
  }
}

module.exports = new SessionManager();
