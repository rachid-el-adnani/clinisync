const db = require('../config/database');

class ClinicsDAL {
  /**
   * Create a new clinic
   */
  async create(clinicData) {
    const { name, primary_color } = clinicData;
    const [result] = await db.execute(
      'INSERT INTO clinics (name, primary_color) VALUES (?, ?)',
      [name, primary_color || '#3B82F6']
    );
    return result.insertId;
  }

  /**
   * Find clinic by ID
   */
  async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM clinics WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find clinic by name
   */
  async findByName(name) {
    const [rows] = await db.execute(
      'SELECT * FROM clinics WHERE name = ?',
      [name]
    );
    return rows[0] || null;
  }

  /**
   * Get all clinics
   */
  async findAll() {
    const [rows] = await db.execute('SELECT * FROM clinics ORDER BY name');
    return rows;
  }

  /**
   * Update clinic
   */
  async update(id, clinicData) {
    const fields = [];
    const values = [];
    
    if (clinicData.name !== undefined) {
      fields.push('name = ?');
      values.push(clinicData.name);
    }
    
    if (clinicData.primary_color !== undefined) {
      fields.push('primary_color = ?');
      values.push(clinicData.primary_color);
    }
    
    if (clinicData.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(clinicData.is_active);
    }
    
    if (fields.length === 0) {
      return false;
    }
    
    values.push(id);
    
    const [result] = await db.execute(
      `UPDATE clinics SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete clinic (cascade deletes all related data)
   */
  async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM clinics WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new ClinicsDAL();

