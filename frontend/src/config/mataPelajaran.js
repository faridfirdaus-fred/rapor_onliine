// Daftar mata pelajaran berdasarkan tingkat kelas
export const MATA_PELAJARAN = {
  // Kelas Bawah (1-3)
  KELAS_BAWAH: [
    'Al-Quran Hadis',
    'Aqidah Akhlak',
    'Fiqih',
    'PPKn',
    'B. Indonesia',
    'B. Arab',
    'Matematika',
    'SBDP',
    'B. Sunda',
    'PJOK'
  ],
  
  // Kelas Atas (4-6)
  KELAS_ATAS: [
    'Al-Quran Hadis',
    'Aqidah Akhlak',
    'Fiqih',
    'SKI',
    'PPKn',
    'B. Indonesia',
    'B. Arab',
    'Matematika',
    'SBDP',
    'B. Sunda',
    'IPA',
    'IPS',
    'PJOK'
  ]
};

/**
 * Mendapatkan daftar mata pelajaran berdasarkan nama kelas
 * @param {string} namaKelas - Nama kelas (misal: "Kelas 1", "Kelas 2", dll)
 * @returns {string[]} Array mata pelajaran
 */
export const getMataPelajaranByKelas = (namaKelas) => {
  if (!namaKelas) return [];
  
  // Extract nomor kelas dari nama (misal: "Kelas 1" -> 1, "1A" -> 1)
  const kelasNumber = parseInt(namaKelas.match(/\d+/)?.[0]);
  
  if (!kelasNumber) return [];
  
  // Kelas 1-3 = Kelas Bawah, Kelas 4-6 = Kelas Atas
  if (kelasNumber >= 1 && kelasNumber <= 3) {
    return MATA_PELAJARAN.KELAS_BAWAH;
  } else if (kelasNumber >= 4 && kelasNumber <= 6) {
    return MATA_PELAJARAN.KELAS_ATAS;
  }
  
  return [];
};
