const config = require('./config');

/**
 * Service for verifying Coolify credentials
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
    return `To use this bot, you must provide your credentials.
    
*Format*:
\`/verify <API_TOKEN> <API_KEY>\`
`;
  },

  /**
   * Check if user is verified (in session)
   * Nota: Ini simple. Di production bisa pakai database
   */
  verifiedUsers: new Set(),

  addVerifiedUser(chatId) {
    this.verifiedUsers.add(chatId);
    console.log(`✅ [VERIFIED] Chat ID ${chatId} is verified`);
  },

  isUserVerified(chatId) {
    return this.verifiedUsers.has(chatId);
  },

  removeVerifiedUser(chatId) {
    this.verifiedUsers.delete(chatId);
    console.log(`❌ [UNVERIFIED] Chat ID ${chatId} removed from verification`);
  },

  getAllVerifiedUsers() {
    return Array.from(this.verifiedUsers);
  },
};

module.exports = credentialsService;