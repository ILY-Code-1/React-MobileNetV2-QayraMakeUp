import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form
    if (!formData.email || !formData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Email dan password harus diisi!',
        confirmButtonColor: '#C68E2D',
      });
      return;
    }

    // Validasi email format
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
        // Redirect sesuai role user
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/analysis');
          }
        } else {
          navigate('/dashboard');
        }
      });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">QayraMakeUp</h1>
            <p className="text-amber-100 text-center mt-2">Login to your account</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                  required
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
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
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Footer */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <a
                    href="/register"
                    className="font-medium text-amber-600 hover:text-amber-500 transition-colors duration-200"
                  >
                    Sign up
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Info */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Secure authentication with encrypted passwords
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
