# Firebase Cloud Functions

Cloud Functions untuk backend aplikasi QayraMakeUp. Semua operasi database Firestore dibungkus dalam Cloud Functions untuk keamanan dan konsistensi.

## 📋 Daftar Fungsi

### User Management

| Function | Deskripsi |
|----------|-----------|
| `getAllUsers` | Mengambil semua data user (hanya admin) |
| `getUserById` | Mengambil data user berdasarkan UID |
| `createUser` | Membuat user baru (hanya admin) |
| `updateUser` | Mengupdate data user yang sudah ada |
| `deleteUser` | Menghapus user (hanya admin) |
| `updateUserStatus` | Update status user (active/inactive/pending) |

## 🚀 Cara Deploy

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Login ke Firebase (jika belum)

```bash
firebase login
```

### 3. Deploy ke Firebase

```bash
# Deploy semua functions
npm run deploy

# Atau menggunakan firebase CLI langsung
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:getAllUsers
```

### 4. Cek Deploy Logs

```bash
npm run logs
```

## 📝 Penggunaan di Frontend

Semua functions dipanggil menggunakan `httpsCallable` dari package `firebase/functions`:

```javascript
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

// Contoh: Get All Users
const getAllUsersFunc = httpsCallable(functions, 'getAllUsers');
const result = await getAllUsersFunc({});
console.log(result.data);
```

## 🔐 Security Rules

### Authentication
- Semua functions memerlukan user yang authenticated
- Token Firebase Auth otomatis divalidasi oleh Cloud Functions

### Authorization
- **Admin-only**: `getAllUsers`, `createUser`, `deleteUser`, `updateUserStatus`
- **Admin/Self**: `getUserById`, `updateUser`
- User biasa hanya bisa melihat dan mengupdate data sendiri

### Prevention
- User tidak bisa menghapus diri sendiri
- User tidak bisa menonaktifkan diri sendiri
- Validasi email duplikat saat create user

## 📦 Struktur Data

### User Document (`users_qayra` collection)

```javascript
{
  id: string,           // Firestore document ID (sama dengan Auth UID)
  name: string,         // Nama lengkap
  email: string,        // Email user
  role: string,        // 'admin' | 'user'
  status: string,      // 'active' | 'inactive' | 'pending'
  eventDate: string,   // ISO date string
  createdAt: timestamp, // Server timestamp
  updatedAt: timestamp  // Server timestamp
}
```

## 🔧 Local Development

### Jalankan Firebase Emulator

```bash
npm run serve
```

Emulator akan running di:
- Functions: `http://localhost:5001`
- Firestore: `http://localhost:8080`

### Update Firebase Config untuk Local Development

Di file `src/config/firebase.ts`:

```javascript
// Uncomment untuk development
// functions.connectFunctionsEmulator(functions, 'localhost', 5001);
```

## 📊 Error Handling

Semua functions mengembalikan error dalam format Firebase HttpsError:

```javascript
{
  code: 'unauthenticated' | 'permission-denied' | 'not-found' | 'invalid-argument' | 'internal',
  message: string
}
```

Frontend harus menangani error ini dengan SweetAlert2:

```javascript
try {
  const result = await someFunction();
} catch (error) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: error.message,
    confirmButtonColor: '#C68E2D',
  });
}
```

## 🔄 Update Functions

Setiap kali ada perubahan:

1. Edit file `index.js`
2. Deploy ulang:
   ```bash
   npm run deploy
   ```

## 📌 Catatan Penting

1. **Pastikan Firestore Rules** di Firebase Console diset sesuai kebutuhan
2. **Admin role** harus di-set di Firebase Auth custom claims atau di Firestore
3. **Email updates** akan mengupdate kedua Firebase Auth dan Firestore
4. **Delete user** akan menghapus dari Firebase Auth dan Firestore

## 🆕 Menambah Function Baru

Ketika menambah fitur baru:

1. Buat function baru di `index.js`
2. Export dengan nama yang jelas
3. Tambahkan validation dan security checks
4. Update dokumentasi ini
5. Deploy function baru

Contoh:

```javascript
exports.newFunction = functions.https.onCall(async (data, context) => {
  try {
    // Validation
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Logic here

    return { success: true, data: result };
  } catch (error) {
    console.error('Error in newFunction:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

## 📞 Support

Jika ada error saat deploy:
1. Cek Firebase console untuk logs
2. Jalankan `npm run logs` untuk melihat error logs
3. Pastikan Firebase project sudah di-set dengan benar di `.firebaserc`
