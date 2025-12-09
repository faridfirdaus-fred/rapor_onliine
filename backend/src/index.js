import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB, disconnectDB } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import kelasRoutes from "./routes/kelas.js";
import siswaRoutes from "./routes/siswa.js";
import nilaiRoutes from "./routes/nilai.js";
import bobotNilaiRoutes from "./routes/bobotnilai.js";
import mataPelajaranRoutes from "./routes/matapelajaran.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://rapor-micimerak.duckdns.org',
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files (for uploaded images)
app.use('/uploads', express.static('uploads'));

app.get("/api", (req, res) => {
  res.json({ message: "Rapor Digital API - Backend Ready" });
});

// Public routes (no authentication required)
app.use("/api/auth", authRoutes);

// Protected routes (authentication required)
app.use("/api/kelas", authMiddleware, kelasRoutes);
app.use("/api/siswa", authMiddleware, siswaRoutes);
app.use("/api/nilai", authMiddleware, nilaiRoutes);
app.use("/api/bobot-nilai", authMiddleware, bobotNilaiRoutes);
app.use("/api/mata-pelajaran", authMiddleware, mataPelajaranRoutes);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

// Start server after DB connection
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Backend running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
  });
});
