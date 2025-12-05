import express from 'express';
import { Nilai } from '../models/Nilai.js';
import { Siswa } from '../models/Siswa.js';
import { BobotNilai } from '../models/BobotNilai.js';

const router = express.Router();

// GET all nilai (optionally filtered by siswaId)
router.get('/', async (req, res) => {
  try {
    const { siswaId } = req.query;
    let nilaiList = await Nilai.findAll(siswaId);
    
    // Filter by kelas
    nilaiList = nilaiList.filter(n => n.kelasId === req.user.kelasId);
    
    res.json(nilaiList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET nilai by ID
router.get('/:id', async (req, res) => {
  try {
    const nilai = await Nilai.findById(req.params.id);
    if (!nilai) {
      return res.status(404).json({ error: 'Nilai tidak ditemukan' });
    }
    
    // Check access
    if (nilai.kelasId !== req.user.kelasId) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    
    res.json(nilai);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET summary (jumlah dan rata-rata) untuk siswa
router.get('/summary/:siswaId', async (req, res) => {
  try {
    const siswa = await Siswa.findById(req.params.siswaId);
    if (!siswa) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' });
    }

    const summary = await Nilai.getJumlahDanRataRata(req.params.siswaId);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ranking for kelas
router.get('/ranking/:kelasId', async (req, res) => {
  try {
    const rankings = await Nilai.getSiswaRanking(req.params.kelasId);
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new nilai
router.post('/', async (req, res) => {
  try {
    const { siswaId, mataPelajaran, nilaiHarian, uas, bobotHarian, bobotUas } = req.body;
    const kelasId = req.user.kelasId; // Guru always uses their own kelasId
    
    if (!siswaId || !mataPelajaran) {
      return res.status(400).json({ 
        error: 'Siswa ID dan mata pelajaran harus diisi' 
      });
    }

    // Check if siswa exists
    const siswa = await Siswa.findById(siswaId);
    if (!siswa) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' });
    }

    // Get bobot nilai for the kelas
    const bobotNilai = await BobotNilai.findByKelas(kelasId);

    // Parse nilai harian array
    let parsedNilaiHarian = [];
    if (Array.isArray(nilaiHarian)) {
      parsedNilaiHarian = nilaiHarian.map(n => parseFloat(n)).filter(n => !isNaN(n));
    } else if (nilaiHarian) {
      const val = parseFloat(nilaiHarian);
      if (!isNaN(val)) parsedNilaiHarian = [val];
    }

    const result = await Nilai.create({ 
      siswaId,
      kelasId,
      mataPelajaran, 
      nilaiHarian: parsedNilaiHarian,
      uas: parseFloat(uas) || 0,
      bobotHarian: bobotHarian !== undefined ? parseInt(bobotHarian) : bobotNilai.bobotHarian,
      bobotUas: bobotUas !== undefined ? parseInt(bobotUas) : bobotNilai.bobotUas
    });
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE nilai
router.put('/:id', async (req, res) => {
  try {
    // Check existing nilai for access control
    const existingNilai = await Nilai.findById(req.params.id);
    if (!existingNilai) {
      return res.status(404).json({ error: 'Nilai tidak ditemukan' });
    }
    
    // Check access for guru
    if (req.user.role === 'guru' && existingNilai.kelasId !== req.user.kelasId) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    
    const { mataPelajaran, nilaiHarian, uas, bobotHarian, bobotUas } = req.body;
    const updateData = {};
    
    if (mataPelajaran !== undefined) updateData.mataPelajaran = mataPelajaran;
    if (uas !== undefined) updateData.uas = parseFloat(uas);
    if (bobotHarian !== undefined) updateData.bobotHarian = parseInt(bobotHarian);
    if (bobotUas !== undefined) updateData.bobotUas = parseInt(bobotUas);
    
    if (nilaiHarian !== undefined) {
      if (Array.isArray(nilaiHarian)) {
        updateData.nilaiHarian = nilaiHarian.map(n => parseFloat(n)).filter(n => !isNaN(n));
      } else {
        const val = parseFloat(nilaiHarian);
        updateData.nilaiHarian = !isNaN(val) ? [val] : [];
      }
    }

    const result = await Nilai.update(req.params.id, updateData);
    
    if (!result) {
      return res.status(404).json({ error: 'Nilai tidak ditemukan' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE nilai
router.delete('/:id', async (req, res) => {
  try {
    // Check existing nilai for access control
    const existingNilai = await Nilai.findById(req.params.id);
    if (!existingNilai) {
      return res.status(404).json({ error: 'Nilai tidak ditemukan' });
    }
    
    // Check access for guru
    if (req.user.role === 'guru' && existingNilai.kelasId !== req.user.kelasId) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    
    const result = await Nilai.delete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: 'Nilai tidak ditemukan' });
    }

    res.json({ message: 'Nilai berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
