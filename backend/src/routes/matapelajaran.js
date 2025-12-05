import express from 'express';
import { getMataPelajaranByKelas } from '../config/mataPelajaran.js';
import { Nilai } from '../models/Nilai.js';
import { Kelas } from '../models/Kelas.js';

const router = express.Router();

// GET daftar mata pelajaran untuk kelas guru yang login
router.get('/', async (req, res) => {
  try {
    // Get kelas guru
    const kelas = await Kelas.findById(req.user.kelasId);
    
    if (!kelas) {
      return res.status(404).json({ error: 'Kelas tidak ditemukan' });
    }

    // Get mata pelajaran berdasarkan nama kelas
    const mataPelajaranList = getMataPelajaranByKelas(kelas.nama);

    // Get statistik untuk setiap mata pelajaran
    const mataPelajaranWithStats = await Promise.all(
      mataPelajaranList.map(async (mapel) => {
        const nilaiCount = await Nilai.countByMataPelajaran(kelas.id, mapel);
        return {
          nama: mapel,
          kelasId: kelas.id,
          namaKelas: kelas.nama,
          jumlahNilai: nilaiCount
        };
      })
    );

    res.json({
      kelas: {
        id: kelas.id,
        nama: kelas.nama
      },
      mataPelajaran: mataPelajaranWithStats
    });
  } catch (error) {
    console.error('Error fetching mata pelajaran:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
