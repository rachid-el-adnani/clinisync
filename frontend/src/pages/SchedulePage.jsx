import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionsAPI, patientsAPI, staffAPI } from '../utils/api';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Plus, User } from 'lucide-react';
import SessionFormModal from '../components/SessionFormModal';

export default function ScheduleCalendarPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [patients, setPatients] = useState({});
  const [therapists, setTherapists] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSessionModal, setShowSessionModal] = useState(false);

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      
      const sessionsResponse = await sessionsAPI.getAll();
      const allSessions = sessionsResponse.data.data || [];
      setSessions(allSessions);
      
      const patientsMap = {};
      const therapistsMap = {};
      
      const uniquePatientIds = [...new Set(allSessions.map((s) => s.patient_id))];
      const uniqueTherapistIds = [...new Set(allSessions.map((s) => s.therapist_id))];
      
      await Promise.all(
        uniquePatientIds.map(async (patientId) => {
          try {
            const response = await patientsAPI.getById(patientId);
            patientsMap[patientId] = response.data.data;
          } catch (err) {
            console.error(`Failed to fetch patient ${patientId}:`, err);
          }
        })
      );
      
      await Promise.all(
        uniqueTherapistIds.map(async (therapistId) => {
          try {
            const response = await staffAPI.getById(therapistId);
            therapistsMap[therapistId] = response.data.data;
          } catch (err) {
            console.error(`Failed to fetch therapist ${therapistId}:`, err);
          }
        })
      );
      
      setPatients(patientsMap);
      setTherapists(therapistsMap);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  };

  // Calendar logic
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getSessionsForDate = (date) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.start_time);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigatePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const navigateNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setShowSessionModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Session</span>
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Schedule</h1>
                  <p className="text-xs text-gray-500">Calendar View</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={navigatePrevMonth} className="btn-secondary p-2">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 min-w-[200px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={navigateNextMonth} className="btn-secondary p-2">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={navigateToday} className="btn-secondary">
              Today
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading calendar...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {/* Week day headers */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 border-b border-r border-gray-200 p-3 text-center text-sm font-semibold text-gray-700"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="border-b border-r border-gray-200 bg-gray-50 min-h-[120px]"
                    />
                  );
                }

                const daySessions = getSessionsForDate(date);
                const isCurrentDay = isToday(date);

                return (
                  <div
                    key={date.toISOString()}
                    className={`border-b border-r border-gray-200 min-h-[120px] p-2 ${
                      isCurrentDay ? 'bg-primary-50' : 'hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-sm font-semibold ${
                          isCurrentDay
                            ? 'bg-primary-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                            : 'text-gray-700'
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {daySessions.length > 0 && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                          {daySessions.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {daySessions.slice(0, 3).map((session) => {
                        const patient = patients[session.patient_id];
                        return (
                          <button
                            key={session.id}
                            onClick={() => navigate(`/sessions/patient/${session.patient_id}`)}
                            className="w-full text-left p-2 rounded bg-primary-100 hover:bg-primary-200 transition-colors text-xs"
                          >
                            <div className="flex items-center space-x-1 mb-1">
                              <User className="w-3 h-3 text-primary-600" />
                              <span className="font-medium text-primary-900 truncate">
                                {patient
                                  ? `${patient.first_name} ${patient.last_name}`
                                  : 'Unknown'}
                              </span>
                            </div>
                            <div className="text-primary-700">
                              {new Date(session.start_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </button>
                        );
                      })}
                      {daySessions.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{daySessions.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Session Form Modal */}
        <SessionFormModal
          isOpen={showSessionModal}
          onClose={() => setShowSessionModal(false)}
          onSuccess={() => {
            fetchScheduleData();
            setShowSessionModal(false);
          }}
        />
      </main>
    </div>
  );
}

