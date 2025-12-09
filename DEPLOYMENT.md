# Rapor Digital - Deployment Guide

## Environment Configuration

### Frontend (.env)
```env
VITE_API_URL=http://rapor-micimerak.duckdns.org/api
VITE_APP_NAME=Rapor Digital
VITE_APP_VERSION=1.0.0
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRE=7d
CLIENT_URL=http://rapor-micimerak.duckdns.org
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Build Commands

### Frontend
```bash
cd frontend
npm install
npm run build
```
Output: `dist/` folder

### Backend
```bash
cd backend
npm install
npm run init-uploads  # Initialize upload folders
npm start
```

## Important Setup for Production

### 1. Upload Folder Structure
Backend will automatically create these folders on `npm install`:
```
backend/
└── uploads/
    └── profiles/
```

### 2. Image Upload Features
- ✅ **Auto compression** - Images compressed to ~50-100KB (WebP format)
- ✅ **Auto resize** - All photos resized to 400x400px
- ✅ **Auto delete old photos** - Old photos deleted when new one uploaded
- ✅ **Optimized storage** - Save 99% disk space vs original images

### 3. Server Requirements
```bash
# Ensure upload folders exist and have correct permissions
cd backend
chmod -R 755 uploads/

# Or manual creation
mkdir -p uploads/profiles
```

### 4. Static File Serving
Backend automatically serves uploaded files at:
```
http://rapor-micimerak.duckdns.org/uploads/profiles/photo.webp
```

## Deployment Notes

1. **Frontend**: Deploy `frontend/dist` folder to static hosting (Vercel, Netlify, etc.)
2. **Backend**: Deploy backend folder to Node.js hosting (Railway, Render, Heroku, etc.)
3. **Database**: MongoDB Atlas (already configured)
4. **Environment Variables**: Set in hosting dashboard
5. **CORS**: Already configured for http://rapor-micimerak.duckdns.org

## Troubleshooting

### Photos not showing?
1. Check if `uploads/profiles/` exists: `ls -la uploads/`
2. Check folder permissions: `chmod -R 755 uploads/`
3. Test static serving: `curl http://localhost:5000/uploads/profiles/.gitkeep`
4. Check backend logs for errors

### Upload fails?
1. Verify Sharp installed: `npm list sharp`
2. Check disk space: `df -h`
3. Check upload size limits in reverse proxy (nginx/apache)

### After deployment:
```bash
# Backend
npm install          # Auto-runs initUploads.js
npm start

# Or manually
npm run init-uploads
```

## Important

- Frontend will use `http://rapor-micimerak.duckdns.org/api` in production
- Backend CORS configured to accept requests from domain
- Upload folders created automatically via `postinstall` script
- All images auto-compressed to WebP format (99% size reduction)
- Old photos auto-deleted to save disk space
