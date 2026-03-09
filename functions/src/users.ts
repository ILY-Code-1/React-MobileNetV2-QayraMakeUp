/**
 * Users CRUD Handlers untuk QayraMakeUp Backend
 */

import * as admin from 'firebase-admin';
import { Response } from 'express';
import {
  ApiResponse,
  UserPublic,
  UsersListResponse,
  UpdateUserData,
} from './types';
import {
  hashPassword,
  verifyPassword,
  formatDate,
  extractBearerToken,
  verifyToken,
  isValidEmail,
  isValidPassword,
} from './utils';

// Initialize Firebase Admin jika belum
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const USERS_COLLECTION = 'users_qayra';

// ============================================================================
// HELPER: REMOVE PASSWORD FROM USER DATA
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toPublicUser = (id: string, data: admin.firestore.DocumentData): UserPublic => {
  const { password, ...publicData } = data;
  return {
    id,
    ...publicData,
  } as UserPublic;
};

// ============================================================================
// AUTH MIDDLEWARE
// ============================================================================

interface AuthResult {
  success: boolean;
  user?: { userId: string; email: string; role: string };
  error?: string;
}

const authenticateRequest = (authHeader: string | undefined): AuthResult => {
  const token = extractBearerToken(authHeader);

  if (!token) {
    return { success: false, error: 'Token tidak ditemukan' };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { success: false, error: 'Token tidak valid atau sudah expired' };
  }

  return { success: true, user: decoded };
};

// ============================================================================
// GET ALL USERS
// ============================================================================

export const getAllUsersHandler = async (
  req: any,
  res: Response
): Promise<void> => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    } as ApiResponse);
    return;
  }

  // Authenticate
  const auth = authenticateRequest(req.headers.authorization);
  if (!auth.success) {
    res.status(401).json({
      status: 'error',
      message: auth.error,
    } as ApiResponse);
    return;
  }

  try {
    const { status, role } = req.query;

    let query: admin.firestore.Query = db.collection(USERS_COLLECTION);

    // Apply filters
    if (status && typeof status === 'string') {
      query = query.where('status', '==', status);
    }
    if (role && typeof role === 'string') {
      query = query.where('role', '==', role);
    }

    // Order by createdAt descending
    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();

    const users: UserPublic[] = snapshot.docs.map((doc) =>
      toPublicUser(doc.id, doc.data())
    );

    res.status(200).json({
      status: 'success',
      message: 'Data users berhasil diambil',
      data: {
        users,
        total: users.length,
      } as UsersListResponse,
      timestamp: formatDate(),
    } as ApiResponse<UsersListResponse>);

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    } as ApiResponse);
  }
};

// ============================================================================
// GET USER BY ID
// ============================================================================

export const getUserByIdHandler = async (
  req: any,
  res: Response
): Promise<void> => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    } as ApiResponse);
    return;
  }

  // Authenticate
  const auth = authenticateRequest(req.headers.authorization);
  if (!auth.success) {
    res.status(401).json({
      status: 'error',
      message: auth.error,
    } as ApiResponse);
    return;
  }

  try {
    const targetUserId = req.params.id;

    if (!targetUserId) {
      res.status(400).json({
        status: 'error',
        message: 'User ID tidak ditemukan',
      } as ApiResponse);
      return;
    }

    const doc = await db.collection(USERS_COLLECTION).doc(targetUserId).get();

    if (!doc.exists) {
      res.status(404).json({
        status: 'error',
        message: 'User tidak ditemukan',
      } as ApiResponse);
      return;
    }

    const user = toPublicUser(doc.id, doc.data()!);

    res.status(200).json({
      status: 'success',
      message: 'Data user berhasil diambil',
      data: { user },
      timestamp: formatDate(),
    } as ApiResponse<{ user: UserPublic }>);

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    } as ApiResponse);
  }
};

// ============================================================================
// CREATE USER (Admin only)
// ============================================================================

export const createUserHandler = async (
  req: any,
  res: Response
): Promise<void> => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    } as ApiResponse);
    return;
  }

  // Authenticate & check admin
  const auth = authenticateRequest(req.headers.authorization);
  if (!auth.success) {
    res.status(401).json({
      status: 'error',
      message: auth.error,
    } as ApiResponse);
    return;
  }

  if (auth.user?.role !== 'admin') {
    res.status(403).json({
      status: 'error',
      message: 'Hanya admin yang bisa membuat user baru',
    } as ApiResponse);
    return;
  }

  try {
    const data = req.body;

    // Validasi input
    if (!data.name || !data.email || !data.password) {
      res.status(400).json({
        status: 'error',
        message: 'Name, email, dan password wajib diisi',
      } as ApiResponse);
      return;
    }

    if (!isValidEmail(data.email)) {
      res.status(400).json({
        status: 'error',
        message: 'Format email tidak valid',
      } as ApiResponse);
      return;
    }

    if (!isValidPassword(data.password)) {
      res.status(400).json({
        status: 'error',
        message: 'Password minimal 6 karakter',
      } as ApiResponse);
      return;
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await db
      .collection(USERS_COLLECTION)
      .where('email', '==', data.email.toLowerCase())
      .limit(1)
      .get();

    if (!existingUser.empty) {
      res.status(409).json({
        status: 'error',
        message: 'Email sudah terdaftar',
      } as ApiResponse);
      return;
    }

    // Hash password
    const hashedPassword = hashPassword(data.password);

    // Buat user baru
    const now = formatDate();
    const userData = {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role || 'user',
      status: data.status || 'active',
      eventDate: data.eventDate || '',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(USERS_COLLECTION).add(userData);

    const user = toPublicUser(docRef.id, userData);

    res.status(201).json({
      status: 'success',
      message: 'User berhasil dibuat',
      data: { user },
      timestamp: formatDate(),
    } as ApiResponse<{ user: UserPublic }>);

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    } as ApiResponse);
  }
};

// ============================================================================
// UPDATE USER
// ============================================================================

export const updateUserHandler = async (
  req: any,
  res: Response
): Promise<void> => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'PUT') {
    res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    } as ApiResponse);
    return;
  }

  // Authenticate
  const auth = authenticateRequest(req.headers.authorization);
  if (!auth.success) {
    res.status(401).json({
      status: 'error',
      message: auth.error,
    } as ApiResponse);
    return;
  }

  try {
    const targetUserId = req.params.id;

    if (!targetUserId) {
      res.status(400).json({
        status: 'error',
        message: 'User ID tidak ditemukan',
      } as ApiResponse);
      return;
    }

    // Check permission: admin bisa update semua, user hanya bisa update dirinya
    if (auth.user?.role !== 'admin' && auth.user?.userId !== targetUserId) {
      res.status(403).json({
        status: 'error',
        message: 'Tidak memiliki permission untuk update user ini',
      } as ApiResponse);
      return;
    }

    const data: UpdateUserData = req.body;

    // Get existing user
    const doc = await db.collection(USERS_COLLECTION).doc(targetUserId).get();

    if (!doc.exists) {
      res.status(404).json({
        status: 'error',
        message: 'User tidak ditemukan',
      } as ApiResponse);
      return;
    }

    const existingData = doc.data()!;

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: formatDate(),
    };

    if (data.name) updateData.name = data.name;
    if (data.eventDate !== undefined) updateData.eventDate = data.eventDate;

    // Email update (perlu validasi unique)
    if (data.email && data.email !== existingData.email) {
      if (!isValidEmail(data.email)) {
        res.status(400).json({
          status: 'error',
          message: 'Format email tidak valid',
        } as ApiResponse);
        return;
      }

      const existingEmail = await db
        .collection(USERS_COLLECTION)
        .where('email', '==', data.email.toLowerCase())
        .limit(1)
        .get();

      if (!existingEmail.empty) {
        res.status(409).json({
          status: 'error',
          message: 'Email sudah digunakan',
        } as ApiResponse);
        return;
      }

      updateData.email = data.email.toLowerCase();
    }

    // Role & Status (admin only)
    if (auth.user?.role === 'admin') {
      if (data.role) updateData.role = data.role;
      if (data.status) updateData.status = data.status;
    }

    // Password update
    if (data.currentPassword && data.newPassword) {
      if (!verifyPassword(data.currentPassword, existingData.password)) {
        res.status(400).json({
          status: 'error',
          message: 'Password lama tidak sesuai',
        } as ApiResponse);
        return;
      }

      if (!isValidPassword(data.newPassword)) {
        res.status(400).json({
          status: 'error',
          message: 'Password baru minimal 6 karakter',
        } as ApiResponse);
        return;
      }

      updateData.password = hashPassword(data.newPassword);
    }

    // Update document
    await doc.ref.update(updateData);

    // Get updated data
    const updatedDoc = await doc.ref.get();
    const user = toPublicUser(updatedDoc.id, updatedDoc.data()!);

    res.status(200).json({
      status: 'success',
      message: 'User berhasil diupdate',
      data: { user },
      timestamp: formatDate(),
    } as ApiResponse<{ user: UserPublic }>);

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    } as ApiResponse);
  }
};

// ============================================================================
// UPDATE USER STATUS
// ============================================================================

export const updateUserStatusHandler = async (
  req: any,
  res: Response
): Promise<void> => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'PATCH') {
    res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    } as ApiResponse);
    return;
  }

  // Authenticate & check admin
  const auth = authenticateRequest(req.headers.authorization);
  if (!auth.success) {
    res.status(401).json({
      status: 'error',
      message: auth.error,
    } as ApiResponse);
    return;
  }

  if (auth.user?.role !== 'admin') {
    res.status(403).json({
      status: 'error',
      message: 'Hanya admin yang bisa mengubah status user',
    } as ApiResponse);
    return;
  }

  try {
    const targetUserId = req.params.id;

    if (!targetUserId) {
      res.status(400).json({
        status: 'error',
        message: 'User ID tidak ditemukan',
      } as ApiResponse);
      return;
    }

    const { status } = req.body;

    if (!status || !['active', 'inactive', 'pending'].includes(status)) {
      res.status(400).json({
        status: 'error',
        message: 'Status harus salah satu dari: active, inactive, pending',
      } as ApiResponse);
      return;
    }

    const doc = await db.collection(USERS_COLLECTION).doc(targetUserId).get();

    if (!doc.exists) {
      res.status(404).json({
        status: 'error',
        message: 'User tidak ditemukan',
      } as ApiResponse);
      return;
    }

    await doc.ref.update({
      status,
      updatedAt: formatDate(),
    });

    res.status(200).json({
      status: 'success',
      message: 'Status user berhasil diupdate',
      data: { id: targetUserId, status },
      timestamp: formatDate(),
    } as ApiResponse<{ id: string; status: string }>);

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    } as ApiResponse);
  }
};

// ============================================================================
// DELETE USER
// ============================================================================

export const deleteUserHandler = async (
  req: any,
  res: Response
): Promise<void> => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'DELETE') {
    res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    } as ApiResponse);
    return;
  }

  // Authenticate & check admin
  const auth = authenticateRequest(req.headers.authorization);
  if (!auth.success) {
    res.status(401).json({
      status: 'error',
      message: auth.error,
    } as ApiResponse);
    return;
  }

  if (auth.user?.role !== 'admin') {
    res.status(403).json({
      status: 'error',
      message: 'Hanya admin yang bisa menghapus user',
    } as ApiResponse);
    return;
  }

  try {
    const targetUserId = req.params.id;

    if (!targetUserId) {
      res.status(400).json({
        status: 'error',
        message: 'User ID tidak ditemukan',
      } as ApiResponse);
      return;
    }

    // Prevent self-deletion
    if (auth.user?.userId === targetUserId) {
      res.status(400).json({
        status: 'error',
        message: 'Tidak bisa menghapus akun sendiri',
      } as ApiResponse);
      return;
    }

    const doc = await db.collection(USERS_COLLECTION).doc(targetUserId).get();

    if (!doc.exists) {
      res.status(404).json({
        status: 'error',
        message: 'User tidak ditemukan',
      } as ApiResponse);
      return;
    }

    await doc.ref.delete();

    res.status(200).json({
      status: 'success',
      message: 'User berhasil dihapus',
      timestamp: formatDate(),
    } as ApiResponse);

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    } as ApiResponse);
  }
};
