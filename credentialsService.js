const config = require('./config');

/**
 * Service untuk verifikasi credentials Coolify
 */
const credentialsService = {
  /**
   * Verifikasi credentials yang diberikan user
   * @param {string} apiToken - API Token yang dikirim user
   * @param {string} apiKey - API Key yang dikirim user
   * @returns {boolean} - True jika credentials valid
   */
  verify(apiToken, apiKey) {
    const isTokenValid = apiToken === config.coolify.apiToken;
    const isKeyValid = apiKey === config.coolify.apiKey;

    console.log(`🔐 [VERIFY] Token valid: ${isTokenValid}, Key valid: ${isKeyValid}`);

    return isTokenValid && isKeyValid;
  },

  /**
   * Format pesan untuk meminta credentials
   */
  getCredentialsPromptMessage() {
    return `🔐 **VERIFIKASI COOLIFY REQUIRED**

Untuk menggunakan bot ini, Anda harus memberikan credentials Coolify.

Format:
\`\`\`
/verify <API_TOKEN> <API_KEY>
\`\`\`

Contoh:
\`\`\`
/verify token123 key456
\`\`\`

⚠️ Hanya user dengan credentials yang tepat yang bisa menggunakan bot ini.`;
  },

  /**
   * Cek apakah user sudah verified (dalam session)
   * Nota: Ini simple. Di production bisa pakai database
   */
  verifiedUsers: new Set(),

  addVerifiedUser(chatId) {
    this.verifiedUsers.add(chatId);
    console.log(`✅ [VERIFIED] Chat ID ${chatId} sudah terverifikasi`);
  },

  isUserVerified(chatId) {
    return this.verifiedUsers.has(chatId);
  },

  removeVerifiedUser(chatId) {
    this.verifiedUsers.delete(chatId);
    console.log(`❌ [UNVERIFIED] Chat ID ${chatId} dihapus dari verifikasi`);
  },

  getAllVerifiedUsers() {
    return Array.from(this.verifiedUsers);
  },
};

module.exports = credentialsService;