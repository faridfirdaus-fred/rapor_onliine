# Fitur Halaman Profil Pengguna

## Deskripsi
Setiap akun guru sekarang memiliki halaman profil pribadi yang dapat dikustomisasi. Setiap guru memiliki profil unik dengan foto profil dan informasi dasar.

## Fitur yang Ditambahkan

### Backend
1. **Schema Database** - Field di model User:
   - `username`: Username untuk login (unique)
   - `name`: Nama lengkap guru
   - `photo`: URL foto profil (opsional)
   - `kelasId`: ID kelas yang diampu

2. **API Endpoints**:
   - `GET /api/auth/profile` - Mendapatkan data profil pengguna yang sedang login
   - `PUT /api/auth/profile` - Update profil dengan support upload foto
   - `GET /api/auth/me` - Mendapatkan informasi user yang sedang login

3. **Upload Foto**:
   - Maksimal ukuran file: 5MB
   - Format yang diterima: JPEG, JPG, PNG, GIF
   - Foto disimpan di: `backend/uploads/profiles/`
   - Foto dapat diakses melalui: `http://localhost:5000/uploads/profiles/[filename]`

### Frontend
1. **ProfilePage Component** (`frontend/src/pages/ProfilePage.jsx`):
   - Tampilan profil yang menarik dengan foto profil bulat
   - Mode view dan edit yang terpisah
   - Upload foto profil dengan preview
   - Form untuk edit nama
   - Loading state dan error handling
   - Otomatis update context setelah profil diubah

2. **Integrasi dengan Dashboard**:
   - Route `/dashboard/profil` menampilkan ProfilePage
   - Default route di dashboard adalah halaman profil
   - Sidebar menu "Profil Guru" untuk navigasi

## Cara Menggunakan

### Untuk Pengguna (Guru)
1. Login ke aplikasi
2. Klik menu "Profil Guru" di sidebar atau otomatis diarahkan ke halaman profil
3. Untuk mengedit profil:
   - Klik tombol "Edit Profil"
   - Ubah nama jika diperlukan
   - Klik ikon kamera untuk upload foto profil
   - Klik "Simpan" untuk menyimpan perubahan
   - Atau "Batal" untuk membatalkan

### Untuk Developer

#### Menjalankan Aplikasi
```bash
# Backend
cd backend
npm install
npx prisma generate
npm start

# Frontend
cd frontend
npm install
npm run dev
```

#### Testing API dengan Postman/cURL

**Get Profile:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update Profile:**
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Ahmad Wijaya" \
  -F "photo=@/path/to/photo.jpg"
```

## Teknologi yang Digunakan
- **Backend**: Express.js, Multer (file upload), Prisma ORM, MongoDB
- **Frontend**: React, Axios, React Router
- **Authentication**: JWT Token

## File yang Dimodifikasi/Dibuat

### Backend
- ✅ `backend/prisma/schema.prisma` - Field photo di User model
- ✅ `backend/src/models/User.js` - Update method untuk prevent password update
- ✅ `backend/src/routes/auth.js` - Tambah endpoint profil dan upload
- ✅ `backend/src/middleware/auth.js` - Tambah verifyToken middleware
- ✅ `backend/src/index.js` - Serve static files untuk uploads
- ✅ `backend/uploads/profiles/` - Folder untuk menyimpan foto profil

### Frontend
- ✅ `frontend/src/pages/ProfilePage.jsx` - Component halaman profil baru
- ✅ `frontend/src/pages/Dashboard.jsx` - Integrasi ProfilePage
- ✅ `frontend/src/contexts/AuthContext.jsx` - Support update user data

## Notes
- Setiap guru memiliki profil yang unik dan terpisah
- Data profil di-fetch dari database berdasarkan user yang login
- Foto profil akan otomatis generate avatar jika belum diupload
- Semua perubahan profil langsung tersimpan di database
- Context AuthContext akan terupdate setelah profil diubah
- Field yang dapat diedit: Nama dan Foto Profil
- Username bersifat read-only (tidak dapat diubah)
