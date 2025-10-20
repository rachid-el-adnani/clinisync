import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { staffAPI, sessionsAPI, patientsAPI } from '../utils/api';
import { ArrowLeft, User, Mail, Activity, Edit2, Users, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function StaffDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const [staff, setStaff] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [relatedPatients, setRelatedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchStaffData();
  }, [id]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      
      // Fetch staff details
      const staffResponse = await staffAPI.getById(id);
      setStaff(staffResponse.data.data);
      setEditData(staffResponse.data.data);
      
      // Fetch sessions for this therapist
      const sessionsResponse = await sessionsAPI.getAll({ therapist_id: id });
      const therapistSessions = sessionsResponse.data.data || [];
      setSessions(therapistSessions);
      
      // Extract unique patient IDs and fetch patient details
      const patientIds = [...new Set(therapistSessions.map((s) => s.patient_id))];
      const patientsPromises = patientIds.map((patientId) =>
        patientsAPI.getById(patientId).catch(() => null)
      );
      const patientsResponses = await Promise.all(patientsPromises);
      const patients = patientsResponses
        .filter((r) => r !== null)
        .map((r) => r.data.data);
      setRelatedPatients(patients);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch staff details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await staffAPI.update(id, editData);
      setStaff(editData);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update staff member');
    }
  };

  const handleDelete = async () => {
    try {
      await staffAPI.delete(id);
      navigate('/staff');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete staff member');
      setShowDeleteConfirm(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'clinic_admin':
        return 'bg-purple-100 text-purple-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff details...</p>
        </div>
      </div>
    );
  }

  if (error && !staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate('/staff')} className="btn-primary">
            Back to Staff
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
                onClick={() => navigate('/staff')}
                className="btn-secondary flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Staff</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {staff?.first_name?.[0]}{staff?.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {staff?.first_name} {staff?.last_name}
                  </h1>
                  <p className="text-xs text-gray-500 capitalize">{staff?.role?.replace('_', ' ')}</p>
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
          {/* Left Column - Staff Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Information</h2>
              
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
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="label">Job Title</label>
                    <input
                      type="text"
                      value={editData.job_title || ''}
                      onChange={(e) => setEditData({ ...editData, job_title: e.target.value })}
                      className="input"
                      placeholder="e.g., Physical Therapist, Receptionist"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editData.is_active}
                      onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <label className="text-sm text-gray-700">Active Staff Member</label>
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
                        {staff?.first_name} {staff?.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{staff?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Permission Level</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(staff?.role)}`}>
                        {staff?.role === 'clinic_admin' ? 'Admin' : 'Staff'}
                      </span>
                    </div>
                  </div>

                  {staff?.job_title && (
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Job Title</p>
                        <p className="text-sm font-medium text-gray-900">{staff.job_title}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      {staff?.is_active ? (
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

            {/* Related Patients Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Related Patients ({relatedPatients.length})
              </h2>
              
              {relatedPatients.length === 0 ? (
                <p className="text-gray-500 text-sm">No patients assigned yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 font-medium">
                          {patient.first_name?.[0]}{patient.last_name?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {patient.first_name} {patient.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sessions.filter((s) => s.patient_id === patient.id).length} sessions
                        </p>
                      </div>
                      <span className="text-primary-600">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Patients</span>
                  <span className="text-lg font-semibold text-gray-900">{relatedPatients.length}</span>
                </div>
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

            {/* Recent Sessions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h2>
              
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-sm">No sessions yet</p>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 5).map((session) => {
                    const patient = relatedPatients.find((p) => p.id === session.patient_id);
                    return (
                      <div
                        key={session.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(session.start_time).toLocaleDateString()} at{' '}
                          {new Date(session.start_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    );
                  })}
                  {sessions.length > 5 && (
                    <button
                      onClick={() => navigate('/schedule')}
                      className="text-sm text-primary-600 hover:text-primary-700 w-full text-center"
                    >
                      View all sessions →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Staff Member</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {staff?.first_name} {staff?.last_name}? This action cannot be undone.
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

