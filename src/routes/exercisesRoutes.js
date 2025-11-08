const express = require('express');
const router = express.Router();
const exercisesController = require('../controllers/exercisesController');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantIsolationMiddleware } = require('../middleware/tenantIsolation');

/**
 * All exercise routes require authentication and tenant isolation
 */
router.use(authenticate);
router.use(authorize('clinic_admin', 'staff'));
router.use(tenantIsolationMiddleware);

/**
 * GET /api/exercises
 * Get all exercises (system-wide + clinic-specific)
 */
router.get('/', exercisesController.getAllExercises);

/**
 * POST /api/exercises
 * Create a new exercise (clinic-specific)
 */
router.post('/', exercisesController.createExercise);

/**
 * PUT /api/exercises/:id
 * Update exercise
 */
router.put('/:id', exercisesController.updateExercise);

module.exports = router;

