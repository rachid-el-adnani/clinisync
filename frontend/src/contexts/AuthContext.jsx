import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { applyColorPalette } from '../utils/colorPalette';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user and clinic from localStorage on mount
    const storedUser = localStorage.getItem('user');
    const storedClinic = localStorage.getItem('clinic');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedClinic) {
      const clinicData = JSON.parse(storedClinic);
      setClinic(clinicData);
      
      // Apply color theme
      if (clinicData.primaryColor) {
        applyColorPalette(clinicData.primaryColor);
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user: userData, clinic: clinicData } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      if (clinicData) {
        localStorage.setItem('clinic', JSON.stringify(clinicData));
        setClinic(clinicData);
        
        // Apply clinic's color theme
        if (clinicData.primaryColor) {
          applyColorPalette(clinicData.primaryColor);
        }
      }
      
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('clinic');
    setUser(null);
    setClinic(null);
    
    // Reset to default color theme
    applyColorPalette('#3B82F6');
  };

  const updateClinicTheme = (primaryColor) => {
    if (clinic) {
      const updatedClinic = { ...clinic, primaryColor };
      setClinic(updatedClinic);
      localStorage.setItem('clinic', JSON.stringify(updatedClinic));
      applyColorPalette(primaryColor);
    }
  };

  const isSecretary = () => {
    if (!user || user.role !== 'staff') return false;
    const jobTitle = (user.jobTitle || '').toLowerCase();
    return jobTitle.includes('secretary') || jobTitle.includes('receptionist') || jobTitle.includes('admin');
  };

  const canEdit = () => {
    return user?.role === 'system_admin' || user?.role === 'clinic_admin';
  };

  const isClinicDeactivated = () => {
    // System admins are never blocked by clinic deactivation
    if (user?.role === 'system_admin') return false;
    
    // Clinic admins and staff are blocked if their clinic is deactivated
    // Check for both 0 (MySQL) and false (boolean)
    return clinic && (clinic.isActive === false || clinic.isActive === 0);
  };

  const value = {
    user,
    clinic,
    loading,
    login,
    logout,
    updateClinicTheme,
    isAuthenticated: !!user,
    isSystemAdmin: user?.role === 'system_admin',
    isClinicAdmin: user?.role === 'clinic_admin',
    isStaff: user?.role === 'staff',
    isSecretary: isSecretary(),
    canEdit: canEdit(),
    isClinicDeactivated: isClinicDeactivated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

