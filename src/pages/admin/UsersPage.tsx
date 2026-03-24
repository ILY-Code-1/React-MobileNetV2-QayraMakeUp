import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User, Edit2, Trash2, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
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
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin'
      ? 'bg-black text-[#C68E2D] border border-black'
      : 'bg-white text-gray-600 border border-gray-200';
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
      <div className="flex flex-col sm:flex-col sm:items-left justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-3">
            <Users className="w-8 h-8 text-[#C68E2D]" />
            Manajemen User
          </h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">Kelola akses dan data klien</p>
        </div>
        <button
          onClick={handleAddUser}
          className="bg-[#C68E2D] hover:bg-[#A67725] text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2 text-sm uppercase tracking-wider"
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
          placeholder="Cari nama atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-[#C68E2D]/5 border-2 border-transparent focus:border-[#C68E2D]/20 rounded-2xl focus:ring-0 text-gray-800 font-bold placeholder-gray-400 transition-all shadow-sm"
        />
      </div>

      {/* Users Table Container */}
      <div className="bg-[#C68E2D]/10 rounded-4xl p-4 sm:p-6 border border-[#C68E2D]/20 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#C68E2D] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Memuat data...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="min-w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <th className="px-4 py-2">Info User</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Tgl Acara</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="bg-white/90 backdrop-blur-sm hover:bg-white transition-all group shadow-sm rounded-2xl"
                    >
                      <td className="px-4 py-4 rounded-l-2xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C68E2D] transition-all duration-300 shadow-md">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 group-hover:text-[#C68E2D] transition-colors line-clamp-1">{u.name}</span>
                            <span className="text-[10px] font-medium text-gray-500 line-clamp-1">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${getRoleBadgeColor(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[11px] font-bold text-gray-700">
                          {u.eventDate && u.role !== 'admin' && !isNaN(new Date(u.eventDate).getTime())
                            ? new Date(u.eventDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`whitespace-nowrap text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm ${getStatusColor(u.status)}`}
                        >
                          {getStatusLabel(u.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 rounded-r-2xl text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleEdit(u.id)}
                            className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id)}
                            disabled={u.id === currentUser?.id}
                            className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                              u.id === currentUser?.id
                                ? 'text-gray-200 cursor-not-allowed'
                                : 'text-red-500 hover:bg-red-50'
                            }`}
                            title="Hapus User"
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
