# Routes Configuration Guide

## 📁 Struktur File Routes

### File: `src/routes.tsx`
File ini mengatur semua routing aplikasi React. Memisahkan routing logic dari komponen utama membuat kode lebih terorganisir dan mudah dimaintain.

### File: `src/App.tsx`
File ini sekarang sangat sederhana, hanya mengatur BrowserRouter dan me-load routes dari `routes.tsx`.

---

## 🛣️ Daftar Routes

### Public Routes (Tanpa Auth)

| Path | Komponen | Deskripsi |
|------|----------|-----------|
| `/` | Redirect ke `/login` | Route default |
| `/login` | `LoginPage` | Halaman login |

### Protected Routes (Memerlukan Auth)

Semua route ini dibungkus dengan:
- `ProtectedRoute` - Memeriksa autentikasi
- `MobileContainer` - Wrapper layout mobile

| Path | Komponen | Deskripsi |
|------|----------|-----------|
| `/dashboard` | `DashboardPage` | Dashboard utama |
| `/analysis` | `AnalysisPage` | Daftar analisis |
| `/analysis/:id` | `AnalysisDetailPage` | Detail analisis (dengan parameter ID) |
| `/users` | `UsersPage` | Kelola user |
| `/users/add` | `AddUserPage` | Form tambah user |

---

## 🔒 Route Components

### ProtectedRoute
```tsx
<ProtectedRoute>
  <MobileContainer>
    <YourComponent />
  </MobileContainer>
</ProtectedRoute>
```

**Fitur:**
- Redirect ke `/login` jika user belum login
- Menyediakan konten yang dilindungi hanya untuk user yang sudah login

### PublicRoute
```tsx
<PublicRoute>
  <YourComponent />
</PublicRoute>
```

**Fitur:**
- Redirect ke `/dashboard` jika user sudah login
- Digunakan untuk halaman yang tidak boleh diakses setelah login (seperti halaman login)

---

## 📝 Cara Menambah Route Baru

### 1. Import Komponen
Di file `src/routes.tsx`, tambahkan import di bagian atas:

```tsx
import NewPage from './pages/NewPage';
```

### 2. Tambah Route
Dalam `<Routes>`, tambahkan route baru:

```tsx
{/* Untuk Route Protected */}
<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <MobileContainer>
        <NewPage />
      </MobileContainer>
    </ProtectedRoute>
  }
/>

{/* Atau untuk Route Public */}
<Route
  path="/public-page"
  element={
    <PublicRoute>
      <PublicPage />
    </PublicRoute>
  }
/>
```

### 3. Jika Butuh Parameter
Gunakan format `:parameter`:

```tsx
<Route
  path="/item/:id"
  element={
    <ProtectedRoute>
      <MobileContainer>
        <ItemDetailPage />
      </MobileContainer>
    </ProtectedRoute>
  }
/>
```

Di komponen, akses parameter dengan:
```tsx
import { useParams } from 'react-router-dom';

const ItemDetailPage = () => {
  const { id } = useParams();
  // gunakan id untuk fetch data
};
```

---

## 🚀 Cara Menggunakan Routes di Komponen

### 1. Import Hooks
```tsx
import { useNavigate, useParams, useLocation } from 'react-router-dom';
```

### 2. useNavigate - Untuk Pindah Halaman
```tsx
const navigate = useNavigate();

// Navigate ke halaman tertentu
navigate('/dashboard');

// Navigate ke halaman dengan parameter
navigate('/analysis/123');

// Navigate dengan replace (tidak ada history)
navigate('/login', { replace: true });

// Navigate ke halaman sebelumnya
navigate(-1);
```

### 3. useParams - Untuk Ambil Parameter URL
```tsx
const { id } = useParams();
console.log(id); // '123' jika URL: '/analysis/123'
```

### 4. useLocation - Untuk Ambil Informasi Lokasi
```tsx
const location = useLocation();
console.log(location.pathname); // '/dashboard'
console.log(location.search); // '?page=1'
```

---

## 🏗️ Struktur Folder yang Direkomendasikan

```
src/
├── routes.tsx           # Semua routes di sini
├── App.tsx              # Hanya wrapper untuk Router
├── pages/               # Semua halaman/page komponen
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── AnalysisPage.tsx
│   ├── AnalysisDetailPage.tsx
│   ├── UsersPage.tsx
│   └── AddUserPage.tsx
├── layouts/             # Layout komponen
│   └── MobileContainer.tsx
└── store/               # State management (auth, dll)
```

---

## ✅ Keuntungan Memisahkan Routes

### 1. **Organisasi Kode Lebih Baik**
- Semua routing logic di satu file
- Mudah melihat seluruh struktur routes
- Tidak bercampur dengan komponen lain

### 2. **Maintainability**
- Tambah/menghapus route lebih mudah
- Tidak perlu edit file yang besar seperti App.tsx
- Struktur jelas dan terdokumentasi

### 3. **Reusability**
- Route components (`ProtectedRoute`, `PublicRoute`) bisa dipakai di mana saja
- Mudah menambah middleware atau guards di routes

### 4. **Testing**
- Routes bisa di-test secara terpisah
- Komponen tidak tergantung pada routing logic

---

## 🎯 Best Practices

### 1. Gunakan Nama Route yang Deskriptif
```tsx
// ✅ Baik
path="/analysis/:id"
path="/users/add"

// ❌ Kurang Baik
path="/a/:id"
path="/u/add"
```

### 2. Tetap Urutan Routes dari Spesifik ke Umum
```tsx
// ✅ Benar - routes spesifik dulu
<Route path="/analysis/:id" element={<DetailPage />} />
<Route path="/analysis" element={<ListPage />} />

// ❌ Salah - routes umum dulu (akan match semua)
<Route path="/analysis" element={<ListPage />} />
<Route path="/analysis/:id" element={<DetailPage />} />
```

### 3. Gunakan Redirect untuk Default Routes
```tsx
<Route path="/" element={<Navigate to="/login" replace />} />
```

### 4. Konsisten dengan Route Guards
```tsx
// Semua route yang butuh auth gunakan ProtectedRoute
<Route
  path="/protected-page"
  element={
    <ProtectedRoute>
      <ProtectedPage />
    </ProtectedRoute>
  }
/>
```

---

## 🔧 Troubleshooting

### Problem: "Route tidak ditemukan"
**Solution:** Pastikan path benar dan urutan routes sudah tepat

### Problem: "Halaman kosong/blank"
**Solution:** Check apakah komponen sudah di-import dengan benar

### Problem: "Protected route tidak bekerja"
**Solution:** Pastikan `ProtectedRoute` meng-import `useAuthStore` dengan benar

---

## 📚 Referensi Tambahan

- [React Router Documentation](https://reactrouter.com/)
- [React Router v6 Hooks](https://reactrouter.com/en/main/hooks/use-navigate)
- [Route Parameters](https://reactrouter.com/en/main/route/route#params)

---

## 🔄 Flow Routes Aplikasi Qayra

```
Login
  ↓ (success)
Dashboard
  ↓
├─ Analysis
│  ├─ Analysis List (table)
│  └─ Analysis Detail (/analysis/:id)
│
└─ Users
   ├─ Users List (table)
   └─ Add User (/users/add)
```

---

## 💡 Tips Tambahan

1. **Lazy Loading Routes** (untuk performance lebih baik):
   ```tsx
   const LazyComponent = React.lazy(() => import('./pages/LazyPage'));

   <Route
     path="/lazy"
     element={
       <React.Suspense fallback={<div>Loading...</div>}>
         <LazyComponent />
       </React.Suspense>
     }
   />
   ```

2. **Route Groups** (untuk mengelompokkan routes):
   ```tsx
   // Bisa buat file khusus untuk setiap fitur
   export const DashboardRoutes = () => { ... }
   export const AnalysisRoutes = () => { ... }
   export const UsersRoutes = () => { ... }
   ```

3. **Custom Route Guards** (untuk logic lebih kompleks):
   ```tsx
   const AdminRoute = ({ children }) => {
     const user = useAuthStore(state => state.user);
     if (user?.role !== 'admin') {
       return <Navigate to="/unauthorized" />;
     }
     return <>{children}</>;
   };
   ```

---

**File routes.tsx sekarang menangani semua routing aplikasi! 🚀**
