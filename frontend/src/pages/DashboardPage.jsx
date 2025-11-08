import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, Activity, Plus, Building2, Clock, FileText, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { sessionsAPI, patientsAPI } from '../utils/api';
import Header from '../components/Header';

export default function DashboardPage() {
  const { user, clinic, logout, isSystemAdmin, isClinicAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isStaff) {
      fetchUpcomingSessions();
    }
  }, [isStaff]);

  const fetchUpcomingSessions = async () => {
    try {
      setLoading(true);
      const response = await sessionsAPI.getAll();
      let sessions = response.data.data || [];
      
      // Filter upcoming sessions for this staff member
      const now = new Date();
      sessions = sessions
        .filter(s => {
          const sessionDate = new Date(s.start_time);
          return sessionDate >= now && s.therapist_id === user.id;
        })
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        .slice(0, 5); // Show next 5 sessions
      
      setUpcomingSessions(sessions);
      
      // Fetch patient details
      const patientIds = [...new Set(sessions.map(s => s.patient_id))];
      const patientsData = {};
      
      await Promise.all(
        patientIds.map(async (id) => {
          try {
            const res = await patientsAPI.getById(id);
            patientsData[id] = res.data.data;
          } catch (err) {
            console.error(`Failed to fetch patient ${id}:`, err);
          }
        })
      );
      
      setPatientsMap(patientsData);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatSessionDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatSessionTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Dashboard" subtitle={user?.email} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-gray-600 mt-1">
            {isSystemAdmin && "Here's what's happening with your platform today."}
            {isClinicAdmin && "Here's an overview of your clinic today."}
            {isStaff && "Here are your upcoming sessions."}
          </p>
        </div>

        {/* System Admin View */}
        {isSystemAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/clinics')}
              className="card hover:shadow-md transition-shadow cursor-pointer text-left group"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">View All Clinics</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage and view all registered clinics
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/register-clinic')}
              className="card hover:shadow-md transition-shadow cursor-pointer text-left group"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Plus className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Register New Clinic</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Create a new clinic with custom branding
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Clinic Admin View */}
        {isClinicAdmin && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <button
                onClick={() => navigate('/patients')}
                className="card hover:shadow-md transition-shadow cursor-pointer text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Manage Patients</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      View and manage patient records
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/schedule')}
                className="card hover:shadow-md transition-shadow cursor-pointer text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">View Schedule</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      View all sessions and appointments
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/staff')}
                className="card hover:shadow-md transition-shadow cursor-pointer text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Manage Staff</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      View and manage staff members
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/treatment-plans')}
                className="card hover:shadow-md transition-shadow cursor-pointer text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Treatment Plans</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage patient treatment plans
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/notifications/settings')}
                className="card hover:shadow-md transition-shadow cursor-pointer text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                    <Bell className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure appointment reminders
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Patients</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Sessions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Therapists</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Color Theme Preview */}
            {clinic && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Clinic Color Theme</h3>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: clinic.primaryColor }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{clinic.primaryColor}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Primary Brand Color</p>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-1">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                    <div
                      key={shade}
                      className="flex-1 h-8 rounded"
                      style={{ backgroundColor: `var(--primary-${shade})` }}
                      title={`${shade}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Staff View */}
        {isStaff && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => navigate('/patients')}
                className="card hover:shadow-md transition-shadow cursor-pointer text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">My Patients</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      View your assigned patients
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/schedule')}
                className="card hover:shadow-md transition-shadow cursor-pointer text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">My Schedule</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      View your upcoming sessions
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/treatment-plans')}
                className="card hover:shadow-md transition-shadow cursor-pointer text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Treatment Plans</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      View and manage treatment plans
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Upcoming Sessions */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upcoming Sessions</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{upcomingSessions.length} scheduled</span>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading sessions...</div>
              ) : upcomingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No upcoming sessions scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => {
                    const patient = patientsMap[session.patient_id];
                    return (
                      <button
                        key={session.id}
                        onClick={() => navigate(`/sessions/patient/${session.patient_id}`)}
                        className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {patient ? `${patient.first_name} ${patient.last_name}` : 'Loading...'}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatSessionDate(session.start_time)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatSessionTime(session.start_time)}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            session.status === 'scheduled' ? 'bg-green-100 text-green-700' :
                            session.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

