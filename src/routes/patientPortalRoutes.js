const express = require('express');
const router = express.Router();
const patientPortalController = require('../controllers/patientPortalController');
const { authenticatePatient } = require('../middleware/patientAuth');

/**
 * POST /api/patient-portal/login
 * Patient login
 */
router.post('/login', patientPortalController.login);

/**
 * GET /api/patient-portal/dashboard
 * Get patient dashboard data
 */
router.get('/dashboard', authenticatePatient, patientPortalController.getDashboard);

/**
 * GET /api/patient-portal/sessions
 * Get patient's sessions
 */
router.get('/sessions', authenticatePatient, patientPortalController.getMySessions);

/**
 * GET /api/patient-portal/treatment-plans
 * Get patient's treatment plans
 */
router.get('/treatment-plans', authenticatePatient, patientPortalController.getMyTreatmentPlans);

/**
 * GET /api/patient-portal/profile
 * Get patient's profile
 */
router.get('/profile', authenticatePatient, patientPortalController.getProfile);

/**
 * PUT /api/patient-portal/profile
 * Update patient's profile
 */
router.put('/profile', authenticatePatient, patientPortalController.updateProfile);

module.exports = router;

