const { Telegraf } = require('telegraf');
const axios = require('axios');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const COOLIFY_API = process.env.COOLIFY_API_URL;
const COOLIFY_TOKEN = process.env.COOLIFY_API_TOKEN;

// Express app untuk webhook
const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://bot-cdn.cdn-gate.com';

// Command: /start
bot.command('start', (ctx) => {
  const welcomeMessage = `Hello, welcome to CDNGate Notifier Bot 👋
What can I help you today?`;

  ctx.reply(welcomeMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📦 View Apps', callback_data: 'view_apps' },
          { text: '📊 Status', callback_data: 'check_status' }
        ],
        [
          { text: '❓ Help', callback_data: 'show_help' }
        ]
      ]
    }
  });
});

// Command: /apps
bot.command('apps', async (ctx) => {
  try {
    const response = await axios.get(`${COOLIFY_API}/applications`, {
      headers: { 'Authorization': `Bearer ${COOLIFY_TOKEN}` }
    });
    
    let message = '📦 Active Applications:\n\n';
    response.data.forEach(app => {
      message += `• ${app.name} - ${app.status}\n`;
    });
    
    ctx.reply(message);
  } catch (error) {
    ctx.reply('❌ Failed to fetch applications');
  }
});

// Handle button callbacks
bot.action('view_apps', async (ctx) => {
  try {
    const response = await axios.get(`${COOLIFY_API}/applications`, {
      headers: { 'Authorization': `Bearer ${COOLIFY_TOKEN}` }
    });
    
    let message = '📦 Active Applications:\n\n';
    response.data.forEach(app => {
      message += `• ${app.name} - ${app.status}\n`;
    });
    
    ctx.editMessageText(message);
  } catch (error) {
    ctx.answerCbQuery('❌ Failed to fetch applications', true);
  }
});

bot.action('check_status', (ctx) => {
  const statusMessage = `📊 Application Status Check

Please select an application to check its status:`;
  
  ctx.editMessageText(statusMessage, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '⬅️ Back', callback_data: 'back_to_menu' }]
      ]
    }
  });
});

bot.action('show_help', (ctx) => {
  const helpMessage = `❓ Help & Information

Available Features:
📦 View Apps - See all active applications
📊 Status - Check application status
❓ Help - Show this help message

For more information, contact the administrator.`;
  
  ctx.editMessageText(helpMessage, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '⬅️ Back', callback_data: 'back_to_menu' }]
      ]
    }
  });
});

bot.action('back_to_menu', (ctx) => {
  const welcomeMessage = `Hello, welcome to CDNGate Notifier Bot 👋
What can I help you today?`;

  ctx.editMessageText(welcomeMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📦 View Apps', callback_data: 'view_apps' },
          { text: '📊 Status', callback_data: 'check_status' }
        ],
        [
          { text: '❓ Help', callback_data: 'show_help' }
        ]
      ]
    }
  });
});

// Middleware untuk express
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Bot is running ✅' });
});

// Webhook endpoint untuk Telegram
app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body, res);
});

// Setup webhook
async function setupWebhook() {
  try {
    const webhookPath = `/bot${process.env.BOT_TOKEN}`;
    const fullWebhookUrl = `${WEBHOOK_URL}${webhookPath}`;
    
    console.log(`Setting up webhook: ${fullWebhookUrl}`);
    
    await bot.telegram.setWebhook(fullWebhookUrl);
    console.log('✅ Webhook set successfully');
  } catch (error) {
    console.error('❌ Failed to set webhook:', error.message);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🤖 Bot server running on port ${PORT}`);
  await setupWebhook();
});