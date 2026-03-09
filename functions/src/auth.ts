/**
 * Auth Handlers untuk QayraMakeUp Backend
 */

import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import {
  ApiResponse,
  RegisterData,
  LoginData,
  LoginResponse,
  UserPublic,
} from './types';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  formatDate,
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
// REGISTER HANDLER
// ============================================================================

export const registerHandler = async (
  req: Request,
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

  try {
    const data: RegisterData = req.body;

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
      status: 'active',
      eventDate: data.eventDate || '',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(USERS_COLLECTION).add(userData);

    // Generate token
    const token = generateToken(docRef.id, userData.email, userData.role);

    // Response tanpa password
    const userPublic: UserPublic = {
      id: docRef.id,
      name: userData.name,
      email: userData.email,
      role: userData.role as 'admin' | 'user',
      status: userData.status as 'active' | 'inactive' | 'pending',
      eventDate: userData.eventDate,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };

    res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil',
      data: { user: userPublic, token },
      timestamp: formatDate(),
    } as ApiResponse<{ user: UserPublic; token: string }>);

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    } as ApiResponse);
  }
};

// ============================================================================
// LOGIN HANDLER
// ============================================================================

export const loginHandler = async (
  req: Request,
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

  try {
    const data: LoginData = req.body;

    // Validasi input
    if (!data.email || !data.password) {
      res.status(400).json({
        status: 'error',
        message: 'Email dan password wajib diisi',
      } as ApiResponse);
      return;
    }

    // Cari user berdasarkan email
    const userSnapshot = await db
      .collection(USERS_COLLECTION)
      .where('email', '==', data.email.toLowerCase())
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      res.status(401).json({
        status: 'error',
        message: 'Email atau password salah',
      } as ApiResponse);
      return;
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    if (!verifyPassword(data.password, userData.password)) {
      res.status(401).json({
        status: 'error',
        message: 'Email atau password salah',
      } as ApiResponse);
      return;
    }

    // Check status
    if (userData.status === 'inactive') {
      res.status(403).json({
        status: 'error',
        message: 'Akun tidak aktif. Hubungi administrator.',
      } as ApiResponse);
      return;
    }

    // Update last login
    const now = formatDate();
    await userDoc.ref.update({
      lastLoginAt: now,
      updatedAt: now,
    });

    // Generate token
    const token = generateToken(userDoc.id, userData.email, userData.role);

    // Response tanpa password
    const userPublic: UserPublic = {
      id: userDoc.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: userData.status,
      eventDate: userData.eventDate,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      lastLoginAt: now,
    };

    res.status(200).json({
      status: 'success',
      message: 'Login berhasil',
      data: { token, user: userPublic } as LoginResponse,
      timestamp: formatDate(),
    } as ApiResponse<LoginResponse>);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    } as ApiResponse);
  }
};

// ============================================================================
// LOGOUT HANDLER (placeholder - untuk client-side token removal)
// ============================================================================

export const logoutHandler = async (
  req: Request,
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

  // Logout di client-side hanya menghapus token dari localStorage
  // Tidak perlu server-side processing untuk simple auth
  res.status(200).json({
    status: 'success',
    message: 'Logout berhasil',
    timestamp: formatDate(),
  } as ApiResponse);
};
