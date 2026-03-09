import React, { useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useAnalysisStore } from '../../store/analysisStore';
import { useAuthStore } from '../../store/authStore';

const getResultColor = (result?: string) => {
  switch (result) {
    case 'Healthy': return 'bg-green-100 text-green-800';
    case 'Improvement': return 'bg-blue-100 text-blue-800';
    case 'Needs Attention': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const RiwayatPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const analyses = useAnalysisStore((state) => state.analyses);
  const loading = useAnalysisStore((state) => state.loading);
  const fetchUserAnalyses = useAnalysisStore((state) => state.fetchUserAnalyses);

  useEffect(() => {
    if (user?.id) {
      fetchUserAnalyses(user.id);
    }
  }, [user?.id, fetchUserAnalyses]);

  return (
    <div className="px-6 py-6 pb-24 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Analisis</h1>
        <p className="text-gray-600 text-sm mt-1">Lihat histori analisis yang telah dilakukan</p>
      </div>

      {/* Summary Stats */}
      <div className="bg-secondary-pink rounded-xl p-4 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#C68E2D] rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{analyses.length}</h3>
            <p className="text-xs text-gray-600 font-medium">Total Riwayat</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="px-4 py-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#C68E2D] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Memuat data...</p>
          </div>
        ) : analyses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap min-w-[100px]">Tanggal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap min-w-[150px]">Nama</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap min-w-[200px]">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap min-w-[100px]">Hasil</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-600">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                              : item.eventDate
                                ? new Date(item.eventDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                : '-'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="text-sm font-medium text-gray-800">{item.name}</span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="text-xs text-gray-600 break-words">{item.email}</span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start space-x-2">
                        <Clock className="w-3 h-3 text-gray-400 shrink-0 mt-1" />
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getResultColor(item.result)}`}>
                          {item.result ?? 'Selesai'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Belum ada riwayat analisis</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatPage;
