const config = require('./config');

/**
 * Service for verifying credentials
 */
const credentialsService = {
  /**
   * Verify credentials that the user provided
   * @param {string} apiToken - API Token that the user provided
   * @param {string} apiKey - API Key that the user provided
   * @returns {boolean} - True if credentials are valid
   */
  verify(apiToken, apiKey) {
    const isTokenValid = apiToken === config.credentials.apiToken;
    const isKeyValid = apiKey === config.credentials.apiKey;

    console.log(`🔐 [VERIFY] Token valid: ${isTokenValid}, Key valid: ${isKeyValid}`);

    return isTokenValid && isKeyValid;
  },

  /**
   * Format message to request credentials
   */
  getCredentialsPromptMessage() {
    return `To use this bot, you must provide your credentials.

*Format*:
\`/verify <API_TOKEN> <API_KEY>\`
`;
  },

  /**
   * Check if user is verified (in session)
   * Note: This is simple. In production, you can use a database
   */
  verifiedUsers: new Set(),

  addVerifiedUser(chatId) {
    this.verifiedUsers.add(chatId);
    console.log(`✅ [VERIFIED] Chat ID ${chatId} verified`);
  },

  isUserVerified(chatId) {
    return this.verifiedUsers.has(chatId);
  },

  removeVerifiedUser(chatId) {
    this.verifiedUsers.delete(chatId);
    console.log(`❌ [UNVERIFIED] Chat ID ${chatId} removed from verified users`);
  },

  getAllVerifiedUsers() {
    return Array.from(this.verifiedUsers);
  },
};

module.exports = credentialsService;