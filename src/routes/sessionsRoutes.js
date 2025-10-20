const express = require('express');
const router = express.Router();
const sessionsController = require('../controllers/sessionsController');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantIsolationMiddleware } = require('../middleware/tenantIsolation');

/**
 * All session routes require authentication and tenant isolation
 */
router.use(authenticate);
router.use(authorize('clinic_admin', 'staff'));
router.use(tenantIsolationMiddleware);

/**
 * POST /api/sessions/create-series
 * Create a session series with automatic follow-up generation
 */
router.post('/create-series', sessionsController.createSessionSeries);

/**
 * GET /api/sessions
 * Get all sessions with optional filters
 */
router.get('/', sessionsController.getAllSessions);

/**
 * GET /api/sessions/:sessionId
 * Get a specific session by ID
 */
router.get('/:sessionId', sessionsController.getSessionById);

/**
 * GET /api/sessions/:sessionId/series
 * Get entire session series (parent + all follow-ups)
 */
router.get('/:sessionId/series', sessionsController.getSessionSeries);

/**
 * PUT /api/sessions/:sessionId
 * Update a session (status, therapist, notes, etc.)
 */
router.put('/:sessionId', sessionsController.updateSession);

/**
 * PUT /api/sessions/:sessionId/reschedule
 * Reschedule a session and cascade to all follow-ups
 */
router.put('/:sessionId/reschedule', sessionsController.rescheduleSession);

/**
 * PUT /api/sessions/:sessionId/cancel
 * Cancel a single session
 */
router.put('/:sessionId/cancel', sessionsController.cancelSession);

/**
 * PUT /api/sessions/:sessionId/cancel-series
 * Cancel entire session series
 */
router.put('/:sessionId/cancel-series', sessionsController.cancelSessionSeries);

module.exports = router;

