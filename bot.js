const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('YOUR_BOT_TOKEN');
const COOLIFY_API = 'https://your-coolify-domain/api';
const COOLIFY_TOKEN = 'your-coolify-token';

// Command /apps - Lihat aplikasi aktif
bot.command('apps', async (ctx) => {
  try {
    const response = await axios.get(`${COOLIFY_API}/applications`, {
      headers: { 'Authorization': `Bearer ${COOLIFY_TOKEN}` }
    });
    
    let message = '📦 Aplikasi Aktif:\n\n';
    response.data.forEach(app => {
      message += `• ${app.name} - ${app.status}\n`;
    });
    
    ctx.reply(message);
  } catch (error) {
    ctx.reply('❌ Gagal mengambil data');
  }
});

bot.launch();