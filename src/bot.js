/**
 * Telegram Bot Configuration
 * Main bot setup with all middleware and handlers
 */

import { Telegraf, session } from 'telegraf';
import 'dotenv/config';
import { registerDrawHandlers } from './handlers/drawHandler.js';
import { getStorageStats } from './utils/storage.js';

// Validate required environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!BOT_TOKEN) {
    console.error('❌ Error: BOT_TOKEN is required in .env file');
    process.exit(1);
}

if (!OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY is required in .env file');
    process.exit(1);
}

// Initialize Telegraf bot with long-polling
const bot = new Telegraf(BOT_TOKEN, {
    handlerTimeout: 120000, // 2 minute timeout for long operations
});

// Enable session middleware for conversation state
bot.use(session());

/**
 * Bot ready event
 * Triggered when bot successfully connects to Telegram API
 */
bot.launch(() => {
    console.log('═══════════════════════════════════════════');
    console.log('🤖  Telegram DALL-E 3 Bot Successfully Started!');
    console.log('═══════════════════════════════════════════');
    console.log(`📡 Connection: Long-polling (Local)`);
    console.log(`⏰ Started at: ${new Date().toLocaleString('id-ID')}`);
    
    const stats = getStorageStats(process.env.STORAGE_DIR || './local_storage');
    console.log(`💾 Storage: ${stats.totalFiles} files (${stats.totalSizeFormatted})`);
    console.log('═══════════════════════════════════════════');
    console.log('📋 Available Commands:');
    console.log('   /draw [prompt]  - Generate image with DALL-E 3');
    console.log('   /help           - Show help information');
    console.log('   /stats          - Show storage statistics');
    console.log('═══════════════════════════════════════════');
});

// Register command handlers
registerDrawHandlers(bot);

/**
 * /help command handler
 * Shows available commands and usage tips
 */
bot.command('help', async (ctx) => {
    const helpMessage = `
🤖 *Panduan Bot Gambar DALL-E 3*

📋 *Perintah yang Tersedia:*

🖼️ `/draw` [deskripsi] - Membuat gambar dari deskripsi teks
   • Pilih rasio aspek (Square, Portrait, Landscape)
   • Gambar akan otomatis disimpan ke lokal

📊 `/stats` - Statistik penyimpanan
   • Lihat total file dan ukuran storage

❓ `/help` - Menampilkan pesan bantuan ini

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 *Tips Penggunaan:*
• Gunakan deskripsi yang detail dan spesifik
• Contoh: \`/draw kucing orange lucu bermain bola\`
• Gambar disimpan otomatis ke folder \`local_storage\`

⚠️ *Batasan:*
• Maksimal 400 karakter untuk prompt
• Resolusi tersedia: 1024x1024, 1024x1792, 1792x1024
`;
    await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
});

/**
 * /stats command handler
 * Shows storage statistics
 */
bot.command('stats', async (ctx) => {
    const stats = getStorageStats(process.env.STORAGE_DIR || './local_storage');
    
    const statsMessage = `
📊 *Statistik Penyimpanan*

📁 Total File: *${stats.totalFiles}* gambar
💾 Ukuran Total: *${stats.totalSizeFormatted}*

📂 Lokasi: \`${process.env.STORAGE_DIR || './local_storage'}/YYYY-MM-DD/\`
`;
    await ctx.reply(statsMessage, { parse_mode: 'Markdown' });
});

/**
 * Handle text messages (non-command)
 * Provides helpful feedback when user sends plain text
 */
bot.on('text', async (ctx) => {
    // Ignore messages from groups where bot is not mentioned (optional)
    // Uncomment below if you want to ignore group messages
    // if (ctx.chat.type !== 'private' && !ctx.message.text.includes(ctx.botInfo.username)) {
    //     return;
    // }

    await ctx.reply(
        '👋 Gunakan perintah `/draw [deskripsi]` untuk membuat gambar.\n\n' +
        '📝 *Contoh:* `/draw kucing lucu dengan topi`\n\n' +
        'Ketik `/help` untuk panduan lengkap.',
        { parse_mode: 'Markdown' }
    );
});

/**
 * Handle sticker messages
 */
bot.on('sticker', async (ctx) => {
    await ctx.reply('👍 Stikernya bagus! Tapi saya butuh deskripsi teks untuk membuat gambar. Gunakan `/draw [deskripsi]` 🎨');
});

/**
 * Handle photo messages
 */
bot.on('photo', async (ctx) => {
    await ctx.reply('📸 Foto yang bagus! Tapi saya butuh deskripsi teks untuk membuat gambar baru. Gunakan `/draw [deskripsi]` 🎨');
});

/**
 * Graceful shutdown handler
 * Catches SIGINT and SIGTERM for clean exit
 */
const shutdown = () => {
    console.log('\n\n🛑 Shutting down bot gracefully...');
    bot.stop('SIGINT');
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default bot;