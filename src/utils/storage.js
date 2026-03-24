/**
 * Storage Utilities
 * Handles local file system operations for image persistence
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

// Get current directory (ES Module compatibility)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get today's date formatted as YYYY-MM-DD
 * @returns {string} - Formatted date string
 */
function getDateFolder() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Full path to directory
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Directory created: ${dirPath}`);
    }
}

/**
 * Build storage directory path
 * @param {string} baseDir - Base storage directory
 * @returns {string} - Full path to today's folder
 */
export function buildStoragePath(baseDir = './local_storage') {
    const dateFolder = getDateFolder();
    const fullPath = path.join(baseDir, dateFolder);
    return fullPath;
}

/**
 * Download image from URL and save to local storage
 * Uses Axios streams for efficient binary data transfer
 * 
 * @param {string} imageUrl - URL of the image to download
 * @param {string} storageDir - Base storage directory
 * @returns {Promise<{filePath: string, fileName: string}>} - Saved file information
 */
export async function downloadAndSaveImage(imageUrl, storageDir) {
    try {
        // Create directory structure: baseDir/YYYY-MM-DD/
        const fullStoragePath = buildStoragePath(storageDir);
        ensureDirectoryExists(fullStoragePath);

        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const fileName = `IMG_${timestamp}.png`;
        const filePath = path.join(fullStoragePath, fileName);

        console.log(`📥 Starting download from: ${imageUrl}`);
        console.log(`💾 Target location: ${filePath}`);

        // Initialize Axios GET request with stream response
        const response = await axios({
            method: 'get',
            url: imageUrl,
            responseType: 'stream',
            timeout: 30000, // 30 second timeout
            headers: {
                'User-Agent': 'Telegram-DALLE-Bot/1.0',
            },
        });

        // Verify content type is an image
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
            throw new Error(`Invalid content type: ${contentType}`);
        }

        // Create write stream for local file
        const writer = fs.createWriteStream(filePath);

        // Pipe incoming stream data directly to file
        await new Promise((resolve, reject) => {
            response.data.pipe(writer);
            
            writer.on('finish', resolve);
            writer.on('error', (err) => {
                // Clean up partial file on error
                fs.unlink(filePath, () => {});
                reject(err);
            });
        });

        // Verify file was written successfully
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
            fs.unlinkSync(filePath);
            throw new Error('Downloaded file is empty');
        }

        console.log(`✅ Image saved successfully!`);
        console.log(`📦 File size: ${(stats.size / 1024).toFixed(2)} KB`);

        return {
            filePath,
            fileName,
            size: stats.size,
            date: getDateFolder(),
        };

    } catch (error) {
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw new Error('⚠️ Tidak dapat mengakses URL gambar. Server mungkin sedang down.');
        }

        if (error.code === 'EACCES') {
            throw new Error('⚠️ Tidak memiliki izin untuk menulis di direktori storage.');
        }

        if (error.code === 'ETIMEDOUT') {
            throw new Error('⚠️ Download timeout. koneksi internet mungkin lambat.');
        }

        console.error('❌ Storage Error:', error.message);
        throw new Error(`⚠️ Gagal menyimpan gambar: ${error.message}`);
    }
}

/**
 * Get total storage statistics
 * @param {string} storageDir - Base storage directory
 * @returns {Object} - Storage statistics
 */
export function getStorageStats(storageDir = './local_storage') {
    try {
        let totalFiles = 0;
        let totalSize = 0;

        if (!fs.existsSync(storageDir)) {
            return { totalFiles: 0, totalSize: 0, totalSizeFormatted: '0 KB' };
        }

        // Recursive function to count files
        function countFiles(dir) {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stats = fs.statSync(fullPath);
                
                if (stats.isDirectory()) {
                    countFiles(fullPath);
                } else if (stats.isFile() && /\.(png|jpg|jpeg|webp)$/i.test(item)) {
                    totalFiles++;
                    totalSize += stats.size;
                }
            }
        }

        countFiles(storageDir);

        // Format size to human readable
        let sizeFormatted;
        if (totalSize < 1024) {
            sizeFormatted = `${totalSize} B`;
        } else if (totalSize < 1024 * 1024) {
            sizeFormatted = `${(totalSize / 1024).toFixed(2)} KB`;
        } else {
            sizeFormatted = `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
        }

        return {
            totalFiles,
            totalSize,
            totalSizeFormatted: sizeFormatted,
        };
    } catch (error) {
        console.error('❌ Error getting storage stats:', error.message);
        return { totalFiles: 0, totalSize: 0, totalSizeFormatted: '0 KB' };
    }
}