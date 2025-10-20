import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { sessionsAPI, staffAPI } from '../utils/api';

export default function SessionEditModal({ isOpen, onClose, onSuccess, session }) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [therapists, setTherapists] = useState([]);
  const [formData, setFormData] = useState({
    status: '',
    therapist_id: '',
    start_time: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen && session) {
      fetchData();
      // Initialize form with session data
      const sessionDate = new Date(session.start_time);
      const formattedDate = sessionDate.toISOString().slice(0, 16); // Format for datetime-local input
      
      setFormData({
        status: session.status || 'scheduled',
        therapist_id: session.therapist_id || '',
        start_time: formattedDate,
        notes: session.notes || '',
      });
    }
  }, [isOpen, session]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const staffRes = await staffAPI.getAll();
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
      const originalDate = new Date(session.start_time);
      const newDate = new Date(formData.start_time);
      const dateChanged = originalDate.getTime() !== newDate.getTime();

      // If date changed, use reschedule endpoint (cascades automatically to subsequent sessions)
      if (dateChanged) {
        await sessionsAPI.reschedule(session.id, newDate.toISOString());
      }

      // Update other fields (status, therapist, notes)
      const updateData = {};
      if (formData.status !== session.status) updateData.status = formData.status;
      if (parseInt(formData.therapist_id) !== session.therapist_id) {
        updateData.therapist_id = parseInt(formData.therapist_id);
      }
      if (formData.notes !== (session.notes || '')) updateData.notes = formData.notes;

      if (Object.keys(updateData).length > 0) {
        await sessionsAPI.update(session.id, updateData);
      }

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update session');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleClose = () => {
    setFormData({
      status: '',
      therapist_id: '',
      start_time: '',
      notes: '',
    });
    setError('');
    onClose();
  };

  if (!isOpen || !session) return null;

  const isFollowUp = session.is_follow_up;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Session</h2>
            {isFollowUp && (
              <p className="text-sm text-gray-500 mt-1">Follow-up Session #{session.series_order}</p>
            )}
          </div>
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="label">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    {isFollowUp ? (
                      <>
                        <strong>Note:</strong> Rescheduling this session will automatically adjust all subsequent sessions in the series.
                      </>
                    ) : (
                      <>
                        <strong>Note:</strong> Rescheduling this parent session will automatically adjust all follow-up sessions.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input"
                  rows="4"
                  placeholder="Add any notes about this session..."
                />
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
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
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

