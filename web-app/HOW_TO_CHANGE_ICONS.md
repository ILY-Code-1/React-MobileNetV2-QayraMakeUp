# Cara Mengubah Site Icon dan Logo

## 1. Cara Mengubah Site Icon (Favicon)

Site icon adalah icon kecil yang muncul di tab browser. Saat ini menggunakan `/vite.svg`.

### Lokasi File:
```
index.html (baris 5)
```

### Cara Mengubah:

#### Option A: Ganti dengan file gambar yang sudah ada
1. Letakkan file icon Anda di folder `public/` (contoh: `qayra-favicon.ico` atau `qayra-icon.png`)
2. Edit `index.html` pada baris 5:

```html
<!-- Sebelum -->
<link rel="icon" type="image/svg+xml" href="/vite.svg" />

<!-- Sesudah (untuk PNG/JPG) -->
<link rel="icon" type="image/png" href="/qayra-icon.png" />

<!-- atau (untuk ICO) -->
<link rel="icon" href="/qayra-favicon.ico" />
```

#### Option B: Buat file baru
1. Buat file icon dengan ukuran standar:
   - Favicon: 32x32, 48x48, atau 64x64 pixel
   - Format: `.ico`, `.png`, atau `.svg`
   - Save sebagai `qayra-favicon.ico` di folder `public/`
2. Update `index.html` sesuai Option A di atas

---

## 2. Cara Mengubah Logo di Header

Logo di header saat ini dibuat dengan CSS (lingkaran dalam lingkaran) dan teks "QAYRA".

### Lokasi:
Semua halaman (DashboardPage, AnalysisPage, UsersPage) pada bagian Header.

### Cara Mengubah:

#### Option A: Gunakan gambar/logo file
1. Letakkan file logo di folder `public/` (contoh: `qayra-logo.png`)
2. Ganti logo CSS di semua halaman dengan:

```tsx
{/* Di DashboardPage.tsx, AnalysisPage.tsx, dan UsersPage.tsx */}
{/* Header section */}
<div className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-lg shrink-0">
  <div className="flex items-center space-x-3">
    {/* Ganti logo CSS dengan image tag */}
    <img
      src="/qayra-logo.png"
      alt="QAYRA Logo"
      className="w-8 h-8 rounded-full"
    />
    <span className="font-serif font-bold text-lg">QAYRA</span>
  </div>
  {/* ... */}
</div>
```

#### Option B: Modifikasi logo CSS yang sudah ada
Jika ingin tetap menggunakan CSS, ubah warna atau ukurannya:

```tsx
{/* Di DashboardPage.tsx, AnalysisPage.tsx, dan UsersPage.tsx */}
<div className="flex items-center space-x-3">
  {/* Outer circle */}
  <div className="w-8 h-8 bg-[#C68E2D] rounded-full flex items-center justify-center">
    {/* Inner circle */}
    <div className="w-6 h-6 bg-[#D4A03A] rounded-full"></div>
  </div>
  <span className="font-serif font-bold text-lg">QAYRA</span>
</div>
```

Ubah:
- `w-8 h-8`: Ukuran outer circle (ganti `8` dengan `10` untuk lebih besar)
- `bg-[#C68E2D]`: Warna outer circle
- `w-6 h-6`: Ukuran inner circle
- `bg-[#D4A03A]`: Warna inner circle
- "QAYRA": Nama brand

---

## 3. Struktur Folder yang Direkomendasikan

```
public/
├── favicon.ico          (Site icon untuk browser)
├── qayra-logo.png       (Logo header)
├── qayra-logo-white.png (Logo alternatif jika butuh versi putih)
└── vite.svg             (Default, bisa dihapus)
```

---

## 4. Tips untuk Icon dan Logo

### Ukuran yang Disarankan:

#### Site Icon (Favicon):
- Minimum: 32x32 pixel
- Recommended: 64x64 pixel
- Format: `.ico` (tersedia di semua browser), `.png`, atau `.svg`

#### Logo Header:
- Recommended: 128x128 atau 256x256 pixel (untuk kualitas baik)
- Saat display akan di-scale ke 32x32 (w-8 h-8)
- Format: `.png` atau `.svg` (SVG ideal karena scalable)

#### Design Tips:
- Background transparent (PNG dengan transparansi atau SVG)
- Kontras tinggi (jika background header hitam, gunakan logo dengan warna terang)
- Simple design untuk ukuran kecil

---

## 5. Contoh Implementasi Lengkap

### Jika ingin menggunakan gambar logo:

```tsx
// Di semua 3 halaman (DashboardPage, AnalysisPage, UsersPage)
// Ganti bagian header logo:

<div className="flex items-center space-x-3">
  {/* Gunakan gambar logo */}
  <img
    src="/qayra-logo.png"
    alt="QAYRA"
    className="w-8 h-8 rounded-full object-contain"
  />
  <span className="font-serif font-bold text-lg">QAYRA</span>
</div>
```

### Jika ingin menggunakan SVG (best practice):

1. Buat file SVG di `public/qayra-logo.svg`
2. Import dan gunakan di React:

```tsx
// Di semua 3 halaman
import QayraLogo from '/qayra-logo.svg';

// Di header:
<div className="flex items-center space-x-3">
  <QayraLogo className="w-8 h-8" />
  <span className="font-serif font-bold text-lg">QAYRA</span>
</div>
```

---

## Catatan Penting:

1. File di folder `public/` akan langsung tersedia dengan path `/nama-file`
2. Setelah mengubah icon/logo, refresh browser (Ctrl+F5) untuk melihat perubahan
3. Cache browser mungkin perlu dibersihkan untuk melihat favicon baru
4. Untuk production, pastikan file icon/logo ter-include saat build

---

## Checklist:

- [ ] Letakkan file icon di `public/`
- [ ] Update `index.html` untuk favicon
- [ ] Update semua 3 halaman (DashboardPage, AnalysisPage, UsersPage) untuk logo header
- [ ] Test di browser (refresh dengan Ctrl+F5)
- [ ] Coba di ukuran layar berbeda (mobile/tablet/desktop)
