const express = require('express');
const router = express.Router();
const treatmentPlansController = require('../controllers/treatmentPlansController');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantIsolationMiddleware } = require('../middleware/tenantIsolation');

/**
 * All treatment plan routes require authentication and tenant isolation
 */
router.use(authenticate);
router.use(authorize('clinic_admin', 'staff'));
router.use(tenantIsolationMiddleware);

/**
 * POST /api/treatment-plans
 * Create a new treatment plan
 */
router.post('/', treatmentPlansController.createTreatmentPlan);

/**
 * GET /api/treatment-plans
 * Get all treatment plans with optional filters
 */
router.get('/', treatmentPlansController.getTreatmentPlans);

/**
 * GET /api/treatment-plans/:id
 * Get treatment plan by ID with goals and exercises
 */
router.get('/:id', treatmentPlansController.getTreatmentPlanById);

/**
 * PUT /api/treatment-plans/:id
 * Update treatment plan
 */
router.put('/:id', treatmentPlansController.updateTreatmentPlan);

/**
 * POST /api/treatment-plans/:treatment_plan_id/goals
 * Add goal to treatment plan
 */
router.post('/:treatment_plan_id/goals', treatmentPlansController.addGoal);

/**
 * PUT /api/treatment-plans/goals/:goal_id
 * Update goal
 */
router.put('/goals/:goal_id', treatmentPlansController.updateGoal);

/**
 * POST /api/treatment-plans/:treatment_plan_id/exercises
 * Prescribe exercise to treatment plan
 */
router.post('/:treatment_plan_id/exercises', treatmentPlansController.prescribeExercise);

/**
 * POST /api/treatment-plans/progress-notes
 * Create progress note
 */
router.post('/progress-notes', treatmentPlansController.createProgressNote);

/**
 * GET /api/treatment-plans/progress-notes/:patient_id
 * Get progress notes for a patient
 */
router.get('/progress-notes/:patient_id', treatmentPlansController.getProgressNotes);

module.exports = router;

