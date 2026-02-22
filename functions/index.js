const functions = require('firebase-functions');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

/**
 * Cross-Project Firebase Backend Architecture
 *
 * Project A: Cloud Functions (API Layer)
 * Project B: Firestore Database (Data Layer)
 *
 * Cloud Functions di Project A mengakses Firestore di Project B menggunakan
 * Firebase Admin SDK dengan Service Account dari Project B.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Load Service Account credential dari Project B
const serviceAccountPath = path.join(__dirname, 'service-account-key.json');

let db;

try {
  // Check if service account file exists
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ ERROR: service-account-key.json not found!');
    console.error('Please create and place the file in: ' + serviceAccountPath);
    throw new Error('Service account not configured');
  }

  // Initialize Firebase Admin SDK with Service Account from Project B
  const serviceAccount = require(serviceAccountPath);

  // Initialize Admin SDK with explicit project ID from Project B
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_B_ID || serviceAccount.project_id
  }, 'project-b-admin');

  db = admin.firestore(app);

  console.log('✅ Firebase Admin initialized successfully for Project B:', serviceAccount.project_id);
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  throw error;
}

// ============================================================================
// MIDDLEWARE & UTILITIES
// ============================================================================

/**
 * Response helper untuk format JSON standar
 */
const response = (res, statusCode, status, message, data = null) => {
  return res.status(statusCode).json({
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Error handler wrapper
 */
const asyncHandler = (fn) => (req, res) => {
  Promise.resolve(fn(req, res)).catch((err) => {
    console.error('❌ Error:', err);
    response(res, 500, 'error', err.message || 'Internal server error');
  });
};

/**
 * Validate required fields
 */
const validateRequired = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

/**
 * Hash password dengan bcrypt
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password dengan hash
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Sanitize user data (remove sensitive fields)
 */
const sanitizeUser = (user) => {
  const { password, ...sanitized } = user;
  return sanitized;
};

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Simple token-based authentication (JWT-like)
 * Dalam production, gunakan Firebase Authentication atau JWT library
 */
const verifyAuthToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response(res, 401, 'error', 'Authorization token required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // TODO: Implement proper JWT verification
    // Untuk sekarang, kita cek token dari Firestore
    // Ini adalah simplified version untuk demo

    // Simpan token di request untuk digunakan di route handlers
    req.authToken = token;
    next();
  } catch (error) {
    return response(res, 401, 'error', 'Invalid authorization token');
  }
};

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * POST /api/auth/register
 * Register user baru
 */
exports.register = functions.https.onRequest(asyncHandler(async (req, res) => {
  // Validate method
  if (req.method !== 'POST') {
    return response(res, 405, 'error', 'Method not allowed');
  }

  try {
    const { name, email, password, role = 'user', eventDate } = req.body;

    // Validate required fields
    validateRequired(req.body, ['name', 'email', 'password']);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response(res, 400, 'error', 'Invalid email format');
    }

    // Validate password strength (min 6 chars)
    if (password.length < 6) {
      return response(res, 400, 'error', 'Password must be at least 6 characters');
    }

    // Check if email already exists
    const existingUser = await db.collection('users_qayra')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return response(res, 409, 'error', 'Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user document
    const userRef = db.collection('users_qayra').doc();
    const userData = {
      id: userRef.id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: ['admin', 'user'].includes(role) ? role : 'user',
      status: 'active',
      eventDate: eventDate || new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await userRef.set(userData);

    console.log('✅ User registered:', userData.email);

    return response(res, 201, 'success', 'User registered successfully', {
      user: sanitizeUser(userData)
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    throw error;
  }
}));

/**
 * POST /api/auth/login
 * Login user dengan email dan password
 */
exports.login = functions.https.onRequest(asyncHandler(async (req, res) => {
  // Validate method
  if (req.method !== 'POST') {
    return response(res, 405, 'error', 'Method not allowed');
  }

  try {
    const { email, password } = req.body;

    // Validate required fields
    validateRequired(req.body, ['email', 'password']);

    // Find user by email
    const userQuery = await db.collection('users_qayra')
      .where('email', '==', email.toLowerCase().trim())
      .limit(1)
      .get();

    if (userQuery.empty) {
      return response(res, 401, 'error', 'Invalid email or password');
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Check if user is active
    if (userData.status !== 'active') {
      return response(res, 403, 'error', 'Account is inactive');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, userData.password);

    if (!isPasswordValid) {
      return response(res, 401, 'error', 'Invalid email or password');
    }

    // Generate simple auth token (in production, use JWT)
    const authToken = Buffer.from(`${userData.id}:${userData.email}:${Date.now()}`).toString('base64');

    // Update last login
    await userDoc.ref.update({
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ User logged in:', userData.email);

    return response(res, 200, 'success', 'Login successful', {
      token: authToken,
      user: sanitizeUser(userData)
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
}));

/**
 * POST /api/auth/logout
 * Logout user
 */
exports.logout = functions.https.onRequest(asyncHandler(async (req, res) => {
  // Validate method
  if (req.method !== 'POST') {
    return response(res, 405, 'error', 'Method not allowed');
  }

  // TODO: Implement proper token invalidation (JWT blacklist)
  return response(res, 200, 'success', 'Logout successful');
}));

// ============================================================================
// USER CRUD ENDPOINTS
// ============================================================================

/**
 * GET /api/users
 * Get all users (with optional filtering)
 */
exports.getAllUsers = functions.https.onRequest(asyncHandler(async (req, res) => {
  // Validate method
  if (req.method !== 'GET') {
    return response(res, 405, 'error', 'Method not allowed');
  }

  try {
    const { status, role } = req.query;

    // Build query
    let query = db.collection('users_qayra');

    if (status) {
      query = query.where('status', '==', status);
    }

    if (role) {
      query = query.where('role', '==', role);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    if (snapshot.empty) {
      return response(res, 200, 'success', 'No users found', {
        users: [],
        total: 0
      });
    }

    const users = snapshot.docs.map(doc => sanitizeUser({
      id: doc.id,
      ...doc.data()
    }));

    console.log('✅ Retrieved users:', users.length);

    return response(res, 200, 'success', 'Users retrieved successfully', {
      users,
      total: users.length
    });

  } catch (error) {
    console.error('❌ Get all users error:', error);
    throw error;
  }
}));

/**
 * GET /api/users/:id
 * Get user by ID
 */
exports.getUserById = functions.https.onRequest(asyncHandler(async (req, res) => {
  // Validate method
  if (req.method !== 'GET') {
    return response(res, 405, 'error', 'Method not allowed');
  }

  try {
    const { id } = req.params;

    if (!id) {
      return response(res, 400, 'error', 'User ID is required');
    }

    const userDoc = await db.collection('users_qayra').doc(id).get();

    if (!userDoc.exists) {
      return response(res, 404, 'error', 'User not found');
    }

    const userData = {
      id: userDoc.id,
      ...userDoc.data()
    };

    console.log('✅ Retrieved user:', userData.email);

    return response(res, 200, 'success', 'User retrieved successfully', {
      user: sanitizeUser(userData)
    });

  } catch (error) {
    console.error('❌ Get user by ID error:', error);
    throw error;
  }
}));

/**
 * PUT /api/users/:id
 * Update user by ID
 */
exports.updateUser = functions.https.onRequest(asyncHandler(async (req, res) => {
  // Validate method
  if (req.method !== 'PUT') {
    return response(res, 405, 'error', 'Method not allowed');
  }

  try {
    const { id } = req.params;
    const { name, email, role, status, eventDate, currentPassword, newPassword } = req.body;

    if (!id) {
      return response(res, 400, 'error', 'User ID is required');
    }

    // Check if user exists
    const userDoc = await db.collection('users_qayra').doc(id).get();

    if (!userDoc.exists) {
      return response(res, 404, 'error', 'User not found');
    }

    const userData = userDoc.data();

    // Prepare update data
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Update basic fields
    if (name) updateData.name = name.trim();
    if (email && email !== userData.email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return response(res, 400, 'error', 'Invalid email format');
      }

      // Check if new email already exists
      const existingEmail = await db.collection('users_qayra')
        .where('email', '==', email.toLowerCase())
        .limit(1)
        .get();

      if (!existingEmail.empty && existingEmail.docs[0].id !== id) {
        return response(res, 409, 'error', 'Email already exists');
      }

      updateData.email = email.toLowerCase().trim();
    }

    if (role && ['admin', 'user'].includes(role)) {
      updateData.role = role;
    }

    if (status && ['active', 'inactive', 'pending'].includes(status)) {
      updateData.status = status;
    }

    if (eventDate) {
      updateData.eventDate = eventDate;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return response(res, 400, 'error', 'Current password is required to update password');
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, userData.password);

      if (!isCurrentPasswordValid) {
        return response(res, 401, 'error', 'Current password is incorrect');
      }

      // Validate new password
      if (newPassword.length < 6) {
        return response(res, 400, 'error', 'New password must be at least 6 characters');
      }

      updateData.password = await hashPassword(newPassword);
    }

    await userDoc.ref.update(updateData);

    // Get updated user data
    const updatedUserDoc = await userDoc.ref.get();
    const updatedUserData = {
      id: updatedUserDoc.id,
      ...updatedUserDoc.data()
    };

    console.log('✅ User updated:', updatedUserData.email);

    return response(res, 200, 'success', 'User updated successfully', {
      user: sanitizeUser(updatedUserData)
    });

  } catch (error) {
    console.error('❌ Update user error:', error);
    throw error;
  }
}));

/**
 * DELETE /api/users/:id
 * Delete user by ID
 */
exports.deleteUser = functions.https.onRequest(asyncHandler(async (req, res) => {
  // Validate method
  if (req.method !== 'DELETE') {
    return response(res, 405, 'error', 'Method not allowed');
  }

  try {
    const { id } = req.params;

    if (!id) {
      return response(res, 400, 'error', 'User ID is required');
    }

    // Check if user exists
    const userDoc = await db.collection('users_qayra').doc(id).get();

    if (!userDoc.exists) {
      return response(res, 404, 'error', 'User not found');
    }

    const userData = userDoc.data();

    // Delete user
    await userDoc.ref.delete();

    console.log('✅ User deleted:', userData.email);

    return response(res, 200, 'success', 'User deleted successfully');

  } catch (error) {
    console.error('❌ Delete user error:', error);
    throw error;
  }
}));

/**
 * PATCH /api/users/:id/status
 * Update user status
 */
exports.updateUserStatus = functions.https.onRequest(asyncHandler(async (req, res) => {
  // Validate method
  if (req.method !== 'PATCH') {
    return response(res, 405, 'error', 'Method not allowed');
  }

  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return response(res, 400, 'error', 'User ID is required');
    }

    if (!status) {
      return response(res, 400, 'error', 'Status is required');
    }

    // Validate status value
    const validStatuses = ['active', 'inactive', 'pending'];
    if (!validStatuses.includes(status)) {
      return response(res, 400, 'error', 'Invalid status value');
    }

    // Check if user exists
    const userDoc = await db.collection('users_qayra').doc(id).get();

    if (!userDoc.exists) {
      return response(res, 404, 'error', 'User not found');
    }

    const userData = userDoc.data();

    // Update status
    await userDoc.ref.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ User status updated:', userData.email, '->', status);

    return response(res, 200, 'success', 'User status updated successfully', {
      id,
      status
    });

  } catch (error) {
    console.error('❌ Update user status error:', error);
    throw error;
  }
}));

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

/**
 * GET /api/health
 * Health check endpoint
 */
exports.health = functions.https.onRequest(asyncHandler(async (req, res) => {
  // Validate method
  if (req.method !== 'GET') {
    return response(res, 405, 'error', 'Method not allowed');
  }

  try {
    // Test Firestore connection
    const testDoc = await db.collection('_health').doc('check').get();

    return response(res, 200, 'success', 'API is healthy', {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return response(res, 503, 'error', 'API is unhealthy', {
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));
