import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { generateColorPalette, isValidHexColor } from '../utils/colorPalette';
import { ArrowLeft, Palette } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Purple', color: '#A855F7' },
  { name: 'Pink', color: '#EC4899' },
  { name: 'Red', color: '#EF4444' },
  { name: 'Orange', color: '#F97316' },
  { name: 'Yellow', color: '#EAB308' },
  { name: 'Green', color: '#10B981' },
  { name: 'Teal', color: '#14B8A6' },
  { name: 'Cyan', color: '#06B6D4' },
  { name: 'Indigo', color: '#6366F1' },
];

export default function RegisterClinicPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    clinicName: '',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: '',
    primaryColor: '#3B82F6',
  });

  const [colorPalette, setColorPalette] = useState(generateColorPalette('#3B82F6'));

  const handleColorChange = (color) => {
    if (isValidHexColor(color)) {
      setFormData({ ...formData, primaryColor: color });
      setColorPalette(generateColorPalette(color));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.registerClinic(formData);
      setSuccess(`Clinic "${response.data.data.clinic.name}" registered successfully!`);
      
      // Reset form
      setFormData({
        clinicName: '',
        adminEmail: '',
        adminPassword: '',
        adminFirstName: '',
        adminLastName: '',
        primaryColor: '#3B82F6',
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register clinic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Register New Clinic</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Clinic Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic Name *
                </label>
                <input
                  type="text"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                  className="input"
                  placeholder="Downtown Wellness Center"
                  required
                />
              </div>
            </div>
          </div>

          {/* Admin User Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Administrator Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.adminFirstName}
                  onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                  className="input"
                  placeholder="John"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.adminLastName}
                  onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                  className="input"
                  placeholder="Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="input"
                  placeholder="admin@clinic.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="input"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>
          </div>

          {/* Branding - Color Theme */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Brand Color</h2>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Choose a primary color for this clinic. The system will automatically generate a complete color palette.
            </p>

            {/* Color Input */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hex Color Code
                </label>
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="input font-mono"
                  placeholder="#3B82F6"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Picker
                </label>
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Preset Colors */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Or choose a preset:
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() => handleColorChange(preset.color)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      formData.primaryColor === preset.color
                        ? 'border-gray-900 scale-110'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {/* Generated Palette Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Generated Color Palette:
              </label>
              <div className="grid grid-cols-11 gap-1">
                {Object.entries(colorPalette).map(([shade, color]) => (
                  <div key={shade} className="space-y-1">
                    <div
                      className="w-full h-16 rounded border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-center text-gray-600">{shade}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Clinic...' : 'Register Clinic'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

