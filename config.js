// ============================================
// AgentForge - Configuration
// config.js
// ============================================

module.exports = {
  // 🔑 INSERT YOUR MANUS AI API KEY HERE
  MANUS_API_KEY: process.env.MANUS_API_KEY || 'sk-jnhFkXT-XtivUH27f1NNxJOuLFMwv0w3o9zCIL8hA1jrIZKpGg-x3MlUIU3x_l-OXOCgDd6Te5PZuspdAZ_6XzS2rmYR',

  // Model to use
  MODEL: 'manus-1',

  // Server port
  PORT: 3000,

  // AI settings
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,

  // Default system prompt
  DEFAULT_SYSTEM: 'You are a helpful, intelligent, and friendly AI assistant. Be concise, clear, and supportive in all responses.',
};
