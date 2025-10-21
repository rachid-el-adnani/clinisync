import { AlertTriangle, Mail, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ClinicDeactivatedPage() {
  const { clinic, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Clinic Access Suspended
            </h1>
            <p className="text-red-100 text-lg">
              {clinic?.name || 'Your clinic'} has been temporarily deactivated
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            {/* Reason */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Reason for Deactivation:
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="text-gray-800">
                  {clinic?.deactivation_reason || 'No specific reason provided. Please contact the system administrator for details.'}
                </p>
              </div>
            </div>

            {/* What this means */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                What This Means:
              </h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                  <span>Access to all clinic features has been suspended</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                  <span>Patient records and appointments are currently inaccessible</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                  <span>Staff members cannot perform any clinic operations</span>
                </li>
              </ul>
            </div>

            {/* Contact System Admin */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                To Resolve This Issue:
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Please contact the <span className="font-semibold">System Administrator</span> to resolve this issue and reactivate your clinic.
                </p>
                
                {clinic?.deactivated_by && (
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">Contact:</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {clinic.deactivated_by.first_name?.[0]}{clinic.deactivated_by.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {clinic.deactivated_by.first_name} {clinic.deactivated_by.last_name}
                        </p>
                        {clinic.deactivated_by.email && (
                          <a 
                            href={`mailto:${clinic.deactivated_by.email}`}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            {clinic.deactivated_by.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!clinic?.deactivated_by && (
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">
                      Please reach out to your system administrator for assistance.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              {clinic?.deactivated_by?.email && (
                <a
                  href={`mailto:${clinic.deactivated_by.email}?subject=Clinic Reactivation Request - ${clinic?.name || 'Our Clinic'}&body=Hello ${clinic.deactivated_by.first_name},\n\nI am writing to request the reactivation of our clinic (${clinic?.name || 'our clinic'}).\n\nCould you please review the deactivation and let us know what steps we need to take?\n\nThank you for your assistance.`}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email System Admin</span>
                </a>
              )}
              
              <button
                onClick={handleLogout}
                className="flex-1 btn-outline"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center">
            <p className="text-sm text-gray-600">
              Your clinic data remains secure and will be accessible once reactivated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

