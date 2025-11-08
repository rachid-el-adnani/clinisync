const notificationsDAL = require('../dal/notificationsDAL');
const sessionsDAL = require('../dal/sessionsDAL');
const patientsDAL = require('../dal/patientsDAL');

class NotificationService {
  /**
   * Create appointment reminders for a new session
   */
  async createSessionReminders(sessionId, clinicId) {
    try {
      // Get notification settings for the clinic
      const settings = await notificationsDAL.getSettings(clinicId);

      if (settings.length === 0) {
        console.log(`No notification settings found for clinic ${clinicId}`);
        return;
      }

      // Get session details
      const session = await sessionsDAL.findById(sessionId, { clinicId });
      if (!session) return;

      // Get patient details
      const patient = await patientsDAL.findById(session.patient_id, { clinicId });
      if (!patient) return;

      const sessionDate = new Date(session.start_time);
      
      // Create reminders based on settings
      for (const setting of settings) {
        if (setting.notification_type === 'appointment_reminder' && setting.enabled) {
          const channels = JSON.parse(setting.channels);
          const timingHours = setting.timing_hours;

          // Calculate scheduled time
          const scheduledFor = new Date(sessionDate);
          scheduledFor.setHours(scheduledFor.getHours() - timingHours);

          // Only create reminder if it's in the future
          if (scheduledFor > new Date()) {
            // Create reminder for each channel
            for (const channel of channels) {
              const message = this.buildReminderMessage(setting.template, {
                patient_name: `${patient.first_name} ${patient.last_name}`,
                appointment_date: sessionDate.toLocaleDateString(),
                appointment_time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                therapist_name: session.therapist_name || 'your therapist',
                hours_before: timingHours
              });

              await notificationsDAL.create({
                clinic_id: clinicId,
                recipient_type: 'patient',
                recipient_id: patient.id,
                notification_type: 'appointment_reminder',
                channel: channel,
                subject: 'Appointment Reminder',
                message: message,
                scheduled_for: scheduledFor.toISOString().slice(0, 19).replace('T', ' '),
                related_session_id: sessionId,
                metadata: {
                  patient_email: patient.email,
                  patient_phone: patient.phone
                }
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error creating session reminders:', error);
    }
  }

  /**
   * Create reminders for session series
   */
  async createSeriesReminders(sessionIds, clinicId) {
    for (const sessionId of sessionIds) {
      await this.createSessionReminders(sessionId, clinicId);
    }
  }

  /**
   * Send rescheduling notification
   */
  async sendReschedulingNotification(sessionId, clinicId, oldDate, newDate) {
    try {
      const session = await sessionsDAL.findById(sessionId, { clinicId });
      if (!session) return;

      const patient = await patientsDAL.findById(session.patient_id, { clinicId });
      if (!patient || !patient.email) return;

      const message = `Your appointment has been rescheduled from ${oldDate.toLocaleString()} to ${newDate.toLocaleString()}.`;

      await notificationsDAL.create({
        clinic_id: clinicId,
        recipient_type: 'patient',
        recipient_id: patient.id,
        notification_type: 'rescheduling',
        channel: 'email',
        subject: 'Appointment Rescheduled',
        message: message,
        scheduled_for: new Date().toISOString().slice(0, 19).replace('T', ' '),
        related_session_id: sessionId,
        metadata: {
          patient_email: patient.email,
          patient_phone: patient.phone
        }
      });
    } catch (error) {
      console.error('Error sending rescheduling notification:', error);
    }
  }

  /**
   * Send cancellation notification
   */
  async sendCancellationNotification(sessionId, clinicId) {
    try {
      const session = await sessionsDAL.findById(sessionId, { clinicId });
      if (!session) return;

      const patient = await patientsDAL.findById(session.patient_id, { clinicId });
      if (!patient || !patient.email) return;

      const sessionDate = new Date(session.start_time);
      const message = `Your appointment on ${sessionDate.toLocaleString()} has been cancelled.`;

      await notificationsDAL.create({
        clinic_id: clinicId,
        recipient_type: 'patient',
        recipient_id: patient.id,
        notification_type: 'cancellation',
        channel: 'email',
        subject: 'Appointment Cancelled',
        message: message,
        scheduled_for: new Date().toISOString().slice(0, 19).replace('T', ' '),
        related_session_id: sessionId,
        metadata: {
          patient_email: patient.email,
          patient_phone: patient.phone
        }
      });

      // Cancel pending reminders for this session
      await notificationsDAL.cancelSessionNotifications(sessionId);
    } catch (error) {
      console.error('Error sending cancellation notification:', error);
    }
  }

  /**
   * Build message from template
   */
  buildReminderMessage(template, data) {
    if (!template) {
      // Default template
      return `Hi ${data.patient_name}, this is a reminder that you have an appointment on ${data.appointment_date} at ${data.appointment_time} with ${data.therapist_name}.`;
    }

    // Replace placeholders in template
    let message = template;
    Object.keys(data).forEach(key => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
    });
    return message;
  }

  /**
   * Process pending notifications (should be run periodically via cron job)
   */
  async processPendingNotifications() {
    try {
      const pending = await notificationsDAL.findPendingNotifications();

      console.log(`Processing ${pending.length} pending notifications...`);

      for (const notification of pending) {
        try {
          // In a real implementation, you would send actual SMS/Email/Push notifications here
          // For now, we'll just mark them as sent (simulated)
          
          console.log(`[SIMULATED] Sending ${notification.channel} notification to ${notification.recipient_type} ${notification.recipient_id}`);
          console.log(`Subject: ${notification.subject}`);
          console.log(`Message: ${notification.message}`);

          // Simulate sending
          if (notification.channel === 'email') {
            // Here you would integrate with SendGrid, AWS SES, etc.
            console.log(`Would send email to: ${JSON.parse(notification.metadata || '{}').patient_email}`);
          } else if (notification.channel === 'sms') {
            // Here you would integrate with Twilio, AWS SNS, etc.
            console.log(`Would send SMS to: ${JSON.parse(notification.metadata || '{}').patient_phone}`);
          }

          // Mark as sent
          await notificationsDAL.updateStatus(notification.id, 'sent');
        } catch (error) {
          console.error(`Failed to send notification ${notification.id}:`, error);
          await notificationsDAL.updateStatus(notification.id, 'failed', error.message);
        }
      }
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }

  /**
   * Initialize default notification settings for a new clinic
   */
  async initializeClinicNotifications(clinicId) {
    const defaultSettings = [
      {
        clinic_id: clinicId,
        notification_type: 'appointment_reminder',
        enabled: true,
        channels: ['email'],
        timing_hours: 24,
        template: 'Hi {{patient_name}}, this is a reminder that you have an appointment tomorrow at {{appointment_time}}.'
      },
      {
        clinic_id: clinicId,
        notification_type: 'appointment_reminder',
        enabled: true,
        channels: ['email'],
        timing_hours: 48,
        template: 'Hi {{patient_name}}, you have an appointment in 2 days on {{appointment_date}} at {{appointment_time}}.'
      }
    ];

    for (const setting of defaultSettings) {
      await notificationsDAL.upsertSetting(setting);
    }
  }
}

module.exports = new NotificationService();

