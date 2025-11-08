import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, FileText, Target, Activity } from 'lucide-react';
import { api } from '../utils/api';
import PatientHeader from '../components/PatientHeader';

export default function PatientPortalDashboardPage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const patientData = localStorage.getItem('patientData');
    if (patientData) {
      setPatient(JSON.parse(patientData));
    }
    
    fetchDashboard();
    fetchTreatmentPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('patientToken');
      if (!token) {
        navigate('/patient-portal/login');
        return;
      }

      const response = await api.get('/patient-portal/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Axios response structure: response.data contains our API response
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
      if (err.response?.status === 401) {
        navigate('/patient-portal/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTreatmentPlans = async () => {
    try {
      const token = localStorage.getItem('patientToken');
      if (!token) return;

      const response = await api.get('/patient-portal/treatment-plans', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTreatmentPlans(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load treatment plans:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-b dark:border-gray-700lue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PatientHeader patient={patient} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {dashboardData?.upcomingSessions?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recent Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {dashboardData?.recentSessions?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Treatment Plans</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {treatmentPlans.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8 transition-colors">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Upcoming Appointments</h2>
          </div>
          <div className="p-6">
            {dashboardData?.upcomingSessions?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(session.start_time)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(session.start_time)} • {session.duration_minutes} minutes
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          with {session.therapist_name}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">No upcoming appointments</p>
            )}
          </div>
        </div>

        {/* Treatment Plans */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8 transition-colors">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Treatment Plans</h2>
          </div>
          <div className="p-6">
            {treatmentPlans.length > 0 ? (
              <div className="space-y-6">
                {treatmentPlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{plan.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Therapist: {plan.therapist_name}
                        </p>
                        {plan.diagnosis && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <strong>Diagnosis:</strong> {plan.diagnosis}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        plan.status === 'active' ? 'bg-green-100 text-green-800' :
                        plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.status}
                      </span>
                    </div>

                    {/* Goals */}
                    {plan.goals && plan.goals.length > 0 && (
                      <div className="mt-4 bg-blue-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Treatment Goals
                        </h4>
                        <ul className="space-y-2">
                          {plan.goals.map((goal) => (
                            <li key={goal.id} className="flex items-start gap-2 text-sm">
                              <span className={`mt-1 ${goal.is_achieved ? 'text-green-600' : 'text-gray-400'}`}>
                                {goal.is_achieved ? '✓' : '○'}
                              </span>
                              <span className={goal.is_achieved ? 'line-through text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}>
                                {goal.goal_text}
                                {goal.target_date && (
                                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                                    (Target: {new Date(goal.target_date).toLocaleDateString()})
                                  </span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Exercises */}
                    {plan.exercises && plan.exercises.length > 0 && (
                      <div className="mt-4 bg-green-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Prescribed Exercises
                        </h4>
                        <div className="space-y-2">
                          {plan.exercises.map((exercise) => (
                            <div key={exercise.id} className="text-sm">
                              <p className="font-medium text-gray-900 dark:text-gray-100">{exercise.name}</p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {exercise.sets} sets × {exercise.reps} reps • {exercise.frequency_per_week}x per week
                              </p>
                              {exercise.description && (
                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{exercise.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Started: {new Date(plan.start_date).toLocaleDateString()}
                      {plan.end_date && ` • Ends: ${new Date(plan.end_date).toLocaleDateString()}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">No treatment plans assigned yet</p>
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Sessions</h2>
          </div>
          <div className="p-6">
            {dashboardData?.recentSessions?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(session.start_time)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {formatTime(session.start_time)} with {session.therapist_name}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      session.status === 'completed' ? 'bg-green-100 text-green-800' :
                      session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">No recent sessions</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

