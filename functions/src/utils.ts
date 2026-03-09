/**
 * Utility Functions untuk QayraMakeUp Backend
 */

import * as crypto from 'crypto';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Secret key untuk JWT signing - dalam production gunakan environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'qayra-makeup-secret-key-2024';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 jam dalam milliseconds

// ============================================================================
// PASSWORD UTILITIES
// ============================================================================

/**
 * Hash password menggunakan SHA-256 dengan salt
 */
export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return `${salt}:${hash}`;
};

/**
 * Verify password dengan hash yang tersimpan
 */
export const verifyPassword = (password: string, storedHash: string): boolean => {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  
  const verifyHash = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
  
  return hash === verifyHash;
};

// ============================================================================
// TOKEN UTILITIES
// ============================================================================

/**
 * Generate simple token untuk authentication
 */
export const generateToken = (userId: string, email: string, role: string): string => {
  const payload = {
    userId,
    email,
    role,
    iat: Date.now(),
    exp: Date.now() + TOKEN_EXPIRY,
  };
  
  // Encode payload ke base64
  const payloadStr = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadStr).toString('base64');
  
  // Generate signature
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadBase64)
    .digest('hex');
  
  return `${payloadBase64}.${signature}`;
};

/**
 * Verify dan decode token
 */
export const verifyToken = (token: string): { userId: string; email: string; role: string } | null => {
  try {
    const [payloadBase64, signature] = token.split('.');
    
    if (!payloadBase64 || !signature) return null;
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payloadBase64)
      .digest('hex');
    
    if (signature !== expectedSignature) return null;
    
    // Decode payload
    const payloadStr = Buffer.from(payloadBase64, 'base64').toString();
    const payload = JSON.parse(payloadStr);
    
    // Check expiry
    if (payload.exp < Date.now()) return null;
    
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    return null;
  }
};

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Format date ke ISO string
 */
export const formatDate = (date: Date = new Date()): string => {
  return date.toISOString();
};

/**
 * Extract token dari Authorization header
 */
export const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength (minimal 6 karakter)
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};
