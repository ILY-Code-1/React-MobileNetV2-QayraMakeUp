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
    <div className="px-6 py-6 pb-24 space-y-8 bg-white min-h-full">
      {/* Welcome Section */}
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex-shrink-0 border-4 border-white shadow-md overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <User className="w-12 h-12 text-gray-300" />
          </div>
          {/* In real app, we would have user profile image here */}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Selamat Datang</h1>
          <p className="text-xl text-gray-700 font-medium opacity-80">Dashboard</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Total Client Card */}
        <div className="bg-[#FDE7E7] rounded-xl p-8 border border-[#FAD2D2] flex flex-col items-center justify-center min-h-[140px] shadow-sm transition-all hover:shadow-md active:scale-95 group">
          <span className="text-lg font-bold text-gray-800 text-center leading-tight group-hover:text-black transition-colors uppercase tracking-wide">Total Client</span>
          <span className="text-4xl font-extrabold text-black mt-3 tracking-tighter">{users.length}</span>
        </div>

        {/* Total Analysis Card */}
        <div className="bg-[#FDE7E7] rounded-xl p-8 border border-[#FAD2D2] flex flex-col items-center justify-center min-h-[140px] shadow-sm transition-all hover:shadow-md active:scale-95 group">
          <span className="text-lg font-bold text-gray-800 text-center leading-tight group-hover:text-black transition-colors uppercase tracking-wide">Total Analysis</span>
          <span className="text-4xl font-extrabold text-black mt-3 tracking-tighter">{analyses.length}</span>
        </div>
      </div>

      {/* Recent Analysis Section */}
      <div className="space-y-4">
        <div className="bg-[#FDE7E7] rounded-2xl p-8 border border-[#FAD2D2] min-h-[350px] shadow-sm relative overflow-hidden">
          {/* Subtle background pattern could go here */}
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-gray-900 text-center uppercase tracking-[0.2em] mb-8 border-b-2 border-black/5 pb-4">
              RECENT ANALYSIS
            </h3>
            
            <div className="space-y-4">
              {recentAnalyses.length > 0 ? (
                recentAnalyses.map((analysis) => (
                  <div 
                    key={analysis.id}
                    onClick={() => navigate(`/analysis/${analysis.id}`)}
                    className="bg-white/80 backdrop-blur-sm p-5 rounded-xl flex justify-between items-center border border-white/60 hover:bg-white hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#C68E2D] transition-colors">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-[#C68E2D] transition-colors">{analysis.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{new Date(analysis.createdAt || '').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-[#C68E2D]">
                      <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Lihat</span>
                      <BarChart3 className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="w-10 h-10 opacity-30" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-60">Belum ada analisis terbaru</p>
                </div>
              )}
            </div>

            {analyses.length > 3 && (
              <button 
                onClick={() => navigate('/analysis')}
                className="w-full mt-8 py-3 text-sm font-black text-center uppercase tracking-widest text-gray-600 hover:text-black transition-colors"
              >
                Lihat Semua Analisis →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
