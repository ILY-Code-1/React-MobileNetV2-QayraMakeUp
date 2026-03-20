// ============================================================================
// COOKIE HELPER - User Data Persistence with Encryption
// ============================================================================

import type { UserData } from '../services/firestoreService';

// ============================================================================
// CONSTANTS
// ============================================================================

const COOKIE_KEY = 'qayra_user'; // Hardcoded cookie key
const SECRET_KEY = import.meta.env.VITE_APP_SECRET_KEY || 'default_secret_key';
const COOKIE_EXPIRY_DAYS = 7; // Cookie expires in 7 days

// ============================================================================
// TYPES
// ============================================================================

export interface EncodedUserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'pending';
  eventDate: string;
}

// ============================================================================
// ENCRYPTION UTILITIES
// ============================================================================

/**
 * Simple XOR encryption for data
 * Note: This is basic encryption. For production, use crypto-js or similar
 */
const xorEncrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result); // Base64 encode
};

/**
 * Simple XOR decryption for data
 */
const xorDecrypt = (encryptedText: string, key: string): string => {
  try {
    const decoded = atob(encryptedText);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (error) {
    console.error('[CookieHelper] Decryption error:', error);
    return '';
  }
};

// ============================================================================
// COOKIE MANAGEMENT
// ============================================================================

/**
 * Encrypt and encode user data
 */
export const encryptUserData = (userData: UserData): string => {
  const dataToEncode: EncodedUserData = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    status: userData.status,
    eventDate: userData.eventDate,
  };

  const jsonString = JSON.stringify(dataToEncode);
  const encrypted = xorEncrypt(jsonString, SECRET_KEY);

  return encrypted;
};

/**
 * Decrypt and decode user data
 */
export const decryptUserData = (encryptedData: string): UserData | null => {
  try {
    const decrypted = xorDecrypt(encryptedData, SECRET_KEY);
    const decodedData = JSON.parse(decrypted) as EncodedUserData;

    return {
      ...decodedData,
      createdAt: undefined, // Not stored in cookie
      updatedAt: undefined,
      lastLoginAt: undefined,
    };
  } catch (error) {
    console.error('[CookieHelper] Error decrypting user data:', error);
    return null;
  }
};

/**
 * Set cookie with encrypted user data
 */
export const setCookie = (userData: UserData): void => {
  try {
    const encryptedData = encryptUserData(userData);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);

    const cookieString = `${COOKIE_KEY}=${encryptedData}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

    document.cookie = cookieString;
  } catch (error) {
    console.error('[CookieHelper] Error setting cookie:', error);
  }
};

/**
 * Get and decrypt user data from cookie
 */
export const getCookie = (): UserData | null => {
  try {
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');

      if (name === COOKIE_KEY && value) {
        return decryptUserData(value);
      }
    }

    return null;
  } catch (error) {
    console.error('[CookieHelper] Error getting cookie:', error);
    return null;
  }
};

/**
 * Remove user data from cookie
 */
export const removeCookie = (): void => {
  try {
    const cookieString = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

    document.cookie = cookieString;
  } catch (error) {
    console.error('[CookieHelper] Error removing cookie:', error);
  }
};

/**
 * Check if user cookie exists
 */
export const hasCookie = (): boolean => {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [name] = cookie.trim().split('=');

    if (name === COOKIE_KEY) {
      return true;
    }
  }

  return false;
};
