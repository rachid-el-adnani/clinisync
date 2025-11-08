const patientPortalDAL = require('../dal/patientPortalDAL');
const patientsDAL = require('../dal/patientsDAL');
const sessionsDAL = require('../dal/sessionsDAL');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');
const db = require('../config/database');

class PatientPortalController {
  /**
   * Patient login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const portalUser = await patientPortalDAL.findByEmail(email);
      if (!portalUser) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      if (!portalUser.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, portalUser.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Get patient details directly (bypass tenant check for login)
      const [patientRows] = await db.query(
        'SELECT * FROM patients WHERE id = ?',
        [portalUser.patient_id]
      );
      const patient = patientRows[0];

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient record not found'
        });
      }

      // Update last login
      await patientPortalDAL.updateLastLogin(portalUser.id);

      // Generate JWT token
      const token = jwt.sign(
        {
          id: portalUser.id,
          patient_id: portalUser.patient_id,
          clinic_id: patient.clinic_id,
          type: 'patient'
        },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          patient: {
            id: patient.id,
            first_name: patient.first_name,
            last_name: patient.last_name,
            email: patient.email,
            clinic_id: patient.clinic_id
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get patient dashboard data
   */
  async getDashboard(req, res) {
    try {
      const patientId = req.user.patient_id;
      const clinicId = req.user.clinic_id;

      // Get upcoming sessions
      const upcomingSessions = await sessionsDAL.findAll(
        { clinicId },
        { 
          patient_id: patientId, 
          status: 'scheduled',
          start_time_from: new Date().toISOString()
        }
      );

      // Get recent sessions
      const recentSessions = await sessionsDAL.findAll(
        { clinicId },
        { 
          patient_id: patientId,
          limit: 5
        }
      );

      res.json({
        success: true,
        data: {
          upcomingSessions: upcomingSessions.slice(0, 5),
          recentSessions
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get patient's sessions
   */
  async getMySessions(req, res) {
    try {
      const patientId = req.user.patient_id;
      const clinicId = req.user.clinic_id;

      const sessions = await sessionsDAL.findAll(
        { clinicId },
        { patient_id: patientId }
      );

      res.json({
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
   * Get patient's treatment plans
   */
  async getMyTreatmentPlans(req, res) {
    try {
      const patientId = req.user.patient_id;
      const clinicId = req.user.clinic_id;

      const [plans] = await db.query(
        `SELECT tp.*, 
          CONCAT(u.first_name, ' ', u.last_name) as therapist_name
         FROM treatment_plans tp
         JOIN users u ON tp.therapist_id = u.id
         WHERE tp.patient_id = ? AND tp.clinic_id = ?
         ORDER BY tp.created_at DESC`,
        [patientId, clinicId]
      );

      // Get goals for each plan
      for (let plan of plans) {
        const [goals] = await db.query(
          'SELECT * FROM treatment_goals WHERE treatment_plan_id = ? ORDER BY created_at',
          [plan.id]
        );
        plan.goals = goals;

        // Get prescribed exercises
        const [exercises] = await db.query(
          `SELECT pe.*, el.name, el.description, el.video_url, el.image_url, el.body_part
           FROM prescribed_exercises pe
           JOIN exercise_library el ON pe.exercise_id = el.id
           WHERE pe.treatment_plan_id = ? AND pe.is_active = TRUE
           ORDER BY pe.created_at`,
          [plan.id]
        );
        plan.exercises = exercises;
      }

      res.json({
        success: true,
        count: plans.length,
        data: plans
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get patient's profile
   */
  async getProfile(req, res) {
    try {
      const patientId = req.user.patient_id;
      
      const [patientRows] = await db.query(
        'SELECT * FROM patients WHERE id = ?',
        [patientId]
      );
      const patient = patientRows[0];

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: patient
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update patient's profile
   */
  async updateProfile(req, res) {
    try {
      const patientId = req.user.patient_id;
      const { email, phone, address } = req.body;

      // Update patient info
      await db.query(
        'UPDATE patients SET email = ?, phone = ?, address = ? WHERE id = ?',
        [email, phone, address, patientId]
      );

      // Get updated patient
      const [patientRows] = await db.query(
        'SELECT * FROM patients WHERE id = ?',
        [patientId]
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: patientRows[0]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PatientPortalController();

