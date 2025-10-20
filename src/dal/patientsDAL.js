const db = require('../config/database');
const { getTenantFilter } = require('../middleware/tenantIsolation');

class PatientsDAL {
  /**
   * Create a new patient (clinic_id must be provided)
   */
  async create(patientData) {
    const { 
      clinic_id, 
      first_name, 
      last_name, 
      email, 
      phone, 
      date_of_birth, 
      address, 
      medical_notes 
    } = patientData;
    
    const [result] = await db.execute(
      `INSERT INTO patients 
       (clinic_id, first_name, last_name, email, phone, date_of_birth, address, medical_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [clinic_id, first_name, last_name, email, phone, date_of_birth, address, medical_notes]
    );
    
    return result.insertId;
  }

  /**
   * Find patient by ID with tenant filtering
   */
  async findById(id, tenantContext) {
    const { filter, params } = getTenantFilter(tenantContext);
    
    let query = 'SELECT * FROM patients WHERE id = ?';
    const queryParams = [id];
    
    if (filter) {
      query += ` AND ${filter}`;
      queryParams.push(...params);
    }
    
    const [rows] = await db.execute(query, queryParams);
    return rows[0] || null;
  }

  /**
   * Find all patients with tenant filtering
   */
  async findAll(tenantContext) {
    const { filter, params } = getTenantFilter(tenantContext);
    
    let query = 'SELECT * FROM patients';
    
    if (filter) {
      query += ` WHERE ${filter}`;
    }
    
    query += ' ORDER BY last_name, first_name';
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Search patients by name with tenant filtering
   */
  async searchByName(searchTerm, tenantContext) {
    const { filter, params } = getTenantFilter(tenantContext);
    
    let query = `SELECT * FROM patients 
                 WHERE (first_name LIKE ? OR last_name LIKE ?)`;
    const queryParams = [`%${searchTerm}%`, `%${searchTerm}%`];
    
    if (filter) {
      query += ` AND ${filter}`;
      queryParams.push(...params);
    }
    
    query += ' ORDER BY last_name, first_name';
    
    const [rows] = await db.execute(query, queryParams);
    return rows;
  }

  /**
   * Update patient with tenant verification
   */
  async update(id, patientData, tenantContext) {
    // First verify the patient belongs to the tenant
    const patient = await this.findById(id, tenantContext);
    if (!patient) {
      return false;
    }
    
    const fields = [];
    const values = [];
    
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 
      'date_of_birth', 'address', 'medical_notes', 'is_active'
    ];
    
    for (const field of allowedFields) {
      if (patientData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(patientData[field]);
      }
    }
    
    if (fields.length === 0) {
      return false;
    }
    
    values.push(id);
    
    const [result] = await db.execute(
      `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  /**
   * Delete patient with tenant verification
   */
  async delete(id, tenantContext) {
    const { filter, params } = getTenantFilter(tenantContext);
    
    let query = 'DELETE FROM patients WHERE id = ?';
    const queryParams = [id];
    
    if (filter) {
      query += ` AND ${filter}`;
      queryParams.push(...params);
    }
    
    const [result] = await db.execute(query, queryParams);
    return result.affectedRows > 0;
  }

  /**
   * Get patient count for a clinic
   */
  async getCount(tenantContext) {
    const { filter, params } = getTenantFilter(tenantContext);
    
    let query = 'SELECT COUNT(*) as count FROM patients';
    
    if (filter) {
      query += ` WHERE ${filter}`;
    }
    
    const [rows] = await db.execute(query, params);
    return rows[0].count;
  }
}

module.exports = new PatientsDAL();

