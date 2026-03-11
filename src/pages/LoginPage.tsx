import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import qayraIcon from '../assets/qayra-icon.png';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Email dan password harus diisi!',
        confirmButtonColor: '#C68E2D',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Format email tidak valid!',
        confirmButtonColor: '#C68E2D',
      });
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);

      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil',
        text: 'Selamat datang kembali!',
        confirmButtonColor: '#C68E2D',
      }).then(() => {
        navigate('/dashboard');
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: error.message || 'Terjadi kesalahan saat login',
        confirmButtonColor: '#C68E2D',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDE7E7] font-sans">
      <div className="max-w-md w-full mx-6 relative">
        {/* Logo Bulat - Floating Above */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-32 h-32 bg-black rounded-full flex items-center justify-center border-4 border-[#C68E2D] shadow-xl overflow-hidden">
            <img src={qayraIcon} alt="Qayra Logo" className="w-24 h-24 object-contain" />
          </div>
        </div>

        <div className="bg-[#C68E2D] rounded-[40px] shadow-2xl pt-24 pb-12 px-8 relative overflow-hidden">
          {/* Black Bar at Top */}
          <div className="absolute top-0 left-0 w-full h-20 bg-black z-10"></div>

          {/* Title Section */}
          <div className="relative z-20 text-center mb-8 mt-4">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wider leading-tight">
              QAYRA FACIAL ANALYZING
            </h1>
            <p className="text-white text-[10px] md:text-xs font-medium tracking-[0.2em] mt-1 opacity-90 uppercase">
              BY QAYRA MAKE UP
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-20">
            {/* Email Field */}
            <div className="relative group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full bg-[#FDE7E7] text-gray-800 placeholder-gray-500 px-5 py-4 rounded-md border-none focus:ring-2 focus:ring-black transition-all duration-300"
                disabled={loading}
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full bg-[#FDE7E7] text-gray-800 placeholder-gray-500 px-5 py-4 rounded-md border-none focus:ring-2 focus:ring-black transition-all duration-300 pr-12"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Login Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-bold text-lg py-4 rounded-xl border-2 border-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-black/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  'LOGIN'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
