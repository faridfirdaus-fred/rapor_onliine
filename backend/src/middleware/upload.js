import multer from 'multer';
import path from 'path';
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

// Middleware untuk kompres foto dan convert ke base64
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
    
    console.log('🔄 Compressing image...');

    // Compress and convert to WebP
    const compressedBuffer = await sharp(req.file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Convert to base64
    const base64Image = `data:image/webp;base64,${compressedBuffer.toString('base64')}`;

    const compressedSize = compressedBuffer.length;
    console.log('✅ Image compressed successfully');
    console.log('- New size:', compressedSize, 'bytes');
    console.log('- Compression ratio:', ((1 - compressedSize / req.file.size) * 100).toFixed(2) + '%');
    console.log('- Format: Base64 WebP');

    // Add base64 data to request
    req.processedFile = {
      base64: base64Image,
      size: compressedSize,
      format: 'webp'
    };

    console.log('📦 Processed file ready (base64 length:', base64Image.length, 'chars)');

    next();
  } catch (error) {
    console.error('❌ Error processing image:', error);
    return res.status(500).json({ error: 'Gagal memproses gambar' });
  }
};
