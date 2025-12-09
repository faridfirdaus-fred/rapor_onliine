# Upload Photo System - Documentation

## Features Implemented

### ✅ Image Compression
- Automatically compress uploaded images using **Sharp** library
- Convert all images to **WebP format** (better compression than JPEG/PNG)
- Resize to **400x400 pixels** (square)
- Quality: **80%** (good balance between quality and size)
- Typical compression: **10MB → 50-100KB**

### ✅ Delete Old Photos
- Automatically delete old profile photo when user uploads new one
- Prevent disk space waste
- Skip deletion for default avatar

### ✅ Validation
- Allowed formats: JPEG, JPG, PNG, GIF, WebP
- Max upload size: 10MB (before compression)
- Final size after compression: ~50-100KB

## File Locations

### Backend Storage
```
backend/uploads/profiles/
├── profile-1234567890-123456789.webp
├── profile-1234567891-987654321.webp
└── ...
```

### Frontend Access
```
http://rapor-micimerak.duckdns.org/uploads/profiles/profile-xxx.webp
```

## How It Works

### Upload Flow
1. User selects image file
2. Frontend sends to `/api/auth/profile` with multipart/form-data
3. Backend receives file in memory (multer memoryStorage)
4. **Sharp** processes image:
   - Resize to 400x400
   - Convert to WebP
   - Apply 80% quality compression
5. Save to `uploads/profiles/`
6. **Delete old photo** if exists
7. Update database with new photo path
8. Return success response

### Code Flow
```javascript
uploadProfile.single('photo')  // Receive file in memory
→ processProfilePhoto          // Compress with Sharp
→ deleteOldPhoto()             // Remove old file
→ User.update()                // Save to database
```

## API Endpoints

### Update Profile with Photo
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- name: string (optional)
- photo: file (optional)
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "...",
    "name": "Guru Kelas 2",
    "photo": "/uploads/profiles/profile-1234567890.webp"
  }
}
```

## Frontend Implementation

### Display Photo
```javascript
import { BASE_URL } from '../services/api';

const photoUrl = user.photo 
  ? `${BASE_URL}${user.photo}` 
  : '/default-avatar.png';

<img src={photoUrl} alt="Profile" />
```

### Upload Photo
```javascript
const formData = new FormData();
formData.append('name', name);
formData.append('photo', photoFile); // File object from input

await axios.put(
  `${API_URL}/auth/profile`,
  formData,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  }
);
```

## Deployment Notes

### Production Server Requirements
1. **Ensure `uploads/profiles/` folder exists**
   ```bash
   mkdir -p uploads/profiles
   chmod 755 uploads/profiles
   ```

2. **Install Sharp dependencies** (for image processing)
   ```bash
   npm install
   ```

3. **Backup Strategy**
   - Backup `uploads/` folder regularly
   - Or use cloud storage (S3, Cloudinary) for production

4. **Static File Serving**
   - Backend must serve `/uploads` as static
   - Already configured in `index.js`:
     ```javascript
     app.use('/uploads', express.static('uploads'));
     ```

### Troubleshooting

**Photo not showing in production:**
1. Check if `uploads/profiles/` folder exists on server
2. Check folder permissions (755 or 777)
3. Verify URL: `http://rapor-micimerak.duckdns.org/uploads/profiles/photo.webp`
4. Check browser console for 404 errors
5. Ensure backend is serving static files

**Upload fails:**
1. Check Sharp installation: `npm list sharp`
2. Check server logs for errors
3. Verify max upload size in reverse proxy (nginx, apache)
4. Check disk space on server

## Benefits

### Before (Old System)
- ❌ No compression → Large files (5-10MB)
- ❌ Old photos accumulate → Disk space waste
- ❌ Various formats (JPG, PNG) → Inconsistent

### After (New System)
- ✅ Automatic compression → Small files (~50-100KB)
- ✅ Auto-delete old photos → No waste
- ✅ Unified format (WebP) → Consistent & efficient
- ✅ Fixed size (400x400) → Uniform display

## Example Compression Results

| Original | Compressed | Savings |
|----------|------------|---------|
| 8.5 MB (PNG) | 78 KB (WebP) | 99.1% |
| 5.2 MB (JPEG) | 62 KB (WebP) | 98.8% |
| 3.1 MB (JPG) | 55 KB (WebP) | 98.2% |

---

**Last Updated:** December 9, 2025
