import express from 'express';
import fs from 'fs';
import csv from 'csv-parser';
import { Siswa } from '../models/Siswa.js';
import { Kelas } from '../models/Kelas.js';
import { Nilai } from '../models/Nilai.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// GET all siswa (optionally filtered by kelasId)
router.get('/', async (req, res) => {
  try {
    const { sort } = req.query;
    const kelasId = req.user.kelasId; // Guru always sees their own kelas only
    
    let siswaList = await Siswa.findAll(kelasId);

    // Add nilai summary for each siswa
    siswaList = await Promise.all(siswaList.map(async (siswa) => {
      const nilaiSummary = await Siswa.getNilaiSummary(siswa.id);
      return {
        ...siswa,
        ...nilaiSummary
      };
    }));

    // Sorting
    if (sort) {
      switch (sort) {
        case 'nama':
          siswaList.sort((a, b) => a.nama.localeCompare(b.nama));
          break;
        case 'absen':
          siswaList.sort((a, b) => a.noAbsen - b.noAbsen);
          break;
        case 'ranking':
          siswaList.sort((a, b) => b.rataRata - a.rataRata);
          break;
        default:
          break;
      }
    }

    // Add ranking if sorted by ranking
    if (sort === 'ranking') {
      siswaList = siswaList.map((siswa, index) => ({
        ...siswa,
        ranking: index + 1
      }));
    }

    res.json(siswaList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET siswa by ID
router.get('/:id', async (req, res) => {
  try {
    const siswa = await Siswa.findById(req.params.id);
    if (!siswa) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' });
    }
    
    // Check access - guru can only see siswa from their kelas
    if (siswa.kelasId !== req.user.kelasId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const nilaiSummary = await Siswa.getNilaiSummary(siswa.id);
    const nilaiList = await Nilai.findBySiswa(siswa.id);

    res.json({
      ...siswa,
      ...nilaiSummary,
      nilaiList
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new siswa
router.post('/', async (req, res) => {
  try {
    let { nisn, nama, noAbsen } = req.body;
    const kelasId = req.user.kelasId; // Guru always uses their own kelasId
    
    if (!nisn || !nama || !noAbsen) {
      return res.status(400).json({ 
        error: 'NISN, nama, dan nomor absen harus diisi' 
      });
    }

    // Check if kelas exists
    const kelas = await Kelas.findById(kelasId);
    if (!kelas) {
      return res.status(404).json({ error: 'Kelas tidak ditemukan' });
    }

    // Create siswa
    const siswa = await Siswa.create({ kelasId, nisn, nama, noAbsen });
    res.status(201).json(siswa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE siswa
router.put('/:id', async (req, res) => {
  try {
    // First check if siswa exists and get their kelasId
    const existingSiswa = await Siswa.findById(req.params.id);
    if (!existingSiswa) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' });
    }
    
    // Check access - guru can only update siswa in their kelas
    if (existingSiswa.kelasId !== req.user.kelasId) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    
    const { nisn, nama, noAbsen } = req.body;
    const kelasId = req.user.kelasId; // Guru cannot change kelasId
    
    const result = await Siswa.update(req.params.id, { nisn, nama, noAbsen, kelasId });
    
    if (!result) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE siswa
router.delete('/:id', async (req, res) => {
  try {
    // First check if siswa exists and get their kelasId
    const existingSiswa = await Siswa.findById(req.params.id);
    if (!existingSiswa) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' });
    }
    
    // Check access - guru can only delete siswa in their kelas
    if (existingSiswa.kelasId !== req.user.kelasId) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    
    const result = await Siswa.delete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' });
    }

    res.json({ message: 'Siswa berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// IMPORT siswa from CSV
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    const kelasId = req.user.kelasId; // Guru always imports to their own kelas

    // Check if kelas exists
    const kelas = await Kelas.findById(kelasId);
    if (!kelas) {
      return res.status(404).json({ error: 'Kelas tidak ditemukan' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File CSV harus diupload' });
    }

    const results = [];
    const errors = [];
    let rowNumber = 0;

    // Read and parse CSV
    const stream = fs.createReadStream(req.file.path)
      .pipe(csv({
        mapHeaders: ({ header }) => header.toLowerCase().trim()
      }));

    for await (const row of stream) {
      rowNumber++;
      
      try {
        const nisn = row.nisn?.trim();
        const nama = row.nama?.trim();
        
        // Validate required fields
        if (!nisn || !nama) {
          errors.push({
            row: rowNumber,
            error: 'NISN dan Nama harus diisi',
            data: row
          });
          continue;
        }

        // Auto-generate noAbsen (sequential)
        const existingSiswa = await Siswa.findAll(kelasId);
        const noAbsen = existingSiswa.length + results.length + 1;

        // Create siswa
        const siswa = await Siswa.create({
          kelasId,
          nisn,
          nama,
          noAbsen
        });

        results.push(siswa);
      } catch (error) {
        errors.push({
          row: rowNumber,
          error: error.message,
          data: row
        });
      }
    }

    // Delete uploaded file
    fs.unlinkSync(req.file.path);

    // Sort results by nama (alphabetical)
    results.sort((a, b) => a.nama.localeCompare(b.nama));

    // Update noAbsen based on alphabetical order
    await Promise.all(results.map((siswa, index) => 
      Siswa.update(siswa.id, { noAbsen: index + 1 })
    ));

    res.json({
      success: true,
      message: `Berhasil import ${results.length} siswa`,
      imported: results.length,
      failed: errors.length,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
