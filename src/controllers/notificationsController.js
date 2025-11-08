const notificationsDAL = require('../dal/notificationsDAL');

class NotificationsController {
  /**
   * Get notification settings for clinic
   */
  async getSettings(req, res) {
    try {
      const settings = await notificationsDAL.getSettings(req.tenantContext.clinicId);

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update notification setting
   */
  async updateSetting(req, res) {
    try {
      const { notification_type, enabled, channels, timing_hours, template } = req.body;

      if (!notification_type) {
        return res.status(400).json({
          success: false,
          message: 'notification_type is required'
        });
      }

      await notificationsDAL.upsertSetting({
        clinic_id: req.tenantContext.clinicId,
        notification_type,
        enabled,
        channels,
        timing_hours,
        template
      });

      res.json({
        success: true,
        message: 'Notification setting updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get booking requests
   */
  async getBookingRequests(req, res) {
    try {
      const { status } = req.query;

      const requests = await notificationsDAL.getBookingRequests(req.tenantContext.clinicId, status);

      res.json({
        success: true,
        count: requests.length,
        data: requests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create booking request (from patient portal)
   */
  async createBookingRequest(req, res) {
    try {
      const { preferred_therapist_id, preferred_date, preferred_time, reason } = req.body;

      if (!preferred_date || !preferred_time) {
        return res.status(400).json({
          success: false,
          message: 'preferred_date and preferred_time are required'
        });
      }

      const requestId = await notificationsDAL.createBookingRequest({
        clinic_id: req.user.clinic_id,
        patient_id: req.user.patient_id,
        preferred_therapist_id,
        preferred_date,
        preferred_time,
        reason
      });

      res.status(201).json({
        success: true,
        message: 'Booking request submitted successfully',
        data: { id: requestId }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Approve/reject booking request
   */
  async updateBookingRequest(req, res) {
    try {
      const { id } = req.params;
      const { status, approved_session_id, notes } = req.body;

      await notificationsDAL.updateBookingRequest(id, {
        status,
        approved_by: req.user.id,
        approved_session_id,
        notes
      });

      res.json({
        success: true,
        message: 'Booking request updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new NotificationsController();

