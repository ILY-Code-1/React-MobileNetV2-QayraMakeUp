# Cross-Project Firebase Backend Setup Guide

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                │
│                    (React - Vite)                               │
│                        ↓                                        │
│                   REST API (fetch/axios)                        │
│                        ↓                                        │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │           Project A: Cloud Functions (API Layer)             │ │
│ │   - Deployed to Firebase Project A                         │ │
│ │   - HTTP Endpoints for all operations                       │ │
│ │   - Firebase Admin SDK configured for Project B             │ │
│ └────────────────────────────────────────────────────────────┘ │
│                        ↓                                        │
│                Service Account (Project B)                     │
│                        ↓                                        │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │           Project B: Firestore Database (Data Layer)        │ │
│ │   - Firebase Project B (separate account/project)          │ │
│ │   - Contains users_qayra collection                         │ │
│ │   - Accessed via Firebase Admin SDK with SA credential      │ │
│ └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Prasyarat

1. **Two Firebase Projects**:
   - Project A: Cloud Functions (API layer)
   - Project B: Firestore Database (data layer)

2. **Google Cloud Console access**:
   - Untuk membuat Service Account di Project B

3. **Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

---

## 🚀 Step-by-Step Setup

### STEP 1: Setup Project B (Firestore Database)

#### 1.1 Create Firebase Project B
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Create new project → `qayra-makeup-db`
3. Pilih region (rekomendasi: `asia-southeast1` untuk Indonesia)

#### 1.2 Create Firestore Database
1. Di Firebase Console Project B
2. Go to **Firestore Database**
3. Click **Create Database**
4. Choose **Production mode**
5. Select region: `asia-southeast1` (sama dengan Cloud Functions)

#### 1.3 Setup Firestore Rules
Create file `firestore.rules` di root:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // All access blocked - only accessed via Cloud Functions
      allow read, write: if false;
    }
  }
}
```

Deploy ke Project B:
```bash
firebase login
firebase use qayra-makeup-db
firebase deploy --only firestore:rules
```

---

### STEP 2: Setup Service Account di Project B

#### 2.1 Create Service Account
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Select Project: `qayra-makeup-db`
3. Go to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
5. Name: `firebase-admin-sdk`
6. Description: `Service account for Cloud Functions cross-project access`
7. Click **Create and Continue**
8. Skip adding users for now
9. Click **Done**

#### 2.2 Grant Firestore Access
1. In Service Accounts page, find `firebase-admin-sdk`
2. Click the 3 dots → **Manage Keys**
3. Go to **Permissions** tab
4. Click **Grant Access**
5. Add role: **Cloud Datastore User** atau **Firestore User**
6. Save

#### 2.3 Generate Private Key
1. In Service Accounts page
2. Click `firebase-admin-sdk` → **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Key type: **JSON**
5. Download the JSON file
6. **IMPORTANT**: Keep this file secure! Never commit to Git!

#### 2.4 Setup Service Account File
1. Copy the downloaded JSON file to `functions/service-account-key.json`
2. Verify file structure:
   ```json
   {
     "type": "service_account",
     "project_id": "qayra-makeup-db",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----...",
     "client_email": "...@qayra-makeup-db.iam.gserviceaccount.com",
     ...
   }
   ```

#### 2.5 Verify .gitignore
Make sure `functions/.gitignore` includes:
```
node_modules/
*.local
service-account-key.json
.env
```

---

### STEP 3: Setup Project A (Cloud Functions)

#### 3.1 Create Firebase Project A
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Create new project → `qayra-makeup-api`
3. Pilih region: `asia-southeast1`

#### 3.2 Configure Firebase CLI
```bash
# Login jika belum
firebase login

# Init untuk Project A
cd C:\Users\Ilham Abdul Hakim\Documents\ILYCODE\ikhsan\React-MobileNetV2-QayraMakeUp
firebase use qayra-makeup-api
```

#### 3.3 Update .firebaserc
Edit `.firebaserc`:
```json
{
  "projects": {
    "default": "qayra-makeup-api"
  }
}
```

#### 3.4 Update firebase.json
```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs20",
    "ignore": [
      "node_modules",
      ".git",
      "firebase-debug.log",
      "firebase-debug.*.log"
    ],
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run lint",
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

#### 3.5 Install Dependencies
```bash
cd functions
npm install
```

This will install:
- `firebase-admin`: Firebase Admin SDK
- `firebase-functions`: Cloud Functions framework
- `bcrypt`: Password hashing

---

### STEP 4: Deploy Cloud Functions

#### 4.1 Test Locally (Emulator)
```bash
cd functions
npm run serve
```

Test endpoints:
```
http://localhost:5001/qayra-makeup-api/asia-southeast1/api/auth/register
http://localhost:5001/qayra-makeup-api/asia-southeast1/api/auth/login
http://localhost:5001/qayra-makeup-api/asia-southeast1/api/health
```

#### 4.2 Deploy to Production
```bash
# Deploy semua functions
firebase deploy --only functions

# Deploy function tertentu
firebase deploy --only functions:register,login,health

# Deploy dengan region spesifik
firebase deploy --only functions:register --region asia-southeast1
```

Wait for deployment to complete...

#### 4.3 Get Cloud Functions URL
After deployment, you'll see:
```
✔  functions[register(us-central1)]: Successful update operation.
✔  functions[login(us-central1)]: Successful update operation.
...
Function URL: https://us-central1-qayra-makeup-api.cloudfunctions.net
```

---

### STEP 5: Setup Frontend

#### 5.1 Configure .env
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=https://asia-southeast1-qayra-makeup-api.cloudfunctions.net
```

**Note**: Ganti region sesuai deployment Anda!

#### 5.2 Update API Service
Di `src/services/api.ts`, pastikan `API_BASE_URL` menggunakan env var:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://asia-southeast1-qayra-makeup-api.cloudfunctions.net';
```

#### 5.3 Wrap App with AuthProvider
Di `src/App.tsx`:
```tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

---

## 📊 API Endpoints Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| PATCH | `/api/users/:id/status` | Update user status |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |

---

## 🧪 Testing API

### Using cURL

#### Register User
```bash
curl -X POST https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

#### Login User
```bash
curl -X POST https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Get All Users (with token)
```bash
curl -X GET https://asia-southeast1-qayra-makeup-api.cloudfunctions.net/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Frontend

```tsx
import { loginUser, registerUser } from './services/api';

// Register
try {
  const response = await registerUser({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  });
  console.log(response);
} catch (error) {
  console.error(error);
}

// Login
try {
  const response = await loginUser('john@example.com', 'password123');
  const { token, user } = response.data;
  console.log('Token:', token);
  console.log('User:', user);
} catch (error) {
  console.error(error);
}
```

---

## 🔒 Security Best Practices

### ✅ DO:
1. Keep `service-account-key.json` in `.gitignore`
2. Never commit secrets to Git
3. Use environment variables for sensitive data
4. Implement proper JWT validation (upgrade current token system)
5. Use HTTPS for all API calls
6. Validate all inputs on server-side
7. Hash passwords with bcrypt (already implemented)

### ❌ DON'T:
1. Never expose Service Account to frontend
2. Never commit `service-account-key.json`
3. Never use direct Firestore access from frontend
4. Never trust client-side validation only

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Service account not configured"
**Solution**:
1. Verify `service-account-key.json` exists in `functions/`
2. Check file has correct JSON format
3. Verify project_id matches Project B

#### Issue: "Missing or insufficient permissions"
**Solution**:
1. Go to Google Cloud Console Project B
2. IAM & Admin → Service Accounts
3. Verify role: `Cloud Datastore User` or `Firestore User`
4. Wait a few minutes for IAM changes to propagate

#### Issue: "Cross-project access denied"
**Solution**:
1. Verify Project A can access Project B via Admin SDK
2. Check Service Account has correct permissions
3. Ensure both projects are in same region (recommended)

#### Issue: Frontend can't connect to API
**Solution**:
1. Verify `VITE_API_BASE_URL` is correct
2. Check CORS settings (should work by default)
3. Verify Cloud Functions are deployed
4. Test with cURL first to isolate issue

#### Issue: Login fails with "Invalid email or password"
**Solution**:
1. Verify user exists in Firestore
2. Check password was hashed correctly during registration
3. Ensure email is lowercase (API handles this automatically)

---

## 📝 Development Workflow

### Adding New Feature

1. **Backend (Cloud Functions)**:
   ```javascript
   // functions/index.js
   exports.newFeature = functions.https.onRequest(asyncHandler(async (req, res) => {
     // Your implementation
   }));
   ```

2. **Deploy**:
   ```bash
   firebase deploy --only functions:newFeature
   ```

3. **Frontend (API Service)**:
   ```typescript
   // src/services/api.ts
   export const newFeature = async (params: any) => {
     return apiRequest('/api/new-feature', {
       method: 'POST',
       body: JSON.stringify(params),
     });
   };
   ```

4. **Use in Component**:
   ```tsx
   import { newFeature } from './services/api';

   const handleFeature = async () => {
     try {
       const result = await newFeature({ data });
       console.log(result);
     } catch (error) {
       console.error(error);
     }
   };
   ```

---

## 🎯 Next Steps

1. **Upgrade Token System**:
   - Implement proper JWT with `jsonwebtoken` library
   - Add token expiration
   - Implement token refresh logic

2. **Add Rate Limiting**:
   - Prevent brute force attacks
   - Implement request throttling

3. **Add Logging**:
   - Log all API calls
   - Monitor for suspicious activity

4. **Add Input Validation Library**:
   - Use `joi` or `zod` for robust validation

5. **Add Unit Tests**:
   - Test all Cloud Functions
   - Test API service functions

---

## 📚 Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Service Accounts & IAM](https://cloud.google.com/iam/docs/service-accounts)

---

## ✅ Checklist

- [ ] Create Firebase Project B (Firestore)
- [ ] Create Firestore database in Project B
- [ ] Deploy Firestore rules
- [ ] Create Service Account in Project B
- [ ] Grant Firestore User role to SA
- [ ] Download and place `service-account-key.json`
- [ ] Verify `.gitignore` includes SA file
- [ ] Create Firebase Project A (Cloud Functions)
- [ ] Configure `.firebaserc` for Project A
- [ ] Install function dependencies
- [ ] Deploy Cloud Functions to Project A
- [ ] Test API endpoints with cURL
- [ ] Configure frontend `.env` with API URL
- [ ] Wrap app with AuthProvider
- [ ] Test login/register in frontend
- [ ] Verify all CRUD operations work

---

## 🎉 Selesai!

Backend cross-project sudah siap digunakan. Cloud Functions di Project A akan mengakses Firestore di Project B melalui Firebase Admin SDK dengan Service Account, memberikan arsitektur yang aman dan scalable.
