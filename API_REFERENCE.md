# API Reference

Complete documentation for all Cloud Functions endpoints in Project A that access Firestore in Project B.

**Base URL**: `https://REGION-PROJECT-A-ID.cloudfunctions.net`

---

## 🔐 Authentication Endpoints

### 1. Register User

**Endpoint**: `POST /api/auth/register`

**Description**: Register a new user with hashed password

**Request Body**:
```typescript
{
  name: string;        // Required - User's full name
  email: string;       // Required - User's email (must be unique)
  password: string;    // Required - Password (min 6 chars)
  role?: 'admin' | 'user';  // Optional - Default: 'user'
  eventDate?: string;  // Optional - ISO date string
}
```

**Success Response** (201):
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "status": "active",
      "eventDate": "2024-02-22T00:00:00.000Z",
      "createdAt": "2024-02-22T00:00:00.000Z",
      "updatedAt": "2024-02-22T00:00:00.000Z"
    }
  },
  "timestamp": "2024-02-22T00:00:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid email format, password too short
- `409` - Email already registered
- `500` - Internal server error

**Example**:
```bash
curl -X POST https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123",
    "role": "user"
  }'
```

---

### 2. Login User

**Endpoint**: `POST /api/auth/login`

**Description**: Authenticate user with email and password

**Request Body**:
```typescript
{
  email: string;    // Required - User's email
  password: string;  // Required - User's password
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "dXNlcjEyMzpqb2huQGV4YW1wbGUuY29tOjE3MDg1NjAwMDAwMDA=",
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "status": "active",
      "eventDate": "2024-02-22T00:00:00.000Z",
      "lastLoginAt": "2024-02-22T00:00:00.000Z"
    }
  },
  "timestamp": "2024-02-22T00:00:00.000Z"
}
```

**Error Responses**:
- `400` - Missing required fields
- `401` - Invalid email or password
- `403` - Account is inactive
- `500` - Internal server error

**Example**:
```bash
curl -X POST https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

---

### 3. Logout User

**Endpoint**: `POST /api/auth/logout`

**Description**: Logout current user

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Logout successful",
  "timestamp": "2024-02-22T00:00:00.000Z"
}
```

**Example**:
```bash
curl -X POST https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 👥 User Management Endpoints

### 4. Get All Users

**Endpoint**: `GET /api/users`

**Description**: Retrieve all users with optional filtering

**Query Parameters**:
```typescript
{
  status?: 'active' | 'inactive' | 'pending';
  role?: 'admin' | 'user';
}
```

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "status": "active",
        "eventDate": "2024-02-22T00:00:00.000Z",
        "createdAt": "2024-02-22T00:00:00.000Z"
      }
    ],
    "total": 1
  },
  "timestamp": "2024-02-22T00:00:00.000Z"
}
```

**Example**:
```bash
# Get all users
curl -X GET https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Filter by status
curl -X GET "https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/users?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Filter by role
curl -X GET "https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/users?role=admin" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 5. Get User by ID

**Endpoint**: `GET /api/users/:id`

**Description**: Retrieve a specific user by their ID

**URL Parameters**:
- `id` (string, required) - User ID

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "status": "active",
      "eventDate": "2024-02-22T00:00:00.000Z",
      "createdAt": "2024-02-22T00:00:00.000Z",
      "updatedAt": "2024-02-22T00:00:00.000Z",
      "lastLoginAt": "2024-02-22T00:00:00.000Z"
    }
  },
  "timestamp": "2024-02-22T00:00:00.000Z"
}
```

**Error Responses**:
- `400` - User ID is required
- `404` - User not found
- `500` - Internal server error

**Example**:
```bash
curl -X GET https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/users/user123 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 6. Update User

**Endpoint**: `PUT /api/users/:id`

**Description**: Update user information

**URL Parameters**:
- `id` (string, required) - User ID

**Request Body**:
```typescript
{
  name?: string;           // Optional - User's name
  email?: string;          // Optional - User's email
  role?: 'admin' | 'user'; // Optional - User's role
  status?: 'active' | 'inactive' | 'pending'; // Optional - User's status
  eventDate?: string;      // Optional - Event date
  currentPassword?: string; // Required when updating password
  newPassword?: string;    // Required when updating password (min 6 chars)
}
```

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "user123",
      "name": "John Updated",
      "email": "john.updated@example.com",
      "role": "admin",
      "status": "active",
      "eventDate": "2024-02-22T00:00:00.000Z",
      "updatedAt": "2024-02-22T01:00:00.000Z"
    }
  },
  "timestamp": "2024-02-22T01:00:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid email format, email already exists, invalid password
- `401` - Current password incorrect
- `404` - User not found
- `409` - Email already exists
- `500` - Internal server error

**Example**:
```bash
# Update basic info
curl -X PUT https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/users/user123 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com",
    "role": "admin"
  }'

# Update password
curl -X PUT https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/users/user123 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "securepass123",
    "newPassword": "newsecurepass456"
  }'
```

---

### 7. Delete User

**Endpoint**: `DELETE /api/users/:id`

**Description**: Delete a user by ID

**URL Parameters**:
- `id` (string, required) - User ID

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "User deleted successfully",
  "timestamp": "2024-02-22T01:00:00.000Z"
}
```

**Error Responses**:
- `400` - User ID is required
- `404` - User not found
- `500` - Internal server error

**Example**:
```bash
curl -X DELETE https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/users/user123 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 8. Update User Status

**Endpoint**: `PATCH /api/users/:id/status`

**Description**: Update user status only

**URL Parameters**:
- `id` (string, required) - User ID

**Request Body**:
```typescript
{
  status: 'active' | 'inactive' | 'pending';  // Required
}
```

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "User status updated successfully",
  "data": {
    "id": "user123",
    "status": "inactive"
  },
  "timestamp": "2024-02-22T01:00:00.000Z"
}
```

**Error Responses**:
- `400` - User ID or status missing, invalid status value
- `404` - User not found
- `500` - Internal server error

**Example**:
```bash
curl -X PATCH https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/users/user123/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

---

## 🏥 Health Check

### 9. Health Check

**Endpoint**: `GET /api/health`

**Description**: Check API and database health

**Success Response** (200):
```json
{
  "status": "success",
  "message": "API is healthy",
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2024-02-22T00:00:00.000Z"
  }
}
```

**Error Response** (503):
```json
{
  "status": "error",
  "message": "API is unhealthy",
  "data": {
    "status": "unhealthy",
    "database": "disconnected",
    "error": "Error message",
    "timestamp": "2024-02-22T00:00:00.000Z"
  }
}
```

**Example**:
```bash
curl -X GET https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/health
```

---

## 📝 Response Format

All endpoints follow a consistent response format:

```typescript
interface ApiResponse<T = any> {
  status: 'success' | 'error';  // Operation status
  message: string;                // Human-readable message
  data?: T;                       // Response data (if any)
  timestamp: string;              // ISO 8601 timestamp
}
```

---

## 🔒 Authentication

### Token Format

Currently using a simple Base64-encoded token (upgrade to JWT for production):

```typescript
token = base64(userId:email:timestamp)
```

**Note**: In production, implement proper JWT tokens with:
- Expiration time
- Refresh tokens
- Proper validation

### Using Tokens

Include the token in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

---

## 🎯 TypeScript Types

### User Type

```typescript
interface User {
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
```

### Login Response Type

```typescript
interface LoginResponse {
  token: string;
  user: User;
}
```

### Users List Response Type

```typescript
interface UsersListResponse {
  users: User[];
  total: number;
}
```

---

## 🚨 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success - Request completed |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required/failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 405 | Method Not Allowed - Wrong HTTP method |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service down |

---

## 📚 Frontend Usage Examples

### Using API Service

```typescript
import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  type User,
  type LoginResponse
} from '../services/api';

// Register
async function handleRegister() {
  try {
    const response = await registerUser({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user'
    });

    if (response.status === 'success') {
      console.log('User registered:', response.data.user);
    }
  } catch (error) {
    console.error('Registration failed:', error);
  }
}

// Login
async function handleLogin() {
  try {
    const response = await loginUser('john@example.com', 'password123');

    if (response.status === 'success') {
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      console.log('Logged in as:', user.name);
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// Get all users
async function loadUsers() {
  try {
    const response = await getAllUsers({ status: 'active' });

    if (response.status === 'success') {
      const { users, total } = response.data;
      console.log(`Loaded ${total} users`);
    }
  } catch (error) {
    console.error('Failed to load users:', error);
  }
}

// Update user
async function updateUserDetails(userId: string) {
  try {
    const response = await updateUser(userId, {
      name: 'Updated Name',
      role: 'admin'
    });

    if (response.status === 'success') {
      console.log('User updated:', response.data.user);
    }
  } catch (error) {
    console.error('Update failed:', error);
  }
}
```

### Using Auth Context

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();

  const handleLogin = async () => {
    await login('john@example.com', 'password123');
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          {isAdmin && <p>You are an admin</p>}
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

---

## 🧪 Testing

### Using Postman

1. **Environment Variables**:
   - `API_BASE_URL`: `https://asia-southeast1-qayra-makeup-api.cloudfunctions.net`
   - `AUTH_TOKEN`: Copy from login response

2. **Collections**:
   - Authentication (register, login, logout)
   - Users (get all, get by ID, update, delete, update status)
   - Health Check

3. **Pre-request Script**:
   ```javascript
   // Automatically add auth token
   if (pm.environment.get('AUTH_TOKEN')) {
     pm.request.headers.add({
       key: 'Authorization',
       value: `Bearer ${pm.environment.get('AUTH_TOKEN')}`
     });
   }
   ```

### Using JavaScript/TypeScript

```typescript
// Test script
const API_BASE_URL = 'https://asia-southeast1-qayra-makeup-api.cloudfunctions.net';

async function testAPI() {
  // Test health
  const health = await fetch(`${API_BASE_URL}/api/health`);
  console.log('Health:', await health.json());

  // Test register
  const register = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    })
  });
  console.log('Register:', await register.json());

  // Test login
  const login = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    })
  });
  const loginData = await login.json();
  console.log('Login:', loginData);

  // Test get users
  const users = await fetch(`${API_BASE_URL}/api/users`, {
    headers: { 'Authorization': `Bearer ${loginData.data.token}` }
  });
  console.log('Users:', await users.json());
}

testAPI();
```

---

## 📞 Support

For issues or questions:
1. Check `CROSS_PROJECT_SETUP.md` for setup instructions
2. Review error messages carefully
3. Test with cURL to isolate issues
4. Check Firebase Console logs
5. Verify Service Account permissions

---

**Last Updated**: 2024-02-22
