const clinicsDAL = require('../dal/clinicsDAL');
const usersDAL = require('../dal/usersDAL');
const patientsDAL = require('../dal/patientsDAL');
const sessionsDAL = require('../dal/sessionsDAL');

class ClinicsController {
  /**
   * GET /api/clinics
   * Get all clinics with basic info
   */
  async getAllClinics(req, res) {
    try {
      const clinics = await clinicsDAL.findAll();
      
      // Get user count for each clinic
      const clinicsWithStats = await Promise.all(
        clinics.map(async (clinic) => {
          const users = await usersDAL.findByClinicId(clinic.id);
          const adminCount = users.filter(u => u.role === 'clinic_admin').length;
          const staffCount = users.filter(u => u.role === 'staff').length;
          
          return {
            ...clinic,
            adminCount,
            staffCount,
            totalUsers: users.length,
          };
        })
      );

      res.status(200).json({
        success: true,
        count: clinicsWithStats.length,
        data: clinicsWithStats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/clinics/:id
   * Get detailed clinic information with all stats
   */
  async getClinicDetails(req, res) {
    try {
      const { id } = req.params;
      
      const clinic = await clinicsDAL.findById(id);
      if (!clinic) {
        return res.status(404).json({
          success: false,
          message: 'Clinic not found',
        });
      }

      // Get users
      const users = await usersDAL.findByClinicId(id);
      const admins = users.filter(u => u.role === 'clinic_admin');
      const staff = users.filter(u => u.role === 'staff');

      // Get patients count
      const tenantContext = { clinicId: parseInt(id), role: 'system_admin', userId: req.user.id };
      const patientsCount = await patientsDAL.getCount(tenantContext);

      // Get sessions stats
      const allSessions = await sessionsDAL.findAll(tenantContext);
      const upcomingSessions = allSessions.filter(s => 
        new Date(s.start_time) > new Date() && s.status === 'scheduled'
      ).length;
      const completedSessions = allSessions.filter(s => s.status === 'completed').length;

      res.status(200).json({
        success: true,
        data: {
          clinic,
          users: {
            admins,
            staff,
            total: users.length,
            adminCount: admins.length,
            staffCount: staff.length,
          },
          stats: {
            totalPatients: patientsCount,
            totalSessions: allSessions.length,
            upcomingSessions,
            completedSessions,
            activeTherapists: staff.filter(s => s.is_active).length,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/clinics/:id
   * Update clinic information
   */
  async updateClinic(req, res) {
    try {
      const { id } = req.params;
      const { name, primary_color } = req.body;

      const clinic = await clinicsDAL.findById(id);
      if (!clinic) {
        return res.status(404).json({
          success: false,
          message: 'Clinic not found',
        });
      }

      const success = await clinicsDAL.update(id, { name, primary_color });

      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to update clinic',
        });
      }

      const updatedClinic = await clinicsDAL.findById(id);

      res.status(200).json({
        success: true,
        message: 'Clinic updated successfully',
        data: updatedClinic,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/clinics/:id/toggle-status
   * Activate or deactivate a clinic
   */
  async toggleClinicStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active, reason } = req.body;

      const clinic = await clinicsDAL.findById(id);
      if (!clinic) {
        return res.status(404).json({
          success: false,
          message: 'Clinic not found',
        });
      }

      const success = await clinicsDAL.update(id, { is_active });

      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to update clinic status',
        });
      }

      const updatedClinic = await clinicsDAL.findById(id);

      res.status(200).json({
        success: true,
        message: is_active ? 'Clinic activated successfully' : 'Clinic deactivated successfully',
        data: {
          clinic: updatedClinic,
          reason: reason || (is_active ? 'Clinic reactivated' : 'Clinic deactivated'),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new ClinicsController();

