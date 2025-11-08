import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsAPI, patientsAPI, staffAPI } from '../utils/api';
import { ArrowLeft, Calendar, User, Clock, CheckCircle, XCircle, Circle, Edit2 } from 'lucide-react';
import SessionEditModal from '../components/SessionEditModal';

export default function SessionSeriesPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [patient, setPatient] = useState(null);
  const [therapist, setTherapist] = useState(null); // Primary therapist (from first session)
  const [therapists, setTherapists] = useState({}); // Map of therapist_id -> therapist object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSession, setEditingSession] = useState(null);

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch patient
      const patientResponse = await patientsAPI.getById(patientId);
      setPatient(patientResponse.data.data);
      
      // Fetch all sessions for this patient
      const sessionsResponse = await sessionsAPI.getAll({ patient_id: patientId });
      const patientSessions = sessionsResponse.data.data || [];
      
      // Sort by start_time
      patientSessions.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      setSessions(patientSessions);
      
      // Fetch all unique therapists from sessions
      const uniqueTherapistIds = [...new Set(patientSessions.map(s => s.therapist_id).filter(Boolean))];
      const therapistsMap = {};
      
      for (const therapistId of uniqueTherapistIds) {
        try {
          const therapistResponse = await staffAPI.getById(therapistId);
          therapistsMap[therapistId] = therapistResponse.data.data;
        } catch (err) {
          console.error(`Failed to fetch therapist ${therapistId}:`, err);
        }
      }
      
      setTherapists(therapistsMap);
      
      // Set primary therapist (from first session)
      if (patientSessions.length > 0 && patientSessions[0].therapist_id) {
        setTherapist(therapistsMap[patientSessions[0].therapist_id]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Circle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isPastSession = (startTime) => {
    return new Date(startTime) < new Date();
  };

  const futureSessions = sessions.filter(s => !isPastSession(s.start_time));
  const pastSessions = sessions.filter(s => isPastSession(s.start_time));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate('/schedule')} className="btn-primary">
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/schedule')}
                className="btn-secondary flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Schedule</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Session Series</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{sessions.length} total sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient & Therapist Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Patient Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Patient</h3>
            <button
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors w-full text-left"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {patient?.first_name?.[0]}{patient?.last_name?.[0]}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {patient?.first_name} {patient?.last_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">View patient profile →</p>
              </div>
            </button>
          </div>

          {/* Therapist Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Therapist</h3>
            {therapist ? (
              <button
                onClick={() => navigate(`/staff/${therapist.id}`)}
                className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors w-full text-left"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {therapist.first_name?.[0]}{therapist.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {therapist.first_name} {therapist.last_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{therapist.job_title || 'Therapist'}</p>
                </div>
              </button>
            ) : (
              <p className="text-gray-500 text-sm">No therapist assigned</p>
            )}
          </div>
        </div>

        {/* Future Sessions */}
        {futureSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upcoming Sessions ({futureSessions.length})
            </h2>
            <div className="space-y-3">
              {futureSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {getStatusIcon(session.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Session {index + 1}
                          </h3>
                          {session.is_follow_up && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              Follow-up #{session.series_order}
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(session.status)}`}>
                            {session.status || 'Scheduled'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(session.start_time).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(session.start_time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                        </div>
                        {session.therapist_id && therapists[session.therapist_id] && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                            <User className="w-4 h-4" />
                            <span>
                              {therapists[session.therapist_id].first_name} {therapists[session.therapist_id].last_name}
                              {session.therapist_id !== sessions[0]?.therapist_id && (
                                <span className="ml-1 text-xs text-amber-600">(Different therapist)</span>
                              )}
                            </span>
                          </div>
                        )}
                        {session.periodicity && session.periodicity !== 'None' && (
                          <p className="text-sm text-gray-500 mt-2">
                            Recurrence: {session.periodicity}
                          </p>
                        )}
                        {session.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            Note: {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingSession(session)}
                      className="btn-secondary btn-sm flex items-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Past Sessions ({pastSessions.length})
            </h2>
            <div className="space-y-3">
              {pastSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {getStatusIcon(session.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Session {pastSessions.length - index}
                          </h3>
                          {session.is_follow_up && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              Follow-up #{session.series_order}
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(session.status)}`}>
                            {session.status || 'Scheduled'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(session.start_time).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(session.start_time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                        </div>
                        {session.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            Note: {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingSession(session)}
                      className="btn-secondary btn-sm flex items-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {sessions.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Found</h3>
            <p className="text-gray-600 dark:text-gray-400">This patient doesn't have any sessions yet.</p>
          </div>
        )}

        {/* Session Edit Modal */}
        <SessionEditModal
          isOpen={!!editingSession}
          onClose={() => setEditingSession(null)}
          onSuccess={() => {
            setEditingSession(null);
            fetchData();
          }}
          session={editingSession}
        />
      </main>
    </div>
  );
}

