const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
  console.log('=================================================');
  console.log('  CliniSync - Your Secure Foundation for Wellness');
  console.log('=================================================');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}`);
  console.log('=================================================');
  console.log('\nAvailable Endpoints:');
  console.log('  GET  /health');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/register-clinic (system_admin only)');
  console.log('  POST /api/auth/create-staff (clinic_admin only)');
  console.log('  GET  /api/patients');
  console.log('  POST /api/patients');
  console.log('  POST /api/sessions/create-series');
  console.log('  PUT  /api/sessions/:sessionId/reschedule');
  console.log('=================================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;

