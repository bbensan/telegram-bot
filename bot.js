// ═══════════════════════════════════════════════
// IMPORTS & CONFIG
// ═══════════════════════════════════════════════
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const credentialsService = require('./credentialsService');
const logger = require('./logger');
const sessionManager = require('./sessionManager');
const app = require('./app');

// Validate config
try {
  config.validate();
  logger.success('Config valid');
  logger.info('Config info', config.getInfo());
} catch (error) {
  logger.error(error.message);
  process.exit(1);
}

// ═══════════════════════════════════════════════
// SETUP BOT
// ═══════════════════════════════════════════════

let bot;

if (config.nodeEnv === 'dev') {
  // DEVELOPMENT - POLLING
  logger.info('MODE: POLLING (Development)');
  bot = new TelegramBot(config.botToken, { polling: true });
} else {
  // PRODUCTION - WEBHOOK
  logger.info('MODE: WEBHOOK (Production)');
  bot = new TelegramBot(config.botToken, {
    webHook: {
      port: config.webhook.port,
      host: config.webhook.host,
    },
  });
}

// ═══════════════════════════════════════════════
// SETUP EXPRESS (untuk production webhook)
// ═══════════════════════════════════════════════

if (config.nodeEnv === 'prod') {
  // Register webhook
  const webhookPath = `/bot${config.botToken}`;

  bot
    .setWebhook(`${config.webhook.url}${webhookPath}`)
    .then(() => {
      logger.success('Webhook successfully registered to Telegram');
      logger.info(`Webhook URL: ${config.webhook.url}${webhookPath}`);
    })
    .catch((err) => {
      logger.error('Failed to register webhook', { error: err.message });
      process.exit(1);
    });

  // Webhook endpoint
  app.post(webhookPath, (req, res) => {
    try {
      bot.processUpdate(req.body);
      logger.debug('Update processed from webhook');
      res.sendStatus(200);
    } catch (error) {
      logger.error('Error processing update', { error: error.message });
      res.sendStatus(500);
    }
  });
}

// ═══════════════════════════════════════════════
// COMMAND: /start - Mulai bot
// ═══════════════════════════════════════════════
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;

  logger.info(`User started the bot`, { chatId, firstName });

  // Check if user is verified
  if (!credentialsService.isUserVerified(chatId)) {
    bot.sendMessage(
      chatId,
      `👋 Hello ${firstName}!\n\n${credentialsService.getCredentialsPromptMessage()}`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // User sudah verified - tampilkan menu
  bot.sendMessage(
    chatId,
    `✅ Hello ${firstName}! Bot is active.\n\nType /help to see available commands.`,
    { parse_mode: 'Markdown' }
  );
});

// ═══════════════════════════════════════════════
// COMMAND: /verify - Verifikasi credentials
// ═══════════════════════════════════════════════

// Handle /verify dengan token dan key
bot.onText(/\/verify\s+(\S+)\s+(\S+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const apiToken = match[1];
  const apiKey = match[2];

  logger.info(`User attempting to verify credentials`, { chatId });

  // Verifikasi credentials
  if (credentialsService.verify(apiToken, apiKey)) {
    credentialsService.addVerifiedUser(chatId);
    sessionManager.createSession(chatId);
    bot.sendMessage(
      chatId,
      `✅ **VERIFICATION SUCCESS**\n\nYou are now able to use this bot.\n\nType /help to see available commands.`,
      { parse_mode: 'Markdown' }
    );
    logger.success(`User verified successfully`, { chatId });
  } else {
    bot.sendMessage(
      chatId,
      `❌ **VERIFICATION FAILED**\n\nThe credentials you provided are not valid.\n\nPlease try again with valid credentials.`,
      { parse_mode: 'Markdown' }
    );
    logger.warn(`Verification failed - invalid credentials`, { chatId });
  }
});

// Handle /verify tanpa token dan key (validation error)
bot.onText(/\/verify(?:\s|$)/, (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.trim();

  // Skip jika sudah ditangani oleh regex sebelumnya (ada token dan key)
  if (text.match(/\/verify\s+\S+\s+\S+/)) {
    return;
  }

  logger.warn(`User sent /verify without credentials`, { chatId });

  const validationMessage = `❌ **INVALID FORMAT**

The /verify command requires 2 parameters.

*Format*:
\`/verify <API_TOKEN> <API_KEY>\`
`;

  bot.sendMessage(chatId, validationMessage, { parse_mode: 'Markdown' });
});

// ═══════════════════════════════════════════════
// COMMAND: /help - Bantuan
// ═══════════════════════════════════════════════
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  logger.info(`User requested help`, { chatId });

  if (!credentialsService.isUserVerified(chatId)) {
    bot.sendMessage(
      chatId,
      `❌ You are not verified.\n\n${credentialsService.getCredentialsPromptMessage()}`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const helpMessage = `📋 **PERINTAH YANG TERSEDIA**

\`/start\` - Start bot
\`/help\` - Help (this message)
\`/ping\` - Test bot connection
\`/status\` - Check bot status
\`/logout\` - Logout from bot

Or send any message to test echo.`;

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// ═══════════════════════════════════════════════
// COMMAND: /ping - Test koneksi
// ═══════════════════════════════════════════════
bot.onText(/\/ping/, (msg) => {
  const chatId = msg.chat.id;

  if (!credentialsService.isUserVerified(chatId)) {
    bot.sendMessage(chatId, `❌ You are not verified.`);
    return;
  }

  logger.info(`User pinged bot`, { chatId });
  bot.sendMessage(chatId, `🏓 Pong! Bot is active.\n\n⏱️ Mode: ${config.getInfo().mode}`);
});

// ═══════════════════════════════════════════════
// COMMAND: /status - Cek status bot
// ═══════════════════════════════════════════════
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;

  if (!credentialsService.isUserVerified(chatId)) {
    bot.sendMessage(chatId, `❌ You are not verified.`);
    return;
  }

  const info = config.getInfo();
  const statusMessage = `📊 **STATUS BOT**

🌍 Environment: ${info.environment.toUpperCase()}
📡 Mode: ${info.mode}
🔌 Webhook: ${info.mode === 'WEBHOOK' ? '✅ Active' : 'N/A'}
⏲️ Polling: ${info.pollingEnabled ? '✅ Active' : '❌ Inactive'}
⏰ Timestamp: ${new Date().toISOString()}`;

  bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
});

// ═══════════════════════════════════════════════
// COMMAND: /logout - Logout
// ═══════════════════════════════════════════════
bot.onText(/\/logout/, (msg) => {
  const chatId = msg.chat.id;

  if (!credentialsService.isUserVerified(chatId)) {
    bot.sendMessage(chatId, `❌ You are not verified.`);
    return;
  }

  credentialsService.removeVerifiedUser(chatId);
  sessionManager.destroySession(chatId);
  logger.info(`User logged out manually`, { chatId });
  bot.sendMessage(chatId, `👋 You have logged out.\n\nType /start to login again.`, { parse_mode: 'Markdown' });
});

// ═══════════════════════════════════════════════
// PESAN OTOMATIS (Echo)
// ═══════════════════════════════════════════════
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Skip jika command
  if (text.startsWith('/')) return;

  // Cek verifikasi
  if (!credentialsService.isUserVerified(chatId)) {
    bot.sendMessage(chatId, `❌ You are not verified.\n\nUse /start to start.`);
    return;
  }

  // Update activity untuk session
  sessionManager.updateActivity(chatId);

  logger.info(`User sent message`, { chatId, message: text });
  bot.sendMessage(chatId, `💬 You said: "${text}"`);
});

// ═══════════════════════════════════════════════
// SESSION EXPIRY HANDLER
// ═══════════════════════════════════════════════
sessionManager.onSessionsExpired = (expiredChatIds) => {
  expiredChatIds.forEach((chatId) => {
    // Remove dari verified users
    credentialsService.removeVerifiedUser(chatId);
    sessionManager.destroySession(chatId);

    // Send notification ke user
    const idleTimeoutMinutes = config.session.idleTimeoutMinutes;
    bot.sendMessage(
      chatId,
      `⏰ **SESSION EXPIRED**\n\nYour session has expired due to ${idleTimeoutMinutes} minutes of inactivity.\n\nType /start to login again.`,
      { parse_mode: 'Markdown' }
    ).catch((error) => {
      logger.warn(`Failed to send expiry notification`, { chatId, error: error.message });
    });

    logger.warn(`Session auto-logout due to inactivity`, { chatId, idleTimeoutMinutes });
  });
};

// ═══════════════════════════════════════════════
// ERROR HANDLER
// ═══════════════════════════════════════════════
bot.on('polling_error', (error) => {
  logger.error('Polling error', { error: error.message });
});

// ═══════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════

if (config.nodeEnv === 'prod') {
  // Production - Express server
  app.listen(config.webhook.port, config.webhook.host, () => {
    logger.success(`Express server listening on ${config.webhook.host}:${config.webhook.port}`);
    logger.info(`Webhook mode ACTIVE`);
    logger.info(`Credentials verification ENABLED`);
    logger.success('BOT IS READY TO USE');
  });
} else {
  // Development - Polling only
  logger.success(`Bot polling mode ACTIVE`);
  logger.info(`Credentials verification ENABLED`);
  logger.success(`Bot is ready to receive messages (Localhost)`);
  logger.success('BOT IS READY TO USE');
}