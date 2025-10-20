const db = require('../config/database');

class UsersDAL {
  /**
   * Create a new user
   */
  async create(userData) {
    const { clinic_id, role, job_title, email, password_hash, first_name, last_name } = userData;
    
    const [result] = await db.execute(
      `INSERT INTO users (clinic_id, role, job_title, email, password_hash, first_name, last_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [clinic_id, role, job_title || null, email, password_hash, first_name, last_name]
    );
    
    return result.insertId;
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    const [rows] = await db.execute(
      `SELECT id, clinic_id, role, job_title, email, first_name, last_name, is_active, created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find user by email (includes password_hash for authentication)
   */
  async findByEmail(email) {
    const [rows] = await db.execute(
      `SELECT id, clinic_id, role, job_title, email, password_hash, first_name, last_name, is_active
       FROM users WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Find users by clinic ID
   */
  async findByClinicId(clinicId) {
    const [rows] = await db.execute(
      `SELECT id, clinic_id, role, job_title, email, first_name, last_name, is_active, created_at, updated_at
       FROM users WHERE clinic_id = ? ORDER BY last_name, first_name`,
      [clinicId]
    );
    return rows;
  }

  /**
   * Find users by role
   */
  async findByRole(role, clinicId = null) {
    let query = `SELECT id, clinic_id, role, job_title, email, first_name, last_name, is_active
                 FROM users WHERE role = ?`;
    const params = [role];
    
    if (clinicId !== null) {
      query += ' AND clinic_id = ?';
      params.push(clinicId);
    }
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Update user
   */
  async update(id, userData) {
    const fields = [];
    const values = [];
    
    const allowedFields = ['email', 'first_name', 'last_name', 'job_title', 'is_active', 'password_hash'];
    
    for (const field of allowedFields) {
      if (userData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(userData[field]);
      }
    }
    
    if (fields.length === 0) {
      return false;
    }
    
    values.push(id);
    
    const [result] = await db.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  /**
   * Check if email exists
   */
  async emailExists(email) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE email = ?',
      [email]
    );
    return rows[0].count > 0;
  }

  /**
   * Delete user
   */
  async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new UsersDAL();

