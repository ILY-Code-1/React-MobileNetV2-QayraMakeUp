import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import qayraIcon from '../assets/qayra-icon.png';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data.email, data.password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-pink to-pink-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-[#C68E2D] rounded-3xl p-8 shadow-2xl">
          {/* Header with Profile Badge */}
          <div className="flex flex-col items-center mb-8">
            {/* Logo Image */}
            <img
              src={qayraIcon}
              alt="QAYRA Logo"
              className="w-20 h-20 rounded-full mb-4 shadow-lg object-contain bg-black"
            />

            {/* Title */}
            <h1 className="text-white text-2xl font-serif font-bold text-center tracking-wide">
              QAYRA FACIAL ANALYZING
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  placeholder="Masukkan email"
                  className="w-full pl-10 pr-4 py-3 bg-white rounded-md border-2 border-transparent focus:border-black focus:outline-none text-gray-800 placeholder-gray-400"
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
                <p className="text-white text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-12 py-3 bg-white rounded-md border-2 border-transparent focus:border-black focus:outline-none text-gray-800 placeholder-gray-400"
                  {...register('password', {
                    required: 'Password wajib diisi',
                    minLength: {
                      value: 6,
                      message: 'Password minimal 6 karakter',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-white text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-black text-white py-4 rounded-lg font-semibold text-lg border-2 border-white hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              LOGIN
            </button>
          </form>

          {/* Demo Accounts Info */}
          <div className="mt-6 p-4 bg-black bg-opacity-20 rounded-lg">
            <p className="text-white text-xs text-center font-medium mb-2">
              DEMO ACCOUNTS:
            </p>
            <div className="space-y-1 text-xs text-white/80 text-center">
              <p><span className="text-yellow-300">Admin:</span> admin@qayra.com / admin123</p>
              <p><span className="text-green-300">User:</span> user@qayra.com / user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
