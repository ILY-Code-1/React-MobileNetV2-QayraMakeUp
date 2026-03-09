import React, { useEffect } from 'react';
import { User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAnalysisStore } from '../../store/analysisStore';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const analyses = useAnalysisStore((state) => state.analyses);
  const fetchUserAnalyses = useAnalysisStore((state) => state.fetchUserAnalyses);

  useEffect(() => {
    if (user?.id) {
      fetchUserAnalyses(user.id);
    }
  }, [user?.id, fetchUserAnalyses]);

  const recentAnalyses = analyses.slice(0, 3);

  return (
    <div className="px-6 py-6 pb-24 space-y-6">
      {/* Profile Section */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-[#C68E2D] rounded-full flex items-center justify-center shadow-md">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Selamat Datang</h2>
          <p className="text-gray-600 text-sm">{user?.name || user?.email || 'user@qayra.com'}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Analysis Card */}
        <div className="bg-secondary-pink rounded-xl p-4 shadow-md col-span-2">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#C68E2D] rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{analyses.length}</h3>
            <p className="text-sm text-gray-600 font-medium">Total Analisis Saya</p>
          </div>
        </div>
      </div>

      {/* Recent Analysis Card */}
      <div className="bg-secondary-pink rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">ANALISIS TERBARU</h3>
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
            <p className="text-gray-500 text-sm">Belum ada analisis</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
