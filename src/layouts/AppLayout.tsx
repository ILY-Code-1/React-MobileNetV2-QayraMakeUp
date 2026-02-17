import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, BarChart3, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import qayraIcon from '../assets/qayra-icon.png';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
    navigate('/login');
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  // Determine which page is active for footer navigation
  const isDashboardActive = location.pathname === '/dashboard';
  const isAnalysisActive = location.pathname.startsWith('/analysis');
  const isUsersActive = location.pathname.startsWith('/users');

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center space-x-3">
          <img
            src={qayraIcon}
            alt="QAYRA"
            className="w-8 h-8 rounded-full object-contain"
          />
          <span className="font-serif font-bold text-lg">QAYRA</span>
        </div>
        <button
          onClick={handleLogoutClick}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-[#C68E2D] shadow-lg shrink-0">
        <div className="flex justify-around items-center py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center space-y-1 ${
              isDashboardActive ? 'text-black' : 'text-white/70'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => navigate('/analysis')}
            className={`flex flex-col items-center space-y-1 ${
              isAnalysisActive ? 'text-black' : 'text-white/70'
            }`}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-medium">Analysis</span>
          </button>

          <button
            onClick={() => navigate('/users')}
            className={`flex flex-col items-center space-y-1 ${
              isUsersActive ? 'text-black' : 'text-white/70'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">Users</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Dialog Title */}
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Konfirmasi Logout
              </h3>

              {/* Dialog Message */}
              <p className="text-gray-600 text-sm mb-6">
                Apakah Anda yakin ingin keluar dari aplikasi?
              </p>

              {/* Dialog Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelLogout}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
