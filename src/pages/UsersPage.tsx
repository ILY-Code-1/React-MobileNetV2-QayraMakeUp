import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Calendar, Mail, User, Edit2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Swal from 'sweetalert2';

interface UserData {
  id: string;
  name: string;
  email: string;
  eventDate: string;
  status: 'active' | 'inactive' | 'pending';
}

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [users, setUsers] = useState<UserData[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      eventDate: '2024-02-15',
      status: 'active',
    },
    {
      id: '2',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      eventDate: '2024-02-14',
      status: 'active',
    },
    {
      id: '3',
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      eventDate: '2024-02-13',
      status: 'pending',
    },
    {
      id: '4',
      name: 'John Smith',
      email: 'john.smith@example.com',
      eventDate: '2024-02-12',
      status: 'inactive',
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      eventDate: '2024-02-11',
      status: 'active',
    },
  ]);

  const handleAddUser = () => {
    navigate('/users/add');
  };

  const handleEdit = (id: string) => {
    // Dummy button - placeholder for edit user functionality
    alert('Edit User button clicked! ID: ' + id + ' (Dummy functionality)');
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
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
    }).then((result) => {
      if (result.isConfirmed) {
        setUsers(users.filter(user => user.id !== id));
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
    <div className="px-6 py-6 pb-24 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Kelola User</h1>
        <p className="text-gray-600 text-sm mt-1">Kelola data pengguna aplikasi</p>
      </div>

      {/* Search Field */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C68E2D] focus:border-transparent text-sm"
        />
      </div>

      {/* Stats Summary */}
      <div className="bg-secondary-pink rounded-xl p-4 shadow-md">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-gray-600 font-medium">Aktif</p>
          </div>
          <div className="text-center border-l border-r border-gray-300">
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.status === 'pending').length}
            </div>
            <p className="text-xs text-gray-600 font-medium">Pending</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.status === 'inactive').length}
            </div>
            <p className="text-xs text-gray-600 font-medium">Tidak Aktif</p>
          </div>
        </div>
      </div>

      {/* Add User Button */}
      <button
        onClick={handleAddUser}
        className="w-full bg-[#C68E2D] hover:bg-[#B77E29] text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Tambah User</span>
      </button>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-sm text-left">
              {/* Table Header */}
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr className="text-xs font-semibold text-gray-600">
                  <th className="px-4 py-3 w-1/4">Nama</th>
                  <th className="px-4 py-3 w-1/3">Email</th>
                  <th className="px-4 py-3 w-1/6">Tanggal</th>
                  <th className="px-4 py-3 w-1/6">Status</th>
                  <th className="px-4 py-3 w-1/12 text-center">Aksi</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-[#C68E2D] rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-600 truncate">
                          {user.email}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {new Date(user.eventDate).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {getStatusLabel(user.status)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-1">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEdit(user.id)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          aria-label="Delete"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? 'Tidak ada hasil yang ditemukan'
                : 'Belum ada data user'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
