import React, { useEffect, useState } from 'react';
import { User, BarChart3, Bell, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { useAnalysisStore } from '../../store/analysisStore';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const users = useUserStore((state) => state.users);
  const getAllUsers = useUserStore((state) => state.getAllUsers);

  const analyses = useAnalysisStore((state) => state.analyses);
  const fetchAllAnalyses = useAnalysisStore((state) => state.fetchAllAnalyses);

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getAllUsers();
    fetchAllAnalyses();
  }, [getAllUsers, fetchAllAnalyses]);

  useEffect(() => {
    setPendingCount(users.filter((u) => u.status === 'pending').length);
  }, [users]);

  const recentAnalyses = analyses.slice(0, 3);

  return (
    <div className="px-6 py-6 pb-24 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Selamat Datang Admin</h1>
          <p className="text-gray-600 text-sm">{user?.name || user?.email || 'admin@qayra.com'}</p>
        </div>
        <div className="w-10 h-10 bg-[#C68E2D] rounded-full flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total User Card */}
        <div className="bg-secondary-pink rounded-xl p-4 shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-[#C68E2D] rounded-full flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{users.length}</h3>
            <p className="text-sm text-gray-600 font-medium">Total User</p>
          </div>
        </div>

        {/* Total Analysis Card */}
        <div className="bg-secondary-pink rounded-xl p-4 shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-[#C68E2D] rounded-full flex items-center justify-center mb-2">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{analyses.length}</h3>
            <p className="text-sm text-gray-600 font-medium">Total Analisis</p>
          </div>
        </div>

        {/* Pending Users Card */}
        <div className="bg-secondary-pink rounded-xl p-4 shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-[#C68E2D] rounded-full flex items-center justify-center mb-2">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{pendingCount}</h3>
            <p className="text-sm text-gray-600 font-medium">Pending Users</p>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="bg-secondary-pink rounded-xl p-4 shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              {users.filter((u) => u.status === 'active').length}
            </h3>
            <p className="text-sm text-gray-600 font-medium">User Aktif</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => navigate('/analysis')}
            className="flex items-center justify-center space-x-2 bg-[#C68E2D] hover:bg-[#B77E29] text-white font-semibold py-4 px-4 rounded-lg shadow-md transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Lihat Analisis</span>
          </button>

          <button
            type="button"
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
            type="button"
            onClick={() => navigate('/analysis')}
            className="text-[#C68E2D] hover:text-[#B77E29] text-sm font-medium transition-colors"
          >
            Lihat Semua
          </button>
        </div>
        {recentAnalyses.length > 0 ? (
          <div className="space-y-3">
            {recentAnalyses.map((analysis) => (
              <div key={analysis.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#C68E2D] rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{analysis.name}</p>
                      <p className="text-xs text-gray-500">
                        {analysis.createdAt
                          ? new Date(analysis.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-[#C68E2D] text-white px-2 py-1 rounded-full">
                    {analysis.result ?? 'Selesai'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <p className="text-gray-500 text-sm">Belum ada data analisis</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
