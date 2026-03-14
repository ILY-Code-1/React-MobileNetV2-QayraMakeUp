import React, { useEffect } from 'react';
import { User, Calendar, Sparkles, Heart, Clock, Activity } from 'lucide-react';
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

  // const recentAnalyses = analyses.slice(0, 3);

  return (
    <div className="px-6 py-6 pb-24 space-y-10 bg-white min-h-full font-sans">
      {/* Client Info Section */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3">
          <User className="w-6 h-6 text-[#C68E2D]" />
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Informasi Client</h2>
        </div>
        <div className="bg-[#C68E2D]/10 rounded-3xl p-8 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="relative z-10 space-y-4">
            <div className="flex items-start">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest w-24 shrink-0 flex items-center space-x-2">
                <Heart className="w-3.5 h-3.5" />
                <span>Nama</span>
              </span>
              <span className="text-sm font-black text-gray-900 border-l-2 border-[#C68E2D]/20 pl-4 ml-4">
                : {user?.name || '-'}
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest w-24 shrink-0 flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tgl Acara</span>
              </span>
              <span className="text-sm font-black text-gray-900 border-l-2 border-[#C68E2D]/20 pl-4 ml-4">
                : {user?.eventDate && !isNaN(new Date(user.eventDate).getTime()) ? new Date(user.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </span>
            </div>
          </div>
          {/* Subtle logo background */}
          <div className="absolute -right-8 -bottom-8 opacity-5 transform rotate-12 text-[#C68E2D]">
            <Sparkles size={160} />
          </div>
        </div>
      </section>

      {/* Last Status Section */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-[#C68E2D]" />
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Status Terakhir</h2>
        </div>
        <div className="bg-[#C68E2D]/10 rounded-3xl p-10 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden flex items-center justify-center text-center min-h-40 group hover:shadow-md transition-all">
          <div className="absolute -left-10 -bottom-10 opacity-5 transform -rotate-12 text-[#C68E2D]">
            <Clock size={140} />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <Sparkles className="w-8 h-8 text-[#C68E2D] mb-4 opacity-50" />
            <p className="text-xl font-black text-gray-800 tracking-wide leading-relaxed">
              {analyses.length > 0 
                ? (analyses[0].result || 'Analisis Selesai') 
                : 'Belum Ada Data Analisis'}
            </p>
            {analyses.length > 0 && analyses[0].createdAt && !isNaN(new Date(analyses[0].createdAt).getTime()) && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-3 flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span>Dianalisis pada {new Date(analyses[0].createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
