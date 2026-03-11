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
  const isAdmin = user?.role === 'admin';

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
    <div className="h-full flex flex-col bg-white font-sans">
      {/* Header */}
      <header className="bg-black text-white px-6 py-5 flex items-center justify-between shadow-2xl shrink-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={qayraIcon}
              alt="QAYRA"
              className="w-12 h-12 rounded-full object-contain border-2 border-[#C68E2D] p-0.5 bg-white"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-black text-sm tracking-[0.2em] leading-none uppercase">QAYRA FACIAL ANALYZING</span>
            <span className="text-[9px] font-bold tracking-[0.3em] text-[#C68E2D] mt-1 uppercase opacity-90">BY QAYRA MAKE UP</span>
          </div>
        </div>
        <button
          onClick={handleLogoutClick}
          className="p-3 hover:bg-white/10 rounded-2xl transition-all active:scale-90 group"
          aria-label="Logout"
        >
          <LogOut className="w-6 h-6 group-hover:text-[#C68E2D] transition-colors" />
        </button>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto bg-white">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bg-[#C68E2D] px-4 py-3 shrink-0 relative z-50 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-end max-w-lg mx-auto relative">
          {isAdmin ? (
            <>
              {/* Beranda */}
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex flex-col items-center space-y-1 transition-all duration-300 w-20 ${
                  isDashboardActive ? 'text-black' : 'text-white/80'
                }`}
              >
                <div className={`p-2 rounded-xl ${isDashboardActive ? 'bg-white shadow-lg' : ''}`}>
                  <Home className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Beranda</span>
              </button>

              {/* Analisis */}
              <button
                onClick={() => navigate('/analysis')}
                className={`flex flex-col items-center space-y-1 transition-all duration-300 w-20 ${
                  isAnalysisActive ? 'text-black' : 'text-white/80'
                }`}
              >
                <div className={`p-2 rounded-xl ${isAnalysisActive ? 'bg-white shadow-lg' : ''}`}>
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Analisis</span>
              </button>

              {/* Users */}
              <button
                onClick={() => navigate('/users')}
                className={`flex flex-col items-center space-y-1 transition-all duration-300 w-20 ${
                  isUsersActive ? 'text-black' : 'text-white/80'
                }`}
              >
                <div className={`p-2 rounded-xl ${isUsersActive ? 'bg-white shadow-lg' : ''}`}>
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">User</span>
              </button>
            </>
            ) : (
            <>
              {/* USER VERSION */}
              {/* 1. Beranda */}
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex flex-col items-center space-y-1.5 pb-1 transition-all duration-300 w-20 ${
                  isDashboardActive ? 'text-black transform -translate-y-1' : 'text-white/80'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${isDashboardActive ? 'bg-white shadow-lg' : ''}`}>
                  <Home className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Beranda</span>
              </button>

              {/* 2. FAB Camera */}
              <div className="relative -top-8">
                <button
                  onClick={() => navigate('/camera')}
                  className={`flex flex-col items-center justify-center w-20 h-20 rounded-full shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] transition-all duration-500 transform border-[6px] border-[#C68E2D] ${
                    isCameraActive
                      ? 'bg-black text-[#C68E2D] scale-110'
                      : 'bg-white text-black hover:scale-105'
                  }`}
                >
                  <Camera className="w-9 h-9" />
                </button>
                <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${isCameraActive ? 'text-black' : 'text-white'}`}>
                  Kamera
                </span>
              </div>

              {/* 3. Riwayat */}
              <button
                onClick={() => navigate('/riwayat')}
                className={`flex flex-col items-center space-y-1.5 pb-1 transition-all duration-300 w-20 ${
                  isRiwayatActive ? 'text-black transform -translate-y-1' : 'text-white/80'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${isRiwayatActive ? 'bg-white shadow-lg' : ''}`}>
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Riwayat</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
