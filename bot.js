const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const COOLIFY_API = process.env.COOLIFY_API_URL;
const COOLIFY_TOKEN = process.env.COOLIFY_API_TOKEN;

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

bot.launch();