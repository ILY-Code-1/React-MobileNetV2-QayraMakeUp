import React from 'react';
import { User, BarChart3, Upload, Bell, LogOut, Settings, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import qayraIcon from '../../assets/qayra-icon.png';
import Swal from 'sweetalert2';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogoutClick = () => {
    Swal.fire({
      title: 'Konfirmasi Logout',
      text: 'Apakah Anda yakin ingin keluar dari aplikasi?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'swal2-popup',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };

  const isDashboardActive = location.pathname === '/dashboard';
  const isAnalysisActive = location.pathname.startsWith('/analysis');
  const isUsersActive = location.pathname.startsWith('/users');

  const handleAddAnalysis = () => {
    // Dummy button - placeholder for add analysis functionality
    alert('Add Analysis button clicked! (Dummy functionality)');
  };

  return (
    <div className="px-6 py-6 pb-24 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Selamat Datang Admin</h1>
          <p className="text-gray-600 text-sm">{user?.email || 'admin@qayra.com'}</p>
        </div>
        <div className="w-10 h-10 bg-[#C68E2D] rounded-full flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Client Card */}
        <div className="bg-secondary-pink rounded-xl p-4 shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-[#C68E2D] rounded-full flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">128</h3>
            <p className="text-sm text-gray-600 font-medium">Total Client</p>
          </div>
        </div>

        {/* Total Analysis Card */}
        <div className="bg-secondary-pink rounded-xl p-4 shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-[#C68E2D] rounded-full flex items-center justify-center mb-2">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">456</h3>
            <p className="text-sm text-gray-600 font-medium">Total Analysis</p>
          </div>
        </div>

        {/* Pending Users Card */}
        <div className="bg-secondary-pink rounded-xl p-4 shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-[#C68E2D] rounded-full flex items-center justify-center mb-2">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">12</h3>
            <p className="text-sm text-gray-600 font-medium">Pending Users</p>
          </div>
        </div>

        {/* System Status Card */}
        <div className="bg-secondary-pink rounded-xl p-4 shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Normal</h3>
            <p className="text-sm text-gray-600 font-medium">System Status</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleAddAnalysis}
            className="flex items-center justify-center space-x-2 bg-[#C68E2D] hover:bg-[#B77E29] text-white font-semibold py-4 px-4 rounded-lg shadow-md transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Tambah Analisis</span>
          </button>

          <button
            onClick={() => navigate('/users')}
            className="flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-4 rounded-lg shadow-md transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Kelola User</span>
          </button>
        </div>
      </div>

      {/* Recent Analysis Card */}
      <div className="bg-secondary-pink rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">ANALISIS TERBARU</h3>
          <button
            onClick={() => navigate('/analysis')}
            className="text-[#C68E2D] hover:text-[#B77E29] text-sm font-medium transition-colors"
          >
            Lihat Semua
          </button>
        </div>
        <div className="space-y-3">
          {/* Recent Analysis Item - Placeholder */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#C68E2D] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Today, 10:30 AM</p>
                </div>
              </div>
              <span className="text-xs bg-[#C68E2D] text-white px-2 py-1 rounded-full">
                Completed
              </span>
            </div>
          </div>

          {/* More placeholder items */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Emily Davis</p>
                  <p className="text-xs text-gray-500">Today, 09:15 AM</p>
                </div>
              </div>
              <span className="text-xs bg-[#C68E2D] text-white px-2 py-1 rounded-full">
                Completed
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Maria Garcia</p>
                  <p className="text-xs text-gray-500">Yesterday, 4:45 PM</p>
                </div>
              </div>
              <span className="text-xs bg-[#C68E2D] text-white px-2 py-1 rounded-full">
                Completed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
