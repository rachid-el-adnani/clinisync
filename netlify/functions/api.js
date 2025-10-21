// Netlify Function to handle all API requests
const serverless = require('serverless-http');
const app = require('../../src/app');

// Export the serverless function
exports.handler = serverless(app);

