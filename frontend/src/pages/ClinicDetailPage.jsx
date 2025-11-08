import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clinicsAPI } from '../utils/api';
import { ArrowLeft, Building2, Users, UserCheck, Palette, Edit2, Power, X } from 'lucide-react';
import { generateColorPalette, isValidHexColor } from '../utils/colorPalette';

export default function ClinicDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [clinic, setClinic] = useState(null);
  const [users, setUsers] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', primary_color: '' });
  const [saving, setSaving] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusReason, setStatusReason] = useState('');

  useEffect(() => {
    fetchClinicDetails();
  }, [id]);

  const fetchClinicDetails = async () => {
    try {
      setLoading(true);
      const response = await clinicsAPI.getById(id);
      setClinic(response.data.data.clinic);
      setUsers(response.data.data.users);
      setStats(response.data.data.stats);
      setEditForm({
        name: response.data.data.clinic.name,
        primary_color: response.data.data.clinic.primary_color,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch clinic details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      await clinicsAPI.update(id, editForm);
      await fetchClinicDetails();
      setShowEditModal(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update clinic');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setSaving(true);
      await clinicsAPI.toggleStatus(id, !clinic.is_active, statusReason);
      await fetchClinicDetails();
      setShowStatusModal(false);
      setStatusReason('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle clinic status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading clinic details...</p>
        </div>
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Clinic not found'}</p>
          <button onClick={() => navigate('/clinics')} className="btn-primary">
            Back to Clinics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/clinics')}
                className="btn-secondary flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Clinics</span>
              </button>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: clinic.primary_color }}
              >
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{clinic.name}</h1>
                  {clinic.is_active ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Clinic ID: {clinic.display_id}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleEditClick}
                className="btn-secondary flex items-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              
              <button
                onClick={() => setShowStatusModal(true)}
                className={`btn-outline flex items-center space-x-2 ${
                  !clinic.is_active
                    ? 'border-green-600 text-green-600 hover:bg-green-50'
                    : 'border-red-600 text-red-600 hover:bg-red-50'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{clinic.is_active ? 'Deactivate' : 'Activate'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Clinic Information Cards (for System Admin) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Clinic Details */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-3">
              <Building2 className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Clinic Details</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Clinic Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{clinic.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Clinic ID</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{clinic.display_id || `#${clinic.id}`}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                {clinic.is_active ? (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-3">
              <Palette className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Branding</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-2">Primary Color</p>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: clinic.primary_color }}
                  />
                  <span className="font-mono text-sm text-gray-700">{clinic.primary_color}</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Counts */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Users</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">Administrators</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{users.adminCount}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">Staff Members</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{users.staffCount}</p>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700">Total Users</p>
                <p className="font-bold text-gray-900 dark:text-gray-100">{users.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Administrators Section */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <UserCheck className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Clinic Administrators
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">({users.adminCount})</span>
          </div>
          
          {users.admins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.admins.map((admin, index) => (
                <div key={admin.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-base">
                        {admin.first_name[0]}{admin.last_name[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {admin.first_name} {admin.last_name}
                        </p>
                        {admin.is_active ? (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex-shrink-0">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full flex-shrink-0">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{admin.email}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          ID: {admin.display_id || `#${admin.id}`}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Administrator {index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No administrators found</p>
            </div>
          )}
        </div>

        {/* Additional Clinic Info */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Additional Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Created Date</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {new Date(clinic.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Last Updated</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {new Date(clinic.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Total Patients</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{stats.totalPatients}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {stats.totalSessions} total
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.completedSessions} completed, {stats.upcomingSessions} upcoming
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Clinic</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input"
                  placeholder="Clinic Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={editForm.primary_color}
                    onChange={(e) => setEditForm({ ...editForm, primary_color: e.target.value })}
                    className="input font-mono flex-1"
                    placeholder="#3B82F6"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                  <input
                    type="color"
                    value={editForm.primary_color}
                    onChange={(e) => setEditForm({ ...editForm, primary_color: e.target.value })}
                    className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Color Preview */}
              {isValidHexColor(editForm.primary_color) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color Preview
                  </label>
                  <div className="flex space-x-1">
                    {Object.entries(generateColorPalette(editForm.primary_color)).map(([shade, color]) => (
                      <div
                        key={shade}
                        className="flex-1 h-12 rounded border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={`${shade}: ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-primary"
                disabled={saving || !editForm.name || !isValidHexColor(editForm.primary_color)}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {clinic.is_active ? 'Deactivate' : 'Activate'} Clinic
              </h2>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setStatusReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              {clinic.is_active ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> Deactivating this clinic will prevent all users from logging in. 
                    This is typically used for missed subscription payments or policy violations.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800">
                    Activating this clinic will allow users to log in and access the system again.
                  </p>
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason {!clinic.is_active ? '(Optional)' : '(Required)'}
              </label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="input resize-none"
                rows={3}
                placeholder={
                  clinic.is_active
                    ? "e.g., Missed subscription payment"
                    : "e.g., Payment received, account restored"
                }
                required={clinic.is_active}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setStatusReason('');
                }}
                className="btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                className={`btn ${
                  clinic.is_active
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                disabled={saving || (clinic.is_active && !statusReason)}
              >
                {saving
                  ? clinic.is_active
                    ? 'Deactivating...'
                    : 'Activating...'
                  : clinic.is_active
                  ? 'Deactivate Clinic'
                  : 'Activate Clinic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

