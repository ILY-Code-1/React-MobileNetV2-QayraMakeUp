import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User, Mail, Calendar, Shield, Save } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';

interface EditFormData {
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'pending';
  eventDate?: string;
}

const EditUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { users, updateUser, loading: updateLoading } = useUserStore();
  const { user: currentUser } = useAuthStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userFound, setUserFound] = useState(false);

  const user = users.find((u) => u.id === id);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch
  } = useForm<EditFormData>();

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedRole = watch('role');

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('role', user.role);
      setValue('status', user.status);
      setValue('eventDate', user.eventDate ? user.eventDate.split('T')[0] : '');
      setUserFound(true);
    } else {
      setUserFound(false);
    }
  }, [user, setValue]);

  const onSubmit = () => {
    if (error) {
      setError(null);
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!id || !user) return;

    setShowConfirmDialog(false);
    setError(null);

    try {
      const formData = getValues();
      const success = await updateUser({
        uid: id,
        name: formData.name,
        email: user.email,
        role: formData.role,
        status: formData.status,
        eventDate: formData.role === 'admin' || !formData.eventDate ? '' : new Date(formData.eventDate).toISOString(),
      });

      if (success) {
        navigate('/users');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Gagal mengupdate user');
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  const handleBack = () => {
    navigate('/users');
  };

  if (!userFound) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-black text-white px-6 py-4 flex items-center shadow-lg shrink-0">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-medium">Kembali</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="w-16 h-16 text-black mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">User Tidak Ditemukan</h2>
            <p className="text-gray-500">User dengan ID tersebut tidak ada</p>
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Edit User</h1>
          <p className="text-gray-500 font-medium">Perbarui informasi data user</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl font-bold text-xs uppercase tracking-wider animate-pulse">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-[#C68E2D]/10 rounded-4xl p-8 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black group-focus-within:text-[#C68E2D] transition-colors w-5 h-5" />
                <input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-none rounded-2xl focus:ring-2 focus:ring-[#C68E2D] text-gray-800 font-bold placeholder-gray-400 transition-all"
                  {...register('name', { required: 'Nama lengkap wajib diisi' })}
                />
              </div>
            </div>

            {/* Email Input (Read-only) */}
            <div className="space-y-2 opacity-60">
              <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  title="Email"
                  placeholder="user@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-100/50 border-none rounded-2xl text-gray-500 font-bold cursor-not-allowed"
                />
              </div>
              <p className="text-[9px] font-bold text-black uppercase tracking-widest ml-1">Email tidak dapat diubah</p>
            </div>

            {/* Role, Status & Date - Single Column */}
            <div className="space-y-6">
              {/* Role Input */}
              <div className="space-y-2">
                <label htmlFor="role" className="block text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">Role</label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black group-focus-within:text-[#C68E2D] transition-colors w-5 h-5" />
                  <select
                    id="role"
                    className={`w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-none rounded-2xl focus:ring-2 focus:ring-[#C68E2D] text-gray-800 font-bold appearance-none cursor-pointer transition-all ${
                      user?.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    {...register('role')}
                    disabled={user?.id === currentUser?.id}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {user?.id === currentUser?.id && (
                  <p className="text-[9px] font-bold text-[#C68E2D] uppercase tracking-widest ml-1">Anda tidak dapat mengubah role sendiri</p>
                )}
              </div>

              {/* Status Input */}
              <div className="space-y-2">
                <label htmlFor="status" className="block text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">Status Akun</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${getValues().status === 'active' ? 'bg-green-500' : getValues().status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  </div>
                  <select
                    id="status"
                    className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-none rounded-2xl focus:ring-2 focus:ring-[#C68E2D] text-gray-800 font-bold appearance-none cursor-pointer transition-all"
                    {...register('status')}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Event Date Input */}
              {selectedRole !== 'admin' && (
                <div className="space-y-2">
                  <label htmlFor="eventDate" className="block text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">Tanggal Acara</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black group-focus-within:text-[#C68E2D] transition-colors w-5 h-5" />
                    <input
                      id="eventDate"
                      type="date"
                      className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-none rounded-2xl focus:ring-2 focus:ring-[#C68E2D] text-gray-800 font-bold transition-all"
                      {...register('eventDate')}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={updateLoading}
                className="w-full bg-black text-white font-black text-lg py-5 rounded-2xl border-2 border-white/10 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-black/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.3em] shadow-xl"
              >
                {updateLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-4xl max-w-sm w-full p-8 shadow-2xl border border-gray-100 transform transition-all scale-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-20 h-20 bg-[#C68E2D]/10 rounded-full mb-6">
                <Save className="w-10 h-10 text-[#C68E2D]" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Konfirmasi</h3>
              <p className="text-gray-500 font-medium mb-8">
                Simpan perubahan data user ini?
              </p>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleConfirmSubmit}
                  className="w-full bg-black text-white font-black py-4 rounded-2xl hover:bg-gray-900 transition-all uppercase tracking-widest text-sm shadow-lg active:scale-[0.98]"
                >
                  Ya, Simpan
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

export default EditUserPage;
