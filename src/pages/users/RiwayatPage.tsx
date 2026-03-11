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
    <div className="px-6 py-6 pb-24 space-y-8 bg-white min-h-full font-sans">
      {/* Page Title */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Riwayat Analisis</h2>
        <p className="text-gray-500 font-medium mt-1">Daftar lengkap hasil pengecekan kulit wajah Anda</p>
      </div>

      {/* History Table Container */}
      <div className="bg-[#FDE7E7] rounded-[40px] p-8 border border-[#FAD2D2] shadow-sm relative overflow-hidden min-h-[400px]">
        <div className="relative z-10">
          {loading ? (
            <div className="py-24 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#C68E2D] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Memuat histori...</p>
            </div>
          ) : analyses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                    <th className="px-4 py-2">Tanggal</th>
                    <th className="px-4 py-2 text-center">|</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-center">|</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((item) => (
                    <tr
                      key={item.id}
                      className="bg-white/80 backdrop-blur-sm hover:bg-white transition-all group shadow-sm active:scale-[0.98]"
                    >
                      <td className="px-4 py-5 rounded-l-2xl">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 group-hover:text-[#C68E2D] transition-colors">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                              : '-'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-5 text-gray-100 text-center">|</td>
                      <td className="px-4 py-5 text-center">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${getResultColor(item.result)}`}>
                          {item.result ?? 'Selesai'}
                        </span>
                      </td>
                      <td className="px-2 py-5 text-gray-100 text-center">|</td>
                      <td className="px-4 py-5 rounded-r-2xl text-center">
                        <button
                          className="bg-black text-white p-2.5 rounded-xl hover:bg-gray-900 transition-colors shadow-sm"
                          title="Lihat Detail"
                        >
                          <Clock size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Belum ada riwayat analisis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiwayatPage;
