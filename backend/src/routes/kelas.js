import express from 'express';
import { Kelas } from '../models/Kelas.js';

const router = express.Router();

// GET all kelas - guru only sees their own kelas
router.get('/', async (req, res) => {
  try {
    const kelas = await Kelas.findById(req.user.kelasId);
    const kelasList = kelas ? [kelas] : [];
    res.json(kelasList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET kelas by ID - guru can only access their own kelas
router.get('/:id', async (req, res) => {
  try {
    // Check access - guru can only access their own kelas
    if (req.user.kelasId !== req.params.id) {
      return res.status(403).json({ error: 'Access denied. You can only access your own class.' });
    }
    
    const kelas = await Kelas.findById(req.params.id);
    if (!kelas) {
      return res.status(404).json({ error: 'Kelas tidak ditemukan' });
    }
    res.json(kelas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new kelas - disabled (kelas are pre-created)
router.post('/', async (req, res) => {
  res.status(403).json({ error: 'Creating kelas is disabled. Classes are pre-configured.' });
});

// UPDATE kelas - disabled (kelas are pre-created)
router.put('/:id', async (req, res) => {
  res.status(403).json({ error: 'Updating kelas is disabled. Classes are pre-configured.' });
});

// DELETE kelas - disabled (kelas are pre-created)
router.delete('/:id', async (req, res) => {
  res.status(403).json({ error: 'Deleting kelas is disabled. Classes are pre-configured.' });
});

export default router;
