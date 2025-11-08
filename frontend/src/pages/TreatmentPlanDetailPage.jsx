import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Target, Activity, FileText, Calendar, User, CheckCircle, Circle } from 'lucide-react';
import { api } from '../utils/api';
import Header from '../components/Header';

export default function TreatmentPlanDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTreatmentPlan();
  }, [id]);

  const fetchTreatmentPlan = async () => {
    try {
      const response = await api.get(`/treatment-plans/${id}`);
      if (response.data.success) {
        setTreatmentPlan(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load treatment plan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading treatment plan...</p>
        </div>
      </div>
    );
  }

  if (error || !treatmentPlan) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || 'Treatment plan not found'}
          </div>
          <button
            onClick={() => navigate('/treatment-plans')}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Treatment Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Treatment Plan Details" />
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/treatment-plans')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Treatment Plans
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{treatmentPlan.title}</h1>
              <p className="text-gray-600 mt-1">Treatment plan details and progress</p>
            </div>
            {getStatusBadge(treatmentPlan.status)}
          </div>
        </div>

        {/* Overview Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Patient</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{treatmentPlan.patient_name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Therapist</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{treatmentPlan.therapist_name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(treatmentPlan.start_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {treatmentPlan.end_date && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">End Date</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(treatmentPlan.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {treatmentPlan.diagnosis && (
              <div className="md:col-span-2 flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Diagnosis</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{treatmentPlan.diagnosis}</p>
                </div>
              </div>
            )}

            {treatmentPlan.notes && (
              <div className="md:col-span-2 flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                  <p className="text-gray-900 dark:text-gray-100">{treatmentPlan.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Goals Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Treatment Goals</h2>
          </div>

          {treatmentPlan.goals && treatmentPlan.goals.length > 0 ? (
            <div className="space-y-4">
              {treatmentPlan.goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    goal.is_achieved ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {goal.is_achieved ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          goal.is_achieved ? 'text-green-900 line-through' : 'text-gray-900'
                        }`}
                      >
                        {goal.goal_text}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {goal.target_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Target: {new Date(goal.target_date).toLocaleDateString()}
                          </span>
                        )}
                        {goal.is_achieved && goal.achieved_date && (
                          <span className="text-green-600">
                            ✓ Achieved: {new Date(goal.achieved_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {goal.notes && (
                        <p className="text-sm text-gray-600 mt-2">{goal.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No goals defined yet</p>
          )}
        </div>

        {/* Exercises Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Prescribed Exercises</h2>
          </div>

          {treatmentPlan.exercises && treatmentPlan.exercises.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {treatmentPlan.exercises.map((exercise) => (
                <div key={exercise.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{exercise.name}</h3>
                  {exercise.body_part && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mb-2">
                      {exercise.body_part}
                    </span>
                  )}
                  {exercise.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{exercise.description}</p>
                  )}
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Sets:</strong> {exercise.sets}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Reps:</strong> {exercise.reps}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Frequency:</strong> {exercise.frequency_per_week}x per week
                    </p>
                  </div>
                  {exercise.default_instructions && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-gray-700 dark:text-gray-300">
                      <strong>Instructions:</strong> {exercise.default_instructions}
                    </div>
                  )}
                  {exercise.instructions && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-gray-700 dark:text-gray-300">
                      <strong>Custom Notes:</strong> {exercise.instructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No exercises prescribed yet</p>
          )}
        </div>

        {/* Progress Notes Section */}
        {treatmentPlan.progressNotes && treatmentPlan.progressNotes.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Progress Notes</h2>
            </div>

            <div className="space-y-4">
              {treatmentPlan.progressNotes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{note.therapist_name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(note.session_date).toLocaleDateString()} at{' '}
                        {new Date(note.session_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {note.pain_level !== null && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                        Pain: {note.pain_level}/10
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 text-sm">
                    {note.subjective && (
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">Subjective:</p>
                        <p className="text-gray-600 dark:text-gray-400">{note.subjective}</p>
                      </div>
                    )}
                    {note.objective && (
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">Objective:</p>
                        <p className="text-gray-600 dark:text-gray-400">{note.objective}</p>
                      </div>
                    )}
                    {note.assessment && (
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">Assessment:</p>
                        <p className="text-gray-600 dark:text-gray-400">{note.assessment}</p>
                      </div>
                    )}
                    {note.plan && (
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">Plan:</p>
                        <p className="text-gray-600 dark:text-gray-400">{note.plan}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

