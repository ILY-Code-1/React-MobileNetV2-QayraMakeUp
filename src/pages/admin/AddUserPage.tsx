import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User, Mail, Calendar, Lock, Shield } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

interface UserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  eventDate: string;
}

const AddUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createUser } = useUserStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<UserData>({
    defaultValues: {
      role: 'user',
    },
  });

  const onSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);
    setIsSubmitting(true);

    try {
      const formData = getValues();
      const success = await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        eventDate: new Date(formData.eventDate).toISOString(),
      });

      if (success) {
        reset();
        navigate('/users');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  const handleBack = () => {
    navigate('/users');
  };

  return (
    <div className="h-full flex flex-col bg-white font-sans">
      {/* Header with Back Button */}
      <div className="bg-black text-white px-6 py-5 flex items-center shadow-2xl shrink-0 z-10">
        <button
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
        {/* Form Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Tambah User</h1>
          <p className="text-gray-500 font-medium">
            Lengkapi data di bawah untuk mendaftarkan akun baru
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#FDE7E7] rounded-[32px] p-8 border border-[#FAD2D2] shadow-sm relative overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                Nama Lengkap
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#C68E2D] transition-colors w-5 h-5" />
                <input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-none rounded-2xl focus:ring-2 focus:ring-[#C68E2D] text-gray-800 font-bold placeholder-gray-400 transition-all"
                  {...register('name', {
                    required: 'Nama wajib diisi',
                    minLength: {
                      value: 2,
                      message: 'Nama minimal 2 karakter',
                    },
                  })}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1 ml-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#C68E2D] transition-colors w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  placeholder="Masukkan email"
                  className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-none rounded-2xl focus:ring-2 focus:ring-[#C68E2D] text-gray-800 font-bold placeholder-gray-400 transition-all"
                  {...register('email', {
                    required: 'Email wajib diisi',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email tidak valid',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1 ml-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#C68E2D] transition-colors w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-none rounded-2xl focus:ring-2 focus:ring-[#C68E2D] text-gray-800 font-bold placeholder-gray-400 transition-all"
                  {...register('password', {
                    required: 'Password wajib diisi',
                    minLength: {
                      value: 6,
                      message: 'Password minimal 6 karakter',
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1 ml-1">{errors.password.message}</p>
              )}
            </div>

            {/* Role & Date Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="role" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                  Role
                </label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#C68E2D] transition-colors w-5 h-5" />
                  <select
                    id="role"
                    className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-none rounded-2xl focus:ring-2 focus:ring-[#C68E2D] text-gray-800 font-bold appearance-none cursor-pointer transition-all"
                    {...register('role')}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="eventDate" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                  Tanggal Acara
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#C68E2D] transition-colors w-5 h-5" />
                  <input
                    id="eventDate"
                    type="date"
                    className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-none rounded-2xl focus:ring-2 focus:ring-[#C68E2D] text-gray-800 font-bold transition-all"
                    {...register('eventDate', {
                      required: 'Wajib diisi',
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white font-black text-lg py-5 rounded-2xl border-2 border-white/10 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-black/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.3em] shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  'Daftarkan User'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-8 shadow-2xl border border-gray-100 transform transition-all scale-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-20 h-20 bg-[#FDE7E7] rounded-full mb-6">
                <Shield className="w-10 h-10 text-[#C68E2D]" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Konfirmasi</h3>
              <p className="text-gray-500 font-medium mb-8">
                Apakah Anda yakin ingin mendaftarkan user baru dengan data tersebut?
              </p>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleConfirmSubmit}
                  className="w-full bg-black text-white font-black py-4 rounded-2xl hover:bg-gray-900 transition-all uppercase tracking-widest text-sm shadow-lg active:scale-[0.98]"
                >
                  Ya, Daftarkan
                </button>
                <button
                  onClick={handleCancelSubmit}
                  className="w-full bg-gray-100 text-gray-500 font-black py-4 rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUserPage;
