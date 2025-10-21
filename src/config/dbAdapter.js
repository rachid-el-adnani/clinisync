// Database Adapter - Switch between MySQL and Firebase
// TEMPORARY: Set USE_FIREBASE=true for demo, false for production MySQL
require('dotenv').config();

const USE_FIREBASE = process.env.USE_FIREBASE === 'true';

console.log(`📊 Using database: ${USE_FIREBASE ? '🔥 FIREBASE (DEMO)' : '🗄️  MySQL (PRODUCTION)'}`);

let usersDAL, clinicsDAL, patientsDAL, sessionsDAL;

if (USE_FIREBASE) {
  // Use Firebase (Demo mode)
  const firebaseDAL = require('../dal/firebaseDAL');
  usersDAL = firebaseDAL.usersDAL;
  clinicsDAL = firebaseDAL.clinicsDAL;
  patientsDAL = firebaseDAL.patientsDAL;
  sessionsDAL = firebaseDAL.sessionsDAL;
} else {
  // Use MySQL (Production mode)
  usersDAL = require('../dal/usersDAL');
  clinicsDAL = require('../dal/clinicsDAL');
  patientsDAL = require('../dal/patientsDAL');
  sessionsDAL = require('../dal/sessionsDAL');
}

module.exports = {
  usersDAL,
  clinicsDAL,
  patientsDAL,
  sessionsDAL
};

