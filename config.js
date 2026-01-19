require('dotenv').config();

const config = {
  // Bot
  botToken: process.env.BOT_TOKEN,
  nodeEnv: process.env.NODE_ENV || 'dev',
  adminChatId: process.env.ADMIN_CHAT_ID,

  // Credentials (for verification)
  credentials: {
    apiToken: process.env.API_TOKEN,
    apiKey: process.env.API_KEY,
  },

  // Webhook (for production)
  webhook: {
    url: process.env.WEBHOOK_URL,
    port: parseInt(process.env.WEBHOOK_PORT) || 8443,
    host: process.env.SERVER_HOST || '0.0.0.0',
  },

  // Polling (for development)
  polling: {
    enabled: process.env.NODE_ENV === 'dev',
    interval: 300, // ms
  },

  // Session timeout (auto-logout)
  session: {
    idleTimeoutMinutes: parseInt(process.env.SESSION_IDLE_TIMEOUT_MINUTES) || 15,
    checkIntervalMinutes: parseInt(process.env.SESSION_CHECK_INTERVAL_MINUTES) || 1,
  },

  // Validate config
  validate() {
    if (!this.botToken) {
      throw new Error('❌ BOT_TOKEN not found in .env');
    }

    if (this.nodeEnv === 'prod' && !this.webhook.url) {
      throw new Error('❌ WEBHOOK_URL not found in .env (required for production)');
    }

    if (!this.credentials.apiToken || !this.credentials.apiKey) {
      throw new Error('❌ API_TOKEN atau API_KEY not found in .env');
    }

    return true;
  },

  // Get info
  getInfo() {
    return {
      environment: this.nodeEnv,
      mode: this.nodeEnv === 'dev' ? 'POLLING' : 'WEBHOOK',
      webhookUrl: this.nodeEnv === 'prod' ? this.webhook.url : 'N/A',
      pollingEnabled: this.polling.enabled,
    };
  },
};

module.exports = config;