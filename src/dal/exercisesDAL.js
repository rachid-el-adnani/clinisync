const pool = require('../config/database');

class ExercisesDAL {
  /**
   * Create a new exercise
   */
  async create(data) {
    const { clinic_id, name, description, instructions, video_url, image_url, body_part, difficulty } = data;
    const [result] = await pool.execute(
      `INSERT INTO exercise_library 
       (clinic_id, name, description, instructions, video_url, image_url, body_part, difficulty) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [clinic_id, name, description, instructions, video_url, image_url, body_part, difficulty]
    );
    return result.insertId;
  }

  /**
   * Find all exercises (system-wide + clinic-specific)
   */
  async findAll(clinicId) {
    const [rows] = await pool.execute(
      'SELECT * FROM exercise_library WHERE (clinic_id IS NULL OR clinic_id = ?) AND is_active = TRUE ORDER BY name',
      [clinicId]
    );
    return rows;
  }

  /**
   * Find exercise by ID
   */
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM exercise_library WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Update exercise
   */
  async update(id, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.instructions !== undefined) {
      fields.push('instructions = ?');
      values.push(data.instructions);
    }
    if (data.video_url !== undefined) {
      fields.push('video_url = ?');
      values.push(data.video_url);
    }
    if (data.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(data.image_url);
    }
    if (data.body_part !== undefined) {
      fields.push('body_part = ?');
      values.push(data.body_part);
    }
    if (data.difficulty !== undefined) {
      fields.push('difficulty = ?');
      values.push(data.difficulty);
    }

    if (fields.length === 0) return;

    values.push(id);

    await pool.execute(
      `UPDATE exercise_library SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * Prescribe exercise to treatment plan
   */
  async prescribeExercise(data) {
    const { treatment_plan_id, exercise_id, sets, reps, frequency_per_week, instructions } = data;
    const [result] = await pool.execute(
      `INSERT INTO prescribed_exercises 
       (treatment_plan_id, exercise_id, sets, reps, frequency_per_week, instructions) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [treatment_plan_id, exercise_id, sets, reps, frequency_per_week, instructions]
    );
    return result.insertId;
  }

  /**
   * Get prescribed exercises for treatment plan
   */
  async getPrescribedExercises(treatmentPlanId) {
    const [rows] = await pool.execute(
      `SELECT pe.*, el.name, el.description, el.instructions as default_instructions, 
        el.video_url, el.image_url, el.body_part, el.difficulty
       FROM prescribed_exercises pe
       JOIN exercise_library el ON pe.exercise_id = el.id
       WHERE pe.treatment_plan_id = ? AND pe.is_active = TRUE
       ORDER BY pe.created_at`,
      [treatmentPlanId]
    );
    return rows;
  }

  /**
   * Update prescribed exercise
   */
  async updatePrescribedExercise(id, data) {
    const fields = [];
    const values = [];

    if (data.sets !== undefined) {
      fields.push('sets = ?');
      values.push(data.sets);
    }
    if (data.reps !== undefined) {
      fields.push('reps = ?');
      values.push(data.reps);
    }
    if (data.frequency_per_week !== undefined) {
      fields.push('frequency_per_week = ?');
      values.push(data.frequency_per_week);
    }
    if (data.instructions !== undefined) {
      fields.push('instructions = ?');
      values.push(data.instructions);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active);
    }

    if (fields.length === 0) return;

    values.push(id);

    await pool.execute(
      `UPDATE prescribed_exercises SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * Delete prescribed exercise
   */
  async deletePrescribedExercise(id) {
    await pool.execute('DELETE FROM prescribed_exercises WHERE id = ?', [id]);
  }
}

module.exports = new ExercisesDAL();

