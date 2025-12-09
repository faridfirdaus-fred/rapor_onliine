import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Configure multer for CSV file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'siswa-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file CSV yang diperbolehkan'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Configure multer for profile photo upload (memory storage for processing)
const profileStorage = multer.memoryStorage();

const profileFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, PNG, GIF, WebP) yang diperbolehkan!'));
  }
};

export const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: profileFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max (akan dikompres)
  }
});

// Middleware untuk kompres dan simpan foto profil
export const processProfilePhoto = async (req, res, next) => {
  if (!req.file) {
    console.log('⚠️ No file uploaded');
    return next();
  }

  try {
    console.log('📸 Processing image upload:');
    console.log('- Original filename:', req.file.originalname);
    console.log('- Original size:', req.file.size, 'bytes');
    console.log('- Mimetype:', req.file.mimetype);
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `profile-${uniqueSuffix}.webp`;
    const filepath = path.join('uploads/profiles', filename);

    // Ensure directory exists
    const dir = 'uploads/profiles';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('📁 Created directory:', dir);
    }

    console.log('🔄 Compressing image...');

    // Compress and convert to WebP (better compression)
    await sharp(req.file.buffer)
      .resize(400, 400, { // Resize to 400x400
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 }) // Convert to WebP with 80% quality
      .toFile(filepath);

    const fileSize = fs.statSync(filepath).size;
    console.log('✅ Image compressed successfully');
    console.log('- New filename:', filename);
    console.log('- New size:', fileSize, 'bytes');
    console.log('- Saved to:', filepath);
    console.log('- Compression ratio:', ((1 - fileSize / req.file.size) * 100).toFixed(2) + '%');

    // Add file info to request
    req.processedFile = {
      filename: filename,
      path: `/uploads/profiles/${filename}`,
      size: fileSize
    };

    console.log('📦 Processed file info:', req.processedFile);

    next();
  } catch (error) {
    console.error('❌ Error processing image:', error);
    return res.status(500).json({ error: 'Gagal memproses gambar' });
  }
};

// Helper function to delete old photo
export const deleteOldPhoto = (photoPath) => {
  if (!photoPath || photoPath === '/uploads/profiles/default-avatar.png') {
    console.log('⚠️ No old photo to delete (null or default avatar)');
    return; // Don't delete default avatar
  }

  try {
    console.log('🗑️ Attempting to delete old photo:', photoPath);
    
    // Remove leading slash and construct full path
    const fullPath = photoPath.startsWith('/') ? photoPath.substring(1) : photoPath;
    
    console.log('- Full path:', fullPath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log('✅ Old photo deleted successfully:', fullPath);
    } else {
      console.log('⚠️ Old photo not found on filesystem:', fullPath);
    }
  } catch (error) {
    console.error('❌ Error deleting old photo:', error.message);
  }
};
