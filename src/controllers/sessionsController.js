const sessionsService = require('../services/sessionsService');

class SessionsController {
  /**
   * POST /api/sessions/create-series
   * Create a session series with automatic follow-up generation
   */
  async createSessionSeries(req, res) {
    try {
      const {
        patientId,
        therapistId,
        startTime,
        durationMinutes,
        periodicity,
        numberOfFollowUps,
        notes
      } = req.body;

      const result = await sessionsService.createSessionSeries(
        {
          patientId,
          therapistId,
          startTime,
          durationMinutes,
          periodicity,
          numberOfFollowUps,
          notes
        },
        req.tenantContext
      );

      res.status(201).json({
        success: true,
        message: 'Session series created successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/sessions/:sessionId
   * Update a session (status, therapist, notes, etc.)
   */
  async updateSession(req, res) {
    try {
      const { sessionId } = req.params;
      const { status, therapist_id, notes } = req.body;

      const sessionsDAL = require('../dal/sessionsDAL');
      
      // Verify session exists and belongs to tenant
      const session = await sessionsDAL.findById(sessionId, req.tenantContext);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // If therapist is being changed, verify they belong to the clinic
      if (therapist_id) {
        const usersDAL = require('../dal/usersDAL');
        const therapist = await usersDAL.findById(therapist_id);
        if (!therapist || therapist.clinic_id !== req.tenantContext.clinicId) {
          return res.status(400).json({
            success: false,
            message: 'Therapist not found or does not belong to your clinic'
          });
        }
      }

      // Update the session
      const updateData = {};
      if (status) updateData.status = status;
      if (therapist_id) updateData.therapist_id = therapist_id;
      if (notes !== undefined) updateData.notes = notes;

      await sessionsDAL.update(sessionId, updateData, req.tenantContext);
      const updatedSession = await sessionsDAL.findById(sessionId, req.tenantContext);

      res.status(200).json({
        success: true,
        message: 'Session updated successfully',
        data: updatedSession
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/sessions/:sessionId/reschedule
   * Reschedule a session and cascade to all follow-ups
   */
  async rescheduleSession(req, res) {
    try {
      const { sessionId } = req.params;
      const { newStartTime } = req.body;

      if (!newStartTime) {
        return res.status(400).json({
          success: false,
          message: 'newStartTime is required'
        });
      }

      const result = await sessionsService.rescheduleSession(
        sessionId,
        newStartTime,
        req.tenantContext
      );

      res.status(200).json({
        success: true,
        message: 'Session rescheduled successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/sessions
   * Get all sessions with optional filters
   */
  async getAllSessions(req, res) {
    try {
      const filters = {
        patient_id: req.query.patient_id,
        therapist_id: req.query.therapist_id,
        status: req.query.status,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const sessions = await sessionsService.getSessions(filters, req.tenantContext);

      res.status(200).json({
        success: true,
        count: sessions.length,
        data: sessions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/sessions/:sessionId
   * Get a specific session by ID
   */
  async getSessionById(req, res) {
    try {
      const { sessionId } = req.params;
      const session = await sessionsService.getSessionById(sessionId, req.tenantContext);

      res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/sessions/:sessionId/series
   * Get entire session series (parent + all follow-ups)
   */
  async getSessionSeries(req, res) {
    try {
      const { sessionId } = req.params;
      const series = await sessionsService.getSessionSeries(sessionId, req.tenantContext);

      res.status(200).json({
        success: true,
        count: series.length,
        data: series
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/sessions/:sessionId/cancel
   * Cancel a single session
   */
  async cancelSession(req, res) {
    try {
      const { sessionId } = req.params;
      const result = await sessionsService.cancelSession(sessionId, req.tenantContext);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/sessions/:sessionId/cancel-series
   * Cancel entire session series
   */
  async cancelSessionSeries(req, res) {
    try {
      const { sessionId } = req.params;
      const result = await sessionsService.cancelSessionSeries(sessionId, req.tenantContext);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          cancelledSessions: result.cancelledSessions
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new SessionsController();

