const patientsDAL = require('../dal/patientsDAL');
const { injectTenantId } = require('../middleware/tenantIsolation');

class PatientsController {
  /**
   * GET /api/patients
   * Get all patients for the authenticated user's clinic
   * For staff members: only returns patients they are assigned to as therapist
   */
  async getAllPatients(req, res) {
    try {
      let patients;
      
      // If user is staff (not clinic_admin), filter by assigned therapist
      if (req.user.role === 'staff') {
        const sessionsDAL = require('../dal/sessionsDAL');
        // Get all sessions where this user is the therapist
        const sessions = await sessionsDAL.findAll(req.tenantContext, {
          therapist_id: req.user.id
        });
        
        // Extract unique patient IDs
        const patientIds = [...new Set(sessions.map(s => s.patient_id))];
        
        // Fetch those patients
        patients = await Promise.all(
          patientIds.map(id => patientsDAL.findById(id, req.tenantContext))
        );
        patients = patients.filter(p => p !== null);
      } else {
        // Clinic admins see all patients
        patients = await patientsDAL.findAll(req.tenantContext);
      }

      res.status(200).json({
        success: true,
        count: patients.length,
        data: patients
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/patients/:id
   * Get a specific patient by ID
   */
  async getPatientById(req, res) {
    try {
      const { id } = req.params;
      const patient = await patientsDAL.findById(id, req.tenantContext);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.status(200).json({
        success: true,
        data: patient
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/patients
   * Create a new patient
   */
  async createPatient(req, res) {
    try {
      const {
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        address,
        medical_notes
      } = req.body;

      if (!first_name || !last_name) {
        return res.status(400).json({
          success: false,
          message: 'First name and last name are required'
        });
      }

      // Inject clinic_id from tenant context
      const patientData = injectTenantId({
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        address,
        medical_notes
      }, req.tenantContext);

      const patientId = await patientsDAL.create(patientData);
      const patient = await patientsDAL.findById(patientId, req.tenantContext);

      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: patient
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/patients/:id
   * Update a patient
   */
  async updatePatient(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove clinic_id from update data (should not be updatable)
      delete updateData.clinic_id;

      const success = await patientsDAL.update(id, updateData, req.tenantContext);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found or update failed'
        });
      }

      const patient = await patientsDAL.findById(id, req.tenantContext);

      res.status(200).json({
        success: true,
        message: 'Patient updated successfully',
        data: patient
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * DELETE /api/patients/:id
   * Delete a patient
   */
  async deletePatient(req, res) {
    try {
      const { id } = req.params;
      const success = await patientsDAL.delete(id, req.tenantContext);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Patient deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/patients/search
   * Search patients by name
   */
  async searchPatients(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const patients = await patientsDAL.searchByName(q, req.tenantContext);

      res.status(200).json({
        success: true,
        count: patients.length,
        data: patients
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PatientsController();

