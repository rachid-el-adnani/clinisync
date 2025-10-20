import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { sessionsAPI, patientsAPI, staffAPI } from '../utils/api';

export default function SessionFormModal({ isOpen, onClose, onSuccess, preSelectedPatient = null }) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: preSelectedPatient?.id || '',
    therapist_id: '',
    start_time: '',
    periodicity: '',
    status: 'scheduled',
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (preSelectedPatient) {
        setFormData(prev => ({ ...prev, patient_id: preSelectedPatient.id }));
      }
    }
  }, [isOpen, preSelectedPatient]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [patientsRes, staffRes] = await Promise.all([
        patientsAPI.getAll(),
        staffAPI.getAll(),
      ]);
      setPatients(patientsRes.data.data);
      setTherapists(staffRes.data.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Format the datetime for the API
      const startDate = new Date(formData.start_time);
      
      // Backend expects camelCase field names
      await sessionsAPI.createSeries({
        patientId: parseInt(formData.patient_id),
        therapistId: parseInt(formData.therapist_id),
        startTime: startDate.toISOString(),
        periodicity: formData.periodicity, // Required: Weekly, BiWeekly, or Monthly
      });

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create session');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setFormData({
      patient_id: '',
      therapist_id: '',
      start_time: '',
      periodicity: '',
      status: 'scheduled',
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Session</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Patient Selection */}
              <div>
                <label className="label">
                  Patient <span className="text-red-500">*</span>
                </label>
                <select
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  className="input"
                  required
                  disabled={preSelectedPatient !== null}
                >
                  <option value="">Select a patient...</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
                {preSelectedPatient && (
                  <p className="mt-1 text-xs text-gray-500">
                    Pre-selected from patient detail page
                  </p>
                )}
              </div>

              {/* Therapist Selection */}
              <div>
                <label className="label">
                  Therapist <span className="text-red-500">*</span>
                </label>
                <select
                  name="therapist_id"
                  value={formData.therapist_id}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select a therapist...</option>
                  {therapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.first_name} {therapist.last_name} ({therapist.job_title || therapist.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time */}
              <div>
                <label className="label">
                  Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              {/* Periodicity (required) */}
              <div>
                <label className="label">
                  Recurrence <span className="text-red-500">*</span>
                </label>
                <select
                  name="periodicity"
                  value={formData.periodicity}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select recurrence...</option>
                  <option value="Weekly">Weekly (5-10 follow-ups)</option>
                  <option value="BiWeekly">Bi-weekly (5-10 follow-ups)</option>
                  <option value="Monthly">Monthly (5-10 follow-ups)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  This will create a series of sessions automatically (8 follow-ups by default)
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This will automatically generate 8 follow-up sessions based on the selected frequency.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || loadingData}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Session Series</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

