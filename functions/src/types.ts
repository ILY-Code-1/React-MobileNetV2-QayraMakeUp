/**
 * Types untuk QayraMakeUp Backend
 */

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // hashed password, tidak dikembalikan ke client
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'pending';
  eventDate: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'pending';
  eventDate: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
  eventDate?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserPublic;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  timestamp?: string;
}

export interface UsersListResponse {
  users: UserPublic[];
  total: number;
}

// ============================================================================
// UPDATE TYPES
// ============================================================================

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'inactive' | 'pending';
  eventDate?: string;
  currentPassword?: string;
  newPassword?: string;
}
