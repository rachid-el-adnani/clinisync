import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, User, ChevronDown, Moon, Sun } from 'lucide-react';

export default function PatientHeader({ patient }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('patientToken');
    localStorage.removeItem('patientData');
    navigate('/patient-portal/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and title */}
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 flex items-center justify-center cursor-pointer"
              onClick={() => navigate('/patient-portal/dashboard')}
            >
              <img src="/logo-icon.svg" alt="CliniSync" className="w-10 h-10" />
            </div>
            <div>
              <button
                onClick={() => navigate('/patient-portal/dashboard')}
                className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Patient Portal
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your Healthcare Dashboard
              </p>
            </div>
          </div>

          {/* Right side - Patient info and dropdown */}
          <div className="flex items-center gap-4">
            {/* Patient info */}
            {patient && (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Patient</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {patient.first_name} {patient.last_name}
                  </p>
                </div>
              </div>
            )}

            {/* Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Menu"
              >
                <User className="w-4 h-4" />
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Content */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {/* Mobile patient info */}
                  {patient && (
                    <div className="md:hidden px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{patient.email}</p>
                    </div>
                  )}

                  {/* Theme Toggle */}
                  <button
                    onClick={() => {
                      toggleTheme();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {theme === 'light' ? (
                      <>
                        <Moon className="w-4 h-4" />
                        <span>Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-4 h-4" />
                        <span>Light Mode</span>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

