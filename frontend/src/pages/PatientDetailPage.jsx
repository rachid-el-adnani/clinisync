import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientsAPI, sessionsAPI, staffAPI } from '../utils/api';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, FileText, Activity, Edit2, Plus, Trash2 } from 'lucide-react';
import SessionFormModal from '../components/SessionFormModal';
import { useAuth } from '../contexts/AuthContext';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEdit, isSecretary } = useAuth();
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      // Fetch patient details
      const patientResponse = await patientsAPI.getById(id);
      setPatient(patientResponse.data.data);
      setEditData(patientResponse.data.data);
      
      // Fetch patient sessions
      const sessionsResponse = await sessionsAPI.getAll({ patient_id: id });
      const patientSessions = sessionsResponse.data.data || [];
      setSessions(patientSessions);
      
      // Find primary therapist from sessions
      if (patientSessions.length > 0) {
        const therapistId = patientSessions[0].therapist_id;
        if (therapistId) {
          try {
            const therapistResponse = await staffAPI.getById(therapistId);
            setTherapist(therapistResponse.data.data);
          } catch (err) {
            console.error('Failed to fetch therapist:', err);
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patient details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await patientsAPI.update(id, editData);
      setPatient(editData);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update patient');
    }
  };

  const handleDelete = async () => {
    try {
      await patientsAPI.delete(id);
      navigate('/patients');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete patient');
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate('/patients')} className="btn-primary">
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/patients')}
                className="btn-secondary flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Patients</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {patient?.first_name?.[0]}{patient?.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {patient?.first_name} {patient?.last_name}
                  </h1>
                  <p className="text-xs text-gray-500">Patient ID: {patient?.id}</p>
                </div>
              </div>
            </div>

            {canEdit && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
                {!isEditing && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn-danger flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
              
              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">First Name</label>
                      <input
                        type="text"
                        value={editData.first_name || ''}
                        onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Last Name</label>
                      <input
                        type="text"
                        value={editData.last_name || ''}
                        onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Date of Birth</label>
                    <input
                      type="date"
                      value={editData.date_of_birth ? editData.date_of_birth.split('T')[0] : ''}
                      onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Address</label>
                    <textarea
                      value={editData.address || ''}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      className="input"
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Medical Notes</label>
                    <textarea
                      value={editData.medical_notes || ''}
                      onChange={(e) => setEditData({ ...editData, medical_notes: e.target.value })}
                      className="input"
                      rows="4"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editData.is_active}
                      onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <label className="text-sm text-gray-700">Active Patient</label>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button type="submit" className="btn-primary">Save Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {patient?.first_name} {patient?.last_name}
                      </p>
                    </div>
                  </div>

                  {patient?.email && (
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{patient.email}</p>
                      </div>
                    </div>
                  )}

                  {patient?.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{patient.phone}</p>
                      </div>
                    </div>
                  )}

                  {patient?.date_of_birth && (
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(patient.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {patient?.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-sm font-medium text-gray-900">{patient.address}</p>
                      </div>
                    </div>
                  )}

                  {patient?.medical_notes && (
                    <div className="flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Medical Notes</p>
                        <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">
                          {patient.medical_notes}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      {patient?.is_active ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sessions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Sessions ({sessions.length})
                </h2>
                {canEdit && (
                  <button
                    onClick={() => setShowSessionModal(true)}
                    className="btn-primary btn-sm flex items-center space-x-1 text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Session</span>
                  </button>
                )}
              </div>
              
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-sm">No sessions scheduled yet</p>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(session.start_time).toLocaleDateString()} at{' '}
                          {new Date(session.start_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          Status: {session.status || 'Scheduled'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          session.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : session.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {session.status || 'Scheduled'}
                      </span>
                    </div>
                  ))}
                  {sessions.length > 5 && (
                    <button
                      onClick={() => navigate('/schedule')}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      View all sessions →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Therapist Info */}
          <div className="space-y-6">
            {/* Designated Therapist Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Designated Therapist</h2>
              
              {therapist ? (
                <button
                  onClick={() => navigate(`/staff/${therapist.id}`)}
                  className="w-full text-left hover:bg-gray-50 rounded-lg p-4 border border-gray-200 transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {therapist.first_name?.[0]}{therapist.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {therapist.first_name} {therapist.last_name}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">{therapist.role}</p>
                    </div>
                  </div>
                  
                  {therapist.email && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                      <Mail className="w-4 h-4" />
                      <span>{therapist.email}</span>
                    </div>
                  )}
                  
                  <div className="mt-3 text-sm text-primary-600 font-medium">
                    View therapist profile →
                  </div>
                </button>
              ) : (
                <p className="text-gray-500 text-sm">No therapist assigned yet</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Sessions</span>
                  <span className="text-lg font-semibold text-gray-900">{sessions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-lg font-semibold text-green-600">
                    {sessions.filter((s) => s.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Upcoming</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {sessions.filter((s) => s.status === 'scheduled').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Form Modal */}
        <SessionFormModal
          isOpen={showSessionModal}
          onClose={() => setShowSessionModal(false)}
          onSuccess={() => {
            fetchPatientData();
            setShowSessionModal(false);
          }}
          preSelectedPatient={patient}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Patient</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {patient?.first_name} {patient?.last_name}? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button onClick={handleDelete} className="btn-danger flex-1">
                  Delete
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

