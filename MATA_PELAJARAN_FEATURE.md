# Sistem Mata Pelajaran Berdasarkan Kelas

## Deskripsi
Sistem mata pelajaran yang otomatis menyesuaikan dengan tingkat kelas. Setiap guru hanya melihat mata pelajaran dan siswa dari kelas yang mereka ampu.

## Mata Pelajaran per Tingkat

### Kelas Bawah (1-3)
1. Al-Quran Hadis
2. Aqidah Akhlak
3. Fiqih
4. PPKn
5. B. Indonesia
6. B. Arab
7. Matematika
8. SBDP
9. B. Sunda
10. PJOK

### Kelas Atas (4-6)
1. Al-Quran Hadis
2. Aqidah Akhlak
3. Fiqih
4. SKI
5. PPKn
6. B. Indonesia
7. B. Arab
8. Matematika
9. SBDP
10. B. Sunda
11. IPA
12. IPS
13. PJOK

## Fitur yang Diimplementasikan

### Backend

1. **Config Mata Pelajaran** (`backend/src/config/mataPelajaran.js`)
   - Fungsi `getMataPelajaranByKelas(namaKelas)` - Mengembalikan array mata pelajaran berdasarkan nama kelas
   - Fungsi `isMataPelajaranValid(mataPelajaran, namaKelas)` - Validasi mata pelajaran untuk kelas tertentu

2. **API Endpoint Baru** (`/api/mata-pelajaran`)
   - `GET /api/mata-pelajaran` - Mendapatkan daftar mata pelajaran untuk kelas guru yang login
   - Response termasuk statistik jumlah nilai per mata pelajaran

3. **Model Update**
   - Tambah method `countByMataPelajaran(kelasId, mataPelajaran)` di `Nilai.js`

### Frontend

1. **Halaman Daftar Mapel** (DaftarMapel.jsx)
   - ✅ Tidak lagi menggunakan data dummy
   - ✅ Fetch mata pelajaran dari API berdasarkan kelas guru
   - ✅ Tampilkan jumlah nilai yang sudah tersimpan
   - ✅ Navigasi ke NilaiMapel dengan data kelas yang lengkap

2. **Halaman Nilai Mapel** (NilaiMapel.jsx)
   - ✅ Tidak lagi menggunakan data dummy
   - ✅ Fetch siswa hanya dari kelas guru yang login
   - ✅ Fetch nilai yang sudah ada untuk mata pelajaran tertentu
   - ✅ Simpan nilai ke database dengan API
   - ✅ Bobot nilai otomatis dari pengaturan kelas
   - ✅ Perhitungan nilai akhir berdasarkan bobot

3. **Config Mata Pelajaran** (frontend/src/config/mataPelajaran.js)
   - Referensi mata pelajaran untuk frontend

## Cara Kerja

### Flow Sistem

1. **Login Guru**
   - Guru login dengan akun yang sudah terdaftar
   - Setiap akun guru terhubung dengan 1 kelas (via `kelasId`)

2. **Lihat Daftar Mata Pelajaran**
   - Sistem otomatis mendeteksi kelas guru (misal: "Kelas 1")
   - API mengembalikan mata pelajaran sesuai tingkat kelas
   - Kelas 1-3: 9 mata pelajaran
   - Kelas 4-6: 12 mata pelajaran

3. **Kelola Nilai**
   - Guru hanya melihat siswa di kelas mereka
   - Guru hanya bisa mengisi nilai untuk mata pelajaran di kelas mereka
   - Data nilai tersimpan per siswa, per mata pelajaran

### Contoh Skenario

**Guru Kelas 1:**
- Login dengan akun `kelas1` / `password`
- Melihat 9 mata pelajaran (Al-Quran Hadis, Aqidah Akhlak, dst.)
- Melihat hanya siswa Kelas 1
- Mengisi nilai untuk siswa Kelas 1 saja

**Guru Kelas 5:**
- Login dengan akun `kelas5` / `password`
- Melihat 12 mata pelajaran (termasuk IPA, IPS, PJOK)
- Melihat hanya siswa Kelas 5
- Mengisi nilai untuk siswa Kelas 5 saja

## API Endpoints

### GET /api/mata-pelajaran
Mendapatkan daftar mata pelajaran untuk kelas guru yang login.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "kelas": {
    "id": "12345",
    "nama": "Kelas 1"
  },
  "mataPelajaran": [
    {
      "nama": "Al-Quran Hadis",
      "kelasId": "12345",
      "namaKelas": "Kelas 1",
      "jumlahNilai": 25
    },
    {
      "nama": "Aqidah Akhlak",
      "kelasId": "12345",
      "namaKelas": "Kelas 1",
      "jumlahNilai": 25
    }
    // ... mata pelajaran lainnya
  ]
}
```

## File yang Dibuat/Dimodifikasi

### Backend
- ✅ **NEW** `backend/src/config/mataPelajaran.js` - Konfigurasi mata pelajaran
- ✅ **NEW** `backend/src/routes/matapelajaran.js` - Route API mata pelajaran
- ✅ **MODIFIED** `backend/src/models/Nilai.js` - Tambah `countByMataPelajaran`
- ✅ **MODIFIED** `backend/src/index.js` - Daftarkan route mata pelajaran

### Frontend
- ✅ **NEW** `frontend/src/config/mataPelajaran.js` - Konfigurasi mata pelajaran
- ✅ **MODIFIED** `frontend/src/pages/DaftarMapel.jsx` - Hapus data dummy, gunakan API
- ✅ **MODIFIED** `frontend/src/pages/NilaiMapel.jsx` - Hapus data dummy, gunakan API real

## Testing

### Test dengan Akun Kelas 1
```bash
# Login dengan:
Username: kelas1
Password: password

# Yang harus terlihat:
- 10 mata pelajaran
- Hanya siswa Kelas 1
- Bisa input nilai untuk semua mapel Kelas 1
```

### Test dengan Akun Kelas 4
```bash
# Login dengan:
Username: kelas4
Password: password

# Yang harus terlihat:
- 13 mata pelajaran (termasuk SKI, IPA, IPS, PJOK)
- Hanya siswa Kelas 4
- Bisa input nilai untuk semua mapel Kelas 4
```

## Validasi & Security

1. ✅ Guru hanya bisa akses data kelas mereka sendiri
2. ✅ Mata pelajaran disesuaikan otomatis dengan tingkat kelas
3. ✅ Tidak ada data dummy - semua dari database
4. ✅ Validasi mata pelajaran di backend
5. ✅ Authorization check di setiap endpoint

## Notes
- Sistem menggunakan nomor kelas untuk menentukan tingkat (1-3 = Bawah, 4-6 = Atas)
- Format nama kelas bisa: "Kelas 1", "Kelas 2A", "1", "1A", dll
- Regex pattern: `/\d+/` untuk ekstrak nomor kelas
- Jika nomor kelas tidak terdeteksi, akan return array kosong
