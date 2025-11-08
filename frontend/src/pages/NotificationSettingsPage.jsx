import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { api } from '../utils/api';
import Header from '../components/Header';

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/notifications/settings');
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (notificationType, timingHours) => {
    const setting = settings.find(
      s => s.notification_type === notificationType && s.timing_hours === timingHours
    );

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await api.post('/notifications/settings', {
        notification_type: notificationType,
        enabled: !setting.enabled,
        channels: JSON.parse(setting.channels),
        timing_hours: timingHours,
        template: setting.template
      });

      setSuccess('Settings updated successfully');
      fetchSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleChannel = async (notificationType, timingHours, channel) => {
    const setting = settings.find(
      s => s.notification_type === notificationType && s.timing_hours === timingHours
    );

    const currentChannels = JSON.parse(setting.channels);
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter(c => c !== channel)
      : [...currentChannels, channel];

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await api.post('/notifications/settings', {
        notification_type: notificationType,
        enabled: setting.enabled,
        channels: newChannels,
        timing_hours: timingHours,
        template: setting.template
      });

      setSuccess('Settings updated successfully');
      fetchSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Notification Settings" />
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Notification Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage appointment reminders and notifications</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Settings List */}
        <div className="space-y-4">
          {settings.map((setting) => {
            const channels = JSON.parse(setting.channels);
            return (
              <div key={`${setting.notification_type}-${setting.timing_hours}`} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {setting.timing_hours}-Hour Appointment Reminder
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Send reminder {setting.timing_hours} hours before appointment
                    </p>

                    {/* Channels */}
                    <div className="flex gap-4 mb-4">
                      <button
                        onClick={() => handleToggleChannel(setting.notification_type, setting.timing_hours, 'email')}
                        disabled={saving || !setting.enabled}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          channels.includes('email')
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 text-gray-600 hover:border-gray-400'
                        } ${(!setting.enabled || saving) && 'opacity-50 cursor-not-allowed'}`}
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </button>

                      <button
                        onClick={() => handleToggleChannel(setting.notification_type, setting.timing_hours, 'sms')}
                        disabled={saving || !setting.enabled}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          channels.includes('sms')
                            ? 'bg-green-50 border-green-500 text-green-700'
                            : 'border-gray-300 text-gray-600 hover:border-gray-400'
                        } ${(!setting.enabled || saving) && 'opacity-50 cursor-not-allowed'}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        SMS
                      </button>
                    </div>

                    {/* Template Preview */}
                    {setting.template && (
                      <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 dark:text-gray-300">
                        <strong>Message Template:</strong> {setting.template}
                      </div>
                    )}
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggleEnabled(setting.notification_type, setting.timing_hours)}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      setting.enabled ? 'bg-green-600' : 'bg-gray-300'
                    } ${saving && 'opacity-50 cursor-not-allowed'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        setting.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}

          {settings.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center transition-colors">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Notification Settings</h3>
              <p className="text-gray-600 dark:text-gray-400">Default notification settings will be created automatically.</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Note:</p>
              <p>
                Notifications will only be sent if the patient has provided their email address or phone number.
                SMS notifications require additional setup with a messaging provider.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

