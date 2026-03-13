import React, { useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useAnalysisStore } from '../../store/analysisStore';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const AnalysisPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate()

  const analyses = useAnalysisStore((state) => state.analyses);
  const loading = useAnalysisStore((state) => state.loading);
  const fetchAllAnalyses = useAnalysisStore((state) => state.fetchAllAnalyses);
  const removeAnalysis = useAnalysisStore((state) => state.removeAnalysis);

  useEffect(() => {
    fetchAllAnalyses();
  }, [fetchAllAnalyses]);

  const filteredAnalyses = analyses.filter(analysis =>
    analysis.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Konfirmasi Hapus',
      text: 'Apakah Anda yakin ingin menghapus data analisis ini? Tindakan ini tidak dapat dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      customClass: { popup: 'swal2-popup' },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await removeAnalysis(id);
          Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data analisis berhasil dihapus.', confirmButtonColor: '#C68E2D' });
        } catch {
          Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus data analisis.', confirmButtonColor: '#C68E2D' });
        }
      }
    });
  };

  return (
    <div className="px-6 py-6 pb-24 space-y-8 bg-white min-h-full">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Hasil Analisis</h1>
        <p className="text-gray-500 font-medium mt-1">Histori data analisis kecantikan klien</p>
      </div>

      {/* Search Field */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#C68E2D] transition-colors w-5 h-5" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-[#FDE7E7] border-none rounded-2xl focus:ring-2 focus:ring-[#C68E2D] text-gray-800 font-medium placeholder-gray-400 shadow-sm transition-all"
        />
      </div>

      {/* Analysis Table Container */}
      <div className="bg-[#FDE7E7] rounded-[32px] p-6 border border-[#FAD2D2] shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#C68E2D] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Memuat data...</p>
            </div>
          ) : filteredAnalyses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <th className="px-4 py-2">Nama</th>
                    <th className="px-4 py-2 text-center">|</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2 text-center">|</th>
                    <th className="px-4 py-2">Tgl Acara</th>
                    <th className="px-4 py-2 text-center">|</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnalyses.map((analysis) => (
                    <tr
                      key={analysis.id}
                      className="bg-white/80 backdrop-blur-sm hover:bg-white transition-all group shadow-sm"
                    >
                      <td className="px-4 py-4 rounded-l-2xl">
                        <span className="font-bold text-gray-900 group-hover:text-[#C68E2D] transition-colors">{analysis.name}</span>
                      </td>
                      <td className="px-2 py-4 text-gray-100 text-center">|</td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-gray-600">{analysis.email}</span>
                      </td>
                      <td className="px-2 py-4 text-gray-100 text-center">|</td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold text-gray-700">
                          {analysis.eventDate
                            ? new Date(analysis.eventDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-gray-100 text-center">|</td>
                      <td className="px-4 py-4 rounded-r-2xl text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => navigate(`/analysis/${analysis.id}`)}
                            className="p-2 text-[#C68E2D] hover:bg-amber-50 rounded-lg transition-colors"
                            title="Detail"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(analysis.id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                {searchTerm ? 'Tidak ada hasil ditemukan' : 'Belum ada data analisis'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
