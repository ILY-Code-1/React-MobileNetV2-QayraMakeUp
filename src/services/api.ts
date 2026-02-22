/**
 * API Service for QayraMakeUp Frontend
 *
 * Menggunakan REST API untuk berkomunikasi dengan Cloud Functions
 * Cloud Functions di Project A -> mengakses Firestore di Project B
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Base URL Cloud Functions Project A
// Update dengan URL Cloud Functions yang sudah deploy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://us-central1-YOUR-PROJECT-A-ID.cloudfunctions.net';

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  timestamp?: string;
}

export interface User {
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

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
  eventDate?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'inactive' | 'pending';
  eventDate?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UsersListResponse {
  users: User[];
  total: number;
}

// ============================================================================
// API HELPER FUNCTIONS
// ============================================================================

/**
 * Helper function untuk membuat API request
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add authorization token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    (defaultOptions.headers as HeadersInit)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============================================================================
// AUTHENTICATION API
// ============================================================================

/**
 * Register user baru
 */
export const registerUser = async (userData: RegisterData): Promise<ApiResponse<{ user: User }>> => {
  return apiRequest<{ user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

/**
 * Login user
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Simpan token ke localStorage jika login berhasil
  if (response.status === 'success' && response.data?.token) {
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
  }

  return response;
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Hapus token dari localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
};

// ============================================================================
// USER CRUD API
// ============================================================================

/**
 * Get all users
 */
export const getAllUsers = async (
  filters?: { status?: string; role?: string }
): Promise<ApiResponse<UsersListResponse>> => {
  const queryParams = new URLSearchParams();

  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.role) queryParams.append('role', filters.role);

  const query = queryParams.toString();
  const endpoint = query ? `/api/users?${query}` : '/api/users';

  return apiRequest<UsersListResponse>(endpoint);
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<ApiResponse<{ user: User }>> => {
  return apiRequest<{ user: User }>(`/api/users/${userId}`);
};

/**
 * Update user
 */
export const updateUser = async (
  userId: string,
  userData: UpdateUserData
): Promise<ApiResponse<{ user: User }>> => {
  return apiRequest<{ user: User }>(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string): Promise<ApiResponse> => {
  return apiRequest(`/api/users/${userId}`, {
    method: 'DELETE',
  });
};

/**
 * Update user status
 */
export const updateUserStatus = async (
  userId: string,
  status: 'active' | 'inactive' | 'pending'
): Promise<ApiResponse<{ id: string; status: string }>> => {
  return apiRequest<{ id: string; status: string }>(`/api/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

// ============================================================================
// HEALTH CHECK API
// ============================================================================

/**
 * Health check API
 */
export const healthCheck = async (): Promise<
  ApiResponse<{ status: string; database: string; timestamp: string }>
> => {
  return apiRequest('/api/health');
};

// ============================================================================
// AUTH HELPER FUNCTIONS
// ============================================================================

/**
 * Get current user dari localStorage
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('auth_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }
  return null;
};

/**
 * Get auth token dari localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

/**
 * Check if user has admin role
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

/**
 * Clear auth data (untuk forced logout)
 */
export const clearAuth = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

// ============================================================================
// ERROR HANDLER
// ============================================================================

/**
 * Handle API error dengan user-friendly message
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

// Export all API functions
export default {
  // Auth
  register: registerUser,
  login: loginUser,
  logout: logoutUser,

  // Users
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,

  // Helpers
  getCurrentUser,
  getAuthToken,
  isAuthenticated,
  isAdmin,
  clearAuth,
  handleApiError,
  healthCheck,
};
