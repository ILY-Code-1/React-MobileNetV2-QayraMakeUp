import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User, Mail, Calendar } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  eventDate: string;
}

const AddUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserData>();

  const onSubmit = (data: UserData) => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    reset();
    // Navigate back to users page
    navigate('/users');
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  const handleBack = () => {
    navigate('/users');
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Tambah User</h1>
          <p className="text-gray-600 text-sm mt-1">
            Isi formulir untuk menambahkan user baru
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-[#C68E2D] focus:outline-none text-gray-800 placeholder-gray-400"
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
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  placeholder="Masukkan email"
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-[#C68E2D] focus:outline-none text-gray-800 placeholder-gray-400"
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
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
                  {...register('eventDate', {
                    required: 'Tanggal acara wajib diisi',
                  })}
                />
              </div>
              {errors.eventDate && (
                <p className="text-red-500 text-sm mt-1">{errors.eventDate.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#C68E2D] hover:bg-[#B77E29] text-white font-semibold py-4 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Simpan User</span>
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
                Konfirmasi Tambah User
              </h3>

              {/* Dialog Message */}
              <p className="text-gray-600 text-sm mb-6">
                Apakah Anda yakin ingin membuat user baru dengan data yang telah diisi?
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
                  Ya, Buat
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
