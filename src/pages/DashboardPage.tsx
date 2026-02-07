import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, BarChart3, Users, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigationStore } from '../store/navigationStore';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { currentTab, setCurrentTab } = useNavigationStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#C68E2D] rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-[#D4A03A] rounded-full"></div>
          </div>
          <span className="font-serif font-bold text-lg">QAYRA</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-6 pb-24 space-y-6">
        {/* Profile Section */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-[#C68E2D] rounded-full flex items-center justify-center shadow-md">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Selamat Datang Dashboard</h2>
            <p className="text-gray-600 text-sm">{user?.email || 'admin@qayra.com'}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Client Card */}
          <div className="bg-secondary-pink rounded-xl p-4 shadow-md">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#C68E2D] rounded-full flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">128</h3>
              <p className="text-sm text-gray-600 font-medium">Total Client</p>
            </div>
          </div>

          {/* Total Analysis Card */}
          <div className="bg-secondary-pink rounded-xl p-4 shadow-md">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#C68E2D] rounded-full flex items-center justify-center mb-2">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">456</h3>
              <p className="text-sm text-gray-600 font-medium">Total Analysis</p>
            </div>
          </div>
        </div>

        {/* Recent Analysis Card */}
        <div className="bg-secondary-pink rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">RECENT ANALYSIS</h3>
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

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#C68E2D] shadow-lg md:relative md:shadow-none">
        <div className="flex justify-around items-center py-4 max-w-[480px] mx-auto">
          <button
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              currentTab === 'home' ? 'text-white' : 'text-white/70'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => setCurrentTab('activity')}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              currentTab === 'activity' ? 'text-white' : 'text-white/70'
            }`}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-medium">Activity</span>
          </button>

          <button
            onClick={() => setCurrentTab('users')}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              currentTab === 'users' ? 'text-white' : 'text-white/70'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">Users</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
