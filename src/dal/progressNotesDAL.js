const pool = require('../config/database');

class ProgressNotesDAL {
  /**
   * Create a new progress note
   */
  async create(data) {
    const { 
      clinic_id, session_id, patient_id, therapist_id, treatment_plan_id,
      subjective, objective, assessment, plan, pain_level 
    } = data;
    
    const [result] = await pool.execute(
      `INSERT INTO progress_notes 
       (clinic_id, session_id, patient_id, therapist_id, treatment_plan_id, 
        subjective, objective, assessment, plan, pain_level) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clinic_id, session_id, patient_id, therapist_id, treatment_plan_id,
       subjective, objective, assessment, plan, pain_level]
    );
    return result.insertId;
  }

  /**
   * Find progress note by session ID
   */
  async findBySessionId(sessionId, tenantContext) {
    const [rows] = await pool.execute(
      `SELECT pn.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        CONCAT(u.first_name, ' ', u.last_name) as therapist_name
       FROM progress_notes pn
       JOIN patients p ON pn.patient_id = p.id
       JOIN users u ON pn.therapist_id = u.id
       WHERE pn.session_id = ? AND pn.clinic_id = ?`,
      [sessionId, tenantContext.clinicId]
    );
    return rows[0] || null;
  }

  /**
   * Find all progress notes for a patient
   */
  async findByPatientId(patientId, tenantContext) {
    const [rows] = await pool.execute(
      `SELECT pn.*, 
        CONCAT(u.first_name, ' ', u.last_name) as therapist_name,
        s.start_time as session_date
       FROM progress_notes pn
       JOIN users u ON pn.therapist_id = u.id
       JOIN sessions s ON pn.session_id = s.id
       WHERE pn.patient_id = ? AND pn.clinic_id = ?
       ORDER BY pn.created_at DESC`,
      [patientId, tenantContext.clinicId]
    );
    return rows;
  }

  /**
   * Find all progress notes for a treatment plan
   */
  async findByTreatmentPlanId(treatmentPlanId, tenantContext) {
    const [rows] = await pool.execute(
      `SELECT pn.*, 
        CONCAT(u.first_name, ' ', u.last_name) as therapist_name,
        s.start_time as session_date
       FROM progress_notes pn
       JOIN users u ON pn.therapist_id = u.id
       JOIN sessions s ON pn.session_id = s.id
       WHERE pn.treatment_plan_id = ? AND pn.clinic_id = ?
       ORDER BY pn.created_at DESC`,
      [treatmentPlanId, tenantContext.clinicId]
    );
    return rows;
  }

  /**
   * Update progress note
   */
  async update(id, data, tenantContext) {
    const fields = [];
    const values = [];

    if (data.subjective !== undefined) {
      fields.push('subjective = ?');
      values.push(data.subjective);
    }
    if (data.objective !== undefined) {
      fields.push('objective = ?');
      values.push(data.objective);
    }
    if (data.assessment !== undefined) {
      fields.push('assessment = ?');
      values.push(data.assessment);
    }
    if (data.plan !== undefined) {
      fields.push('plan = ?');
      values.push(data.plan);
    }
    if (data.pain_level !== undefined) {
      fields.push('pain_level = ?');
      values.push(data.pain_level);
    }

    if (fields.length === 0) return;

    values.push(id, tenantContext.clinicId);

    await pool.execute(
      `UPDATE progress_notes SET ${fields.join(', ')} WHERE id = ? AND clinic_id = ?`,
      values
    );
  }

  /**
   * Delete progress note
   */
  async delete(id, tenantContext) {
    await pool.execute(
      'DELETE FROM progress_notes WHERE id = ? AND clinic_id = ?',
      [id, tenantContext.clinicId]
    );
  }
}

module.exports = new ProgressNotesDAL();

