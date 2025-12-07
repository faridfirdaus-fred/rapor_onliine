# Rapor Digital - Deployment Guide

## Environment Configuration

### Frontend (.env.production)
```env
VITE_API_URL=/api
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
CLIENT_URL=https://your-production-domain.com
MAX_FILE_SIZE=5242880
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
npm start
```

## Deployment Notes

1. **Frontend**: Deploy `frontend/dist` folder to static hosting (Vercel, Netlify, etc.)
2. **Backend**: Deploy backend folder to Node.js hosting (Railway, Render, Heroku, etc.)
3. **Database**: MongoDB Atlas (already configured)
4. **Environment Variables**: Set in hosting dashboard
5. **CORS**: Update `CLIENT_URL` with your production domain

## Important

- Frontend will use `/api` in production (relative path)
- Backend CORS is configured to accept production domain
- Make sure to set `NODE_ENV=production` in backend
