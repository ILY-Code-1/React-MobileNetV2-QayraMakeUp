import React, { useEffect, useState } from 'react';
import { User, BarChart3, Users, ShieldCheck, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { useAnalysisStore } from '../../store/analysisStore';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  // const user = useAuthStore((state) => state.user);

  const users = useUserStore((state) => state.users);
  const getAllUsers = useUserStore((state) => state.getAllUsers);

  const analyses = useAnalysisStore((state) => state.analyses);
  const fetchAllAnalyses = useAnalysisStore((state) => state.fetchAllAnalyses);

  const [, setPendingCount] = useState(0);

  useEffect(() => {
    getAllUsers();
    fetchAllAnalyses();
  }, [getAllUsers, fetchAllAnalyses]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingCount(users.filter((u) => u.status === 'pending').length);
  }, [users]);

  const recentAnalyses = analyses.slice(0, 3);
  
  // Filter user statistics
  const totalClients = users.filter(u => u.role === 'user').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;

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
          <p className="text-xl text-gray-700 font-medium opacity-80">Dashboard Admin</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Client Card */}
        <div className="bg-[#C68E2D]/10 rounded-3xl p-6 border border-[#C68E2D]/20 flex flex-col items-center justify-center min-h-40 shadow-sm transition-all hover:shadow-md active:scale-95 group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={80} className="text-[#C68E2D]" />
          </div>
          <div className="p-3 bg-white rounded-2xl shadow-sm mb-3 z-10">
            <Users className="w-6 h-6 text-[#C68E2D]" />
          </div>
          <span className="text-sm font-black text-gray-500 text-center uppercase tracking-widest z-10">Total Client</span>
          <span className="text-4xl font-black text-black mt-2 tracking-tighter z-10">{totalClients}</span>
        </div>

        {/* Total Admin Card */}
        <div className="bg-black/5 rounded-3xl p-6 border border-black/10 flex flex-col items-center justify-center min-h-40 shadow-sm transition-all hover:shadow-md active:scale-95 group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck size={80} className="text-black" />
          </div>
          <div className="p-3 bg-black text-white rounded-2xl shadow-sm mb-3 z-10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-sm font-black text-gray-500 text-center uppercase tracking-widest z-10">Total Admin</span>
          <span className="text-4xl font-black text-black mt-2 tracking-tighter z-10">{totalAdmins}</span>
        </div>

        {/* Total Analysis Card */}
        <div className="bg-[#C68E2D]/10 rounded-3xl p-6 border border-[#C68E2D]/20 flex flex-col items-center justify-center min-h-40 shadow-sm transition-all hover:shadow-md active:scale-95 group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={80} className="text-[#C68E2D]" />
          </div>
          <div className="p-3 bg-white rounded-2xl shadow-sm mb-3 z-10">
            <BarChart3 className="w-6 h-6 text-[#C68E2D]" />
          </div>
          <span className="text-sm font-black text-gray-500 text-center uppercase tracking-widest z-10">Total Analisis</span>
          <span className="text-4xl font-black text-black mt-2 tracking-tighter z-10">{analyses.length}</span>
        </div>
      </div>

      {/* Recent Analysis Section */}
      <div className="space-y-4">
        <div className="bg-[#C68E2D]/10 rounded-4xl p-8 border border-[#C68E2D]/20 min-h-[350px] shadow-sm relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute -right-20 -bottom-20 opacity-5 transform -rotate-12">
            <BarChart3 size={300} className="text-[#C68E2D]" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center space-x-3 mb-8 border-b-2 border-[#C68E2D]/10 pb-4">
              <Activity className="w-6 h-6 text-[#C68E2D]" />
              <h3 className="text-2xl font-black text-gray-900 text-center uppercase tracking-[0.2em]">
                RECENT ANALYSIS
              </h3>
            </div>
            
            <div className="space-y-4">
              {recentAnalyses.length > 0 ? (
                recentAnalyses.map((analysis) => (
                  <div 
                    key={analysis.id}
                    onClick={() => navigate(`/analysis/${analysis.id}`)}
                    className="bg-white/80 backdrop-blur-sm p-5 rounded-xl flex justify-between items-center border border-white/60 hover:bg-white hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#C68E2D] transition-colors">
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
