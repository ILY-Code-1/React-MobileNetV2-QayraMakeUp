import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Activity, BarChart3, Image as ImageIcon } from 'lucide-react';
import qayraIcon from '../../assets/qayra-icon.png';
import { getAnalysisById } from '../../services/firestoreService';
import type { AnalysisData } from '../../services/firestoreService';
import { OUTPUT_INDEX_MAPPING } from '../../utils/mlConfig';

import { useAuthStore } from '../../store/authStore';

const AnalysisDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!id) return;

    getAnalysisById(id)
      .then((data: AnalysisData | null) => {
        // Validate userId
        if (data && user && data.userId !== user.id) {
          setAccessDenied(true);
          setAnalysisData(null);
        } else {
          setAnalysisData(data);
          setAccessDenied(false);
        }
      })
      .catch(() => setAnalysisData(null))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleBack = () => {
    navigate('/riwayat');
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 0.80) return 'bg-green-100 text-green-800';
    if (score >= 0.60) return 'bg-blue-100 text-blue-800';
    if (score >= 0.40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceLabel = (score?: number) => {
    if (!score) return 'Tidak Diketahui';
    if (score >= 0.80) return 'Tinggi';
    if (score >= 0.60) return 'Sedang';
    if (score >= 0.40) return 'Rendah';
    return 'Tidak Pasti';
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
            {accessDenied ? (
              <>
                <p className="text-xl font-semibold text-red-600 mb-2">Akses Ditolak</p>
                <p className="text-gray-600 text-sm">Anda tidak memiliki akses ke data analisis ini</p>
              </>
            ) : (
              <>
                <p className="text-xl font-semibold text-gray-800 mb-2">Data Tidak Ditemukan</p>
                <p className="text-gray-600 text-sm">Data analisis dengan ID {id} tidak ada</p>
              </>
            )}
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
              {analysisData.predictedLabelDisplay || analysisData.result || 'Completed'}
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

          {/* Confidence Score Card */}
          {analysisData.confidenceScore !== undefined && (
            <div className="bg-[#C68E2D]/10 rounded-4xl p-8 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-[#C68E2D]">
                  <Activity className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Tingkat Keyakinan</h2>
              </div>
              <div className="flex items-center space-x-4 ml-2">
                <span className="text-4xl font-black text-gray-900">
                  {(analysisData.confidenceScore * 100).toFixed(1)}%
                </span>
                <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${getConfidenceColor(analysisData.confidenceScore)}`}>
                  {getConfidenceLabel(analysisData.confidenceScore)}
                </span>
              </div>
            </div>
          )}

          {/* Hasil Analisis Summary Card */}
          {analysisData.generatedSummary && (
            <div className="bg-[#C68E2D]/10 rounded-4xl p-8 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-[#C68E2D]">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Hasil Analisis</h2>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                <p className="text-lg font-black text-gray-900 leading-relaxed">
                  {analysisData.generatedSummary}
                </p>
              </div>
            </div>
          )}

          {/* Clinical Notes Card */}
          {analysisData.clinicalNotes && (
            <div className="bg-[#C68E2D]/10 rounded-4xl p-8 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-6 text-center">Catatan Klinis</h2>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/40">
                <p className="text-base font-bold text-gray-800 leading-relaxed">
                  {analysisData.clinicalNotes}
                </p>
              </div>
            </div>
          )}

          {/* Clinical Focus Card */}
          {analysisData.clinicalFocus && (
            <div className="bg-[#C68E2D]/10 rounded-4xl p-8 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-6 text-center">Fokus Klinis</h2>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/40">
                <p className="text-base font-bold text-gray-800 leading-relaxed">
                  {analysisData.clinicalFocus}
                </p>
              </div>
            </div>
          )}

          {/* Treatment Priority Card */}
          {analysisData.treatmentPriority && analysisData.treatmentPriority.length > 0 && (
            <div className="bg-[#C68E2D]/10 rounded-4xl p-8 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-6 text-center">Prioritas Perawatan</h2>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                <ul className="space-y-3">
                  {analysisData.treatmentPriority.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#C68E2D] text-white rounded-full flex items-center justify-center text-sm font-black">
                        {index + 1}
                      </span>
                      <span className="text-base font-bold text-gray-800 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Preparation Protocol Card */}
          {analysisData.preparationProtocol && (
            <div className="bg-[#C68E2D]/10 rounded-4xl p-8 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-6 text-center">Protokol Persiapan</h2>
              <div className="space-y-6">
                {/* 7 Days Before */}
                {analysisData.preparationProtocol['7_days_before'] && analysisData.preparationProtocol['7_days_before'].length > 0 && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                    <h3 className="text-sm font-black text-[#C68E2D] uppercase tracking-widest mb-4">7 Hari Sebelum</h3>
                    <ul className="space-y-2">
                      {analysisData.preparationProtocol['7_days_before'].map((item, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#C68E2D] rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm font-bold text-gray-700 leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 3 Days Before */}
                {analysisData.preparationProtocol['3_days_before'] && analysisData.preparationProtocol['3_days_before'].length > 0 && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                    <h3 className="text-sm font-black text-[#C68E2D] uppercase tracking-widest mb-4">3 Hari Sebelum</h3>
                    <ul className="space-y-2">
                      {analysisData.preparationProtocol['3_days_before'].map((item, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#C68E2D] rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm font-bold text-gray-700 leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Day of Makeup */}
                {analysisData.preparationProtocol.day_of_makeup && analysisData.preparationProtocol.day_of_makeup.length > 0 && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                    <h3 className="text-sm font-black text-[#C68E2D] uppercase tracking-widest mb-4">Hari Makeup</h3>
                    <ul className="space-y-2">
                      {analysisData.preparationProtocol.day_of_makeup.map((item, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#C68E2D] rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm font-bold text-gray-700 leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Probability Distribution Card */}
          {analysisData.modelOutputRaw && analysisData.modelOutputRaw.length > 0 && (
            <div className="bg-[#C68E2D]/10 rounded-4xl p-8 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-6 text-center">Distribusi Probabilitas</h2>
              <div className="space-y-4">
                {analysisData.modelOutputRaw.map((prob, index) => {
                  const classInfo = OUTPUT_INDEX_MAPPING[index.toString()];
                  const isPredicted = analysisData.predictedLabel === classInfo.key;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`font-bold text-sm ${isPredicted ? 'text-[#C68E2D]' : 'text-gray-700'}`}>
                          {classInfo.label}
                        </span>
                        <span className={`font-black text-sm ${isPredicted ? 'text-[#C68E2D]' : 'text-gray-700'}`}>
                          {(prob * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${isPredicted ? 'bg-[#C68E2D]' : 'bg-gray-400'}`}
                          style={{ width: `${prob * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Image Card */}
          {analysisData.imageUrl && (
            <div className="bg-[#C68E2D]/10 rounded-4xl p-8 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-[#C68E2D]">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Foto Analisis</h2>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                <img
                  src={analysisData.imageUrl}
                  alt="Analyzed photo"
                  className="w-full h-auto rounded-xl object-cover"
                />
              </div>
            </div>
          )}

          {/* Catatan Qayra Card */}
          <div className="bg-[#C68E2D]/10 rounded-4xl p-8 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-6 text-center">Catatan Qayra</h2>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/40">
              <p className="text-base font-bold text-gray-800 leading-relaxed">
                {analysisData.catatan_qayra || '-'}
              </p>
            </div>
          </div>

          {/* Analysis Date */}
          {analysisData.createdAt && !isNaN(new Date(analysisData.createdAt).getTime()) && (
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Dianalisis pada {new Date(analysisData.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetailPage;
