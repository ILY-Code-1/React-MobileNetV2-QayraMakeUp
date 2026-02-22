import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User, Mail, Calendar, Lock, Shield, Save } from 'lucide-react';
import { useUserStore, type UserData } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';

interface EditFormData {
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'pending';
  eventDate: string;
}

const EditUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { users, updateUser, loading: updateLoading } = useUserStore();
  const { currentUser } = useAuthStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userFound, setUserFound] = useState(false);

  const user = users.find((u) => u.id === id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<EditFormData>();

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

  const onSubmit = (data: EditFormData) => {
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
      const success = await updateUser(id, {
        name: user.name,
        email: user.email,
        role: getValues().role,
        status: getValues().status,
        eventDate: new Date(getValues().eventDate).toISOString(),
      });

      if (success) {
        navigate('/users');
      }
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
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">User Tidak Ditemukan</h2>
            <p className="text-gray-500">User dengan ID tersebut tidak ada</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-black text-white px-6 py-4 flex items-center shadow-lg shrink-0">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="font-medium">Kembali</span>
        </button>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Form Header */}
        <div className="bg-white px-6 py-6 shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Edit User</h1>
          <p className="text-gray-600 text-sm mt-1">
            Edit informasi user yang ada
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Input (Read-only) */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="name"
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Nama tidak dapat diubah</p>
            </div>

            {/* Email Input (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
            </div>

            {/* Password Input (Note) */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value="••••••••"
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Password dapat diubah melalui fitur reset password</p>
            </div>

            {/* Role Input */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="role"
                  className={`w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-[#C68E2D] focus:outline-none text-gray-800 appearance-none cursor-pointer ${
                    user.id === currentUser?.uid ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  {...register('role')}
                  disabled={user.id === currentUser?.uid}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <svg
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 ${
                    user.id === currentUser?.uid ? 'hidden' : 'pointer-events-none'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              {user.id === currentUser?.uid && (
                <p className="text-xs text-gray-500 mt-1">Anda tidak dapat mengubah role sendiri</p>
              )}
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Status Input */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="relative">
                <select
                  id="status"
                  className="w-full pl-4 pr-10 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-[#C68E2D] focus:outline-none text-gray-800 appearance-none cursor-pointer"
                  {...register('status')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
              )}
            </div>

            {/* Event Date Input */}
            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Acara
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="eventDate"
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-[#C68E2D] focus:outline-none text-gray-800"
                  {...register('eventDate')}
                />
              </div>
              {errors.eventDate && (
                <p className="text-red-500 text-sm mt-1">{errors.eventDate.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={updateLoading}
              className="w-full bg-[#C68E2D] hover:bg-[#B77E29] text-white font-semibold py-4 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateLoading ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Dialog Title */}
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Konfirmasi Edit User
              </h3>

              {/* Dialog Message */}
              <p className="text-gray-600 text-sm mb-6">
                Apakah Anda yakin ingin mengubah data user ini?
              </p>

              {/* Dialog Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelSubmit}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="flex-1 bg-[#C68E2D] hover:bg-[#B77E29] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Ya, Simpan
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
