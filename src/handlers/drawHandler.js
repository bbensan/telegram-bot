/**
 * Draw Command Handler
 * Handles /draw command with inline keyboard for aspect ratio selection
 */

import { Telegraf, Markup } from 'telegraf';
import path from 'path';
import { generateImage, ASPECT_RATIOS } from '../utils/openaiClient.js';
import { downloadAndSaveImage } from '../utils/storage.js';

/**
 * Create inline keyboard for aspect ratio selection
 * @param {string} prompt - The original prompt for image generation
 * @returns {Object} - Telegraf inline keyboard markup
 */
function createAspectRatioKeyboard(prompt) {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback('🟢 Square (1:1)', `draw_square`),
            Markup.button.callback('📱 Portrait (9:16)', `draw_portrait`),
        ],
        [
            Markup.button.callback('🌄 Landscape (16:9)', `draw_landscape`),
        ],
    ]);
}

/**
 * Register draw command and callback handlers
 * @param {Telegraf} bot - Telegraf bot instance
 */
export function registerDrawHandlers(bot) {
    /**
     * /draw command handler
     * Shows aspect ratio selection keyboard
     */
    bot.command('draw', async (ctx) => {
        const args = ctx.message.text.replace('/draw', '').trim();

        // Validate prompt
        if (!args) {
            return ctx.reply(
                '❌ *Penggunaan:* `/draw [deskripsi gambar]`\n\n' +
                '📝 *Contoh:* `/draw kucing orange lucu dengan topi`\n\n' +
                'Pilih rasio aspek di bawah setelah mengirim deskripsi.',
                { parse_mode: 'Markdown' }
            );
        }

        if (args.length < 3) {
            return ctx.reply('⚠️ Deskripsi terlalu pendek. Mohon berikan deskripsi yang lebih detail.');
        }

        if (args.length > 400) {
            return ctx.reply('⚠️ Deskripsi terlalu panjang. Maksimal 400 karakter.');
        }

        const prompt = args;

        // Store prompt in session for callback handler
        if (!ctx.session) ctx.session = {};
        ctx.session.pendingPrompt = prompt;

        console.log(`\n🎨 New /draw request from ${ctx.from.username || ctx.from.id}`);
        console.log(`📝 Prompt: "${prompt}"`);

        // Show aspect ratio selection keyboard
        await ctx.replyWithMarkdown(
            `🎨 *Sedang memproses:*\n` +
            `_"${prompt}"_\n\n` +
            `📐 *Pilih rasio aspek:*`,
            createAspectRatioKeyboard(prompt)
        );
    });

    /**
     * Callback query handler for aspect ratio selection
     * Handles all draw callback queries
     */
    bot.action(/^draw_(\w+)$/, async (ctx) => {
        const match = ctx.match;
        const aspectKey = match[1];

        // Get prompt from session
        const prompt = ctx.session?.pendingPrompt;
        if (!prompt) {
            return ctx.answerCbQuery('⚠️ Session expired. Please send /draw again.');
        }

        const aspectRatio = ASPECT_RATIOS[aspectKey]?.value || '1024x1024';

        console.log(`\n🎨 Generating image...`);
        console.log(`📝 Prompt: "${prompt}"`);
        console.log(`📐 Aspect Ratio: ${aspectRatio}`);

        // Show loading indicator
        await ctx.answerCbQuery('🎨 Membuat gambar...');
        
        // Edit original message to show processing status
        await ctx.editMessageText(
            `⏳ *Sedang Membuat Gambar*\n\n` +
            `📝 Prompt: _"${prompt}"_\n` +
            `📐 Rasio: ${aspectRatio}\n\n` +
            `Mohon tunggu beberapa saat...`,
            { parse_mode: 'Markdown' }
        );

        try {
            // Step 1: Generate image with DALL-E 3
            const imageUrl = await generateImage(prompt, aspectRatio);

            // Step 2: Download and save to local storage
            const storageDir = process.env.STORAGE_DIR || './local_storage';
            const savedFile = await downloadAndSaveImage(imageUrl, storageDir);

            // Step 3: Send image back to user
            await ctx.replyWithPhoto(
                { source: savedFile.filePath },
                {
                    caption: 
                        `✅ *Gambar Berhasil Dibuat!*\n\n` +
                        `📝 Prompt: _"${prompt}"_\n` +
                        `📐 Ukuran: ${aspectRatio}\n` +
                        `💾 Tersimpan: \`./${path.relative('.', savedFile.filePath)}\`\n` +
                        `📦 Ukuran file: ${(savedFile.size / 1024).toFixed(2)} KB`,
                    parse_mode: 'Markdown',
                }
            );

            // Update processing message
            await ctx.editMessageText(
                `✅ *Gambar Berhasil Dibuat dan Disimpan!*\n\n` +
                `📝 Prompt: _"${prompt}"_\n` +
                `📐 Ukuran: ${aspectRatio}\n` +
                `💾 Lokasi: \`./${path.relative('.', savedFile.filePath)}\``,
                { parse_mode: 'Markdown' }
            );

            console.log(`✅ Image sent to user and saved locally`);

        } catch (error) {
            console.error(`❌ Error:`, error.message);
            
            // Send error message
            await ctx.reply(error.message);
            
            // Update processing message
            await ctx.editMessageText(
                `❌ *Gagal Membuat Gambar*\n\n` +
                `${error.message}\n\n` +
                `Silakan coba lagi dengan deskripsi yang berbeda.`,
                { parse_mode: 'Markdown' }
            );
        }
    });
}