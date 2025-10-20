/**
 * Tenant Isolation Middleware
 * 
 * This middleware enforces strict multi-tenancy by:
 * 1. Verifying user authentication
 * 2. Setting the current clinic_id from the authenticated user
 * 3. Making clinic_id available for all subsequent database operations
 * 
 * SECURITY: System admins can bypass tenant filtering, but regular users
 * (clinic_admin and staff) are strictly limited to their own clinic's data.
 */

const tenantIsolationMiddleware = (req, res, next) => {
  try {
    // Ensure user is authenticated (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for tenant isolation'
      });
    }

    // Set tenant context
    req.tenantContext = {
      clinicId: req.user.clinicId,
      role: req.user.role,
      userId: req.user.id
    };

    // For system_admin, allow them to bypass tenant filtering
    // by checking if they explicitly set a clinicId in query params or body
    if (req.user.role === 'system_admin') {
      // System admin can optionally specify a clinic_id to impersonate/manage
      const targetClinicId = req.query.clinic_id || req.body?.clinic_id;
      
      if (targetClinicId) {
        req.tenantContext.clinicId = parseInt(targetClinicId);
        req.tenantContext.isImpersonating = true;
      } else {
        // No clinic_id specified, system admin sees all data
        req.tenantContext.bypassTenantFilter = true;
      }
    } else {
      // Regular users (clinic_admin, staff) must have a clinic_id
      if (!req.tenantContext.clinicId) {
        return res.status(403).json({
          success: false,
          message: 'User is not associated with any clinic'
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Tenant isolation error',
      error: error.message
    });
  }
};

/**
 * Helper function to get tenant-aware WHERE clause
 * Use this in DAL methods to automatically inject clinic_id filtering
 */
const getTenantFilter = (tenantContext) => {
  if (!tenantContext) {
    throw new Error('Tenant context is required');
  }

  // System admin with no specific clinic - no filter
  if (tenantContext.bypassTenantFilter) {
    return { filter: '', params: [] };
  }

  // Regular users or system admin targeting a specific clinic
  return {
    filter: 'clinic_id = ?',
    params: [tenantContext.clinicId]
  };
};

/**
 * Helper function to inject clinic_id into data object
 * Use this before INSERT operations to ensure clinic_id is set
 */
const injectTenantId = (data, tenantContext) => {
  if (!tenantContext) {
    throw new Error('Tenant context is required');
  }

  // Don't inject if system admin is bypassing filters
  if (tenantContext.bypassTenantFilter) {
    return data;
  }

  // Inject clinic_id
  return {
    ...data,
    clinic_id: tenantContext.clinicId
  };
};

module.exports = {
  tenantIsolationMiddleware,
  getTenantFilter,
  injectTenantId
};

