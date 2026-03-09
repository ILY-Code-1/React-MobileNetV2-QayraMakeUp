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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-black text-white px-6 py-4 flex items-center shadow-lg shrink-0">
        <button type="button" onClick={handleBack} className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
          <ArrowLeft className="w-6 h-6" />
          <span className="font-medium">Kembali</span>
        </button>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile Header */}
        <div className="bg-white px-6 py-8 shadow-md">
          <div className="flex flex-col items-center">
            <img src={qayraIcon} alt="QAYRA" className="w-24 h-24 rounded-full object-contain mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">{analysisData.name}</h1>
            <p className="text-gray-600 text-sm mt-1">{analysisData.email}</p>
            <div className="mt-3">
              <span className="bg-[#C68E2D] text-white text-xs font-medium px-3 py-1 rounded-full">
                {analysisData.result ?? 'Completed'}
              </span>
            </div>
          </div>
        </div>

        {/* Informasi Section */}
        <div className="px-6 py-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Informasi</h2>

          {/* Event Information Card */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 mr-2 text-[#C68E2D]" />
              <h3 className="text-base font-bold text-gray-800">Tanggal Acara</h3>
            </div>
            <div className="text-base font-semibold text-gray-800">
              {analysisData.eventDate
                ? new Date(analysisData.eventDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                : '-'}
            </div>
          </div>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="w-full bg-[#C68E2D] hover:bg-[#B77E29] text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Hasil Analisis</span>
          </button>
        </div>

        {/* Hasil Analisis */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-center min-h-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Hasil Analisis</h3>
                <p className="text-gray-600 text-sm">Hasil analisis akan tampil di sini</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetailPage;
