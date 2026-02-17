import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Calendar, Mail, User } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import Swal from 'sweetalert2';

const AnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const analyses = useAnalysisStore((state) => state.analyses);
  const deleteAnalysis = useAnalysisStore((state) => state.deleteAnalysis);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const filteredAnalyses = analyses.filter(analysis =>
    analysis.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-6 py-6 pb-24 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Analysis</h1>
        <p className="text-gray-600 text-sm mt-1">Kelola data analisis klien</p>
      </div>

      {/* Search Field */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C68E2D] focus:border-transparent text-sm"
        />
      </div>

      {/* Stats Summary */}
      <div className="bg-secondary-pink rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#C68E2D] rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{filteredAnalyses.length}</h3>
              <p className="text-xs text-gray-600 font-medium">Total Analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredAnalyses.length > 0 ? (
          <div className="space-y-0">
            {/* Table Header */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600">
                <div className="col-span-3">Nama</div>
                <div className="col-span-5">Email</div>
                <div className="col-span-3">Tanggal</div>
                <div className="col-span-1 text-center">Aksi</div>
              </div>
            </div>

            {/* Table Body */}
            {filteredAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                onClick={() => {
                  setDeleteId(analysis.id);
                  Swal.fire({
                    title: 'Konfirmasi Hapus',
                    text: 'Apakah Anda yakin ingin menghapus data analisis ini? Tindakan ini tidak dapat dibatalkan.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Ya, Hapus',
                    cancelButtonText: 'Batal',
                    customClass: {
                      popup: 'swal2-popup',
                    },
                  }).then((result) => {
                    if (result.isConfirmed) {
                      deleteAnalysis(analysis.id);
                    }
                  });
                }}
                className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="grid grid-cols-12 gap-2 items-center">
                  {/* Name */}
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-[#C68E2D] rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {analysis.name}
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-span-5 flex items-center space-x-2">
                    <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600 truncate">
                      {analysis.email}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-3">
                    <span className="text-xs text-gray-600">
                      {new Date(analysis.eventDate).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(analysis.id);
                        Swal.fire({
                          title: 'Konfirmasi Hapus',
                          text: 'Apakah Anda yakin ingin menghapus data analisis ini? Tindakan ini tidak dapat dibatalkan.',
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#d33',
                          cancelButtonColor: '#3085d6',
                          confirmButtonText: 'Ya, Hapus',
                          cancelButtonText: 'Batal',
                          customClass: {
                            popup: 'swal2-popup',
                          },
                        }).then((result) => {
                          if (result.isConfirmed) {
                            deleteAnalysis(analysis.id);
                          }
                        });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? 'Tidak ada hasil yang ditemukan'
                : 'Belum ada data analisis'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
