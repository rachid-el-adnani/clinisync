const express = require('express');
const router = express.Router();
const patientsController = require('../controllers/patientsController');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantIsolationMiddleware } = require('../middleware/tenantIsolation');

/**
 * All patient routes require authentication and tenant isolation
 */
router.use(authenticate);
router.use(authorize('clinic_admin', 'staff'));
router.use(tenantIsolationMiddleware);

/**
 * GET /api/patients
 * Get all patients for the authenticated user's clinic
 */
router.get('/', patientsController.getAllPatients);

/**
 * GET /api/patients/search
 * Search patients by name
 */
router.get('/search', patientsController.searchPatients);

/**
 * GET /api/patients/:id
 * Get a specific patient by ID
 */
router.get('/:id', patientsController.getPatientById);

/**
 * POST /api/patients
 * Create a new patient
 * Allowed for: clinic_admin, staff with job_title containing 'secretary' or 'receptionist'
 */
router.post('/', async (req, res, next) => {
  // Check if user is clinic_admin or secretary/receptionist
  if (req.user.role === 'clinic_admin') {
    return next();
  }
  
  if (req.user.role === 'staff') {
    const { usersDAL } = require('../config/dbAdapter');
    const user = await usersDAL.findById(req.user.id);
    const jobTitle = (user.job_title || '').toLowerCase();
    
    if (jobTitle.includes('secretary') || jobTitle.includes('receptionist') || jobTitle.includes('admin')) {
      return next();
    }
  }
  
  return res.status(403).json({
    success: false,
    message: 'Only clinic administrators and secretaries can create patients'
  });
}, patientsController.createPatient);

/**
 * PUT /api/patients/:id
 * Update a patient
 */
router.put('/:id', patientsController.updatePatient);

/**
 * DELETE /api/patients/:id
 * Delete a patient
 */
router.delete('/:id', patientsController.deletePatient);

module.exports = router;

