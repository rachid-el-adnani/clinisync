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
      const usersDAL = require('../dal/usersDAL');
      
      // Verify session exists and belongs to tenant
      const session = await sessionsDAL.findById(sessionId, req.tenantContext);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // If therapist is being changed, verify permissions and therapist belongs to clinic
      if (therapist_id && parseInt(therapist_id) !== parseInt(session.therapist_id)) {
        // Only clinic admins and secretaries can change the therapist assignment
        if (req.tenantContext.role === 'staff') {
          const { isSecretaryRole } = require('../constants/jobTitles');
          const currentUser = await usersDAL.findById(req.tenantContext.userId);
          
          if (!isSecretaryRole(currentUser.job_title)) {
            return res.status(403).json({
              success: false,
              message: 'Only clinic administrators and secretaries can change the assigned therapist'
            });
          }
        }
        
        // Verify therapist belongs to the clinic and has a therapist role
        const { isTherapistRole } = require('../constants/jobTitles');
        const therapist = await usersDAL.findById(therapist_id);
        if (!therapist || therapist.clinic_id !== req.tenantContext.clinicId) {
          return res.status(400).json({
            success: false,
            message: 'Therapist not found or does not belong to your clinic'
          });
        }
        
        if (!isTherapistRole(therapist.job_title)) {
          return res.status(400).json({
            success: false,
            message: 'Selected staff member is not a therapist and cannot be assigned to sessions'
          });
        }
      }

      // Update the session
      const updateData = {};
      if (status && status !== session.status) updateData.status = status;
      if (therapist_id && parseInt(therapist_id) !== parseInt(session.therapist_id)) {
        updateData.therapist_id = parseInt(therapist_id);
      }
      if (notes !== undefined && notes !== session.notes) updateData.notes = notes;

      // Only update if there are actual changes
      if (Object.keys(updateData).length > 0) {
        await sessionsDAL.update(sessionId, updateData, req.tenantContext);
      }
      
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

