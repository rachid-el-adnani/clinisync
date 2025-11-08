/**
 * Generate display IDs for different entity types
 * Format: CS-{TYPE}{NUMBER}
 * Examples: CS-C00001, CS-U00001, CS-P00001
 */

const db = require('../config/database');

/**
 * Get the next display ID for a given table and prefix
 * @param {string} table - The table name (clinics, users, patients)
 * @param {string} prefix - The prefix (C for clinics, U for users, P for patients)
 * @returns {Promise<string>} The next display ID
 */
async function getNextDisplayId(table, prefix) {
  const [rows] = await db.query(
    `SELECT MAX(CAST(SUBSTRING(display_id, 5) AS UNSIGNED)) as max_num 
     FROM ${table} 
     WHERE display_id LIKE ?`,
    [`CS-${prefix}%`]
  );
  
  const maxNum = rows[0]?.max_num || 0;
  const nextNum = maxNum + 1;
  
  return `CS-${prefix}${String(nextNum).padStart(5, '0')}`;
}

/**
 * Generate display ID for a clinic
 */
async function generateClinicDisplayId() {
  return getNextDisplayId('clinics', 'C');
}

/**
 * Generate display ID for a user
 */
async function generateUserDisplayId() {
  return getNextDisplayId('users', 'U');
}

/**
 * Generate display ID for a patient
 */
async function generatePatientDisplayId() {
  return getNextDisplayId('patients', 'P');
}

module.exports = {
  generateClinicDisplayId,
  generateUserDisplayId,
  generatePatientDisplayId,
};

