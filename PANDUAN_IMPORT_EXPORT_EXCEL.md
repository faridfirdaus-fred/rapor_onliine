# 📚 Panduan Import & Export Excel - Rapor Digital

## 📋 Daftar Isi
1. [Import Siswa dari Excel/CSV](#import-siswa)
2. [Export Nilai ke Excel](#export-nilai)
3. [Import Nilai dari Excel](#import-nilai)

---

## 1️⃣ Import Siswa dari Excel/CSV {#import-siswa}

### ✅ Cara Import Siswa

#### **Langkah 1: Siapkan File Excel**

Buat file Excel dengan format seperti ini:

| Absen | NISN     | Nama    |
|-------|----------|---------|
| 1     | 1212121  | abdul   |
| 2     | 1313131  | david   |
| 3     | 13131    | moses   |
| 4     | 14212412 | raju    |
| 5     | 123213   | solomon |

**⚠️ Penting:**
- Header kolom harus: `Absen`, `NISN`, `Nama` (atau gunakan header apapun di baris pertama)
- NISN bisa berupa angka apapun (tidak harus 10 digit)
- Nama harus diisi
- Nomor Absen akan diurutkan otomatis berdasarkan urutan

#### **Langkah 2: Simpan sebagai CSV**

1. Di Excel, klik **File** → **Save As**
2. Pilih format: **CSV (Comma delimited) (*.csv)**
3. Simpan dengan nama seperti: `siswa-kelas-1.csv`

#### **Langkah 3: Import ke Website**

1. Login ke website Rapor Digital
2. Masuk ke halaman **Kelas** yang ingin diisi
3. Klik tombol **"Import Siswa"**
4. Pilih file CSV yang sudah dibuat
5. Klik **"Upload"** atau **"Import"**
6. Siswa akan otomatis masuk ke database

#### **Format CSV yang Benar:**

```csv
nisn,nama
1212121,abdul
1313131,david
13131,moses
14212412,raju
123213,solomon
```

**Catatan:**
- Baris pertama adalah header (`nisn,nama`)
- Setiap baris berikutnya adalah data siswa
- Nomor absen akan di-generate otomatis berdasarkan urutan input

---

## 2️⃣ Export Nilai ke Excel {#export-nilai}

### ✅ Cara Export Nilai

#### **Langkah 1: Masuk ke Halaman Nilai**

1. Login ke website
2. Pilih **Daftar Mata Pelajaran**
3. Klik mata pelajaran yang ingin di-export (misal: **IPS**)

#### **Langkah 2: Klik Tombol Export**

1. Di halaman nilai, cari tombol **"📊 Export ke Excel"** (biasanya di pojok kanan atas)
2. Klik tombol tersebut
3. File Excel akan otomatis terdownload

#### **Isi File Excel yang Di-Export:**

| No Absen | NISN     | Nama    | Harian 1 | Harian 2 | Harian 3 | UAS | Nilai Akhir |
|----------|----------|---------|----------|----------|----------|-----|-------------|
| 1        | 1212121  | abdul   | 80       | 85       | 90       | 88  | 86.40       |
| 2        | 1313131  | david   | 75       | 80       | -        | 85  | 82.00       |
| 3        | 13131    | moses   | 90       | 95       | 92       | 94  | 93.20       |

**Keterangan:**
- **Harian 1, 2, 3**: Nilai harian (tugas, kuis, dll)
- **UAS**: Nilai Ujian Akhir Semester
- **Nilai Akhir**: Hasil perhitungan otomatis berdasarkan bobot
  - Formula: `(Rata-rata Harian × Bobot Harian) + (UAS × Bobot UAS) / 100`
  - Contoh: Bobot Harian 40%, UAS 60%
  - `(85 × 40 + 88 × 60) / 100 = 86.8`

---

## 3️⃣ Import Nilai dari Excel {#import-nilai}

### ✅ Cara Import Nilai dari Excel

#### **Langkah 1: Export Data Terlebih Dahulu**

Untuk memastikan format yang benar, sebaiknya **export data terlebih dahulu**:

1. Masuk ke halaman nilai mata pelajaran
2. Klik **"📊 Export Excel"**
3. Buka file Excel yang terdownload

File akan terlihat seperti ini:

| No Absen | NISN     | Nama    | Harian 1 | Harian 2 | Harian 3 | UAS | Nilai Akhir |
|----------|----------|---------|----------|----------|----------|-----|-------------|
| 1        | 1212121  | abdul   | -        | -        | -        | -   | 0.00        |
| 2        | 1313131  | david   | -        | -        | -        | -   | 0.00        |
| 3        | 13131    | moses   | -        | -        | -        | -   | 0.00        |

#### **Langkah 2: Isi Nilai di Excel**

Edit file Excel dan isi nilai-nilai:

| No Absen | NISN     | Nama    | Harian 1 | Harian 2 | Harian 3 | UAS | Nilai Akhir |
|----------|----------|---------|----------|----------|----------|-----|-------------|
| 1        | 1212121  | abdul   | 80       | 85       | 90       | 88  | -           |
| 2        | 1313131  | david   | 75       | 80       | 85       | 82  | -           |
| 3        | 13131    | moses   | 90       | 95       | 92       | 94  | -           |

**⚠️ Penting:**
- **No Absen** dan **NISN** JANGAN DIUBAH (digunakan untuk mencocokkan siswa)
- **Nama** bisa diubah atau tidak, tidak akan berpengaruh
- **Harian 1, 2, 3, dst**: Isi dengan angka 0-100, atau biarkan kosong/"-" jika tidak ada nilai
- **UAS**: Isi dengan angka 0-100, atau biarkan kosong/"-"
- **Nilai Akhir**: DIABAIKAN saat import (akan dihitung otomatis)

#### **Langkah 3: Simpan File Excel**

1. **JANGAN ubah format menjadi CSV**
2. Simpan sebagai file Excel (.xlsx atau .xls)
3. File siap untuk di-import

#### **Langkah 4: Import ke Website**

1. Di halaman nilai mata pelajaran, klik tombol **"🔼 Import Excel"** (tombol orange/oranye)
2. Pilih file Excel yang sudah diisi
3. Sistem akan memproses dan menampilkan hasil:
   - ✅ Berhasil: Berapa banyak data yang berhasil di-import
   - ⚠️ Gagal: Jika ada data yang berhasil tapi ada yang gagal
   - ❌ Error: Jika semua data gagal
4. Jika berhasil, data nilai akan muncul di tabel
5. **PENTING**: Klik **"Simpan Semua Nilai"** untuk menyimpan ke database!

### ⚠️ Catatan Penting Import Excel:

1. **Format Kolom Harus Sama**
   - Pastikan nama kolom sama persis: `No Absen`, `NISN`, `Nama`, `Harian 1`, `Harian 2`, dst
   - Jangan tambah atau kurangi kolom
   - Urutan kolom boleh berbeda

2. **Matching Siswa**
   - Sistem mencocokkan siswa berdasarkan **NISN** atau **No Absen**
   - Jika NISN tidak cocok, sistem akan cari berdasarkan No Absen
   - Jika keduanya tidak cocok, data siswa akan di-skip

3. **Nilai yang Valid**
   - Nilai harus angka 0-100
   - Nilai boleh desimal (misal: 85.5)
   - Jika kosong, "-", atau tidak valid, akan diabaikan (tetap null)

4. **Kolom Harian Dinamis**
   - Jumlah kolom harian menyesuaikan dengan pengaturan di website
   - Jika di Excel ada "Harian 1" sampai "Harian 5", tapi di website hanya ada 3 kolom, maka Harian 4 dan 5 akan diabaikan
   - Jika di Excel hanya ada "Harian 1" dan "Harian 2", tapi di website ada 3 kolom, maka Harian 3 akan tetap kosong

### 📋 Contoh File Excel untuk Import:

**Contoh 1: Import Nilai Lengkap**
```
No Absen | NISN     | Nama    | Harian 1 | Harian 2 | Harian 3 | UAS
1        | 1212121  | abdul   | 80       | 85       | 90       | 88
2        | 1313131  | david   | 75       | 80       | 85       | 82
3        | 13131    | moses   | 90       | 95       | 92       | 94
```

**Contoh 2: Import Nilai Sebagian**
```
No Absen | NISN     | Nama    | Harian 1 | Harian 2 | Harian 3 | UAS
1        | 1212121  | abdul   | 80       | 85       | -        | -
2        | 1313131  | david   | 75       | -        | -        | -
3        | 13131    | moses   | 90       | 95       | 92       | 94
```

**Contoh 3: Import Hanya UAS**
```
No Absen | NISN     | Nama    | Harian 1 | Harian 2 | Harian 3 | UAS
1        | 1212121  | abdul   | -        | -        | -        | 88
2        | 1313131  | david   | -        | -        | -        | 82
3        | 13131    | moses   | -        | -        | -        | 94
```

### 🔄 Alur Kerja yang Disarankan:

1. **Export** → Dapatkan template dengan data siswa yang sudah ada
2. **Edit** → Isi nilai di Excel
3. **Import** → Upload file kembali ke website
4. **Review** → Periksa data yang ter-import
5. **Save** → Klik "Simpan Semua Nilai" untuk menyimpan ke database

---

## 🔧 Pengaturan Bobot Nilai

### Cara Mengatur Bobot Nilai Harian dan UAS:

1. Masuk ke menu **"Bobot Nilai"** di dashboard
2. Klik **"Edit Bobot"**
3. Atur persentase:
   - **Nilai Harian**: Misalnya 40%
   - **UAS**: Misalnya 60%
   - **Total harus 100%**
4. Klik **"Simpan"**

**Catatan:**
- Perubahan bobot akan diterapkan ke **semua nilai** yang sudah ada
- Nilai akhir akan dihitung ulang secara otomatis

---

## 📊 Cara Kerja Sistem Nilai

### Formula Perhitungan:

```
Rata-rata Harian = (Harian 1 + Harian 2 + ... + Harian N) / N
Nilai Akhir = (Rata-rata Harian × Bobot Harian) + (UAS × Bobot UAS) / 100
```

### Contoh Perhitungan:

**Data:**
- Harian 1: 80
- Harian 2: 85
- Harian 3: 90
- UAS: 88
- Bobot Harian: 40%
- Bobot UAS: 60%

**Perhitungan:**
```
Rata-rata Harian = (80 + 85 + 90) / 3 = 85
Nilai Akhir = (85 × 40) + (88 × 60) / 100
            = 3400 + 5280 / 100
            = 8680 / 100
            = 86.8
```

---

## 📝 Tips & Trik

### ✅ Best Practices:

1. **Import Siswa:**
   - Import siswa di awal semester sebelum input nilai
   - Pastikan NISN unik untuk setiap siswa
   - Gunakan nama lengkap yang benar

2. **Input Nilai:**
   - **Gunakan Import Excel** untuk input nilai massal yang lebih cepat
   - Export template terlebih dahulu untuk mendapatkan format yang benar
   - Input nilai harian secara berkala (tidak menumpuk)
   - Gunakan kolom yang cukup (3-5 kolom harian biasanya cukup)
   - Simpan secara berkala untuk menghindari kehilangan data

3. **Export Data:**
   - Export secara rutin sebagai backup
   - Gunakan untuk membuat rapor di akhir semester
   - Simpan file dengan nama yang jelas (misal: `IPS_Kelas4_2025-12-07.xlsx`)

4. **Workflow Import Excel:**
   - **Export** → Edit di Excel → **Import** → **Save**
   - Periksa hasil import sebelum klik "Simpan Semua Nilai"
   - Jika ada error, perbaiki file Excel dan import ulang

### ⚠️ Hal yang Harus Dihindari:

1. ❌ Jangan import siswa yang sama berkali-kali
2. ❌ Jangan ubah NISN setelah nilai sudah diinput
3. ❌ Jangan lupa save setelah input nilai (baik manual maupun import)
4. ❌ Jangan refresh halaman saat proses menyimpan sedang berjalan
5. ❌ Jangan ubah format kolom di Excel saat import nilai
6. ❌ Jangan hapus kolom "No Absen" atau "NISN" di file Excel

---

## 🆘 Troubleshooting

### Problem: File CSV Tidak Bisa Di-import (Import Siswa)

**Solusi:**
1. Pastikan format file adalah `.csv`
2. Buka file di Notepad, pastikan formatnya:
   ```
   nisn,nama
   123,Ahmad
   456,Budi
   ```
3. Jangan ada kolom kosong di awal
4. Encoding file harus UTF-8

### Problem: File Excel Tidak Bisa Di-import (Import Nilai)

**Solusi:**
1. Pastikan format file adalah `.xlsx` atau `.xls`
2. Pastikan nama kolom sama persis: `No Absen`, `NISN`, `Nama`, `Harian 1`, dst
3. Jangan ada baris kosong di atas header
4. Export template terlebih dahulu untuk mendapatkan format yang benar

### Problem: Nilai Tidak Ter-import

**Solusi:**
1. Periksa pesan error yang muncul
2. Pastikan NISN atau No Absen cocok dengan data siswa yang ada
3. Pastikan nilai dalam range 0-100
4. Periksa apakah ada karakter khusus dalam kolom nilai
5. Coba export ulang template dan gunakan file tersebut

### Problem: Beberapa Siswa Tidak Ter-import

**Solusi:**
1. Periksa NISN atau No Absen siswa tersebut
2. Pastikan siswa sudah terdaftar di database
3. Periksa apakah ada spasi atau karakter tersembunyi di kolom NISN
4. Coba hapus dan ketik ulang NISN di Excel

### Problem: Nilai Akhir Tidak Sesuai

**Solusi:**
1. Cek bobot nilai di menu **Bobot Nilai**
2. Pastikan total bobot = 100%
3. Refresh halaman setelah mengubah bobot
4. Nilai akhir akan dihitung ulang otomatis
5. Formula: `(Rata-rata Harian × Bobot Harian) + (UAS × Bobot UAS) / 100`

### Problem: Data Import Hilang Setelah Refresh

**Solusi:**
1. **PENTING**: Setelah import, HARUS klik tombol **"Simpan Semua Nilai"**
2. Import Excel hanya mengisi data di browser, belum tersimpan ke database
3. Tunggu konfirmasi "Data nilai berhasil disimpan!" sebelum refresh atau close tab

### Problem: Siswa yang Ditambahkan Tidak Muncul

**Solusi:**
1. Refresh halaman (F5)
2. Logout dan login kembali
3. Pastikan kelas sudah dipilih dengan benar

---

## 📞 Bantuan Lebih Lanjut

Jika masih ada masalah, silakan hubungi:
- **Admin Sistem**: admin@rapordigital.com
- **WhatsApp Support**: 08xx-xxxx-xxxx

---

**Terakhir diupdate:** 7 Desember 2025
**Versi Aplikasi:** 1.0.0
