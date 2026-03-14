import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Download } from 'lucide-react';
import qayraIcon from '../../assets/qayra-icon.png';
import { getAnalysisById } from '../../services/firestoreService';
import type { AnalysisData } from '../../services/firestoreService';
import Swal from 'sweetalert2';

const AnalysisDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getAnalysisById(id)
      .then((data: AnalysisData | null) => setAnalysisData(data))
      .catch(() => setAnalysisData(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBack = () => {
    navigate('/analysis');
  };

  const handleDownload = () => {
    Swal.fire({
      title: 'Download Hasil Analisis',
      text: 'Fitur download belum tersedia saat ini.',
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#C68E2D',
      customClass: { popup: 'swal2-popup' },
    });
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-black text-white px-6 py-4 flex items-center shadow-lg shrink-0">
          <button type="button" onClick={handleBack} className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-6 h-6" />
            <span className="font-medium">Kembali</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#C68E2D] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-black text-white px-6 py-4 flex items-center shadow-lg shrink-0">
          <button type="button" onClick={handleBack} className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-6 h-6" />
            <span className="font-medium">Kembali</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-800 mb-2">Data Tidak Ditemukan</p>
            <p className="text-gray-600 text-sm">Data analisis dengan ID {id} tidak ada</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white font-sans">
      {/* Header with Back Button */}
      <div className="bg-black text-white px-6 py-5 flex items-center shadow-2xl shrink-0 z-10">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center space-x-3 text-white hover:text-[#C68E2D] transition-all active:scale-95 group"
        >
          <div className="p-2 bg-white/10 rounded-xl group-hover:bg-[#C68E2D]/20 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </div>
          <span className="font-black uppercase tracking-[0.2em] text-sm">Kembali</span>
        </button>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-full p-1 border-4 border-[#C68E2D] shadow-2xl overflow-hidden">
              <img src={qayraIcon} alt="QAYRA" className="w-full h-full object-contain" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest border-2 border-[#C68E2D]">
              {analysisData.result ?? 'Completed'}
            </div>
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">{analysisData.name}</h1>
            <p className="text-gray-500 font-bold text-sm tracking-wide">{analysisData.email}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Tanggal Acara Card */}
          <div className="bg-[#C68E2D]/10 rounded-4xl p-8 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-[#C68E2D]">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Tanggal Acara</h2>
            </div>
            <p className="text-2xl font-black text-gray-800 ml-2">
              {analysisData.eventDate && !isNaN(new Date(analysisData.eventDate).getTime())
                ? new Date(analysisData.eventDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                : '-'}
            </p>
          </div>

          {/* Hasil Analisis Detail Card */}
          <div className="bg-[#C68E2D]/10 rounded-4xl p-8 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all min-h-50 flex flex-col justify-center">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-6 text-center">Hasil Analisis</h2>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/40">
              <p className="text-xl font-black text-gray-900 leading-relaxed uppercase tracking-wide">
                {analysisData.result ?? 'Analisis Selesai'}
              </p>
              {analysisData.createdAt && !isNaN(new Date(analysisData.createdAt).getTime()) && (
                <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-[0.2em]">
                  Dianalisis pada {new Date(analysisData.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="w-full bg-black text-white font-black text-lg py-5 rounded-2xl border-2 border-white/10 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-black/10 active:scale-[0.98] transition-all uppercase tracking-[0.3em] shadow-xl flex items-center justify-center space-x-3"
          >
            <Download className="w-6 h-6" />
            <span>Download Hasil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetailPage;
