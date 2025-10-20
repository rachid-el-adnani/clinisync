const express = require('express');
const router = express.Router();
const clinicsController = require('../controllers/clinicsController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * All clinic routes require system_admin authentication
 */
router.use(authenticate);
router.use(authorize('system_admin'));

/**
 * GET /api/clinics
 * Get all clinics
 */
router.get('/', clinicsController.getAllClinics);

/**
 * GET /api/clinics/:id
 * Get clinic details with stats
 */
router.get('/:id', clinicsController.getClinicDetails);

/**
 * PUT /api/clinics/:id
 * Update clinic information
 */
router.put('/:id', clinicsController.updateClinic);

/**
 * PUT /api/clinics/:id/toggle-status
 * Activate or deactivate a clinic
 */
router.put('/:id/toggle-status', clinicsController.toggleClinicStatus);

module.exports = router;

