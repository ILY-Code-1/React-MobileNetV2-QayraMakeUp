import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, BarChart3, Users, Camera, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import qayraIcon from '../assets/qayra-icon.png';
import Swal from 'sweetalert2';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.isAdmin || false;

  // Determine which page is active for footer navigation
  const isDashboardActive = location.pathname === '/dashboard';
  const isCameraActive = location.pathname === '/camera';
  const isRiwayatActive = location.pathname === '/riwayat';
  const isAnalysisActive = location.pathname.startsWith('/analysis');
  const isUsersActive = location.pathname.startsWith('/users');

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
          <span className="font-serif font-bold text-lg">QAYRA FACIAL ANLYZING</span>
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

      {/* Bottom Navigation Bar with FAB-style Camera Button */}
      <div className="bg-[#C68E2D] shadow-lg shrink-0">
        <div className="flex justify-around items-center py-4">
          {isAdmin ? (
            <>
              {/* Admin Menu */}
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex flex-col items-center space-y-1 ${
                  isDashboardActive ? 'text-black' : 'text-white/70'
                }`}
              >
                <Home className="w-6 h-6" />
                <span className="text-xs font-medium">Beranda</span>
              </button>

              <button
                onClick={() => navigate('/analysis')}
                className={`flex flex-col items-center space-y-1 ${
                  isAnalysisActive ? 'text-black' : 'text-white/70'
                }`}
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-xs font-medium">Analisis</span>
              </button>

              <button
                onClick={() => navigate('/users')}
                className={`flex flex-col items-center space-y-1 ${
                  isUsersActive ? 'text-black' : 'text-white/70'
                }`}
              >
                <Users className="w-6 h-6" />
                <span className="text-xs font-medium">Kelola User</span>
              </button>
            </>
          ) : (
            <>
              {/* 1. Tombol Beranda */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center space-y-1 w-1/3 ${
            isDashboardActive ? 'text-black' : 'text-white/70'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Beranda</span>
        </button>

        {/* 2. FAB Camera Button - Diangkat ke atas dengan absolute */}
        <div className="relative w-1/3 flex justify-center">
          <button
            onClick={() => navigate('/camera')}
            className="absolute -top-14 flex flex-col items-center" 
          >
            {/* Lingkaran FAB Hitam */}
            <div
              className={`
                w-20 h-20
                bg-black
                rounded-full
                shadow-2xl
                flex items-center justify-center
                border-[6px] border-[#C68E2D] /* Border tebal warna emas agar terlihat "docked" */
                transition-all duration-300
                ${isCameraActive ? 'scale-110 ring-4 ring-black/10' : 'hover:scale-105'}
              `}
            >
              <Camera
                className={`w-10 h-10 text-[#C68E2D] transition-transform ${
                  isCameraActive ? 'scale-110' : 'scale-100'
                }`}
              />
            </div>
            
            {/* Label Kamera (Muncul di bawah lingkaran) */}
            <span className={`mt-2 text-xs font-bold ${isCameraActive ? 'text-black' : 'text-white'}`}>
              KAMERA
            </span>

            {/* Indikator Status Aktif (Floating di atas tombol) */}
            {isCameraActive && (
              <div className="absolute -top-8 bg-white px-3 py-1 rounded-full shadow-lg flex items-center space-x-2 border border-gray-100">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-800">AKTIF</span>
              </div>
            )}
          </button>
        </div>

        {/* 3. Tombol Riwayat */}
        <button
          onClick={() => navigate('/riwayat')}
          className={`flex flex-col items-center space-y-1 w-1/3 ${
            isRiwayatActive ? 'text-black' : 'text-white/70'
          }`}
        >
          <Clock className="w-6 h-6" />
          <span className="text-xs font-medium">Riwayat</span>
        </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
