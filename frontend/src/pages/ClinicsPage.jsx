import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clinicsAPI } from '../utils/api';
import { ArrowLeft, Plus, Building2, Users, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ClinicsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await clinicsAPI.getAll();
      setClinics(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch clinics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">All Clinics</h1>
            </div>

            <button
              onClick={() => navigate('/register-clinic')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Clinic</span>
            </button>
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading clinics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Clinics</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{clinics.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Admins</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {clinics.reduce((sum, c) => sum + c.adminCount, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Staff</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {clinics.reduce((sum, c) => sum + c.staffCount, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Clinics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinics.map((clinic) => (
                <button
                  key={clinic.id}
                  onClick={() => navigate(`/clinics/${clinic.id}`)}
                  className="card hover:shadow-lg transition-all cursor-pointer text-left group"
                >
                  {/* Color Bar */}
                  <div
                    className="h-2 rounded-t-lg -mx-6 -mt-6 mb-4"
                    style={{ backgroundColor: clinic.primary_color }}
                  />

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">
                          {clinic.name}
                        </h3>
                        {clinic.is_active ? (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {clinic.display_id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Created {new Date(clinic.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: clinic.primary_color + '20' }}
                    >
                      <Building2
                        className="w-5 h-5"
                        style={{ color: clinic.primary_color }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Admins</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{clinic.adminCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Staff</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{clinic.staffCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Users</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{clinic.totalUsers}</span>
                    </div>
                  </div>

                  {/* Color Palette Preview */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-1">
                      <div
                        className="w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: clinic.primary_color }}
                      />
                      <span className="text-xs text-gray-500 font-mono">
                        {clinic.primary_color}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {clinics.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No clinics registered yet</p>
                <button
                  onClick={() => navigate('/register-clinic')}
                  className="btn-primary mt-4"
                >
                  Register Your First Clinic
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

