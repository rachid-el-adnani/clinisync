const authService = require('../services/authService');

class AuthController {
  /**
   * POST /api/auth/register-clinic
   * Register a new clinic with its first admin user (system_admin only)
   */
  async registerClinic(req, res) {
    try {
      const { clinicName, adminEmail, adminPassword, adminFirstName, adminLastName } = req.body;

      const result = await authService.registerClinic({
        clinicName,
        adminEmail,
        adminPassword,
        adminFirstName,
        adminLastName
      });

      res.status(201).json({
        success: true,
        message: 'Clinic registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/auth/login
   * Login user and return JWT token
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

      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/auth/create-staff
   * Create a new staff user (clinic_admin only)
   */
  async createStaff(req, res) {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      const clinicId = req.user.clinicId;

      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      const result = await authService.createStaff(
        { email, password, firstName, lastName, role },
        clinicId
      );

      res.status(201).json({
        success: true,
        message: 'Staff user created successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/auth/me
   * Get current user information
   */
  async getCurrentUser(req, res) {
    try {
      res.status(200).json({
        success: true,
        data: {
          id: req.user.id,
          clinicId: req.user.clinicId,
          role: req.user.role,
          email: req.user.email
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();

