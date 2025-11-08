const sessionsDAL = require('../dal/sessionsDAL');
const patientsDAL = require('../dal/patientsDAL');
const usersDAL = require('../dal/usersDAL');
const notificationService = require('./notificationService');

class SessionsService {
  /**
   * Calculate the next session date based on periodicity
   */
  calculateNextSessionDate(currentDate, periodicity) {
    const date = new Date(currentDate);

    switch (periodicity) {
      case 'Weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'BiWeekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'Monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        throw new Error('Invalid periodicity');
    }

    return date;
  }

  /**
   * Format date to MySQL DATETIME format
   */
  formatDatetime(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  /**
   * Create a session series with automatic follow-up generation
   */
  async createSessionSeries(sessionData, tenantContext) {
    const {
      patientId,
      therapistId,
      startTime,
      durationMinutes,
      periodicity,
      numberOfFollowUps,
      notes
    } = sessionData;

    // Validate input
    if (!patientId || !therapistId || !startTime || !periodicity) {
      throw new Error('Missing required fields: patientId, therapistId, startTime, periodicity');
    }

    if (!['Weekly', 'BiWeekly', 'Monthly'].includes(periodicity)) {
      throw new Error('Invalid periodicity. Must be Weekly, BiWeekly, or Monthly');
    }

    const followUpCount = numberOfFollowUps || 8; // Default to 8 follow-ups

    if (followUpCount < 1 || followUpCount > 50) {
      throw new Error('Number of follow-ups must be between 1 and 50');
    }

    // Verify patient exists and belongs to tenant
    const patient = await patientsDAL.findById(patientId, tenantContext);
    if (!patient) {
      throw new Error('Patient not found or does not belong to your clinic');
    }

    // Verify therapist exists and belongs to tenant
    const therapist = await usersDAL.findById(therapistId);
    if (!therapist || therapist.clinic_id !== tenantContext.clinicId) {
      throw new Error('Therapist not found or does not belong to your clinic');
    }

    // Verify therapist is staff or clinic_admin
    if (!['staff', 'clinic_admin'].includes(therapist.role)) {
      throw new Error('Therapist must be a staff member or clinic admin');
    }

    // Prepare sessions array
    const sessionsToCreate = [];

    // Create the initial session
    const initialSession = {
      clinic_id: tenantContext.clinicId,
      patient_id: patientId,
      therapist_id: therapistId,
      start_time: this.formatDatetime(new Date(startTime)),
      duration_minutes: durationMinutes || 60,
      status: 'scheduled',
      periodicity: periodicity,
      is_follow_up: false,
      parent_session_id: null, // Will be updated after creation
      series_order: 0,
      notes: notes || null
    };

    sessionsToCreate.push(initialSession);

    // Generate follow-up sessions
    let currentDate = new Date(startTime);

    for (let i = 1; i <= followUpCount; i++) {
      currentDate = this.calculateNextSessionDate(currentDate, periodicity);

      const followUpSession = {
        clinic_id: tenantContext.clinicId,
        patient_id: patientId,
        therapist_id: therapistId,
        start_time: this.formatDatetime(currentDate),
        duration_minutes: durationMinutes || 60,
        status: 'scheduled',
        periodicity: periodicity,
        is_follow_up: true,
        parent_session_id: null, // Will be set to initial session ID
        series_order: i,
        notes: notes || null
      };

      sessionsToCreate.push(followUpSession);
    }

    try {
      // Create initial session first to get its ID
      const initialSessionId = await sessionsDAL.create(sessionsToCreate[0]);

      // Update parent_session_id for follow-ups
      const followUpSessions = sessionsToCreate.slice(1).map(session => ({
        ...session,
        parent_session_id: initialSessionId
      }));

      // Create all follow-up sessions
      const followUpIds = await sessionsDAL.createBatch(followUpSessions);

      // Create notifications for all sessions
      const allSessionIds = [initialSessionId, ...followUpIds];
      await notificationService.createSeriesReminders(allSessionIds, tenantContext.clinicId);

      return {
        parentSessionId: initialSessionId,
        followUpSessionIds: followUpIds,
        totalSessions: 1 + followUpIds.length,
        periodicity: periodicity
      };
    } catch (error) {
      throw new Error(`Failed to create session series: ${error.message}`);
    }
  }

  /**
   * Reschedule a session and cascade the change to all follow-ups
   */
  async rescheduleSession(sessionId, newStartTime, tenantContext) {
    // Validate input
    if (!sessionId || !newStartTime) {
      throw new Error('Missing required fields: sessionId, newStartTime');
    }

    // Find the session
    const session = await sessionsDAL.findById(sessionId, tenantContext);
    if (!session) {
      throw new Error('Session not found or does not belong to your clinic');
    }

    // Calculate time difference
    const oldStartTime = new Date(session.start_time);
    const newStartDateTime = new Date(newStartTime);
    const timeDelta = newStartDateTime - oldStartTime; // in milliseconds

    if (timeDelta === 0) {
      throw new Error('New start time is the same as the current start time');
    }

    try {
      // Determine if this is the parent session or a follow-up
      const parentSessionId = session.is_follow_up ? session.parent_session_id : session.id;

      // Get all sessions in the series starting from the current session
      const allSessions = await sessionsDAL.findSeriesByParentId(parentSessionId, tenantContext);

      // Filter sessions that come at or after the current session (by series_order)
      const sessionsToUpdate = allSessions.filter(s => s.series_order >= session.series_order);

      // Prepare batch updates
      const updates = sessionsToUpdate.map(s => {
        const currentStartTime = new Date(s.start_time);
        const newTime = new Date(currentStartTime.getTime() + timeDelta);

        return {
          id: s.id,
          data: {
            start_time: this.formatDatetime(newTime)
          }
        };
      });

      // Execute batch update
      await sessionsDAL.updateBatch(updates);

      // Send rescheduling notifications and update reminders
      for (const update of updates) {
        const oldSession = allSessions.find(s => s.id === update.id);
        const oldDate = new Date(oldSession.start_time);
        const newDate = new Date(update.data.start_time);
        
        // Cancel old reminders
        const notificationsDAL = require('../dal/notificationsDAL');
        await notificationsDAL.cancelSessionNotifications(update.id);
        
        // Send rescheduling notification
        await notificationService.sendReschedulingNotification(update.id, tenantContext.clinicId, oldDate, newDate);
        
        // Create new reminders
        await notificationService.createSessionReminders(update.id, tenantContext.clinicId);
      }

      return {
        updatedSessions: updates.length,
        timeDelta: timeDelta / (1000 * 60), // Convert to minutes
        affectedSessionIds: updates.map(u => u.id)
      };
    } catch (error) {
      throw new Error(`Failed to reschedule session series: ${error.message}`);
    }
  }

  /**
   * Get session details by ID
   */
  async getSessionById(sessionId, tenantContext) {
    const session = await sessionsDAL.findById(sessionId, tenantContext);
    
    if (!session) {
      throw new Error('Session not found or does not belong to your clinic');
    }

    return session;
  }

  /**
   * Get all sessions with optional filters
   */
  async getSessions(filters, tenantContext) {
    return await sessionsDAL.findAll(tenantContext, filters);
  }

  /**
   * Get entire session series (parent + all follow-ups)
   */
  async getSessionSeries(sessionId, tenantContext) {
    // Get the session to determine parent
    const session = await sessionsDAL.findById(sessionId, tenantContext);
    
    if (!session) {
      throw new Error('Session not found or does not belong to your clinic');
    }

    const parentSessionId = session.is_follow_up ? session.parent_session_id : session.id;

    return await sessionsDAL.findSeriesByParentId(parentSessionId, tenantContext);
  }

  /**
   * Cancel a single session
   */
  async cancelSession(sessionId, tenantContext) {
    const session = await sessionsDAL.findById(sessionId, tenantContext);
    
    if (!session) {
      throw new Error('Session not found or does not belong to your clinic');
    }

    await sessionsDAL.update(sessionId, { status: 'cancelled' }, tenantContext);

    // Send cancellation notification
    await notificationService.sendCancellationNotification(sessionId, tenantContext.clinicId);

    return { message: 'Session cancelled successfully' };
  }

  /**
   * Cancel entire session series
   */
  async cancelSessionSeries(sessionId, tenantContext) {
    const session = await sessionsDAL.findById(sessionId, tenantContext);
    
    if (!session) {
      throw new Error('Session not found or does not belong to your clinic');
    }

    const parentSessionId = session.is_follow_up ? session.parent_session_id : session.id;
    const allSessions = await sessionsDAL.findSeriesByParentId(parentSessionId, tenantContext);

    // Update all sessions to cancelled
    const updates = allSessions.map(s => ({
      id: s.id,
      data: { status: 'cancelled' }
    }));

    await sessionsDAL.updateBatch(updates);

    // Send cancellation notifications for all sessions
    for (const session of allSessions) {
      await notificationService.sendCancellationNotification(session.id, tenantContext.clinicId);
    }

    return {
      message: 'Session series cancelled successfully',
      cancelledSessions: updates.length
    };
  }
}

module.exports = new SessionsService();

