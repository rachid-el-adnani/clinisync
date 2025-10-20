const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * POST /api/auth/register-clinic
 * Register a new clinic with its first admin user
 * Requires: system_admin authentication
 */
router.post(
  '/register-clinic',
  authenticate,
  authorize('system_admin'),
  authController.registerClinic
);

/**
 * POST /api/auth/login
 * Login user and return JWT token
 * Public route
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/create-staff
 * Create a new staff user for the clinic
 * Requires: clinic_admin authentication
 */
router.post(
  '/create-staff',
  authenticate,
  authorize('clinic_admin'),
  authController.createStaff
);

/**
 * GET /api/auth/me
 * Get current user information
 * Requires: authentication
 */
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;

