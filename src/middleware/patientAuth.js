const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const patientPortalDAL = require('../dal/patientPortalDAL');

/**
 * Middleware to authenticate patient portal users
 */
async function authenticatePatient(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, jwtSecret);

    // Check if this is a patient token
    if (decoded.type !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Verify patient portal user is still active
    const portalUser = await patientPortalDAL.findByPatientId(decoded.patient_id);
    if (!portalUser || !portalUser.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = { authenticatePatient };

