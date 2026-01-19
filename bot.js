// ═══════════════════════════════════════════════
// IMPORTS & CONFIG
// ═══════════════════════════════════════════════
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const config = require('./config');
const credentialsService = require('./credentialsService');

// Validate config
try {
  config.validate();
  console.log('✅ Config valid');
  console.log('📋 Info:', config.getInfo());
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

// ═══════════════════════════════════════════════
// SETUP BOT
// ═══════════════════════════════════════════════

let bot;

if (config.nodeEnv === 'dev') {
  // DEVELOPMENT - POLLING
  console.log('📱 MODE: POLLING (Development)');
  bot = new TelegramBot(config.botToken, { polling: true });
} else {
  // PRODUCTION - WEBHOOK
  console.log('🌐 MODE: WEBHOOK (Production)');
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

const app = express();
app.use(express.json());

if (config.nodeEnv === 'prod') {
  // Register webhook
  const webhookPath = `/bot${config.botToken}`;

  bot
    .setWebhook(`${config.webhook.url}${webhookPath}`)
    .then(() => {
      console.log('✅ Webhook berhasil didaftarkan ke Telegram');
      console.log(`📍 URL: ${config.webhook.url}${webhookPath}`);
    })
    .catch((err) => {
      console.error('❌ Gagal mendaftarkan webhook:', err.message);
      process.exit(1);
    });

  // Webhook endpoint
  app.post(webhookPath, (req, res) => {
    try {
      bot.processUpdate(req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error('❌ Error processing update:', error);
      res.sendStatus(500);
    }
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Bot webhook sedang berjalan',
      timestamp: new Date().toISOString(),
      mode: 'WEBHOOK',
    });
  });
}

// ═══════════════════════════════════════════════
// COMMAND: /start - Mulai bot
// ═══════════════════════════════════════════════
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;

  console.log(`👤 [START] User: ${firstName} (${chatId})`);

  // Cek apakah user sudah verified
  if (!credentialsService.isUserVerified(chatId)) {
    bot.sendMessage(
      chatId,
      `👋 Halo ${firstName}!\n\n${credentialsService.getCredentialsPromptMessage()}`
    );
    return;
  }

  // User sudah verified - tampilkan menu
  bot.sendMessage(
    chatId,
    `✅ Halo ${firstName}! Bot Coolify sedang aktif.\n\nKetik /help untuk melihat perintah yang tersedia.`,
  );
});

// ═══════════════════════════════════════════════
// COMMAND: /verify - Verifikasi credentials
// ═══════════════════════════════════════════════
bot.onText(/\/verify\s+(\S+)\s+(\S+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const apiToken = match[1];
  const apiKey = match[2];

  console.log(`🔐 [VERIFY] Chat ${chatId} mencoba verifikasi`);

  // Verifikasi credentials
  if (credentialsService.verify(apiToken, apiKey)) {
    credentialsService.addVerifiedUser(chatId);
    bot.sendMessage(
      chatId,
      `✅ **VERIFIKASI BERHASIL**\n\nAnda sekarang sudah bisa menggunakan bot ini.\n\nKetik /help untuk melihat perintah yang tersedia.`,
    );
    console.log(`✅ [VERIFIED] Chat ${chatId} berhasil terverifikasi`);
  } else {
    bot.sendMessage(
      chatId,
      `❌ **VERIFIKASI GAGAL**\n\nCredentials yang Anda berikan tidak valid.\n\nSilakan coba lagi dengan credentials yang benar.`,
    );
    console.log(`❌ [VERIFY FAILED] Chat ${chatId} credentials salah`);
  }
});

// ═══════════════════════════════════════════════
// COMMAND: /help - Bantuan
// ═══════════════════════════════════════════════
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  console.log(`ℹ️ [HELP] User ${chatId} meminta bantuan`);

  if (!credentialsService.isUserVerified(chatId)) {
    bot.sendMessage(
      chatId,
      `❌ Anda belum terverifikasi.\n\n${credentialsService.getCredentialsPromptMessage()}`,
    );
    return;
  }

  const helpMessage = `📋 **PERINTAH YANG TERSEDIA**

/start - Mulai bot
/help - Bantuan (pesan ini)
/ping - Test koneksi bot
/status - Cek status bot
/logout - Logout dari bot

Atau kirim pesan apapun untuk test echo.`;

  bot.sendMessage(chatId, helpMessage);
});

// ═══════════════════════════════════════════════
// COMMAND: /ping - Test koneksi
// ═══════════════════════════════════════════════
bot.onText(/\/ping/, (msg) => {
  const chatId = msg.chat.id;

  if (!credentialsService.isUserVerified(chatId)) {
    bot.sendMessage(chatId, `❌ Anda belum terverifikasi.`);
    return;
  }

  console.log(`🏓 [PING] User ${chatId}`);
  bot.sendMessage(chatId, `🏓 Pong! Bot sedang aktif.\n\n⏱️ Mode: ${config.getInfo().mode}`);
});

// ═══════════════════════════════════════════════
// COMMAND: /status - Cek status bot
// ═══════════════════════════════════════════════
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;

  if (!credentialsService.isUserVerified(chatId)) {
    bot.sendMessage(chatId, `❌ Anda belum terverifikasi.`);
    return;
  }

  const info = config.getInfo();
  const statusMessage = `📊 **STATUS BOT**

🌍 Environment: ${info.environment.toUpperCase()}
📡 Mode: ${info.mode}
🔌 Webhook: ${info.mode === 'WEBHOOK' ? '✅ Active' : 'N/A'}
⏲️ Polling: ${info.pollingEnabled ? '✅ Active' : '❌ Inactive'}
⏰ Timestamp: ${new Date().toISOString()}`;

  bot.sendMessage(chatId, statusMessage);
});

// ═══════════════════════════════════════════════
// COMMAND: /logout - Logout
// ═══════════════════════════════════════════════
bot.onText(/\/logout/, (msg) => {
  const chatId = msg.chat.id;

  if (!credentialsService.isUserVerified(chatId)) {
    bot.sendMessage(chatId, `❌ Anda belum terverifikasi.`);
    return;
  }

  credentialsService.removeVerifiedUser(chatId);
  bot.sendMessage(chatId, `👋 Anda telah logout.\n\nKetik /start untuk login kembali.`);
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
    bot.sendMessage(chatId, `❌ Anda belum terverifikasi.\n\nGunakan /start untuk mulai.`);
    return;
  }

  console.log(`💬 [MESSAGE] Chat ${chatId}: ${text}`);
  bot.sendMessage(chatId, `💬 Anda mengatakan: "${text}"`);
});

// ═══════════════════════════════════════════════
// ERROR HANDLER
// ═══════════════════════════════════════════════
bot.on('polling_error', (error) => {
  console.error('❌ [POLLING ERROR]:', error.message);
});

// ═══════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════

if (config.nodeEnv === 'prod') {
  // Production - Express server
  app.listen(config.webhook.port, config.webhook.host, () => {
    console.log(`🚀 Express server listen di ${config.webhook.host}:${config.webhook.port}`);
    console.log(`📡 Webhook mode AKTIF`);
    console.log(`🔐 Credentials verification ENABLED`);
  });
} else {
  // Development - Polling only
  console.log(`🚀 Bot polling mode AKTIF`);
  console.log(`🔐 Credentials verification ENABLED`);
  console.log(`✅ Bot siap menerima pesan (Localhost)`);
}

console.log('\n═══════════════════════════════════════════════');
console.log('🤖 BOT SIAP DIGUNAKAN');
console.log('═══════════════════════════════════════════════\n');