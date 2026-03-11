import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Calendar, Mail, User, Edit2, Shield, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore, type UserData } from '../../store/userStore';
import Swal from 'sweetalert2';

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { users, loading, getAllUsers, deleteUser } = useUserStore();
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const handleAddUser = () => {
    navigate('/users/add');
  };

  const handleEdit = (id: string) => {
    navigate(`/users/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Konfirmasi Hapus',
      text: 'Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'swal2-popup',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const success = await deleteUser(id);
        if (success) {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'User berhasil dihapus',
            confirmButtonColor: '#C68E2D',
          });
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Tidak Aktif';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-6 py-6 pb-24 space-y-8 bg-white min-h-full">
      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Manajemen User</h1>
          <p className="text-gray-500 font-medium mt-1">Kelola akses dan data klien</p>
        </div>
        <button
          onClick={handleAddUser}
          className="bg-[#FDE7E7] hover:bg-[#FAD2D2] text-gray-900 font-black py-3 px-6 rounded-2xl border-2 border-black/5 shadow-sm transition-all hover:shadow-md active:scale-95 flex items-center space-x-2 text-sm uppercase tracking-wider"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah User</span>
        </button>
      </div>

      {/* Search Field */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#C68E2D] transition-colors w-5 h-5" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-[#FDE7E7] border-none rounded-2xl focus:ring-2 focus:ring-[#C68E2D] text-gray-800 font-medium placeholder-gray-400 shadow-sm transition-all"
        />
      </div>

      {/* Users Table Container */}
      <div className="bg-[#FDE7E7] rounded-[32px] p-6 border border-[#FAD2D2] shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#C68E2D] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Memuat data...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <th className="px-4 py-2">Nama</th>
                    <th className="px-4 py-2 text-center">|</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2 text-center">|</th>
                    <th className="px-4 py-2">Tgl Acara</th>
                    <th className="px-4 py-2 text-center">|</th>
                    <th className="px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="bg-white/80 backdrop-blur-sm hover:bg-white transition-all group shadow-sm"
                    >
                      <td className="px-4 py-4 rounded-l-2xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#C68E2D] transition-colors">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-bold text-gray-900 group-hover:text-[#C68E2D] transition-colors">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-gray-100 text-center">|</td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-gray-600">{u.email}</span>
                      </td>
                      <td className="px-2 py-4 text-gray-100 text-center">|</td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold text-gray-700">
                          {u.eventDate
                            ? new Date(u.eventDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-gray-100 text-center">|</td>
                      <td className="px-4 py-4 rounded-r-2xl text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getStatusColor(u.status)}`}
                          >
                            {getStatusLabel(u.status)}
                          </span>
                          <button
                            onClick={() => handleEdit(u.id)}
                            className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id)}
                            disabled={u.id === currentUser?.uid}
                            className={`p-2 rounded-lg transition-colors ${
                              u.id === currentUser?.uid
                                ? 'text-gray-200 cursor-not-allowed'
                                : 'text-red-400 hover:bg-red-50'
                            }`}
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                {searchTerm ? 'Tidak ada hasil ditemukan' : 'Belum ada data user'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
