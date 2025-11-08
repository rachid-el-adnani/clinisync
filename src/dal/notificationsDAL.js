const pool = require('../config/database');

class NotificationsDAL {
  /**
   * Create a new notification
   */
  async create(data) {
    const { 
      clinic_id, recipient_type, recipient_id, notification_type, channel,
      subject, message, scheduled_for, related_session_id, metadata 
    } = data;
    
    const [result] = await pool.execute(
      `INSERT INTO notifications 
       (clinic_id, recipient_type, recipient_id, notification_type, channel, 
        subject, message, scheduled_for, related_session_id, metadata) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clinic_id, recipient_type, recipient_id, notification_type, channel,
       subject, message, scheduled_for, related_session_id, 
       metadata ? JSON.stringify(metadata) : null]
    );
    return result.insertId;
  }

  /**
   * Find notifications by status and scheduled time (for sending)
   */
  async findPendingNotifications() {
    const [rows] = await pool.execute(
      `SELECT * FROM notifications 
       WHERE status = 'pending' AND scheduled_for <= NOW()
       ORDER BY scheduled_for
       LIMIT 100`
    );
    return rows;
  }

  /**
   * Update notification status
   */
  async updateStatus(id, status, errorMessage = null) {
    if (status === 'sent') {
      await pool.execute(
        'UPDATE notifications SET status = ?, sent_at = NOW() WHERE id = ?',
        [status, id]
      );
    } else {
      await pool.execute(
        'UPDATE notifications SET status = ?, error_message = ? WHERE id = ?',
        [status, errorMessage, id]
      );
    }
  }

  /**
   * Get notification settings for a clinic
   */
  async getSettings(clinicId) {
    const [rows] = await pool.execute(
      'SELECT * FROM notification_settings WHERE clinic_id = ? AND enabled = TRUE',
      [clinicId]
    );
    return rows;
  }

  /**
   * Create or update notification setting
   */
  async upsertSetting(data) {
    const { clinic_id, notification_type, enabled, channels, timing_hours, template } = data;
    
    await pool.execute(
      `INSERT INTO notification_settings 
       (clinic_id, notification_type, enabled, channels, timing_hours, template)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       enabled = VALUES(enabled),
       channels = VALUES(channels),
       template = VALUES(template)`,
      [clinic_id, notification_type, enabled, JSON.stringify(channels), timing_hours, template]
    );
  }

  /**
   * Get notification history for a patient
   */
  async getPatientNotifications(patientId, clinicId) {
    const [rows] = await pool.execute(
      `SELECT * FROM notifications 
       WHERE recipient_type = 'patient' AND recipient_id = ? AND clinic_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [patientId, clinicId]
    );
    return rows;
  }

  /**
   * Cancel notifications for a session
   */
  async cancelSessionNotifications(sessionId) {
    await pool.execute(
      `UPDATE notifications 
       SET status = 'cancelled' 
       WHERE related_session_id = ? AND status = 'pending'`,
      [sessionId]
    );
  }

  /**
   * Create booking request
   */
  async createBookingRequest(data) {
    const { 
      clinic_id, patient_id, preferred_therapist_id, 
      preferred_date, preferred_time, reason 
    } = data;
    
    const [result] = await pool.execute(
      `INSERT INTO booking_requests 
       (clinic_id, patient_id, preferred_therapist_id, preferred_date, preferred_time, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [clinic_id, patient_id, preferred_therapist_id, preferred_date, preferred_time, reason]
    );
    return result.insertId;
  }

  /**
   * Get booking requests for a clinic
   */
  async getBookingRequests(clinicId, status = null) {
    let query = `
      SELECT br.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        CONCAT(u.first_name, ' ', u.last_name) as therapist_name
      FROM booking_requests br
      JOIN patients p ON br.patient_id = p.id
      LEFT JOIN users u ON br.preferred_therapist_id = u.id
      WHERE br.clinic_id = ?
    `;
    const params = [clinicId];

    if (status) {
      query += ' AND br.status = ?';
      params.push(status);
    }

    query += ' ORDER BY br.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Update booking request status
   */
  async updateBookingRequest(id, data) {
    const { status, approved_by, approved_session_id, notes } = data;
    
    await pool.execute(
      `UPDATE booking_requests 
       SET status = ?, approved_by = ?, approved_session_id = ?, notes = ?
       WHERE id = ?`,
      [status, approved_by, approved_session_id, notes, id]
    );
  }
}

module.exports = new NotificationsDAL();

