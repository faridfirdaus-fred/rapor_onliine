# Struktur Database - Rapor Digital

## Database: rapordigital
**Connection String**: MongoDB Atlas (lihat .env)

## Collections

### 1. users
- `_id`: ObjectId
- `nama`: String
- `email`: String (unique)
- `password`: String (hashed)
- `role`: String (enum: 'admin', 'guru')
- `createdAt`: Date
- `updatedAt`: Date

### 2. kelas
- `_id`: ObjectId
- `nama`: String (contoh: "X IPA 1")
- `tingkat`: Number (10, 11, atau 12)
- `jurusan`: String (IPA/IPS/dll)
- `waliKelas`: ObjectId (ref: users)
- `createdAt`: Date
- `updatedAt`: Date

### 3. siswa
- `_id`: ObjectId
- `nis`: String (unique)
- `nama`: String
- `kelas`: ObjectId (ref: kelas)
- `jenisKelamin`: String (enum: 'L', 'P')
- `tanggalLahir`: Date
- `alamat`: String
- `createdAt`: Date
- `updatedAt`: Date

### 4. nilai
- `_id`: ObjectId
- `siswa`: ObjectId (ref: siswa)
- `mataPelajaran`: String
- `semester`: Number (1 atau 2)
- `tahunAjaran`: String (contoh: "2024/2025")
- `tugas`: Number
- `uts`: Number
- `uas`: Number
- `nilaiAkhir`: Number (calculated)
- `createdAt`: Date
- `updatedAt`: Date

### 5. bobotnilai
- `_id`: ObjectId
- `mataPelajaran`: String
- `bobotTugas`: Number (%)
- `bobotUTS`: Number (%)
- `bobotUAS`: Number (%)
- `createdAt`: Date
- `updatedAt`: Date

## Relationships

```
users (wali kelas) --> kelas
kelas --> siswa
siswa --> nilai
```
