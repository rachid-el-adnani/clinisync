const pool = require('../config/database');

class TreatmentPlansDAL {
  /**
   * Create a new treatment plan
   */
  async create(data) {
    const { clinic_id, patient_id, therapist_id, title, diagnosis, start_date, end_date, notes } = data;
    const [result] = await pool.execute(
      `INSERT INTO treatment_plans 
       (clinic_id, patient_id, therapist_id, title, diagnosis, start_date, end_date, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [clinic_id, patient_id, therapist_id, title, diagnosis, start_date, end_date, notes]
    );
    return result.insertId;
  }

  /**
   * Find treatment plan by ID
   */
  async findById(id, tenantContext) {
    const [rows] = await pool.execute(
      `SELECT tp.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        CONCAT(u.first_name, ' ', u.last_name) as therapist_name
       FROM treatment_plans tp
       JOIN patients p ON tp.patient_id = p.id
       JOIN users u ON tp.therapist_id = u.id
       WHERE tp.id = ? AND tp.clinic_id = ?`,
      [id, tenantContext.clinicId]
    );
    return rows[0] || null;
  }

  /**
   * Find all treatment plans for a clinic
   */
  async findAll(tenantContext, filters = {}) {
    let query = `
      SELECT tp.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        CONCAT(u.first_name, ' ', u.last_name) as therapist_name
      FROM treatment_plans tp
      JOIN patients p ON tp.patient_id = p.id
      JOIN users u ON tp.therapist_id = u.id
      WHERE tp.clinic_id = ?
    `;
    const params = [tenantContext.clinicId];

    if (filters.patient_id) {
      query += ' AND tp.patient_id = ?';
      params.push(filters.patient_id);
    }

    if (filters.status) {
      query += ' AND tp.status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY tp.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Update treatment plan
   */
  async update(id, data, tenantContext) {
    const fields = [];
    const values = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.diagnosis !== undefined) {
      fields.push('diagnosis = ?');
      values.push(data.diagnosis);
    }
    if (data.end_date !== undefined) {
      fields.push('end_date = ?');
      values.push(data.end_date);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }

    if (fields.length === 0) return;

    values.push(id, tenantContext.clinicId);

    await pool.execute(
      `UPDATE treatment_plans SET ${fields.join(', ')} WHERE id = ? AND clinic_id = ?`,
      values
    );
  }

  /**
   * Delete treatment plan
   */
  async delete(id, tenantContext) {
    await pool.execute(
      'DELETE FROM treatment_plans WHERE id = ? AND clinic_id = ?',
      [id, tenantContext.clinicId]
    );
  }

  /**
   * Add goal to treatment plan
   */
  async addGoal(data) {
    const { treatment_plan_id, goal_text, target_date, notes } = data;
    const [result] = await pool.execute(
      'INSERT INTO treatment_goals (treatment_plan_id, goal_text, target_date, notes) VALUES (?, ?, ?, ?)',
      [treatment_plan_id, goal_text, target_date, notes]
    );
    return result.insertId;
  }

  /**
   * Get goals for treatment plan
   */
  async getGoals(treatmentPlanId) {
    const [rows] = await pool.execute(
      'SELECT * FROM treatment_goals WHERE treatment_plan_id = ? ORDER BY created_at',
      [treatmentPlanId]
    );
    return rows;
  }

  /**
   * Update goal
   */
  async updateGoal(goalId, data) {
    const fields = [];
    const values = [];

    if (data.goal_text !== undefined) {
      fields.push('goal_text = ?');
      values.push(data.goal_text);
    }
    if (data.target_date !== undefined) {
      fields.push('target_date = ?');
      values.push(data.target_date);
    }
    if (data.is_achieved !== undefined) {
      fields.push('is_achieved = ?');
      values.push(data.is_achieved);
      if (data.is_achieved) {
        fields.push('achieved_date = NOW()');
      }
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }

    if (fields.length === 0) return;

    values.push(goalId);

    await pool.execute(
      `UPDATE treatment_goals SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * Delete goal
   */
  async deleteGoal(goalId) {
    await pool.execute('DELETE FROM treatment_goals WHERE id = ?', [goalId]);
  }
}

module.exports = new TreatmentPlansDAL();

