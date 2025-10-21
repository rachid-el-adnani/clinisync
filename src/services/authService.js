const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usersDAL = require('../dal/usersDAL');
const clinicsDAL = require('../dal/clinicsDAL');
const { jwtSecret, jwtExpiresIn, bcryptSaltRounds } = require('../config/auth');
const db = require('../config/database');

class AuthService {
  /**
   * Register a new clinic with its first admin user
   * Only accessible by system_admin
   */
  async registerClinic(clinicData) {
    const { clinicName, adminEmail, adminPassword, adminFirstName, adminLastName, primaryColor } = clinicData;

    // Validate input
    if (!clinicName || !adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
      throw new Error('All fields are required');
    }

    // Check if email already exists
    const existingUser = await usersDAL.findByEmail(adminEmail);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Check if clinic name already exists
    const existingClinic = await clinicsDAL.findByName(clinicName);
    if (existingClinic) {
      throw new Error('Clinic name already exists');
    }

    // Use transaction to ensure atomicity
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Create clinic
      const [clinicResult] = await connection.execute(
        'INSERT INTO clinics (name, primary_color) VALUES (?, ?)',
        [clinicName, primaryColor || '#3B82F6']
      );
      const clinicId = clinicResult.insertId;

      // Hash password
      const passwordHash = await bcrypt.hash(adminPassword, bcryptSaltRounds);

      // Create admin user
      const [userResult] = await connection.execute(
        `INSERT INTO users (clinic_id, role, email, password_hash, first_name, last_name)
         VALUES (?, 'clinic_admin', ?, ?, ?, ?)`,
        [clinicId, adminEmail, passwordHash, adminFirstName, adminLastName]
      );
      const userId = userResult.insertId;

      await connection.commit();

      return {
        clinic: {
          id: clinicId,
          name: clinicName,
          primaryColor: primaryColor || '#3B82F6'
        },
        admin: {
          id: userId,
          email: adminEmail,
          firstName: adminFirstName,
          lastName: adminLastName,
          role: 'clinic_admin'
        }
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Login user and generate JWT token
   */
  async login(email, password) {
    // Find user by email
    const user = await usersDAL.findByEmail(email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Get clinic info for color theme
    let clinic = null;
    if (user.clinic_id) {
      clinic = await clinicsDAL.findById(user.clinic_id);
      
      // If clinic is deactivated, get the system admin info to show contact
      if (clinic && !clinic.is_active) {
        const systemAdmins = await usersDAL.findByRole('system_admin');
        clinic.deactivated_by = systemAdmins.length > 0 ? {
          first_name: systemAdmins[0].first_name,
          last_name: systemAdmins[0].last_name,
          email: systemAdmins[0].email
        } : null;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        clinicId: user.clinic_id,
        role: user.role,
        email: user.email
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        clinicId: user.clinic_id,
        role: user.role,
        jobTitle: user.job_title,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      clinic: clinic ? {
        id: clinic.id,
        name: clinic.name,
        primaryColor: clinic.primary_color,
        isActive: clinic.is_active,
        deactivatedBy: clinic.deactivated_by || null
      } : null
    };
  }

  /**
   * Create a new staff user for a clinic
   */
  async createStaff(staffData, clinicId) {
    const { email, password, firstName, lastName, role } = staffData;

    // Validate role
    if (!['staff', 'clinic_admin'].includes(role)) {
      throw new Error('Invalid role. Must be either "staff" or "clinic_admin"');
    }

    // Check if email already exists
    const existingUser = await usersDAL.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, bcryptSaltRounds);

    // Create user
    const userId = await usersDAL.create({
      clinic_id: clinicId,
      role,
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName
    });

    const user = await usersDAL.findById(userId);

    return {
      id: user.id,
      clinicId: user.clinic_id,
      role: user.role,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = new AuthService();

