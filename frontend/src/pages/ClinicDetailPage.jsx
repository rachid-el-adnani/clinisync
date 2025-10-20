import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clinicsAPI } from '../utils/api';
import { ArrowLeft, Building2, Users, UserCheck, Calendar, Activity, CheckCircle, Palette, Edit2, Power, X } from 'lucide-react';
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
          <p className="mt-4 text-gray-600">Loading clinic details...</p>
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

  const colorPalette = generateColorPalette(clinic.primary_color);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
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
                  <h1 className="text-xl font-bold text-gray-900">{clinic.name}</h1>
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
                <p className="text-xs text-gray-500">Clinic ID: {clinic.id}</p>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Sessions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcomingSessions}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Therapists</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeTherapists}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Sessions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedSessions}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Section */}
          <div className="space-y-6">
            {/* Admins */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <UserCheck className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Administrators ({users.adminCount})
                </h2>
              </div>
              
              <div className="space-y-3">
                {users.admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {admin.first_name[0]}{admin.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {admin.first_name} {admin.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                    {admin.is_active ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                ))}
                
                {users.admins.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No administrators</p>
                )}
              </div>
            </div>

            {/* Staff */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Staff Members ({users.staffCount})
                </h2>
              </div>
              
              <div className="space-y-3">
                {users.staff.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {staff.first_name[0]}{staff.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {staff.first_name} {staff.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{staff.email}</p>
                      </div>
                    </div>
                    {staff.is_active ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                ))}
                
                {users.staff.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No staff members</p>
                )}
              </div>
            </div>
          </div>

          {/* Brand & Color Theme */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <Palette className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Brand Color Theme</h2>
              </div>
              
              <div className="space-y-4">
                {/* Primary Color */}
                <div className="flex items-center space-x-3">
                  <div
                    className="w-16 h-16 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: clinic.primary_color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">Primary Color</p>
                    <p className="text-sm text-gray-500 font-mono">{clinic.primary_color}</p>
                  </div>
                </div>

                {/* Full Palette */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Complete Color Palette (11 shades)
                  </p>
                  <div className="grid grid-cols-11 gap-1">
                    {Object.entries(colorPalette).map(([shade, color]) => (
                      <div key={shade} className="space-y-1">
                        <div
                          className="w-full h-16 rounded border border-gray-200"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                        <p className="text-xs text-center text-gray-600">{shade}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Clinic Info */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinic Information</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Clinic Name</p>
                  <p className="font-medium text-gray-900">{clinic.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Clinic ID</p>
                  <p className="font-medium text-gray-900">{clinic.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(clinic.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(clinic.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="font-medium text-gray-900">
                    {users.total} ({users.adminCount} admins, {users.staffCount} staff)
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="font-medium text-gray-900">
                    {stats.totalSessions} ({stats.completedSessions} completed, {stats.upcomingSessions} upcoming)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Clinic</h2>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
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

