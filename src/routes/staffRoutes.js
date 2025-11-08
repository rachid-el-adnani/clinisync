const express = require('express');
const router = express.Router();
const usersDAL = require('../dal/usersDAL');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantIsolationMiddleware } = require('../middleware/tenantIsolation');
const { generateUserDisplayId } = require('../utils/displayId');

/**
 * All staff routes require authentication
 */
router.use(authenticate);
router.use(tenantIsolationMiddleware);

/**
 * POST /api/staff
 * Create a new staff member (clinic_admin only)
 */
router.post('/', authorize('clinic_admin'), async (req, res) => {
  try {
    const { first_name, last_name, email, password, job_title, role } = req.body;
    
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: first_name, last_name, email, password',
      });
    }
    
    // Check if email already exists
    const existingUser = await usersDAL.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(password, 10);
    
    // Default role to 'staff' if not specified
    const userRole = role || 'staff';
    
    if (userRole !== 'staff' && userRole !== 'clinic_admin') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be staff or clinic_admin',
      });
    }
    
    // Generate display ID
    const display_id = await generateUserDisplayId();
    
    const userId = await usersDAL.create({
      display_id,
      clinic_id: req.tenantContext.clinicId,
      role: userRole,
      job_title: job_title || 'Staff',
      email,
      password_hash,
      first_name,
      last_name,
    });
    
    const newUser = await usersDAL.findById(userId);
    
    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/staff
 * Get all staff members for the clinic
 */
router.get('/', authorize('clinic_admin', 'staff'), async (req, res) => {
  try {
    const staff = await usersDAL.findByClinicId(req.tenantContext.clinicId);
    
    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/staff/:id
 * Get specific staff member details
 */
router.get('/:id', authorize('clinic_admin', 'staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await usersDAL.findById(id);
    
    if (!user || user.clinic_id !== req.tenantContext.clinicId) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /api/staff/:id
 * Update staff member (clinic_admin only)
 */
router.put('/:id', authorize('clinic_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, job_title, is_active } = req.body;
    
    const user = await usersDAL.findById(id);
    if (!user || user.clinic_id !== req.tenantContext.clinicId) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }
    
    await usersDAL.update(id, { first_name, last_name, email, job_title, is_active });
    const updatedUser = await usersDAL.findById(id);
    
    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * DELETE /api/staff/:id
 * Delete staff member (clinic_admin only)
 */
router.delete('/:id', authorize('clinic_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await usersDAL.findById(id);
    if (!user || user.clinic_id !== req.tenantContext.clinicId) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }
    
    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }
    
    await usersDAL.delete(id);
    
    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;

