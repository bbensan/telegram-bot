/**
 * OpenAI Client Configuration
 * Handles DALL-E 3 image generation with proper error handling
 */

import OpenAI from 'openai';
import 'dotenv/config';

// Initialize OpenAI client with API key from environment
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Aspect ratio options for DALL-E 3
 * DALL-E 3 supports: 1024x1024, 1024x1792, 1792x1024
 */
export const ASPECT_RATIOS = {
    square: { label: '⬜ Square (1:1)', value: '1024x1024' },
    portrait: { label: '📱 Portrait (9:16)', value: '1024x1792' },
    landscape: { label: '🖼️ Landscape (16:9)', value: '1792x1024' },
};

/**
 * Generate image using DALL-E 3
 * @param {string} prompt - The image description
 * @param {string} aspectRatio - Desired aspect ratio (e.g., '1024x1024')
 * @returns {Promise<string>} - URL of the generated image
 * @throws {Error} - When API fails or content policy violated
 */
export async function generateImage(prompt, aspectRatio = '1024x1024') {
    try {
        console.log(`🎨 Generating image with prompt: "${prompt}" (${aspectRatio})`);

        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: aspectRatio,
            quality: 'standard', // 'standard' or 'hd'
            response_format: 'url',
        });

        // Extract the temporary URL from response
        const imageUrl = response.data[0].url;
        const revisedPrompt = response.data[0].revised_prompt;

        console.log(`✅ Image generated successfully`);
        console.log(`📝 Revised prompt: "${revisedPrompt}"`);

        return imageUrl;

    } catch (error) {
        // Handle specific OpenAI API errors
        if (error.status === 400) {
            if (error.code === 'content_policy_violation') {
                throw new Error('⚠️ Maaf, prompt Anda melanggar kebijakan konten OpenAI. Silakan gunakan deskripsi lain.');
            }
            throw new Error('⚠️ Request tidak valid. Mohon periksa kembali prompt Anda.');
        }

        if (error.status === 401) {
            throw new Error('⚠️ Konfigurasi API OpenAI tidak valid. Mohon periksa API key Anda.');
        }

        if (error.status === 429) {
            throw new Error('⚠️ Batas penggunaan tercapai. Mohon tunggu sebentar dan coba lagi.');
        }

        if (error.status === 500) {
            throw new Error('⚠️ Server OpenAI sedang mengalami gangguan. Mohon coba lagi nanti.');
        }

        // Generic error
        console.error('❌ OpenAI API Error:', error.message);
        throw new Error(`⚠️ Gagal membuat gambar: ${error.message}`);
    }
}

export default openai;