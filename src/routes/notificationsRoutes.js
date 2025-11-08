const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantIsolationMiddleware } = require('../middleware/tenantIsolation');
const { authenticatePatient } = require('../middleware/patientAuth');

/**
 * GET /api/notifications/settings
 * Get notification settings (clinic admin only)
 */
router.get(
  '/settings',
  authenticate,
  authorize('clinic_admin'),
  tenantIsolationMiddleware,
  notificationsController.getSettings
);

/**
 * POST /api/notifications/settings
 * Update notification setting (clinic admin only)
 */
router.post(
  '/settings',
  authenticate,
  authorize('clinic_admin'),
  tenantIsolationMiddleware,
  notificationsController.updateSetting
);

/**
 * GET /api/notifications/booking-requests
 * Get booking requests (staff access)
 */
router.get(
  '/booking-requests',
  authenticate,
  authorize('clinic_admin', 'staff'),
  tenantIsolationMiddleware,
  notificationsController.getBookingRequests
);

/**
 * POST /api/notifications/booking-requests
 * Create booking request (from patient portal)
 */
router.post(
  '/booking-requests',
  authenticatePatient,
  notificationsController.createBookingRequest
);

/**
 * PUT /api/notifications/booking-requests/:id
 * Approve/reject booking request
 */
router.put(
  '/booking-requests/:id',
  authenticate,
  authorize('clinic_admin', 'staff'),
  tenantIsolationMiddleware,
  notificationsController.updateBookingRequest
);

module.exports = router;

