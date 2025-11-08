const db = require('../config/database');
const { getTenantFilter } = require('../middleware/tenantIsolation');

class SessionsDAL {
  /**
   * Create a new session
   */
  async create(sessionData) {
    const {
      clinic_id,
      patient_id,
      therapist_id,
      start_time,
      duration_minutes,
      status,
      periodicity,
      is_follow_up,
      parent_session_id,
      series_order,
      notes
    } = sessionData;

    const [result] = await db.execute(
      `INSERT INTO sessions 
       (clinic_id, patient_id, therapist_id, start_time, duration_minutes, status, 
        periodicity, is_follow_up, parent_session_id, series_order, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clinic_id,
        patient_id,
        therapist_id,
        start_time,
        duration_minutes || 60,
        status || 'scheduled',
        periodicity || 'None',
        is_follow_up || false,
        parent_session_id || null,
        series_order || 0,
        notes || null
      ]
    );

    return result.insertId;
  }

  /**
   * Create multiple sessions in a transaction (for series creation)
   */
  async createBatch(sessionsData) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const insertedIds = [];
      
      for (const sessionData of sessionsData) {
        const {
          clinic_id,
          patient_id,
          therapist_id,
          start_time,
          duration_minutes,
          status,
          periodicity,
          is_follow_up,
          parent_session_id,
          series_order,
          notes
        } = sessionData;

        const [result] = await connection.execute(
          `INSERT INTO sessions 
           (clinic_id, patient_id, therapist_id, start_time, duration_minutes, status, 
            periodicity, is_follow_up, parent_session_id, series_order, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            clinic_id,
            patient_id,
            therapist_id,
            start_time,
            duration_minutes || 60,
            status || 'scheduled',
            periodicity || 'None',
            is_follow_up || false,
            parent_session_id || null,
            series_order || 0,
            notes || null
          ]
        );
        
        insertedIds.push(result.insertId);
      }
      
      await connection.commit();
      return insertedIds;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Find session by ID with tenant filtering
   */
  async findById(id, tenantContext) {
    const { filter, params } = getTenantFilter(tenantContext);

    let query = `SELECT s.*, 
                 p.first_name as patient_first_name, p.last_name as patient_last_name,
                 u.first_name as therapist_first_name, u.last_name as therapist_last_name
                 FROM sessions s
                 LEFT JOIN patients p ON s.patient_id = p.id
                 LEFT JOIN users u ON s.therapist_id = u.id
                 WHERE s.id = ?`;
    const queryParams = [id];

    if (filter) {
      query += ` AND s.${filter}`;
      queryParams.push(...params);
    }

    const [rows] = await db.execute(query, queryParams);
    return rows[0] || null;
  }

  /**
   * Find all sessions with tenant filtering
   */
  async findAll(tenantContext, filters = {}) {
    const { filter, params } = getTenantFilter(tenantContext);

    let query = `SELECT s.*, 
                 p.first_name as patient_first_name, p.last_name as patient_last_name,
                 u.first_name as therapist_first_name, u.last_name as therapist_last_name
                 FROM sessions s
                 LEFT JOIN patients p ON s.patient_id = p.id
                 LEFT JOIN users u ON s.therapist_id = u.id`;
    const queryParams = [];

    const whereClauses = [];
    
    if (filter) {
      whereClauses.push(`s.${filter}`);
      queryParams.push(...params);
    }

    // Additional filters
    if (filters.patient_id) {
      whereClauses.push('s.patient_id = ?');
      queryParams.push(filters.patient_id);
    }

    if (filters.therapist_id) {
      whereClauses.push('s.therapist_id = ?');
      queryParams.push(filters.therapist_id);
    }

    if (filters.status) {
      whereClauses.push('s.status = ?');
      queryParams.push(filters.status);
    }

    if (filters.start_date) {
      whereClauses.push('s.start_time >= ?');
      queryParams.push(filters.start_date);
    }

    if (filters.end_date) {
      whereClauses.push('s.start_time <= ?');
      queryParams.push(filters.end_date);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY s.start_time DESC';

    const [rows] = await db.execute(query, queryParams);
    return rows;
  }

  /**
   * Find all follow-up sessions after a specific session
   */
  async findFollowUpSessions(sessionId, tenantContext) {
    const { filter, params } = getTenantFilter(tenantContext);

    let query = `SELECT * FROM sessions 
                 WHERE parent_session_id = ? AND is_follow_up = true`;
    const queryParams = [sessionId];

    if (filter) {
      query += ` AND ${filter}`;
      queryParams.push(...params);
    }

    query += ' ORDER BY series_order ASC';

    const [rows] = await db.execute(query, queryParams);
    return rows;
  }

  /**
   * Find session series (parent + all follow-ups)
   */
  async findSeriesByParentId(parentSessionId, tenantContext) {
    const { filter, params } = getTenantFilter(tenantContext);

    let query = `SELECT * FROM sessions 
                 WHERE (id = ? OR parent_session_id = ?)`;
    const queryParams = [parentSessionId, parentSessionId];

    if (filter) {
      query += ` AND ${filter}`;
      queryParams.push(...params);
    }

    query += ' ORDER BY series_order ASC';

    const [rows] = await db.execute(query, queryParams);
    return rows;
  }

  /**
   * Update session
   */
  async update(id, sessionData, tenantContext) {
    // First verify the session belongs to the tenant
    const session = await this.findById(id, tenantContext);
    if (!session) {
      return false;
    }

    const fields = [];
    const values = [];

    const allowedFields = [
      'start_time', 'duration_minutes', 'status', 
      'periodicity', 'notes', 'therapist_id'
    ];

    for (const field of allowedFields) {
      if (sessionData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(sessionData[field]);
      }
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);

    const [result] = await db.execute(
      `UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Update multiple sessions in a transaction (for cascade reschedule)
   */
  async updateBatch(updates) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      for (const { id, data } of updates) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(data)) {
          fields.push(`${key} = ?`);
          values.push(value);
        }

        if (fields.length > 0) {
          values.push(id);
          await connection.execute(
            `UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`,
            values
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete session
   */
  async delete(id, tenantContext) {
    const { filter, params } = getTenantFilter(tenantContext);

    let query = 'DELETE FROM sessions WHERE id = ?';
    const queryParams = [id];

    if (filter) {
      query += ` AND ${filter}`;
      queryParams.push(...params);
    }

    const [result] = await db.execute(query, queryParams);
    return result.affectedRows > 0;
  }

  /**
   * Delete entire series (parent + all follow-ups)
   */
  async deleteSeries(parentSessionId, tenantContext) {
    const { filter, params } = getTenantFilter(tenantContext);

    let query = 'DELETE FROM sessions WHERE (id = ? OR parent_session_id = ?)';
    const queryParams = [parentSessionId, parentSessionId];

    if (filter) {
      query += ` AND ${filter}`;
      queryParams.push(...params);
    }

    const [result] = await db.execute(query, queryParams);
    return result.affectedRows > 0;
  }
}

module.exports = new SessionsDAL();

