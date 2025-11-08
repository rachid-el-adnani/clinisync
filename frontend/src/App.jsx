import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterClinicPage from './pages/RegisterClinicPage';
import ClinicsPage from './pages/ClinicsPage';
import ClinicDetailPage from './pages/ClinicDetailPage';
import PatientsManagementPage from './pages/PatientsManagementPage';
import PatientDetailPage from './pages/PatientDetailPage';
import AddPatientPage from './pages/AddPatientPage';
import StaffManagementPage from './pages/StaffManagementPage';
import StaffDetailPage from './pages/StaffDetailPage';
import AddStaffPage from './pages/AddStaffPage';
import SchedulePage from './pages/SchedulePage';
import SessionSeriesPage from './pages/SessionSeriesPage';
import ClinicDeactivatedPage from './pages/ClinicDeactivatedPage';
import PatientPortalLoginPage from './pages/PatientPortalLoginPage';
import PatientPortalDashboardPage from './pages/PatientPortalDashboardPage';
import TreatmentPlansPage from './pages/TreatmentPlansPage';
import CreateTreatmentPlanPage from './pages/CreateTreatmentPlanPage';
import TreatmentPlanDetailPage from './pages/TreatmentPlanDetailPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';

// Protected Route Component
function ProtectedRoute({ children, requireSystemAdmin = false }) {
  const { isAuthenticated, isSystemAdmin, isClinicDeactivated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If clinic is deactivated, redirect to deactivated page
  if (isClinicDeactivated) {
    return <Navigate to="/clinic-deactivated" replace />;
  }

  if (requireSystemAdmin && !isSystemAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/register-clinic"
            element={
              <ProtectedRoute requireSystemAdmin={true}>
                <RegisterClinicPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/clinics"
            element={
              <ProtectedRoute requireSystemAdmin={true}>
                <ClinicsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/clinics/:id"
            element={
              <ProtectedRoute requireSystemAdmin={true}>
                <ClinicDetailPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <PatientsManagementPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/patients/new"
            element={
              <ProtectedRoute>
                <AddPatientPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute>
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <StaffManagementPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/staff/new"
            element={
              <ProtectedRoute>
                <AddStaffPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/staff/:id"
            element={
              <ProtectedRoute>
                <StaffDetailPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <SchedulePage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/sessions/patient/:patientId"
            element={
              <ProtectedRoute>
                <SessionSeriesPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="/clinic-deactivated" element={<ClinicDeactivatedPage />} />
          
          {/* Patient Portal Routes */}
          <Route path="/patient-portal/login" element={<PatientPortalLoginPage />} />
          <Route path="/patient-portal/dashboard" element={<PatientPortalDashboardPage />} />
          
          {/* Treatment Plans Routes */}
          <Route
            path="/treatment-plans"
            element={
              <ProtectedRoute>
                <TreatmentPlansPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/treatment-plans/new"
            element={
              <ProtectedRoute>
                <CreateTreatmentPlanPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/treatment-plans/:id"
            element={
              <ProtectedRoute>
                <TreatmentPlanDetailPage />
              </ProtectedRoute>
            }
          />
          
          {/* Notification Settings Routes */}
          <Route
            path="/notifications/settings"
            element={
              <ProtectedRoute>
                <NotificationSettingsPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
