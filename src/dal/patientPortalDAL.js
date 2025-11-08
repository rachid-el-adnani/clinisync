const pool = require('../config/database');

class PatientPortalDAL {
  /**
   * Create a new patient portal user
   */
  async create(data) {
    const { patient_id, email, password_hash } = data;
    const [result] = await pool.execute(
      'INSERT INTO patient_portal_users (patient_id, email, password_hash) VALUES (?, ?, ?)',
      [patient_id, email, password_hash]
    );
    return result.insertId;
  }

  /**
   * Find patient portal user by email
   */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM patient_portal_users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Find patient portal user by patient ID
   */
  async findByPatientId(patientId) {
    const [rows] = await pool.execute(
      'SELECT * FROM patient_portal_users WHERE patient_id = ?',
      [patientId]
    );
    return rows[0] || null;
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id) {
    await pool.execute(
      'UPDATE patient_portal_users SET last_login = NOW() WHERE id = ?',
      [id]
    );
  }

  /**
   * Update password
   */
  async updatePassword(id, password_hash) {
    await pool.execute(
      'UPDATE patient_portal_users SET password_hash = ? WHERE id = ?',
      [password_hash, id]
    );
  }

  /**
   * Toggle active status
   */
  async toggleStatus(id, is_active) {
    await pool.execute(
      'UPDATE patient_portal_users SET is_active = ? WHERE id = ?',
      [is_active, id]
    );
  }
}

module.exports = new PatientPortalDAL();

